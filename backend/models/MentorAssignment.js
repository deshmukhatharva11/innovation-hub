const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MentorAssignment = sequelize.define('MentorAssignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idea_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ideas',
        key: 'id'
      }
    },
    mentor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Mentors',
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
    assignment_type: {
      type: DataTypes.ENUM('college', 'incubator', 'independent', 'pre_incubatee'),
      allowNull: false,
      defaultValue: 'college'
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assignment_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'terminated', 'pending'),
      allowNull: false,
      defaultValue: 'pending'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    mentor_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    student_feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
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
    tableName: 'mentor_assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['idea_id']
      },
      {
        fields: ['mentor_id']
      },
      {
        fields: ['student_id']
      },
      {
        fields: ['assignment_type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['assigned_by']
      },
      {
        unique: true,
        fields: ['idea_id', 'mentor_id', 'student_id']
      }
    ]
  });

  // Instance methods
  MentorAssignment.prototype.isActive = function() {
    return this.status === 'active' && this.is_active;
  };

  MentorAssignment.prototype.canBeTerminated = function() {
    return this.status === 'active' || this.status === 'pending';
  };

  MentorAssignment.prototype.complete = function(notes, rating) {
    this.status = 'completed';
    this.end_date = new Date();
    if (notes) this.mentor_notes = notes;
    if (rating) this.rating = rating;
    return this.save();
  };

  MentorAssignment.prototype.terminate = function(reason) {
    this.status = 'terminated';
    this.end_date = new Date();
    if (reason) this.assignment_reason = reason;
    return this.save();
  };

  // Class methods
  MentorAssignment.findByIdea = function(ideaId) {
    return this.findAll({
      where: {
        idea_id: ideaId,
        is_active: true
      },
      order: [['created_at', 'DESC']]
    });
  };

  MentorAssignment.findByMentor = function(mentorId) {
    return this.findAll({
      where: {
        mentor_id: mentorId,
        is_active: true
      },
      order: [['created_at', 'DESC']]
    });
  };

  MentorAssignment.findByStudent = function(studentId) {
    return this.findAll({
      where: {
        student_id: studentId,
        is_active: true
      },
      order: [['created_at', 'DESC']]
    });
  };

  MentorAssignment.findActiveByIdea = function(ideaId) {
    return this.findAll({
      where: {
        idea_id: ideaId,
        status: 'active',
        is_active: true
      },
      order: [['created_at', 'DESC']]
    });
  };

  MentorAssignment.findActiveByMentor = function(mentorId) {
    return this.findAll({
      where: {
        mentor_id: mentorId,
        status: 'active',
        is_active: true
      },
      order: [['created_at', 'DESC']]
    });
  };

  return MentorAssignment;
};
