import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Subjects
export const getSubjects = () => api.get('/subjects');
export const createSubject = (data) => api.post('/subjects', data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);
export const getSubjectWithTopics = (id) => api.get(`/subjects/${id}/topics`);

// Topics
export const getTopics = (params) => api.get('/topics', { params });
export const createTopic = (data) => api.post('/topics', data);
export const updateTopic = (id, data) => api.put(`/topics/${id}`, data);
export const deleteTopic = (id) => api.delete(`/topics/${id}`);

// Sessions
export const createSession = (data) => api.post('/sessions', data);
export const getTodaySessions = () => api.get('/sessions/today');
export const getWeeklySessions = () => api.get('/sessions/weekly');
export const getSessions = () => api.get('/sessions');

// Progress
export const getStreak = () => api.get('/progress/streak');
export const getActivity = () => api.get('/progress/activity');

export default api;
