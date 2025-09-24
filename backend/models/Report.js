const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    report_type: {
      type: DataTypes.ENUM('quarterly', 'annual', 'idea_analytics', 'college_performance', 'mentor_effectiveness', 'incubation_pipeline'),
      allowNull: false,
    },
    period_start: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    period_end: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'generating', 'completed', 'failed'),
      defaultValue: 'draft',
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    college_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Colleges',
        key: 'id',
      },
    },
    incubator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Incubators',
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    created_by: {
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
    tableName: 'Reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Report;
};
