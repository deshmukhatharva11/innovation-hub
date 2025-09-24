import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { setUser, logout } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const isMountedRef = useRef(true);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(null);

  console.log('🔒 ProtectedRoute - Auth State:', { isAuthenticated, user: !!user, token: !!token, isLoadingUser });

  useEffect(() => {
    console.log('🔒 ProtectedRoute - useEffect triggered:', { token: !!token, user: !!user });
    // Check if user is logged in but user data is missing
    if (token && !user) {
      console.log('🔒 ProtectedRoute - Token exists but no user, fetching user data...');
      fetchUserData();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [token, user]);

  const fetchUserData = async (retryCount = 0) => {
    if (isLoadingUser) return; // Prevent multiple simultaneous requests
    
    try {
      setIsLoadingUser(true);
      setLoadingStartTime(Date.now());
      console.log(`🔒 ProtectedRoute - Fetching user data... (attempt ${retryCount + 1})`);
      
      // Fetch user data from the API using the token with timeout
      const response = await Promise.race([
        authAPI.getCurrentUser(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]);
      
      // Only update state if component is still mounted
      if (!isMountedRef.current) return;
      
      if (response.data?.data?.user) {
        const fetchedUser = response.data.data.user;
        console.log('🔒 ProtectedRoute - User data fetched successfully:', fetchedUser.name);
        dispatch(setUser(fetchedUser));
      } else {
        // If API call fails, clear token and redirect to login
        toast.error('Session expired. Please login again.');
        dispatch(logout());
      }
    } catch (error) {
      // Only show errors if component is still mounted
      if (!isMountedRef.current) return;
      
      // Don't show error for cancelled/aborted requests
      if (error.name === 'CancelledError' || 
          error.code === 'ERR_CANCELED' || 
          error.name === 'AbortError' ||
          error.message?.includes('aborted')) {
        console.log('Auth request was cancelled or aborted');
        return;
      }
      
      console.error('Error fetching user data:', error);
      
      // Retry logic for network errors
      if (retryCount < 2 && (
        error.message === 'Request timeout' ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('timeout')
      )) {
        console.log(`Retrying user data fetch... (attempt ${retryCount + 1})`);
        setTimeout(() => fetchUserData(retryCount + 1), 2000);
        return;
      }
      
      // Handle timeout specifically
      if (error.message === 'Request timeout') {
        toast.error('Connection timeout. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load user data. Please login again.');
      }
      
      dispatch(logout());
    } finally {
      if (isMountedRef.current) {
        setIsLoadingUser(false);
        setLoadingStartTime(null);
      }
    }
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  // If user data is still loading
  if (token && !user && isLoadingUser) {
    // Check if loading has been going on for too long (15 seconds)
    if (loadingStartTime && Date.now() - loadingStartTime > 15000) {
      console.log('🔒 ProtectedRoute - Loading timeout, clearing invalid token');
      toast.error('Connection timeout. Please login again.');
      dispatch(logout());
      return <Navigate to="/login" replace />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400">Loading user data...</p>
          <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-500">Please wait...</p>
        </div>
      </div>
    );
  }

  // If we have a token but no user and we're not loading, the token is invalid
  if (token && !user && !isLoadingUser) {
    console.log('🔒 ProtectedRoute - Token exists but no user data, clearing invalid token');
    toast.error('Session expired. Please login again.');
    dispatch(logout());
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
