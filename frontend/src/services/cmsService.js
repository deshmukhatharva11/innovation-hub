import axios from 'axios';
import { mockApi } from './mockApi';

// Create axios instance for CMS API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://backend-8ttdpow9s-shris-projects-68144c68.vercel.app',
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add token
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

/**
 * Service for fetching and managing CMS content
 */
export const cmsService = {
  /**
   * Get page content by slug
   * @param {string} slug - The page slug
   * @returns {Promise} - The API response
   */
  getPageContent: async (slug) => {
    try {
      const response = await api.get(`/public/cms/pages/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching page content for ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Get latest circulars
   * @param {number} limit - Number of circulars to fetch
   * @returns {Promise} - The API response
   */
  getLatestCirculars: async (limit = 5) => {
    try {
      const response = await api.get(`/public/cms/circulars`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching latest circulars, using mock data:', error);
      // Fallback to mock data
      return mockApi.getCirculars();
    }
  },

  /**
   * Get latest announcements
   * @param {number} limit - Number of announcements to fetch
   * @returns {Promise} - The API response
   */
  getLatestAnnouncements: async (limit = 5) => {
    try {
      const response = await api.get(`/public/cms/announcements`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching latest announcements:', error);
      throw error;
    }
  },

  /**
   * Get portal statistics
   * @returns {Promise} - The API response
   */
  getPortalStatistics: async () => {
    try {
      const response = await api.get(`/public/cms/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching portal statistics, using mock data:', error);
      // Fallback to mock data
      return mockApi.getStats();
    }
  },

  /**
   * Get participating colleges
   * @returns {Promise} - The API response
   */
  getParticipatingColleges: async () => {
    try {
      const response = await api.get(`/public/cms/colleges`);
      return response.data;
    } catch (error) {
      console.error('Error fetching participating colleges:', error);
      throw error;
    }
  }
};

export default cmsService;
