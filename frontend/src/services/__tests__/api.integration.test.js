import axios from 'axios';
import api from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('API Service Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  describe('API Configuration', () => {
    test('should have correct base URL configuration', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:54112/api',
      });
    });

    test('should add authorization header when token exists', async () => {
      const mockToken = 'test-jwt-token';
      mockLocalStorage.getItem.mockReturnValue(mockToken);

      mockedAxios.request.mockResolvedValueOnce({ data: 'success' });

      await api.get('/test-endpoint');

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    test('should not add authorization header when no token exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockedAxios.request.mockResolvedValueOnce({ data: 'success' });

      await api.get('/test-endpoint');

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.not.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });
  });

  describe('Authentication API Endpoints', () => {
    test('should handle successful login request', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: 1,
              name: 'Test User',
              email: 'test@example.com',
              role: 'student',
            },
            token: 'jwt-token-here',
          },
          message: 'Login successful',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await api.post('/auth/login', loginData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(result.data).toEqual(mockResponse.data);
    });

    test('should handle login failure with proper error response', async () => {
      const loginData = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Invalid credentials',
          },
          status: 401,
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      try {
        await api.post('/auth/login', loginData);
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toBe('Invalid credentials');
      }
    });

    test('should handle token refresh on 401 response', async () => {
      const refreshToken = 'refresh-token';
      mockLocalStorage.getItem
        .mockReturnValueOnce('expired-token') // First call for Authorization header
        .mockReturnValueOnce(refreshToken);   // Second call for refresh token

      const mockRefreshResponse = {
        data: {
          success: true,
          data: {
            token: 'new-access-token',
            refreshToken: 'new-refresh-token',
          },
        },
      };

      const mockOriginalResponse = {
        data: { message: 'Success after token refresh' },
      };

      // First request fails with 401
      mockedAxios.request
        .mockRejectedValueOnce({
          response: { status: 401 },
          config: { url: '/test-endpoint', _retry: undefined },
        })
        // Refresh token request succeeds
        .mockResolvedValueOnce(mockRefreshResponse)
        // Retry original request succeeds
        .mockResolvedValueOnce(mockOriginalResponse);

      const result = await api.get('/test-endpoint');

      expect(mockedAxios.request).toHaveBeenCalledTimes(3);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'new-access-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
      expect(result.data).toEqual(mockOriginalResponse.data);
    });

    test('should handle refresh token failure and clear storage', async () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce('expired-token')
        .mockReturnValueOnce('invalid-refresh-token');

      mockedAxios.request
        .mockRejectedValueOnce({
          response: { status: 401 },
          config: { url: '/test-endpoint', _retry: undefined },
        })
        .mockRejectedValueOnce({
          response: { status: 401 },
        });

      try {
        await api.get('/test-endpoint');
      } catch (error) {
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('Ideas API Endpoints', () => {
    test('should fetch ideas list with proper parameters', async () => {
      const mockIdeasResponse = {
        data: {
          success: true,
          data: {
            ideas: [
              {
                id: 1,
                title: 'Test Idea 1',
                status: 'pending',
                category: 'Technology',
              },
              {
                id: 2,
                title: 'Test Idea 2',
                status: 'endorsed',
                category: 'Healthcare',
              },
            ],
            totalCount: 2,
            page: 1,
            limit: 10,
          },
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockIdeasResponse);

      const params = {
        page: 1,
        limit: 10,
        status: 'all',
        category: 'all',
      };

      const result = await api.get('/ideas', { params });

      expect(mockedAxios.get).toHaveBeenCalledWith('/ideas', { params });
      expect(result.data.data.ideas).toHaveLength(2);
      expect(result.data.data.totalCount).toBe(2);
    });

    test('should submit new idea successfully', async () => {
      const ideaData = {
        title: 'Revolutionary AI Platform',
        description: 'An innovative AI-powered learning platform',
        category: 'Education Technology',
        problemStatement: 'Current education systems lack personalization',
        proposedSolution: 'AI-powered adaptive learning system',
        targetAudience: 'Students and educators',
        teamMembers: [
          {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Developer',
          },
        ],
      };

      const mockSubmissionResponse = {
        data: {
          success: true,
          data: {
            id: 123,
            ...ideaData,
            status: 'pending',
            submittedAt: '2024-01-20T10:00:00Z',
          },
          message: 'Idea submitted successfully',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockSubmissionResponse);

      const result = await api.post('/ideas', ideaData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/ideas', ideaData);
      expect(result.data.data.id).toBe(123);
      expect(result.data.data.status).toBe('pending');
      expect(result.data.message).toBe('Idea submitted successfully');
    });

    test('should handle idea endorsement by college admin', async () => {
      const endorsementData = {
        ideaId: 456,
        feedback: 'Excellent innovative concept with strong potential',
        recommendation: 'Recommend for incubation',
      };

      const mockEndorsementResponse = {
        data: {
          success: true,
          data: {
            ideaId: 456,
            status: 'endorsed',
            endorsedBy: 'Dr. Jane Smith',
            endorsedAt: '2024-01-20T11:00:00Z',
            feedback: endorsementData.feedback,
          },
          message: 'Idea endorsed successfully',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockEndorsementResponse);

      const result = await api.post(`/ideas/${endorsementData.ideaId}/endorse`, {
        feedback: endorsementData.feedback,
        recommendation: endorsementData.recommendation,
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(`/ideas/${endorsementData.ideaId}/endorse`, {
        feedback: endorsementData.feedback,
        recommendation: endorsementData.recommendation,
      });
      expect(result.data.data.status).toBe('endorsed');
    });

    test('should fetch idea details by ID', async () => {
      const ideaId = 789;
      const mockIdeaDetailResponse = {
        data: {
          success: true,
          data: {
            id: ideaId,
            title: 'Detailed Idea',
            description: 'Comprehensive description of the idea',
            status: 'under_review',
            category: 'FinTech',
            student: {
              id: 1,
              name: 'Alice Johnson',
              email: 'alice@example.com',
            },
            teamMembers: [],
            comments: [
              {
                id: 1,
                content: 'Great concept!',
                author: 'Prof. Smith',
                createdAt: '2024-01-19T15:00:00Z',
              },
            ],
            attachments: [],
          },
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockIdeaDetailResponse);

      const result = await api.get(`/ideas/${ideaId}`);

      expect(mockedAxios.get).toHaveBeenCalledWith(`/ideas/${ideaId}`);
      expect(result.data.data.id).toBe(ideaId);
      expect(result.data.data.status).toBe('under_review');
      expect(result.data.data.comments).toHaveLength(1);
    });
  });

  describe('Analytics API Endpoints', () => {
    test('should fetch dashboard analytics for college admin', async () => {
      const mockAnalyticsResponse = {
        data: {
          success: true,
          data: {
            totalStudents: 150,
            totalIdeas: 45,
            pendingIdeas: 12,
            endorsedIdeas: 20,
            rejectedIdeas: 8,
            monthlySubmissions: [
              { month: 'Jan', submissions: 8 },
              { month: 'Feb', submissions: 12 },
              { month: 'Mar', submissions: 15 },
            ],
            categoryDistribution: [
              { category: 'Technology', count: 20 },
              { category: 'Healthcare', count: 15 },
              { category: 'Education', count: 10 },
            ],
            recentActivity: [
              {
                type: 'idea_submitted',
                studentName: 'John Doe',
                ideaTitle: 'New Innovation',
                timestamp: '2024-01-20T09:30:00Z',
              },
            ],
          },
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockAnalyticsResponse);

      const result = await api.get('/analytics/dashboard');

      expect(mockedAxios.get).toHaveBeenCalledWith('/analytics/dashboard');
      expect(result.data.data.totalStudents).toBe(150);
      expect(result.data.data.totalIdeas).toBe(45);
      expect(result.data.data.monthlySubmissions).toHaveLength(3);
      expect(result.data.data.categoryDistribution).toHaveLength(3);
    });

    test('should fetch student-specific analytics', async () => {
      const mockStudentAnalyticsResponse = {
        data: {
          success: true,
          data: {
            myIdeasCount: 3,
            pendingIdeas: 1,
            endorsedIdeas: 1,
            rejectedIdeas: 1,
            profileViews: 25,
            ideaViews: 120,
            recentActivity: [
              {
                type: 'idea_endorsed',
                ideaTitle: 'My Great Idea',
                timestamp: '2024-01-19T14:00:00Z',
              },
            ],
          },
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockStudentAnalyticsResponse);

      const result = await api.get('/analytics/student-dashboard');

      expect(mockedAxios.get).toHaveBeenCalledWith('/analytics/student-dashboard');
      expect(result.data.data.myIdeasCount).toBe(3);
      expect(result.data.data.endorsedIdeas).toBe(1);
    });
  });

  describe('File Upload Functionality', () => {
    test('should handle file upload with proper FormData', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      const mockUploadResponse = {
        data: {
          success: true,
          data: {
            fileId: 'file_123',
            fileName: 'test.pdf',
            fileSize: 1024,
            uploadedAt: '2024-01-20T12:00:00Z',
          },
          message: 'File uploaded successfully',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockUploadResponse);

      const formData = new FormData();
      formData.append('file', mockFile);

      const result = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      expect(mockedAxios.post).toHaveBeenCalledWith('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result.data.data.fileId).toBe('file_123');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle network timeout errors', async () => {
      const timeoutError = new Error('timeout of 5000ms exceeded');
      timeoutError.code = 'ECONNABORTED';
      mockedAxios.get.mockRejectedValueOnce(timeoutError);

      try {
        await api.get('/test-endpoint');
      } catch (error) {
        expect(error.code).toBe('ECONNABORTED');
        expect(error.message).toContain('timeout');
      }
    });

    test('should handle server errors (5xx)', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            success: false,
            message: 'Internal Server Error',
          },
        },
      };

      mockedAxios.get.mockRejectedValueOnce(serverError);

      try {
        await api.get('/test-endpoint');
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data.message).toBe('Internal Server Error');
      }
    });

    test('should handle CORS errors', async () => {
      const corsError = new Error('Network Error');
      corsError.code = 'ERR_NETWORK';
      mockedAxios.get.mockRejectedValueOnce(corsError);

      try {
        await api.get('/test-endpoint');
      } catch (error) {
        expect(error.code).toBe('ERR_NETWORK');
        expect(error.message).toBe('Network Error');
      }
    });

    test('should handle malformed JSON responses', async () => {
      const malformedResponse = {
        data: 'invalid json response',
        status: 200,
      };

      mockedAxios.get.mockResolvedValueOnce(malformedResponse);

      const result = await api.get('/test-endpoint');

      expect(result.data).toBe('invalid json response');
    });
  });

  describe('Request Cancellation', () => {
    test('should cancel pending requests with same key', async () => {
      const mockController = {
        abort: jest.fn(),
      };

      global.AbortController = jest.fn(() => mockController);

      // Make first request
      mockedAxios.get.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

      const firstRequest = api.get('/test-endpoint', { cancelKey: 'test' });

      // Make second request with same key
      mockedAxios.get.mockResolvedValueOnce({ data: 'second response' });

      const secondRequest = api.get('/test-endpoint', { cancelKey: 'test' });

      const result = await secondRequest;

      expect(mockController.abort).toHaveBeenCalled();
      expect(result.data).toBe('second response');
    });
  });

  describe('Request Interceptors', () => {
    test('should add request timestamp for logging', async () => {
      const mockDate = new Date('2024-01-20T10:00:00Z');
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      mockedAxios.request.mockResolvedValueOnce({ data: 'success' });

      await api.get('/test-endpoint');

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            requestStartTime: mockDate.getTime(),
          }),
        })
      );

      spy.mockRestore();
    });
  });

  describe('Response Interceptors', () => {
    test('should log response time for performance monitoring', async () => {
      const mockStartTime = 1642680000000; // Jan 20, 2024 10:00:00 GMT
      const mockEndTime = 1642680000500;   // 500ms later

      const mockConfig = {
        metadata: {
          requestStartTime: mockStartTime,
        },
      };

      const mockResponse = {
        data: { success: true },
        config: mockConfig,
      };

      jest.spyOn(Date, 'now').mockReturnValue(mockEndTime);
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await api.get('/test-endpoint');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Request to /test-endpoint took 500ms')
      );

      consoleSpy.mockRestore();
    });
  });
});