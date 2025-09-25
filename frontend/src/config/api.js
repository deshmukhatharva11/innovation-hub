// API Configuration for different environments
const getApiUrl = () => {
  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    // Use environment variable if available, otherwise use deployed backend
    return process.env.REACT_APP_API_URL || 'https://web-production-33931.up.railway.app/api';
  }
  
  // Development environment
  return 'http://localhost:3001/api';
};

export const API_BASE_URL = getApiUrl();

// Helper function to get full API URL
export const getFullApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Specific API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  
  // CMS endpoints
  CMS_CONTENT: '/cms/content',
  CMS_NOTIFICATIONS: '/cms/notifications',
  CMS_MEDIA: '/cms/media',
  CMS_TEMPLATES: '/cms/templates/content',
  CMS_ANALYTICS: '/cms/analytics',
  
  // Admin CMS endpoints
  ADMIN_CIRCULARS: '/admin/cms/circulars',
  
  // Public CMS endpoints
  PUBLIC_CIRCULARS: '/public/cms/circulars',
  PUBLIC_CIRCULAR_DOWNLOAD: (id) => `/public/cms/circulars/${id}/download`,
  
  // Other endpoints
  IDEAS: '/ideas',
  USERS: '/users',
  COLLEGES: '/colleges',
  DOCUMENTS: '/documents',
  STATISTICS: '/statistics'
};

export default {
  API_BASE_URL,
  getFullApiUrl,
  API_ENDPOINTS
};
