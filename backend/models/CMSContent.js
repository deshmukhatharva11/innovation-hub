const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CMSContent = sequelize.define('CMSContent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Content title'
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'URL-friendly identifier'
  },
  content_type: {
    type: DataTypes.ENUM(
      'page',
      'post',
      'announcement',
      'circular',
      'notification',
      'banner',
      'footer',
      'header',
      'sidebar',
      'popup',
      'email_template',
      'sms_template',
      'custom'
    ),
    allowNull: false,
    defaultValue: 'page',
    comment: 'Type of content'
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    comment: 'Main content body (HTML/Markdown)'
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Short description or summary'
  },
  meta_title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'SEO meta title'
  },
  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'SEO meta description'
  },
  meta_keywords: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'SEO meta keywords'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived', 'scheduled'),
    allowNull: false,
    defaultValue: 'draft',
    comment: 'Content status'
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private', 'password_protected', 'role_based'),
    allowNull: false,
    defaultValue: 'public',
    comment: 'Content visibility'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Password for password-protected content'
  },
  allowed_roles: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Roles allowed to view role-based content'
  },
  featured_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Featured image URL'
  },
  gallery: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Image gallery URLs'
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'File attachments'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Content tags for categorization'
  },
  categories: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Content categories'
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Make it nullable to avoid constraint errors
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Content author'
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'cms_contents',
      key: 'id',
    },
    comment: 'Parent content for hierarchical structure'
  },
  template: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Template used for rendering'
  },
  custom_fields: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Custom fields for dynamic content'
  },
  seo_data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional SEO data'
  },
  view_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of views'
  },
  like_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of likes'
  },
  comment_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of comments'
  },
  share_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of shares'
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Display priority (higher = more important)'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether content is featured'
  },
  is_sticky: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether content is sticky/pinned'
  },
  allow_comments: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether comments are allowed'
  },
  allow_sharing: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether sharing is allowed'
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Publication date'
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Scheduled publication date'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Content expiration date'
  },
  last_modified_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Last user who modified the content'
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Content version number'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether content is active'
  }
}, {
  tableName: 'cms_contents',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['slug']
    },
    {
      fields: ['content_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['author_id']
    },
    {
      fields: ['parent_id']
    },
    {
      fields: ['published_at']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['is_sticky']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    beforeCreate: (content) => {
      if (content.status === 'published' && !content.published_at) {
        content.published_at = new Date();
      }
    },
    beforeUpdate: (content) => {
      if (content.changed('status') && content.status === 'published' && !content.published_at) {
        content.published_at = new Date();
      }
      if (content.changed('content') || content.changed('title')) {
        content.version += 1;
      }
    }
  }
});

// Instance methods
CMSContent.prototype.incrementViews = async function() {
  this.view_count += 1;
  return this.save();
};

CMSContent.prototype.incrementLikes = async function() {
  this.like_count += 1;
  return this.save();
};

CMSContent.prototype.incrementShares = async function() {
  this.share_count += 1;
  return this.save();
};

CMSContent.prototype.getFullUrl = function() {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${baseUrl}/${this.slug}`;
};

CMSContent.prototype.getExcerpt = function(length = 160) {
  if (this.excerpt) return this.excerpt;
  
  // Strip HTML tags and get plain text
  const plainText = this.content.replace(/<[^>]*>/g, '');
  return plainText.length > length ? plainText.substring(0, length) + '...' : plainText;
};

CMSContent.prototype.isPublished = function() {
  return this.status === 'published' && this.is_active;
};

CMSContent.prototype.isScheduled = function() {
  return this.status === 'scheduled' && this.scheduled_at && new Date(this.scheduled_at) > new Date();
};

CMSContent.prototype.isExpired = function() {
  return this.expires_at && new Date(this.expires_at) < new Date();
};

// Class methods
CMSContent.getPublished = async function(filters = {}) {
  const whereClause = {
    status: 'published',
    is_active: true
  };

  if (filters.content_type) whereClause.content_type = filters.content_type;
  if (filters.author_id) whereClause.author_id = filters.author_id;
  if (filters.tags) whereClause.tags = { [sequelize.Op.contains]: filters.tags };
  if (filters.categories) whereClause.categories = { [sequelize.Op.contains]: filters.categories };

  return this.findAll({
    where: whereClause,
    order: [['published_at', 'DESC']],
    limit: filters.limit || 10,
    offset: filters.offset || 0
  });
};

CMSContent.getBySlug = async function(slug) {
  return this.findOne({
    where: {
      slug,
      status: 'published',
      is_active: true
    }
  });
};

CMSContent.search = async function(query, filters = {}) {
  const whereClause = {
    [sequelize.Op.or]: [
      { title: { [sequelize.Op.like]: `%${query}%` } },
      { content: { [sequelize.Op.like]: `%${query}%` } },
      { excerpt: { [sequelize.Op.like]: `%${query}%` } },
      { meta_keywords: { [sequelize.Op.like]: `%${query}%` } }
    ],
    status: 'published',
    is_active: true
  };

  if (filters.content_type) whereClause.content_type = filters.content_type;

  return this.findAll({
    where: whereClause,
    order: [['published_at', 'DESC']],
    limit: filters.limit || 10,
    offset: filters.offset || 0
  });
};

// Associations
CMSContent.associate = (models) => {
  CMSContent.belongsTo(models.User, {
    foreignKey: 'author_id',
    as: 'author'
  });
  
  CMSContent.belongsTo(models.User, {
    foreignKey: 'last_modified_by',
    as: 'lastModifier'
  });
  
  CMSContent.belongsTo(CMSContent, {
    foreignKey: 'parent_id',
    as: 'parent'
  });
  
  CMSContent.hasMany(CMSContent, {
    foreignKey: 'parent_id',
    as: 'children'
  });
};

module.exports = CMSContent;
