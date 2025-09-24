import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../store/slices/authSlice';
import ideaSlice from '../store/slices/ideaSlice';
import userSlice from '../store/slices/userSlice';
import notificationSlice from '../store/slices/notificationSlice';
import themeSlice from '../store/slices/themeSlice';

// Create a test store
export const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      ideas: ideaSlice,
      users: userSlice,
      notifications: notificationSlice,
      theme: themeSlice,
    },
    preloadedState: initialState,
  });
};

// Custom render function that includes providers
export const renderWithProviders = (
  ui,
  {
    initialState = {},
    store = createTestStore(initialState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Mock user data for testing
export const mockUsers = {
  student: {
    id: 1,
    name: 'John Doe',
    email: 'student@example.com',
    role: 'student',
    college: 'MIT',
    department: 'Computer Science',
    avatar: 'https://example.com/avatar.jpg'
  },
  college: {
    id: 2,
    name: 'Dr. Jane Smith',
    email: 'college@example.com',
    role: 'college',
    collegeName: 'MIT',
    position: 'Innovation Director',
    avatar: 'https://example.com/avatar.jpg'
  },
  incubator: {
    id: 3,
    name: 'Alex Johnson',
    email: 'incubator@example.com',
    role: 'incubator',
    organizationName: 'TechStart Incubator',
    position: 'Program Manager',
    avatar: 'https://example.com/avatar.jpg'
  }
};

// Mock idea data for testing
export const mockIdeas = [
  {
    id: 1,
    title: 'AI-Powered Study Assistant',
    description: 'An intelligent tutoring system that adapts to individual learning styles.',
    category: 'Education Technology',
    status: 'pending',
    submittedAt: '2024-01-20T10:00:00Z',
    studentId: 1,
    studentName: 'John Doe',
    views: 45,
    comments: []
  },
  {
    id: 2,
    title: 'Sustainable Energy Monitor',
    description: 'IoT-based system for monitoring energy consumption.',
    category: 'Green Technology',
    status: 'endorsed',
    submittedAt: '2024-01-18T10:00:00Z',
    studentId: 1,
    studentName: 'John Doe',
    views: 78,
    comments: []
  }
];

// Helper function to create authenticated state
export const createAuthenticatedState = (userRole = 'student') => ({
  auth: {
    user: mockUsers[userRole],
    token: 'mock-token',
    isAuthenticated: true,
    loading: false,
    error: null,
  },
  theme: {
    mode: 'light',
  },
  notifications: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  ideas: {
    ideas: mockIdeas,
    currentIdea: null,
    loading: false,
    error: null,
    filters: {
      status: 'all',
      category: 'all',
      search: '',
    },
  },
  users: {
    users: Object.values(mockUsers),
    loading: false,
    error: null,
    filters: {
      role: 'all',
      status: 'all',
      search: '',
    },
  },
});

// Mock API responses
export const mockApiResponses = {
  login: {
    user: mockUsers.student,
    token: 'mock-jwt-token'
  },
  ideas: mockIdeas,
  users: Object.values(mockUsers)
};

// Helper to wait for async operations
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export * from '@testing-library/react';
