const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  idea_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ideas',
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 2000],
    },
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id',
    },
    comment: 'For nested comments/replies',
  },
  likes_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  is_edited: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  edited_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deleted_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  is_flagged: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  flag_reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  flagged_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  flagged_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'comments',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeUpdate: (comment) => {
      if (comment.changed('content') && !comment.isNewRecord) {
        comment.is_edited = true;
        comment.edited_at = new Date();
      }
    },
  },
});

// Instance methods
Comment.prototype.incrementLikes = async function() {
  this.likes_count += 1;
  return this.save();
};

Comment.prototype.decrementLikes = async function() {
  if (this.likes_count > 0) {
    this.likes_count -= 1;
    return this.save();
  }
  return this;
};

Comment.prototype.softDelete = async function(deletedBy) {
  this.is_deleted = true;
  this.deleted_at = new Date();
  this.deleted_by = deletedBy;
  return this.save();
};

Comment.prototype.flag = async function(reason, flaggedBy) {
  this.is_flagged = true;
  this.flag_reason = reason;
  this.flagged_by = flaggedBy;
  this.flagged_at = new Date();
  return this.save();
};

// Class methods
Comment.findByIdea = function(ideaId) {
  return this.findAll({
    where: { 
      idea_id: ideaId,
      is_deleted: false,
      parent_id: null, // Only top-level comments
    },
    include: [
      {
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'name', 'profile_image_url'],
      },
      {
        model: sequelize.models.Comment,
        as: 'replies',
        where: { is_deleted: false },
        required: false,
        include: [
          {
            model: sequelize.models.User,
            as: 'user',
            attributes: ['id', 'name', 'profile_image_url'],
          },
        ],
      },
    ],
    order: [
      ['created_at', 'DESC'],
      [{ model: sequelize.models.Comment, as: 'replies' }, 'created_at', 'ASC'],
    ],
  });
};

Comment.findByUser = function(userId) {
  return this.findAll({
    where: { 
      user_id: userId,
      is_deleted: false,
    },
    include: [
      {
        model: sequelize.models.Idea,
        as: 'idea',
        attributes: ['id', 'title'],
      },
    ],
    order: [['created_at', 'DESC']],
  });
};

Comment.findReplies = function(parentId) {
  return this.findAll({
    where: { 
      parent_id: parentId,
      is_deleted: false,
    },
    include: [
      {
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'name', 'profile_image_url'],
      },
    ],
    order: [['created_at', 'ASC']],
  });
};

Comment.findFlagged = function() {
  return this.findAll({
    where: { is_flagged: true },
    include: [
      {
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: sequelize.models.Idea,
        as: 'idea',
        attributes: ['id', 'title'],
      },
    ],
    order: [['flagged_at', 'DESC']],
  });
};

module.exports = Comment;
