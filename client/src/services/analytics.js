import api from './api';

/**
 * Analytics Service
 * Handles sending custom event data to the backend for tracking.
 */

const analyticsService = {
  /**
   * Tracks a custom user event.
   * @param {string} eventName - The name of the event (e.g., 'magazine_created').
   * @param {object} [eventData={}] - Additional data to track with the event.
   * @returns {Promise<void>}
   */
  trackEvent: async (eventName, eventData = {}) => {
    try {
      // Send the event data to the backend
      await api.post('/analytics/track', {
        event: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
      });
      // console.log(`Analytics event tracked: ${eventName}`);
    } catch (error) {
      // Log the error but don't re-throw, as analytics tracking should not block user flow
      console.error(`Failed to track analytics event ${eventName}:`, error);
    }
  },

  /**
   * Fetches analytics data for a specific magazine.
   * @param {string} magazineId
   * @returns {Promise<object>} Analytics report data
   */
  getMagazineAnalytics: async (magazineId) => {
    try {
      const response = await api.get(`/analytics/magazine/${magazineId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || `Failed to fetch analytics for magazine ${magazineId}`);
    }
  },
};

export default analyticsService;
