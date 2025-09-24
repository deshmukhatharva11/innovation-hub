const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Idea = sequelize.define('Idea', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [5, 200],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [20, 5000],
    },
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isIn: [['Technology', 'Healthcare', 'Education', 'Finance', 'Environment', 'Agriculture', 'Transportation', 'Entertainment', 'Social Impact', 'Other', 'Education Technology']],
    },
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'new_submission', 'under_review', 'nurture', 'pending_review', 'needs_development', 'updated_pending_review', 'endorsed', 'forwarded_to_incubation', 'incubated', 'rejected'),
    allowNull: false,
    defaultValue: 'draft',
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  college_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  team_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 20,
    },
  },
  funding_required: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Funding required in USD',
  },
  timeline: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Expected timeline for implementation',
  },
  likes_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  views_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  problem_statement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  solution_approach: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  market_potential: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tech_stack: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Technology stack used in the idea',
  },
  team_members: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Team members information',
  },
  implementation_plan: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detailed implementation plan',
  },
  technical_feasibility: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  business_model: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  competitive_analysis: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  risk_assessment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  success_metrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  submission_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  review_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endorsement_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  incubation_start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reviewer_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  // Nurture mode tracking
  last_updated_by_student: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When student last updated the idea in nurture mode',
  },
  nurture_update_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of times student updated idea in nurture mode',
  },
  is_updated_in_nurture: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether idea has been updated since being put in nurture mode',
  },
  nurture_feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Feedback from college admin for nurture mode',
  },
  // Workflow Management Fields
  assigned_mentor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Mentor assigned to review this idea',
  },
  development_feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detailed feedback for needs development stage',
  },
  development_requirements: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Specific requirements for development stage',
  },
  review_timeline_start: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When review process started',
  },
  review_timeline_end: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Expected review completion date',
  },
  workflow_stage: {
    type: DataTypes.ENUM('submission', 'review', 'development', 'endorsement', 'incubation'),
    allowNull: false,
    defaultValue: 'submission',
    comment: 'Current workflow stage',
  },
  previous_status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Previous status for tracking transitions',
  },
  status_change_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for status change',
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Internal notes from college admin',
  },
  mentor_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes from assigned mentor',
  },
  is_upgraded: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Whether the idea has been upgraded from nurture to under_review',
  },
  upgraded_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when the idea was upgraded',
  },
  upgraded_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User ID who upgraded the idea',
  },
}, {
  tableName: 'ideas',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (idea) => {
      if (idea.status === 'submitted') {
        idea.submission_date = new Date();
      }
    },
    beforeUpdate: (idea) => {
      if (idea.changed('status')) {
        const now = new Date();
        
        // Store previous status for tracking
        if (idea.previous_status !== idea.status) {
          idea.previous_status = idea._previousDataValues?.status || idea.status;
        }
        
        switch (idea.status) {
          case 'submitted':
          case 'new_submission':
            idea.submission_date = now;
            idea.workflow_stage = 'submission';
            break;
          case 'nurture':
            idea.workflow_stage = 'nurture';
            break;
          case 'pending_review':
            idea.workflow_stage = 'pending_review';
            break;
          case 'under_review':
            idea.review_date = now;
            idea.review_timeline_start = now;
            idea.workflow_stage = 'review';
            break;
          case 'needs_development':
            idea.workflow_stage = 'development';
            break;
          case 'updated_pending_review':
            idea.workflow_stage = 'review';
            break;
          case 'endorsed':
            idea.endorsement_date = now;
            idea.workflow_stage = 'endorsement';
            break;
          case 'forwarded_to_incubation':
            idea.workflow_stage = 'incubation';
            break;
          case 'incubated':
            idea.incubation_start_date = now;
            idea.workflow_stage = 'incubation';
            break;
        }
      }
    },
  },
});

// Instance methods
Idea.prototype.incrementViews = async function() {
  this.views_count += 1;
  return this.save();
};

Idea.prototype.incrementLikes = async function() {
  this.likes_count += 1;
  return this.save();
};

Idea.prototype.decrementLikes = async function() {
  if (this.likes_count > 0) {
    this.likes_count -= 1;
    return this.save();
  }
  return this;
};

// Class methods
Idea.findByStatus = function(status) {
  return this.findAll({ where: { status } });
};

Idea.findByCategory = function(category) {
  return this.findAll({ where: { category } });
};

Idea.findByCollege = function(collegeId) {
  return this.findAll({ where: { college_id: collegeId } });
};

Idea.findByIncubator = function(incubatorId) {
  return this.findAll({ where: { incubator_id: incubatorId } });
};

Idea.findByStudent = function(studentId) {
  return this.findAll({ where: { student_id: studentId } });
};

Idea.findPublic = function() {
  return this.findAll({ where: { is_public: true } });
};

Idea.findFeatured = function() {
  return this.findAll({ where: { is_featured: true, is_public: true } });
};

module.exports = Idea;
