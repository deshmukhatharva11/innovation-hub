const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Chat = sequelize.define('Chat', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    coordinator_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    idea_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Ideas',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'closed', 'archived'),
      defaultValue: 'active'
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    student_unread_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    coordinator_unread_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'chats',
    timestamps: true,
    indexes: [
      {
        fields: ['student_id', 'coordinator_id']
      },
      {
        fields: ['idea_id']
      },
      {
        fields: ['status']
      }
    ]
  });

  return Chat;
};
