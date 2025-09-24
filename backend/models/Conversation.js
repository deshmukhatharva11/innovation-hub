const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  college_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'archived', 'closed'),
    allowNull: false,
    defaultValue: 'active',
  },
  last_message_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  unread_count_student: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  unread_count_admin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'conversations',
  timestamps: true,
  underscored: true,
});

module.exports = Conversation;
