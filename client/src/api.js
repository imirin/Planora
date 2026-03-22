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

// Classes
export const getClasses = () => api.get('/classes/student');
export const getTutorClasses = () => api.get('/classes/tutor');
export const createClass = (data) => api.post('/classes/create', data);
export const getClassById = (id) => api.get(`/classes/${id}`);
export const getClassDetails = (id) => api.get(`/classes/${id}`);
export const joinClass = (data) => api.post('/classes/join', data);
export const deleteClass = (id) => api.delete(`/classes/${id}`);
export const getStudentClasses = () => api.get('/classes/student');
export const addAssignment = (id, data) => api.post(`/classes/${id}/assignment`, data);
export const getClassStudents = (id) => api.get(`/classes/${id}/students`);

// Assignments
export const getAssignments = (classId) => api.get(`/assignments/class/${classId}`);
export const createAssignment = (data) => api.post('/assignments', data);
export const deleteAssignment = (id) => api.delete(`/assignments/${id}`);

// Announcements
export const getAnnouncements = (classId) => api.get(`/announcements/class/${classId}`);
export const createAnnouncement = (data) => api.post('/announcements', data);

// Progress
export const getStreak = () => api.get('/progress/streak');
export const getActivity = () => api.get('/progress/activity');

export default api;
