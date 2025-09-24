const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Like = sequelize.define('Like', {
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
  like_type: {
    type: DataTypes.ENUM('like', 'love', 'helpful', 'innovative'),
    allowNull: false,
    defaultValue: 'like',
  },
}, {
  tableName: 'likes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['idea_id', 'user_id'],
      name: 'unique_user_idea_like',
    },
  ],
});

// Class methods
Like.findByIdea = function(ideaId) {
  return this.findAll({ where: { idea_id: ideaId } });
};

Like.findByUser = function(userId) {
  return this.findAll({ where: { user_id: userId } });
};

Like.findByType = function(likeType) {
  return this.findAll({ where: { like_type: likeType } });
};

Like.countByIdea = function(ideaId) {
  return this.count({ where: { idea_id: ideaId } });
};

Like.countByIdeaAndType = function(ideaId, likeType) {
  return this.count({ where: { idea_id: ideaId, like_type: likeType } });
};

Like.hasUserLiked = async function(ideaId, userId) {
  const like = await this.findOne({ where: { idea_id: ideaId, user_id: userId } });
  return !!like;
};

Like.getUserLikeType = async function(ideaId, userId) {
  const like = await this.findOne({ where: { idea_id: ideaId, user_id: userId } });
  return like ? like.like_type : null;
};

module.exports = Like;
