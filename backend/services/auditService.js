const AuditLog = require('../models/AuditLog');
const { User, College, Incubator } = require('../models');
const { Op } = require('sequelize');

class AuditService {
  /**
   * Log an audit event
   * @param {Object} options - Audit log options
   * @param {number} options.userId - User ID who performed the action
   * @param {string} options.action - Action performed
   * @param {string} options.actionCategory - Category of the action
   * @param {string} options.description - Description of the action
   * @param {Object} options.resource - Resource information
   * @param {Object} options.request - Request information
   * @param {Object} options.metadata - Additional metadata
   * @param {string} options.status - Status of the action
   * @param {string} options.severity - Severity level
   * @param {boolean} options.isSensitive - Whether action involves sensitive data
   * @param {Object} options.changes - Old and new values for updates
   * @param {string} options.errorMessage - Error message if failed
   * @param {number} options.durationMs - Duration in milliseconds
   */
  static async log({
    userId = null,
    action,
    actionCategory = 'OTHER',
    description,
    resource = {},
    request = {},
    metadata = {},
    status = 'SUCCESS',
    severity = 'LOW',
    isSensitive = false,
    changes = {},
    errorMessage = null,
    durationMs = null
  }) {
    try {
      // Get user information if userId provided
      let userInfo = {};
      if (userId) {
        const user = await User.findByPk(userId, {
          attributes: ['id', 'name', 'email', 'role', 'college_id', 'incubator_id']
        });
        if (user) {
          userInfo = {
            user_name: user.name,
            user_role: user.role,
            user_email: user.email,
            college_id: user.college_id,
            incubator_id: user.incubator_id
          };
        }
      }

      // Create audit log entry
      const auditLog = await AuditLog.create({
        user_id: userId,
        ...userInfo,
        action,
        action_category: actionCategory,
        resource_type: resource.type || null,
        resource_id: resource.id || null,
        resource_name: resource.name || null,
        description,
        status,
        ip_address: request.ip || null,
        user_agent: request.userAgent || null,
        session_id: request.sessionId || null,
        request_id: request.requestId || null,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: request.userAgent,
          referer: request.referer
        },
        old_values: changes.old || null,
        new_values: changes.new || null,
        error_message: errorMessage,
        duration_ms: durationMs,
        severity,
        is_sensitive: isSensitive
      });

      console.log(`📝 Audit logged: ${action} by ${userInfo.user_name || 'System'} - ${status}`);
      return auditLog;
    } catch (error) {
      console.error('❌ Failed to create audit log:', error);
      // Don't throw error to avoid breaking the main flow
      return null;
    }
  }

  /**
   * Log authentication events
   */
  static async logAuth(userId, action, request, metadata = {}) {
    const actionMap = {
      'login': 'LOGIN',
      'logout': 'LOGOUT',
      'register': 'USER_REGISTER',
      'forgot_password': 'PASSWORD_RESET_REQUEST',
      'reset_password': 'PASSWORD_RESET',
      'change_password': 'PASSWORD_CHANGE',
      'verify_email': 'EMAIL_VERIFY',
      'otp_request': 'OTP_REQUEST',
      'otp_verify': 'OTP_VERIFY'
    };

    const severityMap = {
      'login': 'MEDIUM',
      'logout': 'LOW',
      'register': 'MEDIUM',
      'forgot_password': 'HIGH',
      'reset_password': 'HIGH',
      'change_password': 'HIGH',
      'verify_email': 'MEDIUM',
      'otp_request': 'MEDIUM',
      'otp_verify': 'MEDIUM'
    };

    return this.log({
      userId,
      action: actionMap[action] || action.toUpperCase(),
      actionCategory: 'AUTHENTICATION',
      description: this.getAuthDescription(action, metadata),
      request,
      metadata,
      severity: severityMap[action] || 'MEDIUM',
      isSensitive: ['forgot_password', 'reset_password', 'change_password', 'otp_request', 'otp_verify'].includes(action)
    });
  }

  /**
   * Log idea management events
   */
  static async logIdea(userId, action, ideaId, ideaTitle, request, metadata = {}) {
    const actionMap = {
      'create': 'IDEA_SUBMIT',
      'update': 'IDEA_UPDATE',
      'delete': 'IDEA_DELETE',
      'evaluate': 'IDEA_EVALUATE',
      'forward': 'IDEA_FORWARD',
      'reject': 'IDEA_REJECT',
      'endorse': 'IDEA_ENDORSE',
      'view': 'IDEA_VIEW',
      'like': 'IDEA_LIKE',
      'comment': 'IDEA_COMMENT'
    };

    return this.log({
      userId,
      action: actionMap[action] || `IDEA_${action.toUpperCase()}`,
      actionCategory: 'IDEA_MANAGEMENT',
      description: this.getIdeaDescription(action, ideaTitle, metadata),
      resource: {
        type: 'idea',
        id: ideaId,
        name: ideaTitle
      },
      request,
      metadata,
      severity: action === 'delete' ? 'HIGH' : 'MEDIUM'
    });
  }

  /**
   * Log user management events
   */
  static async logUser(adminUserId, action, targetUserId, targetUserName, request, metadata = {}) {
    const actionMap = {
      'create': 'USER_CREATE',
      'update': 'USER_UPDATE',
      'delete': 'USER_DELETE',
      'activate': 'USER_ACTIVATE',
      'deactivate': 'USER_DEACTIVATE',
      'role_change': 'USER_ROLE_CHANGE',
      'profile_update': 'PROFILE_UPDATE'
    };

    return this.log({
      userId: adminUserId,
      action: actionMap[action] || `USER_${action.toUpperCase()}`,
      actionCategory: 'USER_MANAGEMENT',
      description: this.getUserDescription(action, targetUserName, metadata),
      resource: {
        type: 'user',
        id: targetUserId,
        name: targetUserName
      },
      request,
      metadata,
      severity: ['delete', 'role_change'].includes(action) ? 'HIGH' : 'MEDIUM',
      isSensitive: ['delete', 'role_change', 'profile_update'].includes(action)
    });
  }

  /**
   * Log college management events
   */
  static async logCollege(adminUserId, action, collegeId, collegeName, request, metadata = {}) {
    const actionMap = {
      'register': 'COLLEGE_REGISTER',
      'update': 'COLLEGE_UPDATE',
      'delete': 'COLLEGE_DELETE',
      'activate': 'COLLEGE_ACTIVATE',
      'deactivate': 'COLLEGE_DEACTIVATE'
    };

    return this.log({
      userId: adminUserId,
      action: actionMap[action] || `COLLEGE_${action.toUpperCase()}`,
      actionCategory: 'COLLEGE_MANAGEMENT',
      description: this.getCollegeDescription(action, collegeName, metadata),
      resource: {
        type: 'college',
        id: collegeId,
        name: collegeName
      },
      request,
      metadata,
      severity: action === 'delete' ? 'HIGH' : 'MEDIUM'
    });
  }

  /**
   * Log mentor management events
   */
  static async logMentor(adminUserId, action, mentorId, mentorName, request, metadata = {}) {
    const actionMap = {
      'add': 'MENTOR_ADD',
      'update': 'MENTOR_UPDATE',
      'delete': 'MENTOR_DELETE',
      'assign': 'MENTOR_ASSIGN',
      'unassign': 'MENTOR_UNASSIGN',
      'activate': 'MENTOR_ACTIVATE',
      'deactivate': 'MENTOR_DEACTIVATE'
    };

    return this.log({
      userId: adminUserId,
      action: actionMap[action] || `MENTOR_${action.toUpperCase()}`,
      actionCategory: 'MENTOR_MANAGEMENT',
      description: this.getMentorDescription(action, mentorName, metadata),
      resource: {
        type: 'mentor',
        id: mentorId,
        name: mentorName
      },
      request,
      metadata,
      severity: action === 'delete' ? 'HIGH' : 'MEDIUM'
    });
  }

  /**
   * Log communication events
   */
  static async logCommunication(userId, action, request, metadata = {}) {
    const actionMap = {
      'chat_message': 'CHAT_MESSAGE',
      'email_send': 'EMAIL_SEND',
      'notification_send': 'NOTIFICATION_SEND',
      'sms_send': 'SMS_SEND',
      'file_upload': 'FILE_UPLOAD',
      'file_download': 'FILE_DOWNLOAD'
    };

    return this.log({
      userId,
      action: actionMap[action] || `COMM_${action.toUpperCase()}`,
      actionCategory: 'COMMUNICATION',
      description: this.getCommunicationDescription(action, metadata),
      request,
      metadata,
      severity: 'LOW'
    });
  }

  /**
   * Log system events
   */
  static async logSystem(action, description, request, metadata = {}) {
    return this.log({
      userId: null,
      action: `SYSTEM_${action.toUpperCase()}`,
      actionCategory: 'SYSTEM_CONFIGURATION',
      description,
      request,
      metadata,
      severity: 'MEDIUM'
    });
  }

  /**
   * Log API access
   */
  static async logApiAccess(userId, method, endpoint, statusCode, request, metadata = {}) {
    const severity = statusCode >= 400 ? 'HIGH' : 'LOW';
    
    return this.log({
      userId,
      action: 'API_ACCESS',
      actionCategory: 'API_ACCESS',
      description: `${method} ${endpoint} - ${statusCode}`,
      request,
      metadata: {
        ...metadata,
        method,
        endpoint,
        statusCode
      },
      status: statusCode >= 400 ? 'FAILED' : 'SUCCESS',
      severity
    });
  }

  /**
   * Log error events
   */
  static async logError(userId, error, request, metadata = {}) {
    return this.log({
      userId,
      action: 'ERROR',
      actionCategory: 'ERROR',
      description: `Error: ${error.message}`,
      request,
      metadata: {
        ...metadata,
        errorStack: error.stack,
        errorName: error.name
      },
      status: 'FAILED',
      severity: 'HIGH',
      errorMessage: error.message
    });
  }

  // Helper methods for descriptions
  static getAuthDescription(action, metadata) {
    const descriptions = {
      'login': `User logged in from ${metadata.ipAddress || 'unknown IP'}`,
      'logout': 'User logged out',
      'register': `New user registered: ${metadata.email || 'unknown email'}`,
      'forgot_password': `Password reset requested for: ${metadata.email || 'unknown email'}`,
      'reset_password': 'Password reset completed',
      'change_password': 'Password changed successfully',
      'verify_email': `Email verification ${metadata.success ? 'successful' : 'failed'}`,
      'otp_request': `OTP requested for: ${metadata.email || 'unknown email'}`,
      'otp_verify': `OTP verification ${metadata.success ? 'successful' : 'failed'}`
    };
    return descriptions[action] || `Authentication action: ${action}`;
  }

  static getIdeaDescription(action, ideaTitle, metadata) {
    const descriptions = {
      'create': `Submitted new idea: ${ideaTitle}`,
      'update': `Updated idea: ${ideaTitle}`,
      'delete': `Deleted idea: ${ideaTitle}`,
      'evaluate': `Evaluated idea: ${ideaTitle} with rating ${metadata.rating || 'N/A'}`,
      'forward': `Forwarded idea: ${ideaTitle} to ${metadata.target || 'next stage'}`,
      'reject': `Rejected idea: ${ideaTitle} - ${metadata.reason || 'No reason provided'}`,
      'endorse': `Endorsed idea: ${ideaTitle}`,
      'view': `Viewed idea: ${ideaTitle}`,
      'like': `Liked idea: ${ideaTitle}`,
      'comment': `Commented on idea: ${ideaTitle}`
    };
    return descriptions[action] || `${action} action on idea: ${ideaTitle}`;
  }

  static getUserDescription(action, userName, metadata) {
    const descriptions = {
      'create': `Created new user: ${userName}`,
      'update': `Updated user: ${userName}`,
      'delete': `Deleted user: ${userName}`,
      'activate': `Activated user: ${userName}`,
      'deactivate': `Deactivated user: ${userName}`,
      'role_change': `Changed role for user: ${userName} to ${metadata.newRole || 'unknown'}`,
      'profile_update': `Updated profile: ${userName}`
    };
    return descriptions[action] || `${action} action on user: ${userName}`;
  }

  static getCollegeDescription(action, collegeName, metadata) {
    const descriptions = {
      'register': `Registered new college: ${collegeName}`,
      'update': `Updated college: ${collegeName}`,
      'delete': `Deleted college: ${collegeName}`,
      'activate': `Activated college: ${collegeName}`,
      'deactivate': `Deactivated college: ${collegeName}`
    };
    return descriptions[action] || `${action} action on college: ${collegeName}`;
  }

  static getMentorDescription(action, mentorName, metadata) {
    const descriptions = {
      'add': `Added new mentor: ${mentorName}`,
      'update': `Updated mentor: ${mentorName}`,
      'delete': `Deleted mentor: ${mentorName}`,
      'assign': `Assigned mentor: ${mentorName} to ${metadata.studentName || 'student'}`,
      'unassign': `Unassigned mentor: ${mentorName} from ${metadata.studentName || 'student'}`,
      'activate': `Activated mentor: ${mentorName}`,
      'deactivate': `Deactivated mentor: ${mentorName}`
    };
    return descriptions[action] || `${action} action on mentor: ${mentorName}`;
  }

  static getCommunicationDescription(action, metadata) {
    const descriptions = {
      'chat_message': `Sent chat message to ${metadata.recipient || 'user'}`,
      'email_send': `Sent email to ${metadata.recipient || 'user'}`,
      'notification_send': `Sent notification to ${metadata.recipient || 'user'}`,
      'sms_send': `Sent SMS to ${metadata.recipient || 'user'}`,
      'file_upload': `Uploaded file: ${metadata.fileName || 'unknown file'}`,
      'file_download': `Downloaded file: ${metadata.fileName || 'unknown file'}`
    };
    return descriptions[action] || `Communication action: ${action}`;
  }

  /**
   * Get audit logs with advanced filtering
   */
  static async getLogs(filters = {}, pagination = {}) {
    const {
      startDate,
      endDate,
      userId,
      action,
      actionCategory,
      status,
      severity,
      resourceType,
      collegeId,
      incubatorId,
      searchTerm,
      isSensitive
    } = filters;

    const {
      page = 1,
      limit = 50,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = pagination;

    const whereClause = {};

    // Date range filter
    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Other filters
    if (userId) whereClause.user_id = userId;
    if (action) whereClause.action = action;
    if (actionCategory) whereClause.action_category = actionCategory;
    if (status) whereClause.status = status;
    if (severity) whereClause.severity = severity;
    if (resourceType) whereClause.resource_type = resourceType;
    if (collegeId) whereClause.college_id = collegeId;
    if (incubatorId) whereClause.incubator_id = incubatorId;
    if (isSensitive !== undefined) whereClause.is_sensitive = isSensitive;

    // Search term filter
    if (searchTerm) {
      whereClause[Op.or] = [
        { user_name: { [Op.like]: `%${searchTerm}%` } },
        { action: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { resource_name: { [Op.like]: `%${searchTerm}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await AuditLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name']
        },
        {
          model: Incubator,
          as: 'incubator',
          attributes: ['id', 'name']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get audit statistics
   */
  static async getStatistics(filters = {}) {
    const whereClause = {};
    
    if (filters.startDate && filters.endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
      };
    }

    const stats = await AuditLog.findAll({
      where: whereClause,
      attributes: [
        'action_category',
        'status',
        'severity',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      group: ['action_category', 'status', 'severity'],
      raw: true
    });

    return stats;
  }

  /**
   * Get user activity summary
   */
  static async getUserActivitySummary(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await AuditLog.findAll({
      where: {
        user_id: userId,
        created_at: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'action',
        'action_category',
        'status',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      group: ['action', 'action_category', 'status'],
      raw: true
    });

    return activities;
  }
}

module.exports = AuditService;
