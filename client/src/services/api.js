import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
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
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Companies API
export const companiesAPI = {
  getAll: async (params) => {
    try {
      const response = await api.get('/companies', { params });
      return { success: true, ...response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch companies' 
      };
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/companies/${id}`);
      return { success: true, ...response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch company' 
      };
    }
  },
  create: async (companyData) => {
    try {
      const response = await api.post('/companies', companyData);
      return { success: true, company: response.data.company };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create company' 
      };
    }
  },
  update: async (id, companyData) => {
    try {
      const response = await api.put(`/companies/${id}`, companyData);
      return { success: true, ...response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update company' 
      };
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/companies/${id}`);
      return { success: true, ...response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete company' 
      };
    }
  },
  getStats: async () => {
    try {
      const response = await api.get('/companies/stats/overview');
      return { success: true, ...response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch company stats' 
      };
    }
  },
};

// Reviews API
export const reviewsAPI = {
  getAll: async (params) => {
    try {
      const response = await api.get('/reviews', { params });
      return { success: true, ...response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch reviews' 
      };
    }
  },
  getAllForCompany: async (companyId) => {
    try {
      const response = await api.get(`/reviews/company/${companyId}`);
      return { success: true, ...response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch company reviews' 
      };
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/reviews/${id}`);
      return { success: true, ...response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch review' 
      };
    }
  },
  create: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return { success: true, ...response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create review' 
      };
    }
  },
  update: async (id, reviewData) => {
    try {
      const response = await api.put(`/reviews/${id}`, reviewData);
      return { success: true, ...response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update review' 
      };
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/reviews/${id}`);
      return { success: true, ...response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete review' 
      };
    }
  },
  markHelpful: async (id) => {
    try {
      const response = await api.post(`/reviews/${id}/helpful`);
      return { success: true, ...response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark review as helpful' 
      };
    }
  },
};



// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  verify: (id) => api.put(`/users/${id}/verify`),
  activate: (id) => api.put(`/users/${id}/activate`),
  deactivate: (id) => api.put(`/users/${id}/deactivate`),
  getStats: () => api.get('/users/stats/overview'),
};

export default api; 