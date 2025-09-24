import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createTestStore, createAuthenticatedState } from '../../../utils/testUtils';
import SubmitIdea from '../SubmitIdea';

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

describe('Idea Submission Integration Tests', () => {
  let store;
  let user;

  beforeEach(() => {
    store = createTestStore(createAuthenticatedState('student'));
    user = userEvent.setup();
    mockNavigate.mockClear();
    mockedAxios.post.mockClear();
    mockedAxios.get.mockClear();
  });

  const renderSubmitIdea = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <SubmitIdea />
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Form Rendering and Validation', () => {
    test('should render all required form fields', () => {
      renderSubmitIdea();

      expect(screen.getByLabelText(/idea title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/problem statement/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/proposed solution/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/target audience/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/market size/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit idea/i })).toBeInTheDocument();
    });

    test('should validate required fields', async () => {
      renderSubmitIdea();

      const submitButton = screen.getByRole('button', { name: /submit idea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/description is required/i)).toBeInTheDocument();
        expect(screen.getByText(/category is required/i)).toBeInTheDocument();
        expect(screen.getByText(/problem statement is required/i)).toBeInTheDocument();
      });

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('should validate minimum character limits', async () => {
      renderSubmitIdea();

      const titleInput = screen.getByLabelText(/idea title/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.type(titleInput, 'Short');
      await user.type(descriptionInput, 'Too short description');

      const submitButton = screen.getByRole('button', { name: /submit idea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title must be at least 10 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/description must be at least 50 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Successful Idea Submission', () => {
    test('should submit idea with complete valid data', async () => {
      const mockSuccessResponse = {
        data: {
          success: true,
          data: {
            id: 123,
            title: 'Revolutionary AI-Powered Learning Platform',
            status: 'pending',
            submittedAt: '2024-01-20T10:00:00Z'
          },
          message: 'Idea submitted successfully'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockSuccessResponse);

      renderSubmitIdea();

      // Fill out the form with valid data
      const titleInput = screen.getByLabelText(/idea title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const categorySelect = screen.getByLabelText(/category/i);
      const problemInput = screen.getByLabelText(/problem statement/i);
      const solutionInput = screen.getByLabelText(/proposed solution/i);
      const audienceInput = screen.getByLabelText(/target audience/i);

      await user.type(titleInput, 'Revolutionary AI-Powered Learning Platform');
      await user.type(descriptionInput, 'This innovative platform uses artificial intelligence to personalize learning experiences for students, adapting to their individual pace and learning style.');
      await user.selectOptions(categorySelect, 'Education Technology');
      await user.type(problemInput, 'Traditional education systems fail to accommodate individual learning differences, leading to poor academic outcomes.');
      await user.type(solutionInput, 'An AI-powered platform that analyzes learning patterns and adapts content delivery accordingly.');
      await user.type(audienceInput, 'Students in higher education institutions');

      const submitButton = screen.getByRole('button', { name: /submit idea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/ideas', {
          title: 'Revolutionary AI-Powered Learning Platform',
          description: 'This innovative platform uses artificial intelligence to personalize learning experiences for students, adapting to their individual pace and learning style.',
          category: 'Education Technology',
          problemStatement: 'Traditional education systems fail to accommodate individual learning differences, leading to poor academic outcomes.',
          proposedSolution: 'An AI-powered platform that analyzes learning patterns and adapts content delivery accordingly.',
          targetAudience: 'Students in higher education institutions',
          marketSize: '',
          competitiveAdvantage: '',
          businessModel: '',
          fundingRequired: '',
          teamMembers: [],
          attachments: []
        });
      });

      // Check success feedback
      await waitFor(() => {
        expect(screen.getByText(/idea submitted successfully/i)).toBeInTheDocument();
      });

      // Check navigation to ideas list
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/ideas');
    });

    test('should handle file upload during submission', async () => {
      const mockFile = new File(['test content'], 'test-document.pdf', {
        type: 'application/pdf'
      });

      const mockSuccessResponse = {
        data: {
          success: true,
          data: { id: 124, title: 'Test Idea', status: 'pending' },
          message: 'Idea submitted successfully with attachments'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockSuccessResponse);

      renderSubmitIdea();

      // Fill minimum required fields
      await user.type(screen.getByLabelText(/idea title/i), 'Test Idea with Attachment');
      await user.type(screen.getByLabelText(/description/i), 'This is a test idea submission with file attachment to verify the upload functionality works correctly.');
      await user.selectOptions(screen.getByLabelText(/category/i), 'Technology');
      await user.type(screen.getByLabelText(/problem statement/i), 'Testing file upload functionality in idea submission.');

      // Upload file
      const fileInput = screen.getByLabelText(/attach files/i);
      await user.upload(fileInput, mockFile);

      const submitButton = screen.getByRole('button', { name: /submit idea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/ideas', expect.objectContaining({
          title: 'Test Idea with Attachment',
          attachments: expect.arrayContaining([
            expect.objectContaining({
              name: 'test-document.pdf',
              type: 'application/pdf'
            })
          ])
        }));
      });
    });

    test('should handle team member addition', async () => {
      const mockSuccessResponse = {
        data: {
          success: true,
          data: { id: 125, title: 'Team Idea', status: 'pending' },
          message: 'Idea submitted successfully'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockSuccessResponse);

      renderSubmitIdea();

      // Fill minimum required fields
      await user.type(screen.getByLabelText(/idea title/i), 'Team Collaboration Project');
      await user.type(screen.getByLabelText(/description/i), 'This project involves multiple team members working together on an innovative solution.');
      await user.selectOptions(screen.getByLabelText(/category/i), 'Technology');
      await user.type(screen.getByLabelText(/problem statement/i), 'Testing team member functionality.');

      // Add team member
      const addTeamMemberButton = screen.getByRole('button', { name: /add team member/i });
      await user.click(addTeamMemberButton);

      const memberNameInput = screen.getByLabelText(/member name/i);
      const memberEmailInput = screen.getByLabelText(/member email/i);
      const memberRoleInput = screen.getByLabelText(/member role/i);

      await user.type(memberNameInput, 'John Smith');
      await user.type(memberEmailInput, 'john.smith@example.com');
      await user.type(memberRoleInput, 'Developer');

      const submitButton = screen.getByRole('button', { name: /submit idea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/ideas', expect.objectContaining({
          teamMembers: expect.arrayContaining([
            expect.objectContaining({
              name: 'John Smith',
              email: 'john.smith@example.com',
              role: 'Developer'
            })
          ])
        }));
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle API submission failure', async () => {
      const mockErrorResponse = {
        response: {
          data: {
            success: false,
            message: 'Failed to submit idea. Please try again.'
          }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(mockErrorResponse);

      renderSubmitIdea();

      // Fill minimum required fields
      await user.type(screen.getByLabelText(/idea title/i), 'Test Idea That Will Fail');
      await user.type(screen.getByLabelText(/description/i), 'This idea submission is designed to test error handling functionality.');
      await user.selectOptions(screen.getByLabelText(/category/i), 'Technology');
      await user.type(screen.getByLabelText(/problem statement/i), 'Testing error scenarios.');

      const submitButton = screen.getByRole('button', { name: /submit idea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to submit idea/i)).toBeInTheDocument();
      });

      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('should handle network connectivity issues', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'ERR_NETWORK';
      mockedAxios.post.mockRejectedValueOnce(networkError);

      renderSubmitIdea();

      // Fill minimum required fields
      await user.type(screen.getByLabelText(/idea title/i), 'Network Test Idea');
      await user.type(screen.getByLabelText(/description/i), 'Testing network connectivity error handling during idea submission.');
      await user.selectOptions(screen.getByLabelText(/category/i), 'Technology');
      await user.type(screen.getByLabelText(/problem statement/i), 'Network connectivity testing.');

      const submitButton = screen.getByRole('button', { name: /submit idea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/unable to connect to server/i)).toBeInTheDocument();
      });
    });

    test('should handle file upload size limit exceeded', async () => {
      const largeMockFile = new File(['x'.repeat(15 * 1024 * 1024)], 'large-file.pdf', {
        type: 'application/pdf'
      });

      renderSubmitIdea();

      const fileInput = screen.getByLabelText(/attach files/i);
      await user.upload(fileInput, largeMockFile);

      await waitFor(() => {
        expect(screen.getByText(/file size exceeds maximum limit/i)).toBeInTheDocument();
      });
    });

    test('should handle unsupported file types', async () => {
      const unsupportedFile = new File(['test'], 'test.exe', {
        type: 'application/x-msdownload'
      });

      renderSubmitIdea();

      const fileInput = screen.getByLabelText(/attach files/i);
      await user.upload(fileInput, unsupportedFile);

      await waitFor(() => {
        expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form State Management', () => {
    test('should save form data as draft', async () => {
      renderSubmitIdea();

      await user.type(screen.getByLabelText(/idea title/i), 'Draft Idea Title');
      await user.type(screen.getByLabelText(/description/i), 'This is a draft idea being saved for later completion.');

      const saveDraftButton = screen.getByRole('button', { name: /save as draft/i });
      await user.click(saveDraftButton);

      // Check if draft is saved to localStorage or state
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ideaDraft',
        expect.stringContaining('Draft Idea Title')
      );
    });

    test('should load previously saved draft', () => {
      // Mock localStorage with saved draft
      const draftData = {
        title: 'Previously Saved Idea',
        description: 'This idea was saved as a draft previously',
        category: 'Technology'
      };
      
      localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(draftData));

      renderSubmitIdea();

      expect(screen.getByDisplayValue('Previously Saved Idea')).toBeInTheDocument();
      expect(screen.getByDisplayValue('This idea was saved as a draft previously')).toBeInTheDocument();
    });

    test('should clear form after successful submission', async () => {
      const mockSuccessResponse = {
        data: {
          success: true,
          data: { id: 126, title: 'Clear Form Test', status: 'pending' },
          message: 'Idea submitted successfully'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockSuccessResponse);

      renderSubmitIdea();

      // Fill and submit form
      await user.type(screen.getByLabelText(/idea title/i), 'Clear Form Test Idea');
      await user.type(screen.getByLabelText(/description/i), 'Testing form clearing functionality after successful submission.');
      await user.selectOptions(screen.getByLabelText(/category/i), 'Technology');
      await user.type(screen.getByLabelText(/problem statement/i), 'Form clearing test.');

      const submitButton = screen.getByRole('button', { name: /submit idea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/ideas');
      });

      // Form should be cleared
      expect(screen.getByLabelText(/idea title/i)).toHaveValue('');
      expect(screen.getByLabelText(/description/i)).toHaveValue('');
    });
  });

  describe('User Experience Features', () => {
    test('should show character count for text areas', async () => {
      renderSubmitIdea();

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Test description');

      expect(screen.getByText(/16 \/ 1000 characters/i)).toBeInTheDocument();
    });

    test('should show loading state during submission', async () => {
      const mockSuccessResponse = {
        data: {
          success: true,
          data: { id: 127, title: 'Loading Test', status: 'pending' },
          message: 'Idea submitted successfully'
        }
      };

      mockedAxios.post.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockSuccessResponse), 1000))
      );

      renderSubmitIdea();

      // Fill minimum required fields
      await user.type(screen.getByLabelText(/idea title/i), 'Loading State Test');
      await user.type(screen.getByLabelText(/description/i), 'Testing loading state during form submission process.');
      await user.selectOptions(screen.getByLabelText(/category/i), 'Technology');
      await user.type(screen.getByLabelText(/problem statement/i), 'Loading state test.');

      const submitButton = screen.getByRole('button', { name: /submit idea/i });
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('should validate email format for team members', async () => {
      renderSubmitIdea();

      const addTeamMemberButton = screen.getByRole('button', { name: /add team member/i });
      await user.click(addTeamMemberButton);

      const memberEmailInput = screen.getByLabelText(/member email/i);
      await user.type(memberEmailInput, 'invalid-email-format');

      const submitButton = screen.getByRole('button', { name: /submit idea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });
  });
});