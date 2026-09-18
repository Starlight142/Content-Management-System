import { Platform } from 'react-native';

// Android Emulator connects to host machine via 10.0.2.2, iOS simulator uses localhost
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

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

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Endpoint "${endpoint}" not found or returned non-JSON response (${response.status})`);
    }

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (error) {
    console.warn(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
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
  updateStatus: (id, status) => request(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  submitDeliverable: (id, submissionUrl) => request(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'REVIEW', submissionUrl }),
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

// Teams APIs
export const teamApi = {
  getAll: () => request('/teams'),
};

export default {
  auth: authApi,
  content: contentApi,
  task: taskApi,
  idea: ideaApi,
  team: teamApi,
};
