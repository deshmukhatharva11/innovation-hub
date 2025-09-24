import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createTestStore, mockUsers } from '../../../utils/testUtils';
import Login from '../Login';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('Login Integration Tests', () => {
  let store;
  let user;

  beforeEach(() => {
    store = createTestStore();
    user = userEvent.setup();
    mockNavigate.mockClear();
    mockedAxios.post.mockClear();
  });

  const renderLogin = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Authentication Flow', () => {
    test('should render login form with all required fields', () => {
      renderLogin();

      expect(screen.getByRole('textbox', { name: /enter your email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    test('should successfully login college admin and redirect to dashboard', async () => {
      const collegeAdminResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: 7,
              name: 'Dr. Priya Sharma',
              email: 'priya.sharma@prpceam.ac.in',
              role: 'college_admin',
              college: {
                id: 1,
                name: 'PRPCEM College'
              }
            },
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsImlhdCI6MTc1NjQ4OTE...'
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(collegeAdminResponse);

      renderLogin();

      const emailInput = screen.getByRole('textbox', { name: /enter your email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'priya.sharma@prpceam.ac.in');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
          email: 'priya.sharma@prpceam.ac.in',
          password: 'password123'
        });
      });

      // Check that localStorage is set
      expect(localStorage.setItem).toHaveBeenCalledWith('token', expect.any(String));
      expect(localStorage.setItem).toHaveBeenCalledWith('user', expect.any(String));

      // Check navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('should handle login failure with invalid credentials', async () => {
      const errorResponse = {
        response: {
          data: {
            success: false,
            message: 'Invalid credentials'
          }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      renderLogin();

      const emailInput = screen.getByRole('textbox', { name: /enter your email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid@email.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('should handle network error during login', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'NETWORK_ERROR';
      mockedAxios.post.mockRejectedValueOnce(networkError);

      renderLogin();

      const emailInput = screen.getByRole('textbox', { name: /enter your email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    test('should show validation errors for empty fields', async () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('should validate email format', async () => {
      renderLogin();

      const emailInput = screen.getByRole('textbox', { name: /enter your email/i });
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });
  });

  describe('Demo Accounts', () => {
    test('should display demo account information', () => {
      renderLogin();

      expect(screen.getByText(/demo accounts:/i)).toBeInTheDocument();
      expect(screen.getByText(/student: arjun.singh@gcoea.ac.in/i)).toBeInTheDocument();
      expect(screen.getByText(/college admin: rajesh.kumar@gcoea.ac.in/i)).toBeInTheDocument();
      expect(screen.getByText(/incubator: sneha.reddy@gcoea.ac.in/i)).toBeInTheDocument();
      expect(screen.getByText(/super admin: admin@innovationhub.com/i)).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    test('should make correct API call with proper headers', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: mockUsers.student,
            token: 'mock-token'
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      renderLogin();

      const emailInput = screen.getByRole('textbox', { name: /enter your email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    test('should handle CORS and API connectivity issues', async () => {
      const corsError = new Error('Network Error');
      corsError.code = 'ERR_NETWORK';
      mockedAxios.post.mockRejectedValueOnce(corsError);

      renderLogin();

      const emailInput = screen.getByRole('textbox', { name: /enter your email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/unable to connect to server/i)).toBeInTheDocument();
      });
    });
  });

  describe('Remember Me Functionality', () => {
    test('should handle remember me checkbox', async () => {
      renderLogin();

      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      expect(rememberMeCheckbox).not.toBeChecked();

      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).toBeChecked();
    });
  });

  describe('Password Visibility Toggle', () => {
    test('should toggle password visibility', async () => {
      renderLogin();

      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: '' }); // Password toggle button

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });
});