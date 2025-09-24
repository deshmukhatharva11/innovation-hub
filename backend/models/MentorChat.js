const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MentorChat = sequelize.define('MentorChat', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idea_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ideas',
        key: 'id'
      }
    },
    mentor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Mentors',
        key: 'id'
      }
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assignment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'mentor_assignments',
        key: 'id'
      }
    },
    chat_type: {
      type: DataTypes.ENUM('idea_mentoring', 'pre_incubatee', 'general'),
      allowNull: false,
      defaultValue: 'idea_mentoring'
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'closed'),
      allowNull: false,
      defaultValue: 'active'
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_message_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
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
    tableName: 'mentor_chats',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['idea_id']
      },
      {
        fields: ['mentor_id']
      },
      {
        fields: ['student_id']
      },
      {
        fields: ['assignment_id']
      },
      {
        fields: ['chat_type']
      },
      {
        fields: ['status']
      },
      {
        unique: true,
        fields: ['idea_id', 'mentor_id', 'student_id']
      }
    ]
  });

  // Instance methods
  MentorChat.prototype.isActive = function() {
    return this.status === 'active' && this.is_active;
  };

  MentorChat.prototype.archive = function() {
    this.status = 'archived';
    return this.save();
  };

  MentorChat.prototype.close = function() {
    this.status = 'closed';
    return this.save();
  };

  MentorChat.prototype.updateLastMessage = function(userId) {
    this.last_message_at = new Date();
    this.last_message_by = userId;
    return this.save();
  };

  // Class methods
  MentorChat.findByIdea = function(ideaId) {
    return this.findAll({
      where: {
        idea_id: ideaId,
        is_active: true
      },
      order: [['last_message_at', 'DESC']]
    });
  };

  MentorChat.findByMentor = function(mentorId) {
    return this.findAll({
      where: {
        mentor_id: mentorId,
        is_active: true
      },
      order: [['last_message_at', 'DESC']]
    });
  };

  MentorChat.findByStudent = function(studentId) {
    return this.findAll({
      where: {
        student_id: studentId,
        is_active: true
      },
      order: [['last_message_at', 'DESC']]
    });
  };

  MentorChat.findActiveByIdea = function(ideaId) {
    return this.findAll({
      where: {
        idea_id: ideaId,
        status: 'active',
        is_active: true
      },
      order: [['last_message_at', 'DESC']]
    });
  };

  MentorChat.findActiveByMentor = function(mentorId) {
    return this.findAll({
      where: {
        mentor_id: mentorId,
        status: 'active',
        is_active: true
      },
      order: [['last_message_at', 'DESC']]
    });
  };

  MentorChat.findActiveByStudent = function(studentId) {
    return this.findAll({
      where: {
        student_id: studentId,
        status: 'active',
        is_active: true
      },
      order: [['last_message_at', 'DESC']]
    });
  };

  return MentorChat;
};