import axios from 'axios';

// Mobile API configuration - This is separate from your main API
// This won't affect your localhost functionality

// You'll need to replace this with your actual ngrok URL
const MOBILE_API_URL = 'https://YOUR-NGROK-URL.ngrok.io/api';

const mobileApi = axios.create({
  baseURL: MOBILE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add token
mobileApi.interceptors.request.use(
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

// Response interceptor
mobileApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default mobileApi;
