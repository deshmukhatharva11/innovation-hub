const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const IdeaFile = sequelize.define('IdeaFile', {
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
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Generated filename for storage',
  },
  original_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Original filename uploaded by user',
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Path to the file in storage',
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'File size in bytes',
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'MIME type of the file',
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  file_type: {
    type: DataTypes.ENUM('document', 'image', 'presentation', 'prototype', 'other'),
    allowNull: false,
    defaultValue: 'document',
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Description of the file',
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether the file is publicly accessible',
  },
  download_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of times the file has been downloaded',
  },
  checksum: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: 'SHA-256 checksum for file integrity',
  },
}, {
  tableName: 'idea_files',
  timestamps: true,
  underscored: true,
});

// Instance methods
IdeaFile.prototype.incrementDownloadCount = async function() {
  this.download_count += 1;
  return this.save();
};

IdeaFile.prototype.getFileUrl = function() {
  return `/uploads/${this.file_path}`;
};

// Class methods
IdeaFile.findByIdea = function(ideaId) {
  return this.findAll({ where: { idea_id: ideaId } });
};

IdeaFile.findByType = function(fileType) {
  return this.findAll({ where: { file_type: fileType } });
};

IdeaFile.findPublic = function() {
  return this.findAll({ where: { is_public: true } });
};

IdeaFile.findByUploader = function(uploaderId) {
  return this.findAll({ where: { uploaded_by: uploaderId } });
};

module.exports = IdeaFile;
