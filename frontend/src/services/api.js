import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Users API
// ============================================================================
export const usersAPI = {
  getAll: () => api.get('/users/'),
  getById: (id) => api.get(`/users/${id}`),
  getByEmail: (email) => api.get(`/users/email/${email}`),
  create: (userData) => api.post('/users/', userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// ============================================================================
// Routine Tasks API (formerly Habits)
// ============================================================================
export const routineTasksAPI = {
  // Get all routine tasks
  getAll: (skip = 0, limit = 100) => api.get(`/routine-tasks/?skip=${skip}&limit=${limit}`),

  // Get by ID
  getById: (id) => api.get(`/routine-tasks/${id}`),

  // Get all tasks for a user
  getByUserId: (userId) => api.get(`/routine-tasks/user/${userId}`),

  // Get tasks for a specific day (e.g., 'Monday')
  getByUserAndDay: (userId, dayName) => api.get(`/routine-tasks/user/${userId}/day/${dayName}`),

  // Create new routine task
  create: (taskData) => api.post('/routine-tasks/', taskData),

  // Update routine task
  update: (id, taskData) => api.put(`/routine-tasks/${id}`, taskData),

  // Delete routine task
  delete: (id) => api.delete(`/routine-tasks/${id}`),
};

// ============================================================================
// Daily Logs API
// ============================================================================
export const logsAPI = {
  // Get all logs
  getAll: (skip = 0, limit = 100) => api.get(`/logs/?skip=${skip}&limit=${limit}`),

  // Get by ID
  getById: (id) => api.get(`/logs/${id}`),

  // Get all logs for a user
  getByUserId: (userId) => api.get(`/logs/user/${userId}`),

  // Get logs for a specific routine task
  getByRoutineTaskId: (routineTaskId) => api.get(`/logs/routine-task/${routineTaskId}`),

  // Get logs for a user on a specific date (format: YYYY-MM-DD)
  getByUserAndDate: (userId, date) => api.get(`/logs/user/${userId}/date/${date}`),

  // Create new log
  create: (logData) => api.post('/logs/', logData),

  // Update log (status, actual_minutes, notes)
  update: (id, logData) => api.put(`/logs/${id}`, logData),

  // Auto-generate today's logs based on routine tasks
  generateToday: (userId) => api.post(`/logs/generate-today/${userId}`),

  // Delete log
  delete: (id) => api.delete(`/logs/${id}`),
};

// ============================================================================
// Interviews API
// ============================================================================
export const interviewsAPI = {
  // Get all interviews
  getAll: (skip = 0, limit = 100) => api.get(`/interviews/?skip=${skip}&limit=${limit}`),

  // Get by ID
  getById: (id) => api.get(`/interviews/${id}`),

  // Get all interviews for a user (with optional filters)
  getByUserId: (userId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    const queryString = params.toString();
    return api.get(`/interviews/user/${userId}${queryString ? '?' + queryString : ''}`);
  },

  // Create new interview
  create: (interviewData) => api.post('/interviews/', interviewData),

  // Update interview
  update: (id, interviewData) => api.put(`/interviews/${id}`, interviewData),

  // Delete interview
  delete: (id) => api.delete(`/interviews/${id}`),
};

// ============================================================================
// Analytics API
// ============================================================================
export const analyticsAPI = {
  // Get weekly analytics (last 7 days)
  getWeekly: (userId) => api.get(`/analytics/weekly/${userId}`),

  // Get monthly analytics (last 30 days)
  getMonthly: (userId) => api.get(`/analytics/monthly/${userId}`),

  // Get current streak
  getStreak: (userId) => api.get(`/analytics/streak/${userId}`),
};

export default api;
