import api from './api';

/**
 * Authentication Service
 * Handles all API calls related to user authentication.
 */

const authService = {
  /**
   * Registers a new user.
   * @param {string} email
   * @param {string} password
   * @param {string} companyName
   * @returns {Promise<object>} User data and token
   */
  register: async (email, password, companyName) => {
    try {
      const response = await api.post('/auth/register', { email, password, companyName });
      // Store token securely
      localStorage.setItem('authToken', response.data.token);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  /**
   * Logs in an existing user.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} User data and token
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      // Store token securely
      localStorage.setItem('authToken', response.data.token);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  /**
   * Logs out the current user.
   */
  logout: () => {
    // Clear token
    localStorage.removeItem('authToken');
    // In a real app, you might also call a backend endpoint to invalidate the session
    return Promise.resolve(true);
  },

  /**
   * Requests a password reset link.
   * @param {string} email
   * @returns {Promise<object>}
   */
  resetPassword: async (email) => {
    try {
      const response = await api.post('/auth/reset-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },

  /**
   * Verifies the current user's token and returns user data.
   * @returns {Promise<object>} Current user data
   */
  verifyToken: async () => {
    try {
      // The token is automatically sent via the interceptor
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      // Token is invalid or expired
      localStorage.removeItem('authToken');
      throw new Error('Session expired or invalid.');
    }
  }
};

export default authService;
