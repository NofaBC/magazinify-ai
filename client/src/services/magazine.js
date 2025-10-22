/**
 * Magazine Service
 * 
 * Handles all API requests related to magazines
 */
import api from './api';

/**
 * Create a new magazine for a tenant
 * 
 * @param {string} tenantId - Tenant ID
 * @param {object} magazineData - Magazine data
 * @returns {Promise<object>} - Created magazine
 */
export const createMagazine = async (tenantId, magazineData) => {
  try {
    const response = await api.post(`/tenant/${tenantId}/magazine`, magazineData);
    return response.data;
  } catch (error) {
    console.error('Error creating magazine:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get a magazine by ID
 * 
 * @param {string} tenantId - Tenant ID
 * @param {string} issueId - Issue ID
 * @returns {Promise<object>} - Magazine issue
 */
export const getMagazine = async (tenantId, issueId) => {
  try {
    const response = await api.get(`/tenant/${tenantId}/magazine/${issueId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting magazine:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all magazines for a tenant
 * 
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Array>} - Array of magazine issues
 */
export const getMagazines = async (tenantId) => {
  try {
    const response = await api.get(`/tenant/${tenantId}/magazine`);
    return response.data;
  } catch (error) {
    console.error('Error getting magazines:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Check if a tenant is eligible for magazine creation
 * 
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<object>} - Eligibility status
 */
export const checkMagazineEligibility = async (tenantId) => {
  try {
    const response = await api.get(`/tenant/${tenantId}/magazine/eligibility`);
    return response.data;
  } catch (error) {
    console.error('Error checking eligibility:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get analytics for a magazine
 * 
 * @param {string} tenantId - Tenant ID
 * @param {string} issueId - Issue ID
 * @returns {Promise<object>} - Magazine analytics
 */
export const getMagazineAnalytics = async (tenantId, issueId) => {
  try {
    const response = await api.get(`/tenant/${tenantId}/magazine/${issueId}/analytics`);
    return response.data;
  } catch (error) {
    console.error('Error getting magazine analytics:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Track a magazine view
 * 
 * @param {string} tenantId - Tenant ID
 * @param {string} issueId - Issue ID
 * @returns {Promise<void>}
 */
export const trackMagazineView = async (tenantId, issueId) => {
  try {
    await api.post(`/magazine/${tenantId}/${issueId}/view`);
  } catch (error) {
    console.error('Error tracking magazine view:', error.response?.data || error.message);
    // Don't throw for analytics errors
  }
};

/**
 * Track a magazine link click
 * 
 * @param {string} tenantId - Tenant ID
 * @param {string} issueId - Issue ID
 * @param {string} linkUrl - URL that was clicked
 * @returns {Promise<void>}
 */
export const trackMagazineLinkClick = async (tenantId, issueId, linkUrl) => {
  try {
    await api.post(`/magazine/${tenantId}/${issueId}/click`, { url: linkUrl });
  } catch (error) {
    console.error('Error tracking magazine link click:', error.response?.data || error.message);
    // Don't throw for analytics errors
  }
};

/**
 * Get a public magazine by ID (no auth required)
 * 
 * @param {string} tenantId - Tenant ID
 * @param {string} issueId - Issue ID
 * @returns {Promise<object>} - Public magazine data
 */
export const getPublicMagazine = async (tenantId, issueId) => {
  try {
    const response = await api.get(`/magazine/${tenantId}/${issueId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting public magazine:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Retry magazine generation if it failed
 * 
 * @param {string} tenantId - Tenant ID
 * @param {string} issueId - Issue ID
 * @returns {Promise<object>} - Updated magazine status
 */
export const retryMagazineGeneration = async (tenantId, issueId) => {
  try {
    const response = await api.post(`/tenant/${tenantId}/magazine/${issueId}/retry`);
    return response.data;
  } catch (error) {
    console.error('Error retrying magazine generation:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete a magazine
 * 
 * @param {string} tenantId - Tenant ID
 * @param {string} issueId - Issue ID
 * @returns {Promise<void>}
 */
export const deleteMagazine = async (tenantId, issueId) => {
  try {
    await api.delete(`/tenant/${tenantId}/magazine/${issueId}`);
  } catch (error) {
    console.error('Error deleting magazine:', error.response?.data || error.message);
    throw error;
  }
};
