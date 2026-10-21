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

// Handle 401 globally (except on login/register auth routes)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');
    if (err.response?.status === 401 && !isAuthRoute) {
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
  notifyCandidate: (id: string, data?: { message?: string; channel?: 'whatsapp' | 'sms' }) =>
    api.post(`/applications/${id}/notify-candidate`, data || {}),
  requestFeedback: (id: string) =>
    api.post(`/applications/${id}/feedback-request`, {}),
  respondFeedback: (id: string, feedbackMessage: string) =>
    api.put(`/applications/${id}/feedback-response`, { feedbackMessage }),
  getFeedbackRequests: () =>
    api.get('/applications/feedback-requests'),
};

// Resume
export const resumeAPI = {
  analyze: (data: Record<string, unknown>) =>
    api.post('/resume/analyze', data),
  extractSkills: (data: { resumeText: string }) =>
    api.post('/resume/extract-skills', data),
};

// Technical Coding Interview Prep (LeetCode style) & Real Interview Test
export const codingAPI = {
  getProblems: () => api.get('/coding/problems'),
  evaluateCode: (data: { problemId: string; language: string; code: string }) =>
    api.post('/coding/evaluate', data),
  getProgress: () => api.get('/coding/progress'),
  updateProgress: (problemId: string, solved: boolean) =>
    api.post('/coding/progress', { problemId, solved }),
  startTest: (type?: string) => api.post('/coding/test/start', { type }),
  submitTest: (data: { testId: string; submissions: Array<{ problemId: string; language: string; code: string }> }) =>
    api.post('/coding/test/submit', data),
  getTestHistory: () => api.get('/coding/test/history'),
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
  disconnectGitHub: () =>
    api.post('/connectors/github/disconnect', {}),
  syncUnstop: (username: string) =>
    api.post('/connectors/unstop/sync', { username }),
  addUnstopAchievement: (data: Record<string, unknown>) =>
    api.post('/connectors/unstop/achievements', data),
  deleteUnstopAchievement: (id: string) =>
    api.delete(`/connectors/unstop/achievements/${id}`),
  getExternalJobs: (query?: string) =>
    api.get('/jobs/external', { params: { query } }),
};

// Analytics
export const analyticsAPI = {
  get: () => api.get('/analytics'),
};

// Candidate Dashboard Stats
export const candidateStatsAPI = {
  get: () => api.get('/candidate/stats'),
};

// Candidates Talent Pool (HR)
export const candidatesAPI = {
  list: () => api.get('/candidates'),
};
