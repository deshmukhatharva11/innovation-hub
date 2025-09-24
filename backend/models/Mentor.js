const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Mentor = sequelize.define('Mentor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [10, 15]
      }
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 50
      }
    },
    availability: {
      type: DataTypes.ENUM('available', 'busy', 'unavailable'),
      allowNull: false,
      defaultValue: 'available'
    },
    max_students: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 5,
      validate: {
        min: 1,
        max: 50
      }
    },
    current_students: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    linkedin_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    website_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: 0.0,
      validate: {
        min: 0.0,
        max: 5.0
      }
    },
    total_ratings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    college_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'colleges',
        key: 'id'
      }
    },
    incubator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'incubators',
        key: 'id'
      }
    },
    district: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: true
      }
    },
    mentor_type: {
      type: DataTypes.ENUM('college', 'incubator', 'independent'),
      allowNull: false,
      defaultValue: 'independent'
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    verification_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Mentors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['college_id']
      },
      {
        fields: ['incubator_id']
      },
      {
        fields: ['availability']
      },
      {
        fields: ['specialization']
      },
      {
        fields: ['district']
      },
      {
        fields: ['mentor_type']
      },
      {
        fields: ['is_verified']
      }
    ]
  });

  // Instance methods
  Mentor.prototype.isAvailable = function() {
    return this.availability === 'available' && this.current_students < this.max_students;
  };

  Mentor.prototype.canTakeMoreStudents = function() {
    return this.current_students < this.max_students;
  };

  Mentor.prototype.updateRating = function(newRating) {
    const totalRating = (this.rating * this.total_ratings) + newRating;
    this.total_ratings += 1;
    this.rating = totalRating / this.total_ratings;
    return this.save();
  };

  // Class methods
  Mentor.findAvailable = function() {
    return this.findAll({
      where: {
        availability: 'available',
        is_active: true
      },
      order: [['rating', 'DESC']]
    });
  };

  Mentor.findBySpecialization = function(specialization) {
    return this.findAll({
      where: {
        specialization: {
          [sequelize.Sequelize.Op.like]: `%${specialization}%`
        },
        availability: 'available',
        is_active: true
      },
      order: [['rating', 'DESC']]
    });
  };

  Mentor.findByCollege = function(collegeId) {
    return this.findAll({
      where: {
        college_id: collegeId,
        is_active: true
      },
      order: [['name', 'ASC']]
    });
  };

  Mentor.findByIncubator = function(incubatorId) {
    return this.findAll({
      where: {
        incubator_id: incubatorId,
        is_active: true
      },
      order: [['name', 'ASC']]
    });
  };

  Mentor.findByDistrict = function(district) {
    return this.findAll({
      where: {
        district: district,
        is_active: true,
        is_verified: true
      },
      order: [['rating', 'DESC'], ['name', 'ASC']]
    });
  };

  Mentor.findByMentorType = function(mentorType) {
    return this.findAll({
      where: {
        mentor_type: mentorType,
        is_active: true,
        is_verified: true
      },
      order: [['rating', 'DESC'], ['name', 'ASC']]
    });
  };

  Mentor.findAvailableByDistrict = function(district) {
    return this.findAll({
      where: {
        district: district,
        availability: 'available',
        is_active: true,
        is_verified: true
      },
      order: [['rating', 'DESC'], ['name', 'ASC']]
    });
  };

  Mentor.findAvailableByCollege = function(collegeId) {
    return this.findAll({
      where: {
        college_id: collegeId,
        availability: 'available',
        is_active: true,
        is_verified: true
      },
      order: [['rating', 'DESC'], ['name', 'ASC']]
    });
  };

  return Mentor;
};
