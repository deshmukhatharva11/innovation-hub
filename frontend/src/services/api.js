import axios from 'axios';

// Create a map to store cancellation tokens
const pendingRequests = new Map();

// Function to cancel previous requests with the same key (only for specific types)
const cancelPreviousRequest = (key, forceCancel = false) => {
  if (pendingRequests.has(key)) {
    const controller = pendingRequests.get(key);
    if (forceCancel || key.includes('_search_') || key.includes('_list_')) {
      controller.abort();
    }
    pendingRequests.delete(key);
  }
};

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://backend-1cpccsqwi-shris-projects-68144c68.vercel.app',
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add token and debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // Use same API base URL to avoid origin mismatch
          const response = await api.post('/auth/refresh', { refreshToken });

          const { token } = response.data.data;
          localStorage.setItem('token', token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  mentorLogin: (credentials) => api.post('/mentors/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),
};

// Ideas API
export const ideasAPI = {
  getAll: (params) => {
    const requestKey = `ideas_getAll_${params?.student_id || 'general'}`;
    cancelPreviousRequest(requestKey);
    const controller = new AbortController();
    pendingRequests.set(requestKey, controller);
    
    return api.get('/ideas', { 
      params,
      signal: controller.signal,
      timeout: 10000
    }).finally(() => {
      pendingRequests.delete(requestKey);
    });
  },
  getById: (id) => {
    // Don't cancel single idea requests to prevent data loss
    return api.get(`/ideas/${id}`, {
      timeout: 10000
    });
  },
  create: (ideaData) => {
    // Don't use cancellation for creating ideas to prevent data loss
    return api.post('/ideas', ideaData, {
      timeout: 20000, // 20 second timeout for idea creation
    });
  },
  update: (id, ideaData) => api.put(`/ideas/${id}`, ideaData),
  delete: (id) => api.delete(`/ideas/${id}`),
  updateStatus: (id, statusData) => api.put(`/ideas/${id}/status`, statusData),
  addComment: (id, commentData) => api.post(`/ideas/${id}/comments`, commentData),
  addLike: (id, likeData) => api.post(`/ideas/${id}/like`, likeData),
  removeLike: (id) => api.post(`/ideas/${id}/like`, {}),
  uploadFiles: (id, files, description) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (description) formData.append('description', description);
    return api.post(`/ideas/${id}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  addTeamMember: (id, memberData) => api.post(`/ideas/${id}/team-members`, memberData),
  removeTeamMember: (id, memberId) => api.delete(`/ideas/${id}/team-members/${memberId}`),
  getComments: (id, params) => api.get(`/ideas/${id}/comments`, { params }),
  getTeamMembers: (id) => api.get(`/ideas/${id}/team-members`),
  getFiles: (id) => api.get(`/ideas/${id}/files`),
  downloadFile: (id, fileId) => api.get(`/ideas/${id}/files/${fileId}/download`),
  getForReview: (params) => {
    const requestKey = `ideas_review_${JSON.stringify(params)}`;
    cancelPreviousRequest(requestKey);
    const controller = new AbortController();
    pendingRequests.set(requestKey, controller);
    
    return api.get('/ideas/review', { 
      params,
      signal: controller.signal,
      timeout: 10000
    }).finally(() => {
      pendingRequests.delete(requestKey);
    });
  },
  deleteFile: (id, fileId) => api.delete(`/ideas/${id}/files/${fileId}`),
  
  // Workflow Management
  getWorkflowStats: (params = {}) => api.get('/ideas/workflow/stats', { params }),
  
  getIdeasByStage: (stage, params = {}) => api.get(`/ideas/workflow/stage/${stage}`, { params }),
  
  getUpgradedIdeas: (params = {}) => api.get('/ideas/workflow/upgraded', { params }),
  
  updateWorkflowStatus: (id, data) => api.put(`/ideas/${id}/workflow/status`, data),
  
  assignMentor: (id, mentorId) => api.post(`/ideas/${id}/workflow/assign-mentor`, { mentor_id: mentorId }),
  
  getValidTransitions: (id) => api.get(`/ideas/${id}/workflow/transitions`),
};


// Users API
export const usersAPI = {
  getAll: (params) => {
    const requestKey = `users_getAll_${JSON.stringify(params)}`;
    cancelPreviousRequest(requestKey);
    const controller = new AbortController();
    pendingRequests.set(requestKey, controller);
    
    return api.get('/users', { 
      params,
      signal: controller.signal 
    }).finally(() => {
      pendingRequests.delete(requestKey);
    });
  },
  
  getById: (id, signal = null) => {
    // Accept optional abort signal for request cancellation
    const config = {
      timeout: 10000, // 10 second timeout
    };
    
    if (signal) {
      config.signal = signal;
    }
    
    return api.get(`/users/${id}`, config);
  },
  
  update: (id, userData) => {
    // Don't use cancellation for user updates to prevent data loss
    return api.put(`/users/${id}`, userData, {
      timeout: 15000, // 15 second timeout for updates
    });
  },
  
  delete: (id) => api.delete(`/users/${id}`),
  
  getStudents: (params) => {
    const requestKey = `users_students_${JSON.stringify(params)}`;
    cancelPreviousRequest(requestKey);
    const controller = new AbortController();
    pendingRequests.set(requestKey, controller);
    
    return api.get('/users/students', { 
      params,
      signal: controller.signal 
    }).finally(() => {
      pendingRequests.delete(requestKey);
    });
  },
  
  getStudentIdeas: (studentId) => {
    return api.get(`/users/${studentId}/ideas`, {
      timeout: 10000
    });
  },
  
  addStudent: (data) => api.post('/users/students', data),
  
  getColleges: () => api.get('/users/colleges'),
  
  getIncubators: () => api.get('/users/incubators'),
  
  getIncubatorColleges: () => api.get('/incubator-manager/colleges'),
  
  getProfile: () => {
    // Don't use cancellation for profile requests to prevent CancelledError
    return api.get('/auth/me', {
      timeout: 10000, // 10 second timeout
    });
  },
  
  uploadProfileImage: (id, file) => {
    const formData = new FormData();
    formData.append('profile_image', file);
    
    return api.post(`/users/${id}/profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000, // 30 second timeout for file uploads
    });
  },
};

// Colleges API
export const collegesAPI = {
  // In collegesAPI object, add:
  getPublic: (params) => api.get('/colleges/public', { params }),

  getAll: (params) => api.get('/colleges/', { params }),
  getById: (id) => api.get(`/colleges/${id}`),
  create: (collegeData) => api.post('/colleges', collegeData),
  update: (id, collegeData) => api.put(`/colleges/${id}`, collegeData),
  delete: (id) => api.delete(`/colleges/${id}`),
  uploadLogo: (id, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post(`/colleges/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getStatistics: (id) => api.get(`/colleges/${id}/statistics`),
};

// Incubators API
export const incubatorsAPI = {
  getAll: (params) => api.get('/incubators', { params }),
  getById: (id) => api.get(`/incubators/${id}`),
  create: (incubatorData) => api.post('/incubators', incubatorData),
  update: (id, incubatorData) => api.put(`/incubators/${id}`, incubatorData),
  delete: (id) => api.delete(`/incubators/${id}`),
  uploadLogo: (id, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post(`/incubators/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getStatistics: (id) => api.get(`/incubators/${id}/statistics`),
  updateOccupancy: (id, occupancyData) => api.put(`/incubators/${id}/occupancy`, occupancyData),
  getFocusAreas: () => api.get('/incubators/search/focus-areas'),
  getServices: () => api.get('/incubators/search/services'),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: (params) => {
    // Don't cancel dashboard requests to prevent loading issues
    return api.get('/analytics/dashboard', { 
      params,
      timeout: 15000 // 15 second timeout
    });
  },
  
  getIdeaStats: (params) => {
    const requestKey = `analytics_ideas_${JSON.stringify(params)}`;
    cancelPreviousRequest(requestKey);
    const controller = new AbortController();
    pendingRequests.set(requestKey, controller);
    
    return api.get('/analytics/ideas', { 
      params,
      signal: controller.signal 
    }).finally(() => {
      pendingRequests.delete(requestKey);
    });
  },
  
  getUserStats: (params) => {
    const requestKey = `analytics_users_${JSON.stringify(params)}`;
    cancelPreviousRequest(requestKey);
    const controller = new AbortController();
    pendingRequests.set(requestKey, controller);
    
    return api.get('/analytics/users', { 
      params,
      signal: controller.signal 
    }).finally(() => {
      pendingRequests.delete(requestKey);
    });
  },
  
  getEngagementStats: (params) => {
    const requestKey = `analytics_engagement_${JSON.stringify(params)}`;
    cancelPreviousRequest(requestKey);
    const controller = new AbortController();
    pendingRequests.set(requestKey, controller);
    
    return api.get('/analytics/engagement', { 
      params,
      signal: controller.signal 
    }).finally(() => {
      pendingRequests.delete(requestKey);
    });
  },
  
  exportData: (type, format, params) => api.get('/analytics/export', { params: { type, format, ...params } }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Comments API
export const commentsAPI = {
  getAll: (params) => api.get('/comments', { params }),
  getById: (id) => api.get(`/comments/${id}`),
  create: (commentData) => api.post('/comments', commentData),
  update: (id, commentData) => api.put(`/comments/${id}`, commentData),
  delete: (id) => api.delete(`/comments/${id}`),
  addLike: (id) => api.post(`/comments/${id}/likes`),
  removeLike: (id) => api.delete(`/comments/${id}/likes`),
  getReplies: (id) => api.get(`/comments/${id}/replies`),
};

// Likes API
export const likesAPI = {
  getAll: (params) => api.get('/likes', { params }),
  create: (likeData) => api.post('/likes', likeData),
  delete: (id) => api.delete(`/likes/${id}`),
  getByIdea: (ideaId) => api.get(`/likes/idea/${ideaId}`),
  getByUser: (userId) => api.get(`/likes/user/${userId}`),
};

// Team Members API
export const teamMembersAPI = {
  getAll: (params) => api.get('/team-members', { params }),
  getById: (id) => api.get(`/team-members/${id}`),
  create: (memberData) => api.post('/team-members', memberData),
  update: (id, memberData) => api.put(`/team-members/${id}`, memberData),
  delete: (id) => api.delete(`/team-members/${id}`),
  getByIdea: (ideaId) => api.get(`/team-members/idea/${ideaId}`),
  getLeads: () => api.get('/team-members/leads'),
};

// Files API
export const filesAPI = {
  getAll: (params) => api.get('/files', { params }),
  getById: (id) => api.get(`/files/${id}`),
  upload: (fileData) => {
    const formData = new FormData();
    Object.keys(fileData).forEach(key => {
      formData.append(key, fileData[key]);
    });
    return api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/files/${id}`),
  download: (id) => api.get(`/files/${id}/download`),
  getByIdea: (ideaId) => api.get(`/files/idea/${ideaId}`),
  getByUser: (userId) => api.get(`/files/user/${userId}`),
};

// Admin Analytics API
export const adminAnalyticsAPI = {
  getSystemAnalytics: (params) => api.get('/admin/analytics/system', { params }),
  getUserAnalytics: (params) => api.get('/admin/analytics/users', { params }),
  getIdeaAnalytics: (params) => api.get('/admin/analytics/ideas', { params }),
  getSystemHealth: () => api.get('/admin/analytics/health'),
  getGlobalAnalytics: (params) => api.get('/admin/analytics/global', { params }),
};

// Enhanced Admin Management API
export const adminManagementAPI = {
  // User Management
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  activateUser: (id) => api.post(`/admin/users/${id}/activate`),
  
  // College Management
  getColleges: (params) => api.get('/admin/colleges', { params }),
  createCollege: (collegeData) => api.post('/admin/colleges', collegeData),
  updateCollege: (id, collegeData) => api.put(`/admin/colleges/${id}`, collegeData),
  
  // Incubator Management
  getIncubators: (params) => api.get('/admin/incubators', { params }),
  
  // System Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', settings),
  
  // Portal Configuration
  getPortalConfig: () => api.get('/admin/portal-config'),
  updatePortalConfig: (config) => api.put('/admin/portal-config', config),
  
  // Backup & Security
  createBackup: () => api.post('/admin/backup'),
  getBackups: () => api.get('/admin/backups'),
  
  // Announcements
  getAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (announcementData) => api.post('/admin/announcements', announcementData),
};

// Enhanced CMS Management API
export const cmsAPI = {
  // Content Management
  createContent: (data) => api.post('/cms/content', data),
  getContent: (params) => api.get('/cms/content', { params }),
  getAllContent: (params) => api.get('/cms/content', { params }),
  getContentById: (id) => api.get(`/cms/content/${id}`),
  updateContent: (id, data) => api.put(`/cms/content/${id}`, data),
  deleteContent: (id) => api.delete(`/cms/content/${id}`),
  publishContent: (id) => api.put(`/cms/content/${id}/publish`),
  unpublishContent: (id) => api.put(`/cms/content/${id}/unpublish`),

  // Notification Management
  createNotification: (data) => api.post('/cms/notifications', data),
  getNotifications: (params) => api.get('/cms/notifications', { params }),
  getAllNotifications: (params) => api.get('/cms/notifications', { params }),
  getNotificationById: (id) => api.get(`/cms/notifications/${id}`),
  updateNotification: (id, data) => api.put(`/cms/notifications/${id}`, data),
  deleteNotification: (id) => api.delete(`/cms/notifications/${id}`),
  sendNotification: (id) => api.post(`/cms/notifications/${id}/send`),

  // Media Management
  uploadMedia: (formData) => api.post('/cms/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMedia: (params) => api.get('/cms/media', { params }),
  getAllMedia: (params) => api.get('/cms/media', { params }),
  getMediaById: (id) => api.get(`/cms/media/${id}`),
  deleteMedia: (id) => api.delete(`/cms/media/${id}`),

  // Templates
  getTemplates: () => api.get('/cms/templates/content'),
  createTemplate: (data) => api.post('/cms/templates', data),
  updateTemplate: (id, data) => api.put(`/cms/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/cms/templates/${id}`),

  // Analytics
  getAnalytics: () => api.get('/cms/analytics'),

  // Legacy Pages (for backward compatibility)
  getPages: () => api.get('/admin/cms/pages'),
  getPage: (slug) => api.get(`/admin/cms/pages/${slug}`),
  updatePage: (slug, pageData) => api.put(`/admin/cms/pages/${slug}`, pageData),
  
  // Circulars (legacy)
  getCirculars: () => api.get('/admin/cms/circulars'),
  uploadCircular: (formData) => api.post('/admin/cms/circulars', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCircular: (id) => api.delete(`/admin/cms/circulars/${id}`),
  
  // Email Settings (legacy)
  getEmailSettings: () => api.get('/admin/email-settings'),
  updateEmailSettings: (settings) => api.put('/admin/email-settings', settings),
  testEmailSettings: (testData) => api.post('/admin/email-settings/test', testData),
};

// Audit Trail API
export const auditAPI = {
  getLogs: (params) => api.get('/admin/audit/logs', { params }),
  getStats: (params) => api.get('/admin/audit/stats', { params }),
  exportLogs: (params) => api.get('/admin/audit/export', { 
    params,
    responseType: 'blob'
  }),
};

// College Management API
export const collegeManagementAPI = {
  getAll: (params) => api.get('/admin/colleges', { params }),
  getById: (id) => api.get(`/admin/colleges/${id}`),
  create: (collegeData) => api.post('/admin/colleges', collegeData),
  update: (id, collegeData) => api.put(`/admin/colleges/${id}`, collegeData),
  delete: (id) => api.delete(`/admin/colleges/${id}`),
  getStats: (id) => api.get(`/admin/colleges/${id}/stats`),
  // Public API for student registration
  getPublic: (params) => api.get('/colleges/public', { params }),
};

// Incubator Management API
export const incubatorManagementAPI = {
  getAll: (params) => api.get('/incubators', { params }),
  getById: (id) => api.get(`/incubators/${id}`),
  create: (incubatorData) => api.post('/incubators', incubatorData),
  update: (id, incubatorData) => api.put(`/incubators/${id}`, incubatorData),
  delete: (id) => api.delete(`/incubators/${id}`),
  getStats: (id) => api.get(`/incubators/${id}/stats`),
};

// Pre-Incubatees API
export const preIncubateesAPI = {
  getAll: (params) => api.get('/pre-incubatees', { params }),
  getById: (id) => api.get(`/pre-incubatees/${id}`),
  create: (preIncubateeData) => api.post('/pre-incubatees', preIncubateeData),
  update: (id, preIncubateeData) => api.put(`/pre-incubatees/${id}`, preIncubateeData),
  assignMentor: (id, mentorData) => api.put(`/pre-incubatees/${id}/assign-mentor`, mentorData),
  getStatistics: () => api.get('/pre-incubatees/statistics/overview'),
  // Student-specific methods
  getMyPreIncubatees: () => api.get('/pre-incubatees/student/my-pre-incubatees'),
  updateStudentProgress: (id, progressData) => api.put(`/pre-incubatees/${id}/student-update`, progressData),
};

// Mentors API
export const mentorsAPI = {
  getAll: (params) => api.get('/mentors', { params }),
  getById: (id) => api.get(`/mentors/${id}`),
  create: (mentorData) => api.post('/mentors', mentorData),
  update: (id, mentorData) => api.put(`/mentors/${id}`, mentorData),
  delete: (id) => api.delete(`/mentors/${id}`),
  getAvailable: (params) => api.get('/mentor-assignments/available-mentors', { params }),
  assignToStudent: (ideaId, mentorId, assignmentType = 'college', assignmentReason = '') => 
    api.post('/mentor-assignments/assign', { 
      idea_id: ideaId, 
      mentor_id: mentorId, 
      assignment_type: assignmentType,
      assignment_reason: assignmentReason
    }),
  unassignStudent: (assignmentId) => api.put(`/mentor-assignments/${assignmentId}/status`, { status: 'cancelled' }),
  getAssignments: (params) => api.get('/mentor-assignments', { params }),
  getDashboard: (period = '30d') => api.get(`/mentors/dashboard?period=${period}`),
  getStudentAssignments: (studentId) => api.get(`/mentor-assignments/student/${studentId}`),
  getMentorAssignments: (mentorId) => api.get(`/mentor-assignments/mentor/${mentorId}`),
  getAvailableMentors: (params) => api.get('/mentor-assignments/available-mentors', { params }),
  
  // Session management
  getSessions: (params) => api.get('/mentors/sessions', { params }),
  createSession: (sessionData) => api.post('/mentors/sessions', sessionData),
  updateSession: (sessionId, sessionData) => api.put(`/mentors/sessions/${sessionId}`, sessionData),
  deleteSession: (sessionId) => api.delete(`/mentors/sessions/${sessionId}`),
};

// Health Check API
export const healthAPI = {
  check: () => api.get('/health'),
  checkAuth: () => api.get('/auth/me'),
};

// Documents API
export const documentsAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getPublic: (params) => api.get('/documents/public', { params }),
  getStudentRestricted: (params) => api.get('/documents/student-restricted', { params }),
  getPrivate: (params) => api.get('/documents/private', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  create: (documentData) => api.post('/documents', documentData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, documentData) => api.put(`/documents/${id}`, documentData),
  delete: (id) => api.delete(`/documents/${id}`),
  download: (id, config = {}) => api.get(`/documents/${id}/download`, config),
  upload: (formData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
  register: (eventId, participantData) => api.post(`/events/${eventId}/register`, participantData),
  unregister: (eventId) => api.delete(`/events/${eventId}/register`),
  getParticipants: (eventId) => api.get(`/events/${eventId}/participants`),
};

// Student Events API
export const studentEventsAPI = {
  getAll: () => api.get('/student-events'),
  getById: (id) => api.get(`/student-events/${id}`),
  getUpcoming: () => api.get('/student-events/upcoming'),
  getCalendar: (start, end) => api.get('/student-events/calendar', { params: { start, end } }),
};

// Chat API
export const chatAPI = {
  // Get all conversations for the current user
  getConversations: () => api.get('/chat/conversations'),
  
  // Get messages for a specific conversation
  getMessages: (chatId) => api.get(`/chat/conversations/${chatId}/messages`),
  
  // Send a message
  sendMessage: (chatId, messageData) => api.post(`/chat/conversations/${chatId}/messages`, messageData),
  
  // Create a new conversation
  createConversation: (conversationData) => api.post('/chat/conversations', conversationData),
  
  // Get students for college admin to start conversations
  getStudents: () => api.get('/chat/students'),
  
  // Mark conversation as read
  markAsRead: (chatId) => api.put(`/chat/conversations/${chatId}/read`),
  
  // Delete conversation
  deleteConversation: (chatId) => api.delete(`/chat/conversations/${chatId}`),
};

// Mentor Chat API
export const mentorChatAPI = {
  // Get mentor conversations
  getConversations: () => api.get('/mentor-chats'),
  
  // Get messages for a conversation
  getMessages: (conversationId) => api.get(`/mentor-chats/${conversationId}/messages`),
  
  // Send message
  sendMessage: (conversationId, message) => api.post(`/mentor-chats/${conversationId}/messages`, { message }),
  
  // Mark messages as read
  markAsRead: (conversationId) => api.put(`/mentor-chats/${conversationId}/read`),
  
  // Edit message
  editMessage: (messageId, message) => api.put(`/mentor-chats/messages/${messageId}`, { message }),
  
  // Delete message
  deleteMessage: (messageId) => api.delete(`/mentor-chats/messages/${messageId}`),
  
  // Get unread count
  getUnreadCount: () => api.get('/mentor-chats/unread/count'),
  
  // Archive chat
  archiveChat: (conversationId) => api.put(`/mentor-chats/${conversationId}/archive`),
  
  // Close chat
  closeChat: (conversationId) => api.put(`/mentor-chats/${conversationId}/close`),
};

// College Coordinator API
export const collegeCoordinatorAPI = {
  // Dashboard
  getDashboard: () => api.get('/college-coordinator/dashboard'),
  
  // Ideas
  getIdeas: (params) => api.get('/college-coordinator/ideas', { params }),
  evaluateIdea: (ideaId, data) => api.post(`/college-coordinator/ideas/${ideaId}/evaluate`, data),
  
  // Events
  getEvents: (params) => api.get('/college-coordinator/events', { params }),
  createEvent: (data) => api.post('/college-coordinator/events', data),
  updateEvent: (eventId, data) => api.put(`/college-coordinator/events/${eventId}`, data),
  deleteEvent: (eventId) => api.delete(`/college-coordinator/events/${eventId}`),
  
  // Reports
  getReports: (params) => api.get('/college-coordinator/reports', { params }),
  createReport: (data) => api.post('/college-coordinator/reports', data),
  updateReport: (reportId, data) => api.put(`/college-coordinator/reports/${reportId}`, data),
  submitReport: (reportId) => api.post(`/college-coordinator/reports/${reportId}/submit`),
  
  // Documents
  getDocuments: (params) => api.get('/college-coordinator/documents', { params }),
  uploadDocument: (data) => api.post('/college-coordinator/documents', data),
  deleteDocument: (documentId) => api.delete(`/college-coordinator/documents/${documentId}`),
  
  // Analytics
  getAnalytics: () => api.get('/college-coordinator/analytics'),
  
  // Students
  getStudents: (params) => api.get('/college-coordinator/students', { params }),
  getStudent: (id) => api.get(`/college-coordinator/students/${id}`),
  addStudent: (data) => api.post('/college-coordinator/students', data),
  exportStudents: () => api.get('/college-coordinator/students/export', { responseType: 'text' }),
  
  // Notifications
  getNotifications: (params) => api.get('/college-coordinator/notifications', { params }),
  markNotificationRead: (id) => api.put(`/college-coordinator/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/college-coordinator/notifications/read-all'),
  
  // Chat
  getChatStudents: () => api.get('/college-coordinator/chat/students'),
  
  // Reports
  downloadReport: (id) => api.get(`/college-coordinator/reports/${id}/download`),
};

export default api;
