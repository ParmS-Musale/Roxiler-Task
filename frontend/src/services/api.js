import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle 403 forbidden errors
    if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data?.message);
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Register user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current user
  getMe: () => api.get('/auth/me'),
  
  // Update password
  updatePassword: (passwordData) => api.put('/auth/password', passwordData),
  
  // Logout user
  logout: () => api.post('/auth/logout')
};

// User API calls
export const userAPI = {
  // Get all users (admin only)
  getUsers: (params) => api.get('/users', { params }),
  
  // Get user by ID
  getUser: (id) => api.get(`/users/${id}`),
  
  // Create user (admin only)
  createUser: (userData) => api.post('/users', userData),
  
  // Update user
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  
  // Delete user (admin only)
  deleteUser: (id) => api.delete(`/users/${id}`)
};

// Store API calls
export const storeAPI = {
  // Get all stores
  getStores: (params) => api.get('/stores', { params }),
  
  // Get store by ID
  getStore: (id) => api.get(`/stores/${id}`),
  
  // Create store (admin only)
  createStore: (storeData) => api.post('/stores', storeData),
  
  // Update store
  updateStore: (id, storeData) => api.put(`/stores/${id}`, storeData),
  
  // Delete store (admin only)
  deleteStore: (id) => api.delete(`/stores/${id}`)
};

// Rating API calls
export const ratingAPI = {
  // Get all ratings (admin only)
  getRatings: (params) => api.get('/ratings', { params }),
  
  // Get ratings for store
  getStoreRatings: (storeId, params) => api.get(`/ratings/store/${storeId}`, { params }),
  
  // Get user's ratings
  getUserRatings: (userId, params) => api.get(`/ratings/user/${userId}`, { params }),
  
  // Submit rating
  submitRating: (ratingData) => api.post('/ratings', ratingData),
  
  // Update rating
  updateRating: (id, ratingData) => api.put(`/ratings/${id}`, ratingData),
  
  // Delete rating
  deleteRating: (id) => api.delete(`/ratings/${id}`),
  
  // Get rating statistics
  getRatingStats: () => api.get('/ratings/stats'),
  
  // Get store statistics
  getStoreStats: (storeId) => api.get(`/ratings/store/${storeId}/stats`)
};

// Admin API calls
export const adminAPI = {
  // Get dashboard data
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Get users with admin filters
  getAdminUsers: (params) => api.get('/admin/users', { params })
};

// Store Owner API calls
export const storeOwnerAPI = {
  // Get store owner dashboard
  getDashboard: () => api.get('/store-owner/dashboard'),
  
  // Get ratings for owner's store
  getRatings: (params) => api.get('/store-owner/ratings', { params }),
  
  // Get customers who rated
  getCustomers: (params) => api.get('/store-owner/customers', { params })
};

export default api;