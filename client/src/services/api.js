import axios from 'axios';

// Configuration for the API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Create an instance of axios with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach authentication token
api.interceptors.request.use(
  (config) => {
    // Retrieve token from local storage or a secure cookie
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    // Handle 401 Unauthorized globally
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // You would typically dispatch a logout action here
      console.error('Unauthorized access. Redirecting to login...');
      // Example: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
