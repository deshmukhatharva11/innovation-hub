const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who performed the action (null for system actions)'
  },
  user_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'User name for quick reference'
  },
  user_role: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'User role at time of action'
  },
  user_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'User email for identification'
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Action performed (e.g., LOGIN, IDEA_SUBMIT, OTP_REQUEST)'
  },
  action_category: {
    type: DataTypes.ENUM(
      'AUTHENTICATION',
      'AUTHORIZATION', 
      'IDEA_MANAGEMENT',
      'USER_MANAGEMENT',
      'COLLEGE_MANAGEMENT',
      'INCUBATOR_MANAGEMENT',
      'MENTOR_MANAGEMENT',
      'EVENT_MANAGEMENT',
      'DOCUMENT_MANAGEMENT',
      'REPORT_GENERATION',
      'SYSTEM_CONFIGURATION',
      'COMMUNICATION',
      'WORKFLOW',
      'SECURITY',
      'ADMINISTRATION',
      'NOTIFICATION',
      'FILE_OPERATION',
      'API_ACCESS',
      'ERROR',
      'OTHER'
    ),
    allowNull: false,
    comment: 'Category of the action for better organization'
  },
  resource_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Type of resource affected (e.g., idea, user, college)'
  },
  resource_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID of the resource affected'
  },
  resource_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Name of the resource for quick reference'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Detailed description of the action'
  },
  status: {
    type: DataTypes.ENUM('SUCCESS', 'FAILED', 'PENDING', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'SUCCESS',
    comment: 'Status of the action'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP address of the user'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent string'
  },
  session_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Session ID for tracking user sessions'
  },
  request_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Unique request ID for tracing'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional metadata about the action'
  },
  old_values: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Previous values before change (for updates)'
  },
  new_values: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'New values after change (for updates)'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if action failed'
  },
  duration_ms: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration of the action in milliseconds'
  },
  college_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'colleges',
      key: 'id',
    },
    comment: 'College context of the action'
  },
  incubator_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'incubators',
      key: 'id',
    },
    comment: 'Incubator context of the action'
  },
  severity: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
    defaultValue: 'LOW',
    comment: 'Severity level of the action'
  },
  is_sensitive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this action involves sensitive data'
  },
  retention_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when this log can be archived'
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['action']
    },
    {
      fields: ['action_category']
    },
    {
      fields: ['resource_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['ip_address']
    },
    {
      fields: ['college_id']
    },
    {
      fields: ['incubator_id']
    },
    {
      fields: ['severity']
    },
    {
      fields: ['is_sensitive']
    }
  ],
  hooks: {
    beforeCreate: (auditLog) => {
      // Set retention date based on severity and sensitivity
      const now = new Date();
      let retentionDays = 90; // Default retention
      
      if (auditLog.is_sensitive) {
        retentionDays = 365; // 1 year for sensitive data
      } else if (auditLog.severity === 'CRITICAL') {
        retentionDays = 2555; // 7 years for critical actions
      } else if (auditLog.severity === 'HIGH') {
        retentionDays = 1095; // 3 years for high severity
      } else if (auditLog.severity === 'MEDIUM') {
        retentionDays = 365; // 1 year for medium severity
      }
      
      auditLog.retention_date = new Date(now.getTime() + (retentionDays * 24 * 60 * 60 * 1000));
    }
  }
});

// Instance methods
AuditLog.prototype.getFormattedTimestamp = function() {
  return new Date(this.created_at).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

AuditLog.prototype.getActionIcon = function() {
  const iconMap = {
    'LOGIN': '🔐',
    'LOGOUT': '🚪',
    'OTP_REQUEST': '📱',
    'OTP_VERIFY': '✅',
    'PASSWORD_RESET': '🔄',
    'IDEA_SUBMIT': '💡',
    'IDEA_UPDATE': '✏️',
    'IDEA_EVALUATE': '⭐',
    'IDEA_DELETE': '🗑️',
    'USER_CREATE': '👤',
    'USER_UPDATE': '✏️',
    'USER_DELETE': '🗑️',
    'COLLEGE_REGISTER': '🏫',
    'MENTOR_ADD': '👨‍🏫',
    'EVENT_CREATE': '📅',
    'DOCUMENT_UPLOAD': '📄',
    'REPORT_GENERATE': '📊',
    'SETTINGS_UPDATE': '⚙️',
    'CHAT_MESSAGE': '💬',
    'FILE_DOWNLOAD': '⬇️',
    'API_ACCESS': '🔌',
    'ERROR': '❌'
  };
  return iconMap[this.action] || '📝';
};

AuditLog.prototype.getSeverityColor = function() {
  const colorMap = {
    'LOW': 'text-gray-600',
    'MEDIUM': 'text-yellow-600',
    'HIGH': 'text-orange-600',
    'CRITICAL': 'text-red-600'
  };
  return colorMap[this.severity] || 'text-gray-600';
};

AuditLog.prototype.getStatusColor = function() {
  const colorMap = {
    'SUCCESS': 'text-green-600',
    'FAILED': 'text-red-600',
    'PENDING': 'text-yellow-600',
    'CANCELLED': 'text-gray-600'
  };
  return colorMap[this.status] || 'text-gray-600';
};

// Class methods
AuditLog.getActivityStats = async function(startDate, endDate, filters = {}) {
  const whereClause = {
    created_at: {
      [sequelize.Op.between]: [startDate, endDate]
    }
  };

  if (filters.user_id) whereClause.user_id = filters.user_id;
  if (filters.action) whereClause.action = filters.action;
  if (filters.action_category) whereClause.action_category = filters.action_category;
  if (filters.status) whereClause.status = filters.status;
  if (filters.college_id) whereClause.college_id = filters.college_id;
  if (filters.incubator_id) whereClause.incubator_id = filters.incubator_id;

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'action_category',
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['action_category', 'status'],
    raw: true
  });

  return stats;
};

AuditLog.getUserActivity = async function(userId, limit = 50) {
  return this.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit
  });
};

AuditLog.getRecentActivity = async function(limit = 100) {
  return this.findAll({
    include: [
      {
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role']
      }
    ],
    order: [['created_at', 'DESC']],
    limit
  });
};

// Associations
AuditLog.associate = (models) => {
  AuditLog.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  
  AuditLog.belongsTo(models.College, {
    foreignKey: 'college_id',
    as: 'college'
  });
  
  AuditLog.belongsTo(models.Incubator, {
    foreignKey: 'incubator_id',
    as: 'incubator'
  });
};

module.exports = AuditLog;
