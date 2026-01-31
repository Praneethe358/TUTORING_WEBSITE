import axios from 'axios';

/**
 * AXIOS API SERVICE
 * 
 * Centralized API client with:
 * - Automatic cookie handling (withCredentials)
 * - Auto-logout on 401 responses
 * - Request/response interceptors
 * - Global error logging (in development)
 */

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: Number(process.env.REACT_APP_API_TIMEOUT_MS || 30000)
});

// Request interceptor for logging (development only)
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for auto-logout on 401 and error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      error.message = 'Unable to connect to server. Please check your connection.';
    }
    
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 API Error');
      console.error('Error:', error.message);
      console.log('Status:', error.response?.status);
      console.log('URL:', error.config?.url);
      console.log('Data:', error.response?.data);
      console.groupEnd();
    }
    
    // Auto logout on 401 Unauthorized
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      
      // Only redirect if not already on home page or login pages
      if (currentPath !== '/' && !currentPath.includes('/login') && !currentPath.includes('/register')) {
        // Store intended destination for redirect after login
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        
        // Clear any stored auth data
        localStorage.removeItem('user');
        
        // Always redirect to home page
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
