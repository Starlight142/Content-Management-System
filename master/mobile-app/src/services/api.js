import { Platform } from 'react-native';

// Support Wi-Fi LAN (192.168.0.104) first for wireless phone access, with USB adb reverse (127.0.0.1) & Cloudflare tunnel
const CANDIDATE_BASE_URLS = Platform.OS === 'android'
  ? ['http://192.168.0.104:5000/api', 'http://127.0.0.1:5000/api', 'http://localhost:5000/api', 'https://limits-claims-herself-folks.trycloudflare.com/api', 'http://10.0.2.2:5000/api']
  : ['http://192.168.0.104:5000/api', 'http://localhost:5000/api', 'http://127.0.0.1:5000/api', 'https://limits-claims-herself-folks.trycloudflare.com/api'];

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
  let target = (urlToTest || activeBaseUrl).trim().replace(/\/+$/, '');
  const healthEndpoint = target.endsWith('/api') ? `${target}/health` : `${target}/api/health`;
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
      return { ok: true, latency, status: response.status, data, endpoint: healthEndpoint };
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

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const request = async (endpoint, options = {}, timeoutMs = 3500) => {
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
  updateLegalChecklist: (id, items) => request(`/contents/${id}/legal-check`, {
    method: 'PUT',
    body: JSON.stringify({ items }),
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
};

export default {
  auth: authApi,
  content: contentApi,
  task: taskApi,
  idea: ideaApi,
  team: teamApi,
  user: userApi,
};

