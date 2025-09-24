const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    document_type: {
      type: DataTypes.ENUM('circular', 'template', 'poster', 'guideline', 'form', 'other'),
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    access_level: {
      type: DataTypes.ENUM('public', 'student_restricted', 'private'),
      defaultValue: 'public',
      comment: 'public: visible to all, student_restricted: college admin and students only, private: incubator only'
    },
    college_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Colleges',
        key: 'id',
      },
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'Documents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Document;
};
