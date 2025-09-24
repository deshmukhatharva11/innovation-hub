const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Incubator = sequelize.define('Incubator', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [2, 200],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  focus_areas: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  contact_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  website: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  established_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1900,
      max: new Date().getFullYear(),
    },
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Maximum number of startups that can be incubated',
  },
  current_occupancy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Current number of startups being incubated',
  },
  funding_available: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Total funding available in USD',
  },
  services_offered: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of services offered by the incubator',
  },
  success_stories: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of successful startups that graduated',
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'incubators',
  timestamps: true,
  underscored: true,
});

// Class methods
Incubator.findActive = function() {
  return this.findAll({ where: { is_active: true } });
};

Incubator.findByName = function(name) {
  return this.findOne({ where: { name } });
};

Incubator.findByFocusArea = function(focusArea) {
  return this.findAll({
    where: {
      focus_areas: {
        [sequelize.Op.contains]: [focusArea],
      },
    },
  });
};

module.exports = Incubator;
