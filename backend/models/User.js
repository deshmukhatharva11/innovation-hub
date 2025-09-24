const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100],
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('student', 'college_admin', 'incubator_manager', 'admin'),
    allowNull: false,
    defaultValue: 'student',
  },
  college_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'colleges',
      key: 'id',
    },
  },
  incubator_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'incubators',
      key: 'id',
    },
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

phone: {
  type: DataTypes.STRING(20),
  allowNull: true,
  validate: {
    customPhoneValidator(value) {
      if (value && (value.length < 10 || value.length > 15)) {
        throw new Error('Phone number must be between 10-15 characters');
      }
    }
  }
},
year_of_study: {
  type: DataTypes.INTEGER,
  allowNull: true,
},

roll_number: {
  type: DataTypes.STRING(50),
  allowNull: true,
},

gpa: {
  type: DataTypes.DECIMAL(3, 2),
  allowNull: true,
},

position: {
  type: DataTypes.STRING(100),
  allowNull: true,
},

experience_years: {
  type: DataTypes.INTEGER,
  allowNull: true,
},

designation: {
  type: DataTypes.STRING(100),
  allowNull: true,
},

expertise_areas: {
  type: DataTypes.TEXT,
  allowNull: true,
},
  profile_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  social_links: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
linkedin_url: {
  type: DataTypes.STRING(500),
  allowNull: true,
  validate: {
    isUrl: {
      msg: 'Invalid LinkedIn URL',
      require_protocol: false
    },
    customUrlValidator(value) {
      if (value && value.trim() === '') {
        return; // Allow empty strings
      }
      if (value && !value.match(/^https?:\/\/.+/)) {
        throw new Error('URL must start with http:// or https://');
      }
    }
  }
},
// Apply same pattern to github_url and portfolio_url

  github_url: {
    type: DataTypes.STRING(500),
  allowNull: true,
  validate: {
    isUrl: {
      msg: 'Invalid github URL',
      require_protocol: false
    },
    customUrlValidator(value) {
      if (value && value.trim() === '') {
        return; // Allow empty strings
      }
      if (value && !value.match(/^https?:\/\/.+/)) {
        throw new Error('URL must start with http:// or https://');
      }
    }
  }
  },
  portfolio_url: {
    type: DataTypes.STRING(500),
  allowNull: true,
  validate: {
    isUrl: {
      msg: 'Invalid portfolio URL',
      require_protocol: false
    },
    customUrlValidator(value) {
      if (value && value.trim() === '') {
        return; // Allow empty strings
      }
      if (value && !value.match(/^https?:\/\/.+/)) {
        throw new Error('URL must start with http:// or https://');
      }
    }
  }
  },

  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reset_password_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  email_verification_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email_verification_otp: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  email_verification_otp_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
      }
    },
  },
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password_hash;
  delete values.reset_password_token;
  delete values.reset_password_expires;
  delete values.email_verification_token;
  delete values.email_verification_otp;
  delete values.email_verification_otp_expires;
  return values;
};

// Class methods
User.findByEmail = function(email) {
  return this.findOne({ where: { email } });
};

User.findByRole = function(role) {
  return this.findAll({ where: { role } });
};

User.findByCollege = function(collegeId) {
  return this.findAll({ where: { college_id: collegeId } });
};

User.findByIncubator = function(incubatorId) {
  return this.findAll({ where: { incubator_id: incubatorId } });
};

module.exports = User;
