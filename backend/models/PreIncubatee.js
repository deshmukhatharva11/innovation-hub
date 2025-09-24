const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PreIncubatee = sequelize.define('PreIncubatee', {
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
      key: 'id'
    }
  },
  incubator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'incubators',
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
  college_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'colleges',
      key: 'id'
    }
  },
  current_phase: {
    type: DataTypes.ENUM('research', 'development', 'testing', 'market_validation', 'scaling'),
    allowNull: false,
    defaultValue: 'research'
  },
  progress_percentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  phase_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  milestones: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  mentor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'mentors',
      key: 'id'
    }
  },
  funding_received: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0
  },
  funding_required: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expected_completion_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'paused', 'terminated'),
    allowNull: false,
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  last_review_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  next_review_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'pre_incubatees',
  timestamps: true,
  underscored: true
});

// Associations
PreIncubatee.associate = (models) => {
  PreIncubatee.belongsTo(models.Idea, {
    foreignKey: 'idea_id',
    as: 'idea'
  });
  
  PreIncubatee.belongsTo(models.Incubator, {
    foreignKey: 'incubator_id',
    as: 'incubator'
  });
  
  PreIncubatee.belongsTo(models.User, {
    foreignKey: 'student_id',
    as: 'student'
  });
  
  PreIncubatee.belongsTo(models.College, {
    foreignKey: 'college_id',
    as: 'college'
  });
  
  PreIncubatee.belongsTo(models.Mentor, {
    foreignKey: 'mentor_id',
    as: 'mentor'
  });
};

module.exports = PreIncubatee;
