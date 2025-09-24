const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MentorChatMessage = sequelize.define('MentorChatMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'mentor_chats',
        key: 'id'
      }
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sender_type: {
      type: DataTypes.ENUM('student', 'mentor', 'admin'),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 2000]
      }
    },
    message_type: {
      type: DataTypes.ENUM('text', 'file', 'image', 'document', 'system'),
      allowNull: false,
      defaultValue: 'text'
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_edited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    edited_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    parent_message_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'mentor_chat_messages',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'mentor_chat_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['chat_id']
      },
      {
        fields: ['sender_id']
      },
      {
        fields: ['sender_type']
      },
      {
        fields: ['message_type']
      },
      {
        fields: ['is_read']
      },
      {
        fields: ['parent_message_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  // Instance methods
  MentorChatMessage.prototype.markAsRead = function() {
    this.is_read = true;
    this.read_at = new Date();
    return this.save();
  };

  MentorChatMessage.prototype.edit = function(newMessage) {
    this.message = newMessage;
    this.is_edited = true;
    this.edited_at = new Date();
    return this.save();
  };

  MentorChatMessage.prototype.isFromStudent = function() {
    return this.sender_type === 'student';
  };

  MentorChatMessage.prototype.isFromMentor = function() {
    return this.sender_type === 'mentor';
  };

  // Class methods
  MentorChatMessage.findByChat = function(chatId, limit = 50, offset = 0) {
    return this.findAll({
      where: {
        chat_id: chatId,
        is_active: true
      },
      order: [['created_at', 'ASC']],
      limit: limit,
      offset: offset
    });
  };

  MentorChatMessage.findUnreadByChat = function(chatId, userId) {
    return this.findAll({
      where: {
        chat_id: chatId,
        sender_id: { [sequelize.Sequelize.Op.ne]: userId },
        is_read: false,
        is_active: true
      },
      order: [['created_at', 'ASC']]
    });
  };

  MentorChatMessage.findBySender = function(senderId) {
    return this.findAll({
      where: {
        sender_id: senderId,
        is_active: true
      },
      order: [['created_at', 'DESC']]
    });
  };

  MentorChatMessage.findRecentByChat = function(chatId, limit = 10) {
    return this.findAll({
      where: {
        chat_id: chatId,
        is_active: true
      },
      order: [['created_at', 'DESC']],
      limit: limit
    });
  };

  return MentorChatMessage;
};