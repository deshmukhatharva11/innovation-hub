import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createTestStore, createAuthenticatedState } from '../../../utils/testUtils';
import CollegeDashboard from '../CollegeDashboard';
import StudentDashboard from '../student/StudentDashboard';
import IncubatorDashboard from '../IncubatorDashboard';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
  });

  describe('College Admin Dashboard', () => {
    test('should load dashboard analytics successfully', async () => {
      const mockAnalytics = {
        data: {
          success: true,
          data: {
            users: 2,
            ideas: 1,
            colleges: 0,
            incubators: 0,
            recentIdeas: [
              {
                id: 2,
                title: 'Eco-Friendly Electric Vehicle Charging Network',
                status: 'under_review',
                studentName: 'Kavya Nair',
                submittedAt: '2024-01-20T10:00:00Z'
              }
            ],
            recentUsers: [
              {
                id: 1,
                name: 'Kavya Nair',
                email: 'kavya.nair@prpceam.ac.in',
                role: 'student'
              }
            ]
          }
        }
      };

      const mockIdeas = {
        data: {
          success: true,
          data: {
            ideas: [
              {
                id: 2,
                title: 'Eco-Friendly Electric Vehicle Charging Network',
                description: 'A network of solar-powered EV charging stations',
                status: 'under_review',
                category: 'Green Technology',
                studentName: 'Kavya Nair',
                submittedAt: '2024-01-20T10:00:00Z'
              }
            ],
            totalCount: 1
          }
        }
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockAnalytics) // Dashboard analytics
        .mockResolvedValueOnce(mockIdeas);    // Ideas list

      const store = createTestStore(createAuthenticatedState('college'));

      render(
        <Provider store={store}>
          <BrowserRouter>
            <CollegeDashboard />
          </BrowserRouter>
        </Provider>
      );

      // Check loading states initially
      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByTestId('dashboard-loading')).not.toBeInTheDocument();
      });

      // Verify API calls were made
      expect(mockedAxios.get).toHaveBeenCalledWith('/analytics/dashboard');
      expect(mockedAxios.get).toHaveBeenCalledWith('/ideas', expect.any(Object));

      // Check dashboard metrics
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Users count
        expect(screen.getByText('1')).toBeInTheDocument(); // Ideas count
        expect(screen.getByText('Eco-Friendly Electric Vehicle Charging Network')).toBeInTheDocument();
        expect(screen.getByText('Kavya Nair')).toBeInTheDocument();
      });
    });

    test('should handle dashboard analytics API failure', async () => {
      const apiError = {
        response: {
          data: {
            success: false,
            message: 'Failed to fetch analytics data'
          }
        }
      };

      mockedAxios.get.mockRejectedValueOnce(apiError);

      const store = createTestStore(createAuthenticatedState('college'));

      render(
        <Provider store={store}>
          <BrowserRouter>
            <CollegeDashboard />
          </BrowserRouter>
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText(/failed to load dashboard data/i)).toBeInTheDocument();
      });
    });

    test('should load students list for college admin', async () => {
      const mockStudents = {
        data: {
          success: true,
          data: {
            users: [
              {
                id: 1,
                name: 'Kavya Nair',
                email: 'kavya.nair@prpceam.ac.in',
                role: 'student',
                department: 'Computer Science',
                year: '3rd Year',
                college: 'PRPCEM College'
              }
            ],
            totalCount: 1
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockStudents);

      const store = createTestStore(createAuthenticatedState('college'));

      render(
        <Provider store={store}>
          <BrowserRouter>
            <CollegeDashboard />
          </BrowserRouter>
        </Provider>
      );

      // Navigate to students section
      const studentsTab = screen.getByText(/students/i);
      await userEvent.click(studentsTab);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('/users', {
          params: { role: 'student' }
        });
        expect(screen.getByText('Kavya Nair')).toBeInTheDocument();
        expect(screen.getByText('kavya.nair@prpceam.ac.in')).toBeInTheDocument();
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
      });
    });

    test('should handle idea endorsement workflow', async () => {
      const mockIdea = {
        data: {
          success: true,
          data: {
            id: 2,
            title: 'Eco-Friendly Electric Vehicle Charging Network',
            description: 'A network of solar-powered EV charging stations',
            status: 'pending',
            category: 'Green Technology',
            studentName: 'Kavya Nair'
          }
        }
      };

      const endorseResponse = {
        data: {
          success: true,
          message: 'Idea endorsed successfully'
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockIdea);
      mockedAxios.post.mockResolvedValueOnce(endorseResponse);

      const store = createTestStore(createAuthenticatedState('college'));

      render(
        <Provider store={store}>
          <BrowserRouter>
            <CollegeDashboard />
          </BrowserRouter>
        </Provider>
      );

      // Wait for ideas to load and click endorse button
      await waitFor(() => {
        const endorseButton = screen.getByRole('button', { name: /endorse/i });
        expect(endorseButton).toBeInTheDocument();
      });

      const endorseButton = screen.getByRole('button', { name: /endorse/i });
      await userEvent.click(endorseButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/ideas/2/endorse', expect.any(Object));
      });
    });
  });

  describe('Student Dashboard', () => {
    test('should load student-specific dashboard data', async () => {
      const mockStudentAnalytics = {
        data: {
          success: true,
          data: {
            myIdeasCount: 2,
            endorsedIdeas: 1,
            pendingIdeas: 1,
            recentActivity: []
          }
        }
      };

      const mockMyIdeas = {
        data: {
          success: true,
          data: {
            ideas: [
              {
                id: 1,
                title: 'AI Study Assistant',
                status: 'pending',
                category: 'Education',
                submittedAt: '2024-01-20T10:00:00Z'
              },
              {
                id: 2,
                title: 'Green Energy Monitor',
                status: 'endorsed',
                category: 'Environment',
                submittedAt: '2024-01-18T10:00:00Z'
              }
            ]
          }
        }
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockStudentAnalytics)
        .mockResolvedValueOnce(mockMyIdeas);

      const store = createTestStore(createAuthenticatedState('student'));

      render(
        <Provider store={store}>
          <BrowserRouter>
            <StudentDashboard />
          </BrowserRouter>
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // My ideas count
        expect(screen.getByText('1')).toBeInTheDocument(); // Endorsed ideas
        expect(screen.getByText('AI Study Assistant')).toBeInTheDocument();
        expect(screen.getByText('Green Energy Monitor')).toBeInTheDocument();
      });

      expect(mockedAxios.get).toHaveBeenCalledWith('/analytics/student-dashboard');
      expect(mockedAxios.get).toHaveBeenCalledWith('/ideas/my-ideas');
    });

    test('should handle idea submission from dashboard', async () => {
      const submitResponse = {
        data: {
          success: true,
          data: {
            id: 3,
            title: 'New Innovation',
            status: 'pending'
          },
          message: 'Idea submitted successfully'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(submitResponse);

      const store = createTestStore(createAuthenticatedState('student'));

      render(
        <Provider store={store}>
          <BrowserRouter>
            <StudentDashboard />
          </BrowserRouter>
        </Provider>
      );

      const submitIdeaButton = screen.getByRole('button', { name: /submit new idea/i });
      await userEvent.click(submitIdeaButton);

      // This would typically open a modal or navigate to submission form
      expect(submitIdeaButton).toBeInTheDocument();
    });
  });

  describe('Incubator Dashboard', () => {
    test('should load incubator-specific metrics and ideas', async () => {
      const mockIncubatorAnalytics = {
        data: {
          success: true,
          data: {
            totalIdeas: 5,
            acceptedIdeas: 2,
            activeStartups: 3,
            portfolioValue: 15000000
          }
        }
      };

      const mockIncubatorIdeas = {
        data: {
          success: true,
          data: {
            ideas: [
              {
                id: 3,
                title: 'HealthTech Innovation',
                status: 'accepted',
                category: 'Healthcare',
                fundingAmount: 500000
              }
            ]
          }
        }
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockIncubatorAnalytics)
        .mockResolvedValueOnce(mockIncubatorIdeas);

      const store = createTestStore(createAuthenticatedState('incubator'));

      render(
        <Provider store={store}>
          <BrowserRouter>
            <IncubatorDashboard />
          </BrowserRouter>
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument(); // Total ideas
        expect(screen.getByText('2')).toBeInTheDocument(); // Accepted ideas
        expect(screen.getByText('3')).toBeInTheDocument(); // Active startups
        expect(screen.getByText('HealthTech Innovation')).toBeInTheDocument();
      });

      expect(mockedAxios.get).toHaveBeenCalledWith('/analytics/incubator-dashboard');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle network connectivity issues', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'ERR_NETWORK';
      mockedAxios.get.mockRejectedValue(networkError);

      const store = createTestStore(createAuthenticatedState('college'));

      render(
        <Provider store={store}>
          <BrowserRouter>
            <CollegeDashboard />
          </BrowserRouter>
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText(/unable to connect to server/i)).toBeInTheDocument();
      });
    });

    test('should handle empty dashboard data gracefully', async () => {
      const emptyAnalytics = {
        data: {
          success: true,
          data: {
            users: 0,
            ideas: 0,
            colleges: 0,
            incubators: 0,
            recentIdeas: [],
            recentUsers: []
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(emptyAnalytics);

      const store = createTestStore(createAuthenticatedState('college'));

      render(
        <Provider store={store}>
          <BrowserRouter>
            <CollegeDashboard />
          </BrowserRouter>
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText(/no recent activity/i)).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });

    test('should refresh dashboard data on user interaction', async () => {
      const initialAnalytics = {
        data: {
          success: true,
          data: { users: 1, ideas: 1, colleges: 0, incubators: 0 }
        }
      };

      const refreshedAnalytics = {
        data: {
          success: true,
          data: { users: 2, ideas: 3, colleges: 1, incubators: 0 }
        }
      };

      mockedAxios.get
        .mockResolvedValueOnce(initialAnalytics)
        .mockResolvedValueOnce(refreshedAnalytics);

      const store = createTestStore(createAuthenticatedState('college'));

      render(
        <Provider store={store}>
          <BrowserRouter>
            <CollegeDashboard />
          </BrowserRouter>
        </Provider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });

      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await userEvent.click(refreshButton);

      // Wait for refreshed data
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });
});