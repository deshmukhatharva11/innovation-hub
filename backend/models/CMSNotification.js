const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CMSNotification = sequelize.define('CMSNotification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Notification title'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Notification message content'
  },
  notification_type: {
    type: DataTypes.ENUM(
      'info',
      'success',
      'warning',
      'error',
      'announcement',
      'update',
      'reminder',
      'promotion',
      'system',
      'custom'
    ),
    allowNull: false,
    defaultValue: 'info',
    comment: 'Type of notification'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'normal',
    comment: 'Notification priority'
  },
  target_audience: {
    type: DataTypes.ENUM(
      'all',
      'students',
      'mentors',
      'college_admins',
      'incubator_managers',
      'super_admins',
      'specific_users',
      'custom_roles'
    ),
    allowNull: false,
    defaultValue: 'all',
    comment: 'Target audience for notification'
  },
  target_user_ids: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Specific user IDs to target'
  },
  target_roles: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Specific roles to target'
  },
  target_colleges: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Specific college IDs to target'
  },
  target_incubators: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Specific incubator IDs to target'
  },
  content_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'cms_contents',
      key: 'id',
    },
    comment: 'Related CMS content'
  },
  action_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL to redirect when notification is clicked'
  },
  action_text: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Text for action button'
  },
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Icon class or URL'
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Image URL for rich notifications'
  },
  template_data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Data for template rendering'
  },
  delivery_methods: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: ['in_app'],
    comment: 'Delivery methods: in_app, email, sms, push'
  },
  email_template: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Email template to use'
  },
  sms_template: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'SMS template to use'
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft',
    comment: 'Notification status'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether notification is active'
  },
  is_global: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether notification is global'
  },
  is_sticky: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether notification is sticky'
  },
  auto_dismiss: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether notification auto-dismisses'
  },
  dismiss_delay: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5000,
    comment: 'Auto-dismiss delay in milliseconds'
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Scheduled delivery time'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Notification expiration time'
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When notification was sent'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who created the notification'
  },
  delivery_stats: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      total_recipients: 0,
      delivered: 0,
      failed: 0,
      opened: 0,
      clicked: 0
    },
    comment: 'Delivery statistics'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional metadata'
  }
}, {
  tableName: 'cms_notifications',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['notification_type']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['target_audience']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_global']
    },
    {
      fields: ['scheduled_at']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['created_by']
    }
  ],
  hooks: {
    beforeCreate: (notification) => {
      if (notification.status === 'scheduled' && !notification.scheduled_at) {
        notification.scheduled_at = new Date();
      }
    }
  }
});

// Instance methods
CMSNotification.prototype.isScheduled = function() {
  return this.status === 'scheduled' && this.scheduled_at && new Date(this.scheduled_at) > new Date();
};

CMSNotification.prototype.isExpired = function() {
  return this.expires_at && new Date(this.expires_at) < new Date();
};

CMSNotification.prototype.canBeSent = function() {
  return this.status === 'draft' || (this.status === 'scheduled' && this.scheduled_at && new Date(this.scheduled_at) <= new Date());
};

CMSNotification.prototype.getDeliveryStats = function() {
  return this.delivery_stats || {
    total_recipients: 0,
    delivered: 0,
    failed: 0,
    opened: 0,
    clicked: 0
  };
};

CMSNotification.prototype.updateDeliveryStats = async function(stats) {
  this.delivery_stats = {
    ...this.getDeliveryStats(),
    ...stats
  };
  return this.save();
};

// Class methods
CMSNotification.getActive = async function() {
  return this.findAll({
    where: {
      is_active: true,
      status: 'sent',
      [sequelize.Op.or]: [
        { expires_at: null },
        { expires_at: { [sequelize.Op.gt]: new Date() } }
      ]
    },
    order: [['priority', 'DESC'], ['created_at', 'DESC']]
  });
};

CMSNotification.getScheduled = async function() {
  return this.findAll({
    where: {
      status: 'scheduled',
      scheduled_at: { [sequelize.Op.lte]: new Date() }
    },
    order: [['scheduled_at', 'ASC']]
  });
};

CMSNotification.getByUser = async function(userId, userRole, collegeId, incubatorId) {
  const whereClause = {
    is_active: true,
    status: 'sent',
    [sequelize.Op.or]: [
      { target_audience: 'all' },
      { target_audience: userRole },
      { target_user_ids: { [sequelize.Op.contains]: [userId] } },
      { target_roles: { [sequelize.Op.contains]: [userRole] } },
      { target_colleges: { [sequelize.Op.contains]: [collegeId] } },
      { target_incubators: { [sequelize.Op.contains]: [incubatorId] } }
    ],
    [sequelize.Op.or]: [
      { expires_at: null },
      { expires_at: { [sequelize.Op.gt]: new Date() } }
    ]
  };

  return this.findAll({
    where: whereClause,
    order: [['priority', 'DESC'], ['created_at', 'DESC']]
  });
};

// Associations
CMSNotification.associate = (models) => {
  CMSNotification.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });
  
  CMSNotification.belongsTo(models.CMSContent, {
    foreignKey: 'content_id',
    as: 'content'
  });
};

module.exports = CMSNotification;
