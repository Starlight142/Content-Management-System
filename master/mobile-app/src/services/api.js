import { Platform } from 'react-native';

// Prioritize localhost / adb reverse (127.0.0.1) & Android emulator (10.0.2.2) first for instant connection on any PC, followed by Wi-Fi LAN & Cloudflare tunnel
const CANDIDATE_BASE_URLS = Platform.OS === 'android'
  ? ['http://127.0.0.1:5000/api', 'http://10.0.2.2:5000/api', 'http://localhost:5000/api', 'http://192.168.0.104:5000/api', 'https://limits-claims-herself-folks.trycloudflare.com/api']
  : ['http://localhost:5000/api', 'http://127.0.0.1:5000/api', 'http://192.168.0.104:5000/api', 'https://limits-claims-herself-folks.trycloudflare.com/api'];

let activeBaseUrl = CANDIDATE_BASE_URLS[0];

export const getBaseUrl = () => activeBaseUrl;
export const setBaseUrl = (url) => { activeBaseUrl = url; };

export const getCandidateBaseUrls = () => [...CANDIDATE_BASE_URLS];

export const setCustomBaseUrl = (url) => {
  if (!url) return activeBaseUrl;
  let cleanUrl = url.trim().replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl = `${cleanUrl}/api`;
  }
  activeBaseUrl = cleanUrl;
  const existingIdx = CANDIDATE_BASE_URLS.indexOf(cleanUrl);
  if (existingIdx > -1) {
    CANDIDATE_BASE_URLS.splice(existingIdx, 1);
  }
  CANDIDATE_BASE_URLS.unshift(cleanUrl);
  return cleanUrl;
};

export const pingServer = async (urlToTest, timeoutMs = 2500) => {
  const trySingleUrl = async (rawUrl) => {
    const target = rawUrl.trim().replace(/\/+$/, '');
    const baseUrl = target.endsWith('/api') ? target : `${target}/api`;
    const healthEndpoint = `${baseUrl}/health`;
    const start = Date.now();

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    try {
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller ? controller.signal : undefined,
      });
      if (timeoutId) clearTimeout(timeoutId);
      const latency = Date.now() - start;
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        activeBaseUrl = baseUrl;
        return { ok: true, latency, status: response.status, data, endpoint: healthEndpoint, resolvedBaseUrl: baseUrl };
      }
      return { ok: false, latency, status: response.status, error: `HTTP ${response.status}`, endpoint: healthEndpoint };
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      const latency = Date.now() - start;
      const isTimeout = err.name === 'AbortError' || (err.message && err.message.toLowerCase().includes('abort'));
      return {
        ok: false,
        latency,
        error: isTimeout ? `หมดเวลาตอบสนอง (${timeoutMs}ms)` : (err.message || 'Cannot reach server'),
        endpoint: healthEndpoint,
      };
    }
  };

  const primaryUrl = (urlToTest || activeBaseUrl).trim();
  const primaryResult = await trySingleUrl(primaryUrl);
  if (primaryResult.ok) {
    return primaryResult;
  }

  // If USB / localhost (127.0.0.1) fails on Android Emulator (e.g. adb reverse not active), seamlessly fallback to 10.0.2.2
  if (Platform.OS === 'android' && (primaryUrl.includes('127.0.0.1:5000') || primaryUrl.includes('localhost:5000'))) {
    const emulatorResult = await trySingleUrl('http://10.0.2.2:5000/api');
    if (emulatorResult.ok) {
      return emulatorResult;
    }
  }

  return primaryResult;
};

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const request = async (endpoint, options = {}, timeoutMs = 2500) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  const urlsToTry = [activeBaseUrl, ...CANDIDATE_BASE_URLS.filter((u) => u !== activeBaseUrl)];
  let lastError = null;

  for (const baseUrl of urlsToTry) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller ? controller.signal : undefined,
      });
      if (timer) clearTimeout(timer);

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Endpoint "${endpoint}" returned non-JSON response (${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      activeBaseUrl = baseUrl;
      return data;
    } catch (err) {
      if (timer) clearTimeout(timer);
      lastError = err;
      const isNetworkOrTimeout = err.name === 'AbortError' ||
        (err.message && (
          err.message.includes('Network request failed') ||
          err.message.includes('Failed to fetch') ||
          err.message.includes('Network Error') ||
          err.message.includes('abort')
        ));
      if (!isNetworkOrTimeout) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Network connection failed');
};

// Auth APIs
export const authApi = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

// Contents APIs
export const contentApi = {
  getAll: () => request('/contents'),
  getById: (id) => request(`/contents/${id}`),
  create: (contentData) => request('/contents', {
    method: 'POST',
    body: JSON.stringify(contentData),
  }),
  updateStatus: (id, status) => request(`/contents/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  submitReview: (id, decision, notes) => request(`/contents/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ decision, notes }),
  }),
  addVersion: (id, fileUrl, changelog) => request(`/contents/${id}/versions`, {
    method: 'POST',
    body: JSON.stringify({ fileUrl, changelog }),
  }),
};

// Tasks APIs
export const taskApi = {
  getAll: () => request('/tasks'),
  create: (taskData) => request('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),
  updateStatus: (id, status, progress = undefined) => request(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(progress !== undefined ? { progress } : {}) }),
  }),
  submitDeliverable: (id, submissionUrl, progress = 85, replyNotes = '') => request(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'REVIEW',
      submissionUrl: submissionUrl || '',
      progress,
      replyNotes: replyNotes || '',
      ...(replyNotes ? { notes: `แก้ไขแล้ว: ${replyNotes}` } : {}),
    }),
  }),
};

// Ideas APIs
export const ideaApi = {
  getAll: () => request('/ideas'),
  create: (ideaData) => request('/ideas', {
    method: 'POST',
    body: JSON.stringify(ideaData),
  }),
};

// Teams APIs (Team-Based Workspace)
export const teamApi = {
  getAll: () => request('/teams'),
  getMyTeam: () => request('/teams/my-team'),
  joinTeam: (joinCode) => request('/teams/join', {
    method: 'POST',
    body: JSON.stringify({ joinCode: (joinCode || '').trim().toUpperCase() }),
  }),
  regenerateCode: (teamId) => request(`/teams/${teamId}/regenerate-code`, {
    method: 'POST',
  }),
  createTeam: (teamData) => request('/teams', {
    method: 'POST',
    body: JSON.stringify(teamData),
  }),
  getDashboard: (teamId) => request(`/teams/${teamId}/dashboard`),
  getTeamTasks: (teamId) => request(`/teams/${teamId}/tasks`),
  getTeamContents: (teamId) => request(`/teams/${teamId}/contents`),
  getTeamActivity: (teamId) => request(`/teams/${teamId}/activity`),
  getTeamMembers: (teamId) => request(`/teams/${teamId}/members`),
};

// Users APIs
export const userApi = {
  getAll: () => request('/users'),
  updateProfile: (profileData) => request('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  }),
  updatePosition: (userId, position) => request(`/users/${userId}/position`, {
    method: 'PATCH',
    body: JSON.stringify({ position }),
  }),
};

export default {
  auth: authApi,
  content: contentApi,
  task: taskApi,
  idea: ideaApi,
  team: teamApi,
  user: userApi,
};
