const AuditService = require('../services/auditService');
const { v4: uuidv4 } = require('uuid');

/**
 * Audit middleware to automatically log API requests
 */
const auditMiddleware = (options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    // Store original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Track response data
    let responseData = null;
    let statusCode = 200;
    
    // Override res.send to capture response
    res.send = function(data) {
      responseData = data;
      statusCode = res.statusCode;
      return originalSend.call(this, data);
    };
    
    // Override res.json to capture response
    res.json = function(data) {
      responseData = data;
      statusCode = res.statusCode;
      return originalJson.call(this, data);
    };
    
    // Log the request when response is sent
    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        const userId = req.user?.id || null;
        
        // Skip logging for certain paths or methods
        const skipPaths = options.skipPaths || ['/health', '/favicon.ico'];
        const skipMethods = options.skipMethods || ['OPTIONS'];
        
        if (skipPaths.some(path => req.path.includes(path)) || 
            skipMethods.includes(req.method)) {
          return;
        }
        
        // Determine action based on route and method
        const action = getActionFromRoute(req.method, req.route?.path || req.path);
        const actionCategory = getActionCategoryFromRoute(req.route?.path || req.path);
        
        // Prepare request metadata
        const requestMetadata = {
          method: req.method,
          path: req.path,
          query: req.query,
          params: req.params,
          requestId,
          userAgent: req.get('User-Agent'),
          referer: req.get('Referer'),
          ip: req.ip || req.connection.remoteAddress,
          sessionId: req.sessionID
        };
        
        // Prepare response metadata
        const responseMetadata = {
          statusCode,
          duration,
          responseSize: responseData ? JSON.stringify(responseData).length : 0,
          success: statusCode < 400
        };
        
        // Log API access
        await AuditService.logApiAccess(
          userId,
          req.method,
          req.path,
          statusCode,
          requestMetadata,
          responseMetadata
        );
        
        // Log specific actions based on route
        if (action && action !== 'API_ACCESS') {
          await logSpecificAction(req, res, action, actionCategory, requestMetadata, responseMetadata);
        }
        
      } catch (error) {
        console.error('❌ Audit middleware error:', error);
      }
    });
    
    next();
  };
};

/**
 * Get action from route and method
 */
function getActionFromRoute(method, path) {
  const routeMap = {
    // Authentication routes
    'POST /api/auth/login': 'LOGIN',
    'POST /api/auth/logout': 'LOGOUT',
    'POST /api/auth/register': 'USER_REGISTER',
    'POST /api/auth/forgot-password': 'PASSWORD_RESET_REQUEST',
    'POST /api/auth/reset-password': 'PASSWORD_RESET',
    'POST /api/auth/change-password': 'PASSWORD_CHANGE',
    'POST /api/auth/verify-email': 'EMAIL_VERIFY',
    'POST /api/auth/send-otp': 'OTP_REQUEST',
    'POST /api/auth/verify-otp': 'OTP_VERIFY',
    
    // Idea routes
    'POST /api/ideas': 'IDEA_SUBMIT',
    'PUT /api/ideas/:id': 'IDEA_UPDATE',
    'DELETE /api/ideas/:id': 'IDEA_DELETE',
    'POST /api/ideas/:id/evaluate': 'IDEA_EVALUATE',
    'PUT /api/ideas/:id/status': 'IDEA_STATUS_UPDATE',
    'GET /api/ideas/:id': 'IDEA_VIEW',
    'POST /api/ideas/:id/like': 'IDEA_LIKE',
    
    // User routes
    'POST /api/users': 'USER_CREATE',
    'PUT /api/users/:id': 'USER_UPDATE',
    'DELETE /api/users/:id': 'USER_DELETE',
    'PUT /api/users/:id/activate': 'USER_ACTIVATE',
    'PUT /api/users/:id/deactivate': 'USER_DEACTIVATE',
    'PUT /api/users/:id/role': 'USER_ROLE_CHANGE',
    'PUT /api/users/profile': 'PROFILE_UPDATE',
    
    // College routes
    'POST /api/colleges': 'COLLEGE_REGISTER',
    'PUT /api/colleges/:id': 'COLLEGE_UPDATE',
    'DELETE /api/colleges/:id': 'COLLEGE_DELETE',
    'PUT /api/colleges/:id/activate': 'COLLEGE_ACTIVATE',
    'PUT /api/colleges/:id/deactivate': 'COLLEGE_DEACTIVATE',
    
    // Mentor routes
    'POST /api/mentors': 'MENTOR_ADD',
    'PUT /api/mentors/:id': 'MENTOR_UPDATE',
    'DELETE /api/mentors/:id': 'MENTOR_DELETE',
    'POST /api/mentor-assignments/assign': 'MENTOR_ASSIGN',
    'DELETE /api/mentor-assignments/:id': 'MENTOR_UNASSIGN',
    
    // Event routes
    'POST /api/events': 'EVENT_CREATE',
    'PUT /api/events/:id': 'EVENT_UPDATE',
    'DELETE /api/events/:id': 'EVENT_DELETE',
    
    // Document routes
    'POST /api/documents': 'DOCUMENT_UPLOAD',
    'GET /api/documents/:id/download': 'DOCUMENT_DOWNLOAD',
    'DELETE /api/documents/:id': 'DOCUMENT_DELETE',
    
    // Report routes
    'POST /api/reports': 'REPORT_GENERATE',
    
    // Chat routes
    'POST /api/mentor-chats/:chatId/messages': 'CHAT_MESSAGE',
    'PUT /api/mentor-chats/messages/:messageId': 'CHAT_MESSAGE_EDIT',
    'DELETE /api/mentor-chats/messages/:messageId': 'CHAT_MESSAGE_DELETE',
    
    // Settings routes
    'PUT /api/settings': 'SETTINGS_UPDATE',
    
    // Admin routes
    'POST /api/admin/users': 'ADMIN_USER_CREATE',
    'PUT /api/admin/users/:id': 'ADMIN_USER_UPDATE',
    'DELETE /api/admin/users/:id': 'ADMIN_USER_DELETE',
    'POST /api/admin/colleges': 'ADMIN_COLLEGE_CREATE',
    'PUT /api/admin/colleges/:id': 'ADMIN_COLLEGE_UPDATE',
    'DELETE /api/admin/colleges/:id': 'ADMIN_COLLEGE_DELETE'
  };
  
  const key = `${method} ${path}`;
  return routeMap[key] || 'API_ACCESS';
}

/**
 * Get action category from route
 */
function getActionCategoryFromRoute(path) {
  if (path.includes('/auth/')) return 'AUTHENTICATION';
  if (path.includes('/ideas')) return 'IDEA_MANAGEMENT';
  if (path.includes('/users')) return 'USER_MANAGEMENT';
  if (path.includes('/colleges')) return 'COLLEGE_MANAGEMENT';
  if (path.includes('/mentors')) return 'MENTOR_MANAGEMENT';
  if (path.includes('/events')) return 'EVENT_MANAGEMENT';
  if (path.includes('/documents')) return 'DOCUMENT_MANAGEMENT';
  if (path.includes('/reports')) return 'REPORT_GENERATION';
  if (path.includes('/chat')) return 'COMMUNICATION';
  if (path.includes('/settings')) return 'SYSTEM_CONFIGURATION';
  if (path.includes('/admin/')) return 'ADMINISTRATION';
  return 'API_ACCESS';
}

/**
 * Log specific actions based on route
 */
async function logSpecificAction(req, res, action, actionCategory, requestMetadata, responseMetadata) {
  const userId = req.user?.id || null;
  const statusCode = responseMetadata.statusCode;
  const success = responseMetadata.success;
  
  // Prepare metadata
  const metadata = {
    ...requestMetadata,
    ...responseMetadata,
    body: req.body,
    params: req.params,
    query: req.query
  };
  
  // Log based on action type
  switch (action) {
    case 'LOGIN':
      await AuditService.logAuth(userId, 'login', requestMetadata, {
        success,
        ipAddress: requestMetadata.ip,
        userAgent: requestMetadata.userAgent
      });
      break;
      
    case 'LOGOUT':
      await AuditService.logAuth(userId, 'logout', requestMetadata, {
        success
      });
      break;
      
    case 'USER_REGISTER':
      await AuditService.logAuth(userId, 'register', requestMetadata, {
        success,
        email: req.body?.email,
        role: req.body?.role
      });
      break;
      
    case 'PASSWORD_RESET_REQUEST':
      await AuditService.logAuth(userId, 'forgot_password', requestMetadata, {
        success,
        email: req.body?.email
      });
      break;
      
    case 'PASSWORD_RESET':
      await AuditService.logAuth(userId, 'reset_password', requestMetadata, {
        success,
        email: req.body?.email
      });
      break;
      
    case 'PASSWORD_CHANGE':
      await AuditService.logAuth(userId, 'change_password', requestMetadata, {
        success
      });
      break;
      
    case 'OTP_REQUEST':
      await AuditService.logAuth(userId, 'otp_request', requestMetadata, {
        success,
        email: req.body?.email,
        phone: req.body?.phone
      });
      break;
      
    case 'OTP_VERIFY':
      await AuditService.logAuth(userId, 'otp_verify', requestMetadata, {
        success,
        email: req.body?.email,
        phone: req.body?.phone
      });
      break;
      
    case 'IDEA_SUBMIT':
      await AuditService.logIdea(userId, 'create', req.params.id, req.body?.title, requestMetadata, {
        success,
        category: req.body?.category,
        status: 'submitted'
      });
      break;
      
    case 'IDEA_UPDATE':
      await AuditService.logIdea(userId, 'update', req.params.id, req.body?.title, requestMetadata, {
        success,
        changes: req.body
      });
      break;
      
    case 'IDEA_DELETE':
      await AuditService.logIdea(userId, 'delete', req.params.id, 'Unknown', requestMetadata, {
        success
      });
      break;
      
    case 'IDEA_EVALUATE':
      await AuditService.logIdea(userId, 'evaluate', req.params.id, 'Unknown', requestMetadata, {
        success,
        rating: req.body?.rating,
        recommendation: req.body?.recommendation
      });
      break;
      
    case 'USER_CREATE':
      await AuditService.logUser(userId, 'create', req.params.id, req.body?.name, requestMetadata, {
        success,
        email: req.body?.email,
        role: req.body?.role
      });
      break;
      
    case 'USER_UPDATE':
      await AuditService.logUser(userId, 'update', req.params.id, req.body?.name, requestMetadata, {
        success,
        changes: req.body
      });
      break;
      
    case 'USER_DELETE':
      await AuditService.logUser(userId, 'delete', req.params.id, 'Unknown', requestMetadata, {
        success
      });
      break;
      
    case 'COLLEGE_REGISTER':
      await AuditService.logCollege(userId, 'register', req.params.id, req.body?.name, requestMetadata, {
        success,
        district: req.body?.district,
        type: req.body?.type
      });
      break;
      
    case 'MENTOR_ADD':
      await AuditService.logMentor(userId, 'add', req.params.id, req.body?.name, requestMetadata, {
        success,
        specialization: req.body?.specialization,
        experience: req.body?.experience_years
      });
      break;
      
    case 'CHAT_MESSAGE':
      await AuditService.logCommunication(userId, 'chat_message', requestMetadata, {
        success,
        chatId: req.params.chatId,
        messageType: req.body?.message_type || 'text'
      });
      break;
      
    case 'DOCUMENT_UPLOAD':
      await AuditService.logCommunication(userId, 'file_upload', requestMetadata, {
        success,
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
        accessLevel: req.body?.access_level
      });
      break;
      
    case 'DOCUMENT_DOWNLOAD':
      await AuditService.logCommunication(userId, 'file_download', requestMetadata, {
        success,
        documentId: req.params.id
      });
      break;
      
    case 'REPORT_GENERATE':
      await AuditService.log({
        userId,
        action: 'REPORT_GENERATE',
        actionCategory: 'REPORT_GENERATION',
        description: `Generated report: ${req.body?.report_type || 'Unknown'}`,
        request: requestMetadata,
        metadata: {
          success,
          reportType: req.body?.report_type,
          dateRange: req.body?.date_range
        },
        severity: 'MEDIUM'
      });
      break;
      
    default:
      // Log as generic API access
      break;
  }
}

/**
 * Manual audit logging function
 */
const logAudit = async (options) => {
  return await AuditService.log(options);
};

module.exports = {
  auditMiddleware,
  logAudit
};
