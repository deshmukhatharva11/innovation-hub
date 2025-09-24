const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255],
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
    allowNull: false,
    defaultValue: 'info',
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id'],
      name: 'idx_notifications_user_id',
    },
    {
      fields: ['user_id', 'is_read'],
      name: 'idx_notifications_user_read',
    },
    {
      fields: ['type'],
      name: 'idx_notifications_type',
    },
    {
      fields: ['created_at'],
      name: 'idx_notifications_created_at',
    },
  ],
});

// Instance methods
Notification.prototype.markAsRead = async function() {
  this.is_read = true;
  this.read_at = new Date();
  return this.save();
};

// Class methods
Notification.createForUser = async function(userId, notificationData) {
  return this.create({
    user_id: userId,
    ...notificationData,
  });
};

Notification.markAllAsReadForUser = async function(userId) {
  return this.update(
    {
      is_read: true,
      read_at: new Date(),
    },
    {
      where: {
        user_id: userId,
        is_read: false,
      },
    }
  );
};

Notification.getUnreadCountForUser = async function(userId) {
  return this.count({
    where: {
      user_id: userId,
      is_read: false,
    },
  });
};

Notification.deleteOldForUser = async function(userId, daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.destroy({
    where: {
      user_id: userId,
      created_at: {
        [require('sequelize').Op.lt]: cutoffDate,
      },
    },
  });
};

module.exports = Notification;
