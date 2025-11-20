import axios from 'axios';

const API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password, role) =>
    api.post('/auth/login', { username, password, role }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Projects API
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getStats: () => api.get('/projects/stats'),
};

// Steps API
export const stepsAPI = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/steps`),
  getProgress: (projectId) => api.get(`/projects/${projectId}/steps/progress`),
  getOverdue: (params) => api.get('/steps/overdue', { params }),
  updateStatus: (id, status) => api.patch(`/steps/${id}/status`, { status }),
  update: (id, data) => api.put(`/steps/${id}`, data),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Departments API
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    return api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadDocuments: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('documents', file);
    });
    return api.post('/upload/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Supervisor Reviews API
export const supervisorReviewsAPI = {
  create: (data) => api.post('/supervisor-reviews', data),
  getByProject: (projectId) => api.get(`/supervisor-reviews/project/${projectId}`),
  getReport: (params) => api.get('/supervisor-reviews/report', { params }),
};

export default api;
