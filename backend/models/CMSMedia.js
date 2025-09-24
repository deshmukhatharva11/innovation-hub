const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CMSMedia = sequelize.define('CMSMedia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Original filename'
  },
  original_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Original file name'
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'File path on server'
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Public URL to access file'
  },
  file_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'MIME type of file'
  },
  file_extension: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'File extension'
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: 'File size in bytes'
  },
  media_type: {
    type: DataTypes.ENUM('image', 'video', 'audio', 'document', 'archive', 'other'),
    allowNull: false,
    comment: 'Type of media'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Media title'
  },
  alt_text: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Alt text for accessibility'
  },
  caption: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Media caption'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Media description'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Media tags'
  },
  categories: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Media categories'
  },
  dimensions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Image/video dimensions {width, height}'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in seconds for video/audio'
  },
  thumbnail_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Thumbnail URL for video/image'
  },
  preview_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Preview URL for large files'
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether file is publicly accessible'
  },
  access_level: {
    type: DataTypes.ENUM('public', 'private', 'restricted'),
    allowNull: false,
    defaultValue: 'public',
    comment: 'Access level for file'
  },
  allowed_roles: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Roles allowed to access restricted files'
  },
  download_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of downloads'
  },
  view_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of views'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether media is featured'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether media is active'
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who uploaded the file'
  },
  content_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'cms_contents',
      key: 'id',
    },
    comment: 'Associated CMS content'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional file metadata'
  }
}, {
  tableName: 'cms_media',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['media_type']
    },
    {
      fields: ['file_type']
    },
    {
      fields: ['is_public']
    },
    {
      fields: ['access_level']
    },
    {
      fields: ['uploaded_by']
    },
    {
      fields: ['content_id']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Instance methods
CMSMedia.prototype.incrementDownloads = async function() {
  this.download_count += 1;
  return this.save();
};

CMSMedia.prototype.incrementViews = async function() {
  this.view_count += 1;
  return this.save();
};

CMSMedia.prototype.getFileSizeFormatted = function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (this.file_size === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(this.file_size) / Math.log(1024));
  return Math.round(this.file_size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

CMSMedia.prototype.isImage = function() {
  return this.media_type === 'image';
};

CMSMedia.prototype.isVideo = function() {
  return this.media_type === 'video';
};

CMSMedia.prototype.isAudio = function() {
  return this.media_type === 'audio';
};

CMSMedia.prototype.isDocument = function() {
  return this.media_type === 'document';
};

CMSMedia.prototype.getThumbnail = function() {
  return this.thumbnail_url || this.file_url;
};

// Class methods
CMSMedia.getByType = async function(mediaType, filters = {}) {
  const whereClause = {
    media_type: mediaType,
    is_active: true
  };

  if (filters.is_public !== undefined) whereClause.is_public = filters.is_public;
  if (filters.access_level) whereClause.access_level = filters.access_level;
  if (filters.uploaded_by) whereClause.uploaded_by = filters.uploaded_by;

  return this.findAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: filters.limit || 20,
    offset: filters.offset || 0
  });
};

CMSMedia.search = async function(query, filters = {}) {
  const whereClause = {
    [sequelize.Op.or]: [
      { filename: { [sequelize.Op.like]: `%${query}%` } },
      { original_name: { [sequelize.Op.like]: `%${query}%` } },
      { title: { [sequelize.Op.like]: `%${query}%` } },
      { alt_text: { [sequelize.Op.like]: `%${query}%` } },
      { caption: { [sequelize.Op.like]: `%${query}%` } },
      { description: { [sequelize.Op.like]: `%${query}%` } },
      { tags: { [sequelize.Op.contains]: [query] } }
    ],
    is_active: true
  };

  if (filters.media_type) whereClause.media_type = filters.media_type;
  if (filters.is_public !== undefined) whereClause.is_public = filters.is_public;

  return this.findAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: filters.limit || 20,
    offset: filters.offset || 0
  });
};

// Associations
CMSMedia.associate = (models) => {
  CMSMedia.belongsTo(models.User, {
    foreignKey: 'uploaded_by',
    as: 'uploader'
  });
  
  CMSMedia.belongsTo(models.CMSContent, {
    foreignKey: 'content_id',
    as: 'content'
  });
};

module.exports = CMSMedia;
