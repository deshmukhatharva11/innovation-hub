const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IdeaEvaluation = sequelize.define('IdeaEvaluation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idea_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Ideas',
        key: 'id',
      },
    },
    evaluator_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recommendation: {
      type: DataTypes.ENUM('nurture', 'forward', 'reject'),
      allowNull: false,
    },
    mentor_assigned: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    nurture_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    evaluation_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'IdeaEvaluations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return IdeaEvaluation;
};
