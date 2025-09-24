// utils/tokenUtils.js
import jwt_decode from 'jwt-decode';

export const isTokenExpired = (token) => {
  try {
    const decodedToken = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const checkAndRefreshToken = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) return false;
  
  if (isTokenExpired(token)) {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.data.token);
        return true;
      } else {
        // Refresh failed, logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return false;
      }
    } catch (error) {
      return false;
    }
  }
  
  return true;
};
