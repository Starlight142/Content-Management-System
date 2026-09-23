import { Platform } from 'react-native';

// Support USB adb reverse (127.0.0.1) on real physical devices & emulators, with 10.0.2.2 fallback
const CANDIDATE_BASE_URLS = Platform.OS === 'android'
  ? ['http://127.0.0.1:5000/api', 'http://localhost:5000/api', 'http://10.13.3.200:5000/api', 'http://10.0.2.2:5000/api']
  : ['http://localhost:5000/api', 'http://127.0.0.1:5000/api'];

let activeBaseUrl = CANDIDATE_BASE_URLS[0];

export const getBaseUrl = () => activeBaseUrl;
export const setBaseUrl = (url) => { activeBaseUrl = url; };

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  const urlsToTry = [activeBaseUrl, ...CANDIDATE_BASE_URLS.filter((u) => u !== activeBaseUrl)];
  let lastError = null;

  for (const baseUrl of urlsToTry) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

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
      lastError = err;
      const isNetworkErr = err.message && (
        err.message.includes('Network request failed') ||
        err.message.includes('Failed to fetch') ||
        err.message.includes('Network Error')
      );
      if (!isNetworkErr) {
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

export default {
  auth: authApi,
  content: contentApi,
  task: taskApi,
  idea: ideaApi,
  team: teamApi,
};

