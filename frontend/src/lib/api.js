import axios from 'axios';

/**
 * AXIOS API SERVICE
 * 
 * Centralized API client with:
 * - Automatic cookie handling (withCredentials)
 * - Auto-logout on 401 responses
 * - Request/response interceptors
 */

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

// Response interceptor for auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto logout on 401 Unauthorized
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      
      // Only redirect if not already on a login page
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        // Clear any stored auth data
        localStorage.removeItem('user');
        
        // Redirect based on current role context
        if (currentPath.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else if (currentPath.startsWith('/tutor')) {
          window.location.href = '/tutor/login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
