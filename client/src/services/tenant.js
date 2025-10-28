import api from './api';

/**
 * Tenant Service
 * Handles all API calls related to the current user's tenant (company) data.
 */

const tenantService = {
  /**
   * Fetches the current tenant's data.
   * @returns {Promise<object>} Tenant data
   */
  getTenantData: async () => {
    try {
      const response = await api.get('/tenant/data');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tenant data');
    }
  },

  /**
   * Updates the tenant's profile settings.
   * @param {object} settings - The settings to update (e.g., name, role).
   * @returns {Promise<object>} Updated tenant data
   */
  updateProfile: async (settings) => {
    try {
      const response = await api.put('/tenant/profile', settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  /**
   * Updates the tenant's brand assets (logo, colors, etc.).
   * @param {object} assets - The brand assets to update.
   * @returns {Promise<object>} Updated tenant data
   */
  updateBrandAssets: async (assets) => {
    try {
      const response = await api.put('/tenant/brand-assets', assets);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update brand assets');
    }
  },

  /**
   * Fetches the tenant's billing information and invoice history.
   * @returns {Promise<object>} Billing data
   */
  getBillingInfo: async () => {
    try {
      const response = await api.get('/tenant/billing');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch billing info');
    }
  },
};

export default tenantService;
