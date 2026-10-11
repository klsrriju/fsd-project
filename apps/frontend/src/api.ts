import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: Record<string, unknown>) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data: Record<string, unknown>) =>
    api.patch('/auth/profile', data),
};

// Jobs
export const jobsAPI = {
  list: (params?: Record<string, string>) =>
    api.get('/jobs', { params }),
  get: (id: string) => api.get(`/jobs/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post('/jobs', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  getCandidates: (id: string) => api.get(`/jobs/${id}/candidates`),
};

// Applications
export const applicationsAPI = {
  list: (params?: Record<string, string>) =>
    api.get('/applications', { params }),
  apply: (data: Record<string, unknown>) =>
    api.post('/applications', data),
  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/applications/${id}/status`, { status, notes }),
};

// Resume
export const resumeAPI = {
  analyze: (data: Record<string, unknown>) =>
    api.post('/resume/analyze', data),
};

// Interviews
export const interviewsAPI = {
  list: () => api.get('/interviews'),
  schedule: (data: Record<string, unknown>) =>
    api.post('/interviews', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/interviews/${id}`, data),
};

// AI Interview
export const aiInterviewAPI = {
  getQuestions: (data: Record<string, unknown>) =>
    api.post('/interview/questions', data),
  evaluateAnswer: (data: Record<string, unknown>) =>
    api.post('/interview/evaluate', data),
};

// Notifications
export const notificationsAPI = {
  list: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`, {}),
  markAllRead: () => api.patch('/notifications/read-all', {}),
};

// Connectors & Web Scraping
export const connectorsAPI = {
  syncGitHub: (username: string) =>
    api.post('/connectors/github/sync', { username }),
  syncUnstop: (username: string) =>
    api.post('/connectors/unstop/sync', { username }),
  getExternalJobs: (query?: string) =>
    api.get('/jobs/external', { params: { query } }),
};

// Analytics
export const analyticsAPI = {
  get: () => api.get('/analytics'),
};

