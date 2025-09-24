const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Idea, User, College, Incubator, TeamMember, IdeaFile, Comment, Like } = require('../models');
const { authenticateToken, authorizeRoles, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { uploadConfigs, handleUploadError, getFileType, generateChecksum } = require('../middleware/upload');
const WorkflowService = require('../services/workflowService');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// @route   GET /api/ideas
// @desc    Get all ideas (with filtering and pagination)
// @access  Private
router.get('/', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('status').optional().isIn(['draft', 'submitted', 'new_submission', 'under_review', 'nurture', 'pending_review', 'needs_development', 'updated_pending_review', 'endorsed', 'forwarded_to_incubation', 'incubated', 'rejected']).withMessage('Invalid status'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('college_id').optional().isInt().withMessage('College ID must be a valid integer'),
  query('incubator_id').optional().isInt().withMessage('Incubator ID must be a valid integer'),
  query('student_id').optional().isInt().withMessage('Student ID must be a valid integer'),
  query('district').optional().isString().withMessage('District must be a string'),
  query('is_featured').optional().isBoolean().withMessage('is_featured must be a boolean'),
  query('is_public').optional().isBoolean().withMessage('is_public must be a boolean'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('sort_by').optional().isIn(['created_at', 'updated_at', 'title', 'status', 'views_count', 'likes_count']).withMessage('Invalid sort_by field'),
  query('sort_order').optional().isIn(['asc', 'desc', 'ASC', 'DESC']).withMessage('sort_order must be asc or desc'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      category,
      college_id,
      incubator_id,
      student_id,
      district,
      is_featured,
      is_public,
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters based on user role (only if no specific student_id is requested)
    if (!student_id) {
      if (req.user.role === 'student') {
        // Students can see their own ideas and public ideas
        whereClause[require('sequelize').Op.or] = [
          { student_id: req.user.id },
          { is_public: true }
        ];
      } else if (req.user.role === 'college_admin') {
        // College admins can see ideas from their college OR ideas without college_id
        whereClause[require('sequelize').Op.or] = [
          { college_id: req.user.college_id },
          { college_id: null }
        ];
        console.log('🔍 College admin filtering for college_id:', req.user.college_id);
      } else if (req.user.role === 'incubator_manager') {
        // Incubator managers can see all ideas from their incubator
        whereClause.incubator_id = req.user.incubator_id;
      }
    } else {
      // If student_id is specified, allow access if user is requesting their own ideas or has admin privileges
      if (req.user.role === 'student' && student_id != req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Students can only view their own ideas'
        });
      }
    }

    // Apply additional filters
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    if (college_id) whereClause.college_id = college_id;
    if (incubator_id) whereClause.incubator_id = incubator_id;
    if (student_id) whereClause.student_id = student_id;
    if (is_featured !== undefined) whereClause.is_featured = is_featured;
    if (is_public !== undefined) whereClause.is_public = is_public;
    
    // Add district filtering using a subquery
    if (district) {
      whereClause[require('sequelize').Op.and] = [
        ...(whereClause[require('sequelize').Op.and] || []),
        {
          college_id: {
            [require('sequelize').Op.in]: require('sequelize').literal(
              `(SELECT id FROM colleges WHERE district = '${district}')`
            )
          }
        }
      ];
    }

    // Search functionality
    if (search) {
      const searchConditions = [
        { title: { [require('sequelize').Op.like]: `%${search}%` } },
        { description: { [require('sequelize').Op.like]: `%${search}%` } },
        { problem_statement: { [require('sequelize').Op.like]: `%${search}%` } },
        { solution_approach: { [require('sequelize').Op.like]: `%${search}%` } },
      ];

      // If we already have an OR condition (for students), combine it with search
      if (whereClause[require('sequelize').Op.or]) {
        whereClause[require('sequelize').Op.and] = [
          { [require('sequelize').Op.or]: whereClause[require('sequelize').Op.or] },
          { [require('sequelize').Op.or]: searchConditions }
        ];
        delete whereClause[require('sequelize').Op.or];
      } else {
        whereClause[require('sequelize').Op.or] = searchConditions;
      }
    }

    console.log('🔍 Ideas query whereClause:', JSON.stringify(whereClause, null, 2));
    
    const { count, rows: ideas } = await Idea.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'profile_image_url'],
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'district'],
        },
        {
          model: Incubator,
          as: 'incubator',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'role'],
          required: false,
          include: [
            {
              model: College,
              as: 'college',
              attributes: ['id', 'name'],
              required: false
            },
            {
              model: Incubator,
              as: 'incubator',
              attributes: ['id', 'name'],
              required: false
            }
          ]
        },
        {
          model: IdeaFile,
          as: 'files',
          attributes: ['id', 'filename', 'original_name', 'file_path', 'file_size', 'mime_type', 'file_type', 'description', 'is_public'],
        },
      ],
      attributes: { exclude: ['problem_statement','solution_approach','technical_feasibility','business_model','competitive_analysis','risk_assessment','success_metrics','tags','reviewer_notes','rejection_reason'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort_by, sort_order.toUpperCase()]],
    });

    console.log('📊 Ideas query results:', {
      total_count: count,
      returned_ideas: ideas.length,
      user_role: req.user.role,
      college_id: req.user.college_id
    });

    const totalPages = Math.ceil(count / limit);

    // Transform ideas to use snake_case for timestamps
    const transformedIdeas = ideas.map(idea => {
      const ideaData = idea.toJSON();
      return {
        ...ideaData,
        created_at: ideaData.createdAt,
        updated_at: ideaData.updatedAt,
        student: ideaData.student ? {
          ...ideaData.student,
          created_at: ideaData.student.createdAt,
          updated_at: ideaData.student.updatedAt
        } : null,
        college: ideaData.college ? {
          ...ideaData.college,
          created_at: ideaData.college.createdAt,
          updated_at: ideaData.college.updatedAt
        } : null,
        incubator: ideaData.incubator ? {
          ...ideaData.incubator,
          created_at: ideaData.incubator.createdAt,
          updated_at: ideaData.incubator.updatedAt
        } : null,
        reviewer: ideaData.reviewer ? {
          ...ideaData.reviewer,
          created_at: ideaData.reviewer.createdAt,
          updated_at: ideaData.reviewer.updatedAt
        } : null,
        files: ideaData.files ? ideaData.files.map(file => ({
          ...file,
          created_at: file.createdAt,
          updated_at: file.updatedAt,
          url: `${process.env.BASE_URL || 'http://192.168.0.101:3001'}/uploads/${file.file_path}`
        })) : [],
        // Map database fields to frontend expected fields
        techStack: ideaData.tech_stack || [],
        teamMembers: ideaData.team_members || [],
        implementationPlan: ideaData.implementation_plan || '',
        marketPotential: ideaData.market_potential || '',
        fundingRequired: ideaData.funding_required || 0
      };
    });

    res.json({
      success: true,
      data: {
        ideas: transformedIdeas,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ideas',
    });
  }
});

// @route   GET /api/ideas/review
// @desc    Get ideas for review (college admin only) - MOVED BEFORE /:id to prevent conflicts
// @access  Private (college_admin, incubator_manager, admin)
router.get('/review', [
  authenticateToken,
  authorizeRoles('college_admin', 'incubator_manager', 'admin')
], async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};

    // Add status filter if provided, otherwise show all reviewable statuses
    if (status) {
      whereClause.status = status;
    } else {
      // For college admins, show submitted and under_review ideas
      if (req.user.role === 'college_admin') {
        whereClause.status = { [require('sequelize').Op.in]: ['submitted', 'under_review'] };
      }
    }

    // Filter by college for college admin
    if (req.user.role === 'college_admin' && req.user.college_id) {
      whereClause.college_id = req.user.college_id;
    }

    // Filter by incubator for incubator manager - ONLY endorsed ideas
    if (req.user.role === 'incubator_manager' && req.user.incubator_id) {
      whereClause.incubator_id = req.user.incubator_id;
      // Incubators can only review ideas that are already endorsed by college
      whereClause.status = 'endorsed';
    }

    console.log('🔍 Ideas review query:', {
      role: req.user.role,
      college_id: req.user.college_id,
      whereClause
    });

    const { rows: ideas, count } = await Idea.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'department']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name']
        },
        {
          model: TeamMember,
          as: 'teamMembers',
          attributes: ['id', 'name', 'role', 'email', 'department', 'year_of_study', 'skills', 'is_lead', 'contribution_percentage'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log('✅ Ideas review results:', {
      count,
      ideas_length: ideas.length
    });

    res.json({
      success: true,
      data: {
        ideas,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get ideas for review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ideas for review'
    });
  }
});

// @route   GET /api/ideas/:id
// @desc    Get idea by ID
// @access  Private
router.get('/:id', [
  authenticateToken,
], async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findByPk(id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'profile_image_url', 'department'],
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'city', 'state'],
        },
        {
          model: Incubator,
          as: 'incubator',
          attributes: ['id', 'name', 'focus_areas'],
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email', 'role', 'college_id', 'incubator_id'],
          required: false,
          include: [
            {
              model: College,
              as: 'college',
              attributes: ['id', 'name'],
              required: false
            },
            {
              model: Incubator,
              as: 'incubator',
              attributes: ['id', 'name'],
              required: false
            }
          ]
        },
        {
          model: TeamMember,
          as: 'teamMembers',
          attributes: ['id', 'name', 'role', 'email', 'department', 'year_of_study', 'skills', 'is_lead', 'contribution_percentage'],
        },
        {
          model: IdeaFile,
          as: 'files',
          attributes: ['id', 'filename', 'original_name', 'file_path', 'file_size', 'mime_type', 'file_type', 'description', 'is_public', 'download_count'],
        },
        {
          model: Comment,
          as: 'comments',
          where: { is_deleted: false, parent_id: null },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'profile_image_url', 'role'],
            },
            {
              model: Comment,
              as: 'replies',
              where: { is_deleted: false },
              required: false,
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'name', 'profile_image_url', 'role'],
                },
              ],
            },
          ],
          limit: 10,
          order: [['created_at', 'DESC']],
        },
      ],
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check access permissions
    if (req.user.role === 'student' && idea.student_id !== req.user.id && !idea.is_public) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (req.user.role === 'college_admin' && idea.college_id !== req.user.college_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (req.user.role === 'incubator_manager' && idea.incubator_id !== req.user.incubator_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Increment view count
    await idea.incrementViews();

    // Check if current user has liked this idea
    const userLike = await Like.findOne({
      where: { idea_id: id, user_id: req.user.id },
    });

    const ideaData = idea.toJSON();
    ideaData.user_has_liked = !!userLike;
    ideaData.user_like_type = userLike ? userLike.like_type : null;

    // Transform timestamps to snake_case
    const transformedIdeaData = {
      ...ideaData,
      created_at: ideaData.createdAt,
      updated_at: ideaData.updatedAt,
      student: ideaData.student ? {
        ...ideaData.student,
        created_at: ideaData.student.createdAt,
        updated_at: ideaData.student.updatedAt
      } : null,
      college: ideaData.college ? {
        ...ideaData.college,
        created_at: ideaData.college.createdAt,
        updated_at: ideaData.college.updatedAt
      } : null,
      incubator: ideaData.incubator ? {
        ...ideaData.incubator,
        created_at: ideaData.incubator.createdAt,
        updated_at: ideaData.incubator.updatedAt
      } : null,
      reviewer: ideaData.reviewer ? {
        ...ideaData.reviewer,
        created_at: ideaData.reviewer.createdAt,
        updated_at: ideaData.reviewer.updatedAt
      } : null,
      teamMembers: ideaData.teamMembers ? ideaData.teamMembers.map(member => ({
        ...member,
        created_at: member.createdAt,
        updated_at: member.updatedAt
      })) : [],
      comments: ideaData.comments ? ideaData.comments.map(comment => ({
        ...comment,
        created_at: comment.createdAt,
        updated_at: comment.updatedAt,
        user: comment.user ? {
          ...comment.user,
          created_at: comment.user.createdAt,
          updated_at: comment.user.updatedAt
        } : null
      })) : [],
      files: ideaData.files ? ideaData.files.map(file => ({
        ...file,
        created_at: file.createdAt,
        updated_at: file.updatedAt,
        url: `${process.env.BASE_URL || 'http://192.168.0.101:3001'}/uploads/${file.file_path}`
      })) : [],
      // Map database fields to frontend expected fields
      techStack: ideaData.tech_stack || [],
      teamMembers: ideaData.team_members || [],
      implementationPlan: ideaData.implementation_plan || '',
      marketPotential: ideaData.market_potential || '',
      fundingRequired: ideaData.funding_required || 0
    };

    res.json({
      success: true,
      data: {
        idea: transformedIdeaData,
      },
    });
  } catch (error) {
    console.error('Get idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get idea',
    });
  }
});

// @route   POST /api/ideas
// @desc    Create a new idea
// @access  Private (Students)
router.post('/', [
  authenticateToken,
  authorizeRoles('student', 'college_admin'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
  body('category').isIn(['Technology', 'Healthcare', 'Education', 'Finance', 'Environment', 'Agriculture', 'Transportation', 'Entertainment', 'Social Impact', 'Other', 'Education Technology']).withMessage('Invalid category'),
  body('team_size').optional().isInt({ min: 1, max: 20 }).withMessage('Team size must be between 1 and 20'),
  body('funding_required').optional().isFloat({ min: 0 }).withMessage('Funding required must be a positive number'),
  body('timeline').optional().isString().withMessage('Timeline must be a string'),
  body('problem_statement').optional().isString().withMessage('Problem statement must be a string'),
  body('solution_approach').optional().isString().withMessage('Solution approach must be a string'),
  body('market_potential').optional().isString().withMessage('Market potential must be a string'),
  body('technical_feasibility').optional().isString().withMessage('Technical feasibility must be a string'),
  body('business_model').optional().isString().withMessage('Business model must be a string'),
  body('competitive_analysis').optional().isString().withMessage('Competitive analysis must be a string'),
  body('risk_assessment').optional().isString().withMessage('Risk assessment must be a string'),
  body('success_metrics').optional().isArray().withMessage('Success metrics must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('is_public').optional().isBoolean().withMessage('is_public must be a boolean'),
  // Frontend specific fields
  body('teamMembers').optional().isArray().withMessage('Team members must be an array'),
  body('techStack').optional().isArray().withMessage('Tech stack must be an array'),
  body('implementationPlan').optional().isString().withMessage('Implementation plan must be a string'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      title,
      description,
      category,
      team_size,
      funding_required,
      timeline,
      problem_statement,
      solution_approach,
      market_potential,
      technical_feasibility,
      business_model,
      competitive_analysis,
      risk_assessment,
      success_metrics,
      tags,
      is_public = true,
      status = 'submitted', // Default to submitted for review
      // Frontend specific fields
      teamMembers,
      techStack,
      implementationPlan,
    } = req.body;

    console.log('🔍 Received request body fields:');
    console.log('teamMembers:', teamMembers);
    console.log('techStack:', techStack);
    console.log('implementationPlan:', implementationPlan);

    // Check if user has a valid college_id
    if (!req.user.college_id) {
      return res.status(400).json({
        success: false,
        message: 'User does not have a valid college_id. Please update your profile.',
      });
    }

    // Create idea with light retry to tolerate transient SQLITE_BUSY
    let idea;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        idea = await Idea.create({
          title,
          description,
          category,
          student_id: req.user.id,
          college_id: req.user.college_id,
          team_size: team_size || (teamMembers ? teamMembers.length : 1),
          funding_required,
          timeline,
          problem_statement,
          solution_approach,
          market_potential,
          technical_feasibility,
          business_model,
          competitive_analysis,
          risk_assessment,
          success_metrics,
          tags,
          is_public,
          status: status,
          // Frontend specific fields
          team_members: teamMembers || [],
          tech_stack: techStack || [],
          implementation_plan: implementationPlan || '',
        });
        break;
      } catch (err) {
        if (err?.parent?.code === 'SQLITE_BUSY' && attempt < 2) {
          await new Promise(r => setTimeout(r, 150 * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }

    // Create notification for new idea submission (if status is 'submitted')
    try {
      if (idea.status === 'submitted' && req.user.college_id) {
        const { Notification, User } = require('../models');
        
        // Get all college admins for this college
        const collegeAdmins = await User.findAll({
          where: {
            role: 'college_admin',
            college_id: req.user.college_id,
            is_active: true
          },
          attributes: ['id']
        });
        
        if (collegeAdmins.length > 0) {
          const notificationPromises = collegeAdmins.map(admin => 
            Notification.create({
              user_id: admin.id,
              title: 'New Idea Submission',
              message: `New idea "${idea.title}" submitted by ${req.user.name} for review.`,
              type: 'info',
              data: {
                idea_id: idea.id,
                student_id: req.user.id,
                student_name: req.user.name,
                category: idea.category
              },
              is_read: false
            })
          );
          
          await Promise.all(notificationPromises);
          
          console.log('✅ Notifications created for new idea submission:', {
            idea_id: idea.id,
            college_admins_notified: collegeAdmins.length
          });
        }
      }
    } catch (notificationError) {
      console.error('❌ Failed to create new idea notifications:', notificationError);
      // Don't fail the main request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Idea created successfully',
      data: {
        idea,
      },
    });
  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create idea',
      error: error.message,
    });
  }
});

// @route   PUT /api/ideas/:id
// @desc    Update idea
// @access  Private (Owner or Admin)
router.put('/:id', [
  authenticateToken,
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 5000 }).withMessage('Description must be between 1 and 5000 characters'),
  body('category').optional().isIn(['Technology', 'Healthcare', 'Education', 'Finance', 'Environment', 'Agriculture', 'Transportation', 'Entertainment', 'Social Impact', 'Other', 'technology', 'healthcare', 'education', 'finance', 'environment', 'agriculture', 'transportation', 'entertainment', 'social impact', 'other']).withMessage('Invalid category'),
  body('status').optional().isIn(['draft', 'submitted', 'new_submission', 'nurture', 'under_review', 'endorsed', 'forwarded', 'incubated', 'rejected']).withMessage('Invalid status'),
  body('team_size').optional().isInt({ min: 1, max: 20 }).withMessage('Team size must be between 1 and 20'),
  body('funding_required').optional().isFloat({ min: 0 }).withMessage('Funding required must be a positive number'),
  body('timeline').optional().isString().withMessage('Timeline must be a string'),
  body('problem_statement').optional().isString().withMessage('Problem statement must be a string'),
  body('solution_approach').optional().isString().withMessage('Solution approach must be a string'),
  body('market_potential').optional().isString().withMessage('Market potential must be a string'),
  body('technical_feasibility').optional().isString().withMessage('Technical feasibility must be a string'),
  body('business_model').optional().isString().withMessage('Business model must be a string'),
  body('competitive_analysis').optional().isString().withMessage('Competitive analysis must be a string'),
  body('risk_assessment').optional().isString().withMessage('Risk assessment must be a string'),
  body('success_metrics').optional().isArray().withMessage('Success metrics must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('is_featured').optional().isBoolean().withMessage('is_featured must be a boolean'),
  body('is_public').optional().isBoolean().withMessage('is_public must be a boolean'),
  body('rejection_reason').optional().isString().withMessage('Rejection reason must be a string'),
  body('reviewer_notes').optional().isString().withMessage('Reviewer notes must be a string'),
  // Frontend specific fields
  body('techStack').optional().isArray().withMessage('Tech stack must be an array'),
  body('teamMembers').optional().isArray().withMessage('Team members must be an array'),
  body('implementationPlan').optional().isString().withMessage('Implementation plan must be a string'),
  body('files').optional().isArray().withMessage('Files must be an array'),
  body('existing_files').optional().isArray().withMessage('Existing files must be an array'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    const idea = await Idea.findByPk(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check if user can update this idea
    if (req.user.role === 'student' && idea.student_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (req.user.role === 'college_admin' && idea.college_id !== req.user.college_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (req.user.role === 'incubator_manager' && idea.incubator_id !== req.user.incubator_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Update idea fields
    const updateFields = [
      'title', 'description', 'category', 'status', 'team_size', 'funding_required',
      'timeline', 'problem_statement', 'solution_approach', 'market_potential',
      'technical_feasibility', 'business_model', 'competitive_analysis',
      'risk_assessment', 'success_metrics', 'tags', 'is_featured', 'is_public',
      'rejection_reason', 'reviewer_notes', 'college_id', 'incubator_id'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        idea[field] = req.body[field];
      }
    });

    // Handle frontend specific fields
    if (req.body.techStack !== undefined) {
      idea.tech_stack = req.body.techStack; // Already JSON from frontend
    }
    if (req.body.teamMembers !== undefined) {
      idea.team_members = req.body.teamMembers; // Already JSON from frontend
    }
    if (req.body.implementationPlan !== undefined) {
      idea.implementation_plan = req.body.implementationPlan;
    }
    if (req.body.marketPotential !== undefined) {
      idea.market_potential = req.body.marketPotential;
    }
    if (req.body.fundingRequired !== undefined) {
      idea.funding_required = req.body.fundingRequired;
    }

    // Handle nurture mode updates
    if (idea.status === 'nurture' && req.user.role === 'student' && idea.student_id === req.user.id) {
      // Student is updating idea in nurture mode
      idea.last_updated_by_student = new Date();
      idea.nurture_update_count = (idea.nurture_update_count || 0) + 1;
      idea.is_updated_in_nurture = true;
      
      console.log('🔄 Student updated idea in nurture mode:', {
        idea_id: idea.id,
        update_count: idea.nurture_update_count,
        student_id: req.user.id
      });
      
      // Notify college admins about the update
      try {
        const { Notification, User } = require('../models');
        const collegeAdmins = await User.findAll({
          where: {
            role: 'college_admin',
            college_id: idea.college_id,
            is_active: true
          },
          attributes: ['id']
        });
        
        if (collegeAdmins.length > 0) {
          const notificationPromises = collegeAdmins.map(admin =>
            Notification.create({
              user_id: admin.id,
              title: 'Idea Updated in Nurture Mode 🔄',
              message: `Student ${req.user.name} has updated their idea "${idea.title}" in nurture mode. Please review the changes.`,
              type: 'info',
              data: {
                idea_id: idea.id,
                idea_title: idea.title,
                student_id: idea.student_id,
                student_name: req.user.name,
                college_id: idea.college_id,
                update_count: idea.nurture_update_count,
                last_updated: idea.last_updated_by_student
              },
              is_read: false
            })
          );
          
          await Promise.all(notificationPromises);
          console.log('✅ College admin notifications created for nurture update');
        }
      } catch (notificationError) {
        console.error('❌ Failed to create nurture update notifications:', notificationError);
      }
    } else if (req.user.role === 'student' && idea.student_id === req.user.id) {
      // Student trying to update idea that's not in nurture mode or is upgraded
      if (idea.status !== 'nurture') {
        return res.status(403).json({
          success: false,
          message: 'You can only update ideas that are in nurture mode. Please wait for college admin feedback.',
        });
      }
      
      // Check if idea is upgraded (moved from nurture to under_review)
      if (idea.is_upgraded) {
        return res.status(403).json({
          success: false,
          message: 'This idea has been upgraded and can no longer be edited. It is now under review.',
        });
      }
    }

    await idea.save();

    res.json({
      success: true,
      message: 'Idea updated successfully',
      data: {
        idea,
      },
    });
  } catch (error) {
    console.error('Update idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update idea',
    });
  }
});

// @route   DELETE /api/ideas/:id
// @desc    Delete idea
// @access  Private (Owner or Admin)
router.delete('/:id', [
  authenticateToken,
], async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findByPk(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check if user can delete this idea
    if (req.user.role === 'student' && idea.student_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (req.user.role === 'college_admin' && idea.college_id !== req.user.college_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (req.user.role === 'incubator_manager' && idea.incubator_id !== req.user.incubator_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Delete associated files
    const files = await IdeaFile.findAll({ where: { idea_id: id } });
    for (const file of files) {
      const filePath = path.join(process.env.UPLOAD_PATH || './uploads', file.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete idea and all associated data
    await idea.destroy();

    res.json({
      success: true,
      message: 'Idea deleted successfully',
    });
  } catch (error) {
    console.error('Delete idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete idea',
    });
  }
});

// @route   POST /api/ideas/:id/files
// @desc    Upload files for an idea
// @access  Private (Owner)
router.post('/:id/files', [
  authenticateToken,
  uploadConfigs.ideaFiles,
  handleUploadError,
], async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findByPk(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check if user can upload files for this idea
    if (req.user.role === 'student' && idea.student_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const fileType = getFileType(file.mimetype);
      const checksum = await generateChecksum(file.path);

      const ideaFile = await IdeaFile.create({
        idea_id: id,
        filename: file.filename,
        original_name: file.originalname,
        file_path: `files/${file.filename}`,
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: req.user.id,
        file_type: fileType,
        checksum,
      });

      uploadedFiles.push(ideaFile);
    }

    res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        files: uploadedFiles,
      },
    });
  } catch (error) {
    console.error('Upload files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
    });
  }
});

// @route   DELETE /api/ideas/:id/files/:fileId
// @desc    Delete a file from an idea
// @access  Private (Owner)
router.delete('/:id/files/:fileId', [
  authenticateToken,
], async (req, res) => {
  try {
    const { id, fileId } = req.params;

    const idea = await Idea.findByPk(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check if user can delete files for this idea
    if (req.user.role === 'student' && idea.student_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const ideaFile = await IdeaFile.findByPk(fileId);
    if (!ideaFile || ideaFile.idea_id !== parseInt(id)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Delete physical file
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', ideaFile.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await ideaFile.destroy();

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
    });
  }
});

// @route   POST /api/ideas/:id/team-members
// @desc    Add team member to an idea
// @access  Private (Owner)
router.post('/:id/team-members', [
  authenticateToken,
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('role').trim().isLength({ min: 2, max: 100 }).withMessage('Role must be between 2 and 100 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('department').optional().isString().withMessage('Department must be a string'),
  body('year_of_study').optional().isInt({ min: 1, max: 10 }).withMessage('Year of study must be between 1 and 10'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('linkedin_url').optional().isURL().withMessage('Invalid LinkedIn URL'),
  body('github_url').optional().isURL().withMessage('Invalid GitHub URL'),
  body('is_lead').optional().isBoolean().withMessage('is_lead must be a boolean'),
  body('contribution_percentage').optional().isInt({ min: 0, max: 100 }).withMessage('Contribution percentage must be between 0 and 100'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    const idea = await Idea.findByPk(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check if user can add team members to this idea
    if (req.user.role === 'student' && idea.student_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const {
      name,
      role,
      email,
      phone,
      department,
      year_of_study,
      skills,
      linkedin_url,
      github_url,
      is_lead = false,
      contribution_percentage,
    } = req.body;

    const teamMember = await TeamMember.create({
      idea_id: id,
      name,
      role,
      email,
      phone,
      department,
      year_of_study,
      skills,
      linkedin_url,
      github_url,
      is_lead,
      contribution_percentage,
    });

    res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      data: {
        teamMember,
      },
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add team member',
    });
  }
});

// @route   PUT /api/ideas/:id/team-members/:memberId
// @desc    Update team member
// @access  Private (Owner)
router.put('/:id/team-members/:memberId', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('role').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Role must be between 2 and 100 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('department').optional().isString().withMessage('Department must be a string'),
  body('year_of_study').optional().isInt({ min: 1, max: 10 }).withMessage('Year of study must be between 1 and 10'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('linkedin_url').optional().isURL().withMessage('Invalid LinkedIn URL'),
  body('github_url').optional().isURL().withMessage('Invalid GitHub URL'),
  body('is_lead').optional().isBoolean().withMessage('is_lead must be a boolean'),
  body('contribution_percentage').optional().isInt({ min: 0, max: 100 }).withMessage('Contribution percentage must be between 0 and 100'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id, memberId } = req.params;

    const idea = await Idea.findByPk(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check if user can update team members for this idea
    if (req.user.role === 'student' && idea.student_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const teamMember = await TeamMember.findByPk(memberId);
    if (!teamMember || teamMember.idea_id !== parseInt(id)) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      });
    }

    // Update team member fields
    const updateFields = [
      'name', 'role', 'email', 'phone', 'department', 'year_of_study',
      'skills', 'linkedin_url', 'github_url', 'is_lead', 'contribution_percentage'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        teamMember[field] = req.body[field];
      }
    });

    await teamMember.save();

    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: {
        teamMember,
      },
    });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team member',
    });
  }
});

// @route   DELETE /api/ideas/:id/team-members/:memberId
// @desc    Remove team member from an idea
// @access  Private (Owner)
router.delete('/:id/team-members/:memberId', [
  authenticateToken,
], async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const idea = await Idea.findByPk(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check if user can remove team members from this idea
    if (req.user.role === 'student' && idea.student_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const teamMember = await TeamMember.findByPk(memberId);
    if (!teamMember || teamMember.idea_id !== parseInt(id)) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      });
    }

    await teamMember.destroy();

    res.json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove team member',
    });
  }
});

// @route   POST /api/ideas/:id/like
// @desc    Like/unlike an idea
// @access  Private
router.post('/:id/like', [
  authenticateToken,
  body('like_type').optional().isIn(['like', 'love', 'helpful', 'innovative']).withMessage('Invalid like type'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { like_type = 'like' } = req.body;

    const idea = await Idea.findByPk(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check if user has already liked this idea
    const existingLike = await Like.findOne({
      where: { idea_id: id, user_id: req.user.id },
    });

    if (existingLike) {
      // Unlike the idea
      await existingLike.destroy();
      await idea.decrementLikes();

      res.json({
        success: true,
        message: 'Idea unliked successfully',
        data: {
          liked: false,
          like_type: null,
        },
      });
    } else {
      // Like the idea
      await Like.create({
        idea_id: id,
        user_id: req.user.id,
        like_type,
      });
      await idea.incrementLikes();

      res.json({
        success: true,
        message: 'Idea liked successfully',
        data: {
          liked: true,
          like_type,
        },
      });
    }
  } catch (error) {
    console.error('Like/unlike idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike idea',
    });
  }
});

// @route   POST /api/ideas/:id/comments
// @desc    Add comment to an idea
// @access  Private
router.post('/:id/comments', [
  authenticateToken,
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be between 1 and 2000 characters'),
  body('parent_id').optional().isInt().withMessage('Parent ID must be a valid integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { content, parent_id } = req.body;

    const idea = await Idea.findByPk(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check if parent comment exists if replying
    if (parent_id) {
      const parentComment = await Comment.findByPk(parent_id);
      if (!parentComment || parentComment.idea_id !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment',
        });
      }
    }

    const comment = await Comment.create({
      idea_id: id,
      user_id: req.user.id,
      content,
      parent_id,
    });

    // Get the comment with user info
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profile_image_url'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: commentWithUser,
      },
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
    });
  }
});

// @route   PUT /api/ideas/:id/comments/:commentId
// @desc    Update comment
// @access  Private (Owner)
router.put('/:id/comments/:commentId', [
  authenticateToken,
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be between 1 and 2000 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id, commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findByPk(commentId);
    if (!comment || comment.idea_id !== parseInt(id)) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user can update this comment
    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    comment.content = content;
    await comment.save();

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        comment,
      },
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment',
    });
  }
});

// @route   DELETE /api/ideas/:id/comments/:commentId
// @desc    Delete comment (soft delete)
// @access  Private (Owner or Admin)
router.delete('/:id/comments/:commentId', [
  authenticateToken,
], async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const comment = await Comment.findByPk(commentId);
    if (!comment || comment.idea_id !== parseInt(id)) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user can delete this comment
    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await comment.softDelete(req.user.id);

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
    });
  }
});

// @route   GET /api/ideas/featured
// @desc    Get featured ideas
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const ideas = await Idea.findAll({
      where: { is_featured: true, is_public: true },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'profile_image_url'],
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name'],
        },
        {
          model: Incubator,
          as: 'incubator',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    res.json({
      success: true,
      data: {
        ideas,
      },
    });
  } catch (error) {
    console.error('Get featured ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured ideas',
    });
  }
});

// @route   GET /api/ideas/categories
// @desc    Get idea categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Idea.findAll({
      attributes: [
        'category',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      where: { is_public: true },
      group: ['category'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']],
    });

    res.json({
      success: true,
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
    });
  }
});

// @route   PUT /api/ideas/:id/status
// @desc    Update idea status (for college admins and incubator managers)
// @access  Private
router.put('/:id/status', [
  authenticateToken,
  body('status').isIn(['submitted', 'new_submission', 'nurture', 'under_review', 'endorsed', 'forwarded', 'incubated', 'rejected']).withMessage('Invalid status'),
  body('feedback').optional().isString().withMessage('Feedback must be a string'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { status, feedback } = req.body;

    // Find the idea
    const idea = await Idea.findByPk(id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check permissions and enforce sequential workflow
    console.log('🔍 Permission check:', {
      userRole: req.user.role,
      userCollegeId: req.user.college_id,
      ideaCollegeId: idea.college_id,
      ideaIncubatorId: idea.incubator_id,
      currentStatus: idea.status,
      requestedStatus: status
    });

    if (req.user.role === 'admin') {
      // Admin can update any idea
      console.log('✅ Admin permission granted');
    } else if (req.user.role === 'college_admin') {
      if (idea.college_id !== req.user.college_id) {
        console.log('❌ College admin permission denied - different college');
        return res.status(403).json({
          success: false,
          message: 'You can only update ideas from your college',
        });
      }

      // College admins can only work with submitted, new_submission, or nurture ideas
      if (!['submitted', 'new_submission', 'nurture', 'under_review'].includes(idea.status)) {
        console.log('❌ College admin cannot modify already processed idea');
        return res.status(403).json({
          success: false,
          message: 'This idea has already been processed and cannot be modified',
        });
      }

      // College admins can only set: under_review, endorsed, forwarded, rejected
      if (!['under_review', 'endorsed', 'forwarded', 'rejected'].includes(status)) {
        console.log('❌ Invalid status transition for college admin');
        return res.status(400).json({
          success: false,
          message: 'College admins can only set status to under_review, endorsed, forwarded, or rejected',
        });
      }

      // Enforce sequential workflow for college admin
      if (idea.status === 'nurture' || idea.status === 'submitted' || idea.status === 'new_submission') {
        if (!['under_review', 'endorsed', 'rejected'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid status transition from submitted/nurture - can only go to under_review, endorsed, or rejected'
          });
        }
      } else if (idea.status === 'under_review') {
        if (!['endorsed', 'rejected'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid status transition from under_review - can only go to endorsed or rejected'
          });
        }
      } else if (idea.status === 'endorsed') {
        if (!['forwarded', 'rejected'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid status transition from endorsed - can only go to forwarded or rejected'
          });
        }
      }

      console.log('✅ College admin permission granted');
    } else if (req.user.role === 'incubator_manager') {
      if (idea.incubator_id !== req.user.incubator_id) {
        console.log('❌ Incubator manager permission denied - different incubator');
        return res.status(403).json({
          success: false,
          message: 'You can only update ideas from your incubator',
        });
      }

      // Incubator managers can only work with endorsed ideas
      if (idea.status !== 'endorsed') {
        console.log('❌ Incubator manager can only review endorsed ideas');
        return res.status(403).json({
          success: false,
          message: 'You can only review ideas that have been endorsed by colleges',
        });
      }

      // Incubator managers can only set: incubated, rejected
      if (!['incubated', 'rejected'].includes(status)) {
        console.log('❌ Invalid status transition for incubator manager');
        return res.status(400).json({
          success: false,
          message: 'Incubator managers can only set status to incubated or rejected',
        });
      }

      console.log('✅ Incubator manager permission granted');
    } else {
      console.log('❌ Insufficient permissions - unknown role');
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    // Sequential workflow logic
    let updateData = {
      status,
      feedback: feedback || idea.feedback,
      reviewed_by: req.user.id,
      reviewed_at: new Date(),
    };

    // When college admin endorses, assign to incubator automatically
    if (req.user.role === 'college_admin' && status === 'endorsed' && !idea.incubator_id) {
      // Find an appropriate incubator for this college (simple round-robin or first available)
      const { Incubator } = require('../models');
      const availableIncubators = await Incubator.findAll({
        where: { is_active: true },
        order: [['id', 'ASC']],
        limit: 1
      });
      
      if (availableIncubators.length > 0) {
        updateData.incubator_id = availableIncubators[0].id;
        console.log(`✅ Auto-assigned idea ${idea.id} to incubator ${availableIncubators[0].name}`);
      }
    }

    // Update the idea
    await idea.update(updateData);

    // Create notification for student about status change
    try {
      const { Notification } = require('../models');
      
      let notificationTitle = '';
      let notificationMessage = '';
      let notificationType = 'info';
      
      switch (status) {
        case 'under_review':
          notificationTitle = 'Idea Under Review 📋';
          notificationMessage = `Your idea "${idea.title}" is now under review by college administrators. We'll notify you of the decision soon!`;
          notificationType = 'info';
          break;
        case 'endorsed':
          notificationTitle = 'Idea Endorsed! 🎉';
          notificationMessage = `Congratulations! Your idea "${idea.title}" has been endorsed by your college and is being considered for incubation.`;
          notificationType = 'success';
          break;
        case 'forwarded':
          notificationTitle = 'Idea Forwarded to Incubator 🚀';
          notificationMessage = `Great news! Your idea "${idea.title}" has been forwarded to the incubator for final review.`;
          notificationType = 'success';
          break;
        case 'nurture':
          notificationTitle = 'Idea Needs Improvement 📝';
          notificationMessage = `Your idea "${idea.title}" needs some improvements. Please check the feedback and update your idea. You can now edit your idea to make the necessary changes.`;
          notificationType = 'warning';
          break;
        case 'rejected':
          notificationTitle = 'Idea Feedback 📝';
          notificationMessage = `Your idea "${idea.title}" needs some improvements. Please check the feedback and consider resubmitting.`;
          notificationType = 'warning';
          break;
        case 'incubated':
          notificationTitle = 'Idea Selected for Incubation! 🎊';
          notificationMessage = `Amazing! Your idea "${idea.title}" has been selected for incubation. Welcome to the program!`;
          notificationType = 'success';
          break;
        default:
          notificationTitle = 'Idea Status Updated';
          notificationMessage = `Your idea "${idea.title}" status has been updated to ${status}.`;
          notificationType = 'info';
      }
      
      await Notification.create({
        user_id: idea.student_id,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        data: {
          idea_id: idea.id,
          idea_title: idea.title,
          old_status: idea.status,
          new_status: status,
          reviewer_id: req.user.id,
          reviewer_name: req.user.name,
          feedback: feedback || idea.feedback
        },
        is_read: false
      });
      
      console.log('✅ Student notification created:', {
        student_id: idea.student_id,
        idea_id: idea.id,
        status: status
      });
    } catch (notificationError) {
      console.error('❌ Failed to create student notification:', notificationError);
    }

    // Automatically create pre-incubatee record for endorsed ideas
    if (status === 'endorsed') {
      try {
        const { PreIncubatee, Incubator } = require('../models');
        
        // Ensure incubator_id is set
        let incubatorId = idea.incubator_id;
        if (!incubatorId) {
          // Get the primary incubator if not set
          const primaryIncubator = await Incubator.findOne({
            where: { name: 'SGBAU Innovation Hub' }
          });
          if (primaryIncubator) {
            incubatorId = primaryIncubator.id;
            // Update the idea with the incubator_id
            await idea.update({ incubator_id: incubatorId });
            console.log(`🔧 Set incubator_id for idea ${idea.id} to ${incubatorId}`);
          } else {
            console.error('❌ No primary incubator found, cannot create pre-incubatee');
            return;
          }
        }
        
        const existingPreIncubatee = await PreIncubatee.findOne({
          where: { idea_id: idea.id }
        });

        if (!existingPreIncubatee) {
          await PreIncubatee.create({
            idea_id: idea.id,
            student_id: idea.student_id,
            college_id: idea.college_id,
            incubator_id: incubatorId,
            current_phase: 'research',
            progress_percentage: 0,
            phase_description: 'Initial research and planning phase',
            milestones: ['Research Complete', 'Prototype Ready', 'Testing Phase', 'Market Validation'],
            funding_received: 0,
            funding_required: idea.funding_required || 0,
            start_date: new Date(),
            expected_completion_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
            status: 'active',
            notes: 'Automatically created upon idea endorsement',
            last_review_date: new Date(),
            next_review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          });
          console.log(`✅ Pre-incubatee record created for idea ${idea.id}`);
        } else {
          console.log(`⚠️ Pre-incubatee already exists for idea ${idea.id}`);
        }
      } catch (error) {
        console.error('⚠️ Error creating pre-incubatee record:', error);
        // Don't fail the endorsement if pre-incubatee creation fails
      }
    }

    // Add a comment about the status change
    if (feedback) {
      await Comment.create({
        idea_id: idea.id,
        user_id: req.user.id,
        content: `Status updated to ${status}: ${feedback}`,
      });
    }

    // Create notifications for status change
    try {
      const { Notification, User } = require('../models');
      
      // 1. Notify student about status change
      let studentNotificationMessage = '';
      let notificationType = 'info';
      
      if (status === 'endorsed') {
        studentNotificationMessage = `Your idea "${idea.title}" has been endorsed by ${req.user.name}! 🎉 It will now be reviewed by incubators.`;
        notificationType = 'success';
      } else if (status === 'rejected') {
        studentNotificationMessage = `Your idea "${idea.title}" needs revision. Check feedback for details.`;
        notificationType = 'warning';
      } else if (status === 'under_review') {
        studentNotificationMessage = `Your idea "${idea.title}" is now under review.`;
        notificationType = 'info';
      } else if (status === 'incubated') {
        studentNotificationMessage = `Congratulations! Your idea "${idea.title}" has been selected for incubation! 🚀`;
        notificationType = 'success';
      }
      
      if (studentNotificationMessage && idea.student_id) {
        await Notification.create({
          user_id: idea.student_id,
          title: `Idea Status Update`,
          message: studentNotificationMessage,
          type: notificationType,
          data: {
            idea_id: idea.id,
            old_status: idea.status,
            new_status: status,
            feedback: feedback || null,
            reviewer_name: req.user.name
          },
          is_read: false
        });
        
        console.log('✅ Student notification created for idea status change:', {
          user_id: idea.student_id,
          idea_id: idea.id,
          new_status: status
        });

        // Send email notification to student
        try {
          const emailService = require('../services/emailService');
          const student = await User.findByPk(idea.student_id);
          
          if (student && student.email) {
            const emailResult = await emailService.sendIdeaStatusUpdateEmail(
              student.email,
              student.name,
              idea.title,
              status,
              studentNotificationMessage,
              feedback
            );
            
            if (emailResult.success) {
              console.log('✅ Email notification sent to student:', {
                student_email: student.email,
                idea_id: idea.id,
                new_status: status
              });
            } else {
              console.error('❌ Failed to send email notification:', emailResult.error);
            }
          } else {
            console.log('⚠️ Student has no email address, skipping email notification');
          }
        } catch (emailError) {
          console.error('❌ Error sending email notification:', emailError);
        }
      }

      // 2. When college endorses, notify incubator managers
      if (req.user.role === 'college_admin' && status === 'endorsed' && updateData.incubator_id) {
        const incubatorManagers = await User.findAll({
          where: {
            role: 'incubator_manager',
            incubator_id: updateData.incubator_id,
            is_active: true
          },
          attributes: ['id']
        });
        
        if (incubatorManagers.length > 0) {
          const incubatorNotificationPromises = incubatorManagers.map(manager =>
            Notification.create({
              user_id: manager.id,
              title: 'New Idea for Incubation Review',
              message: `New endorsed idea "${idea.title}" from ${req.user.college?.name || 'college'} is ready for incubation review.`,
              type: 'info',
              data: {
                idea_id: idea.id,
                student_id: idea.student_id,
                college_id: idea.college_id,
                college_name: req.user.college?.name,
                category: idea.category,
                reviewer_name: req.user.name
              },
              is_read: false
            })
          );
          
          await Promise.all(incubatorNotificationPromises);
          
          console.log('✅ Incubator notifications created for endorsed idea:', {
            idea_id: idea.id,
            incubator_managers_notified: incubatorManagers.length
          });
        }
      }

      // 3. When incubator incubates an idea, notify college admins
      if (req.user.role === 'incubator_manager' && status === 'incubated' && idea.college_id) {
        const collegeAdmins = await User.findAll({
          where: {
            role: 'college_admin',
            college_id: idea.college_id,
            is_active: true
          },
          attributes: ['id']
        });
        
        if (collegeAdmins.length > 0) {
          const collegeNotificationPromises = collegeAdmins.map(admin =>
            Notification.create({
              user_id: admin.id,
              title: 'Idea Successfully Incubated! 🚀',
              message: `Congratulations! Idea "${idea.title}" by ${idea.student?.name || 'student'} has been selected for incubation at ${req.user.incubator?.name || 'incubator'}.`,
              type: 'success',
              data: {
                idea_id: idea.id,
                student_id: idea.student_id,
                student_name: idea.student?.name,
                college_id: idea.college_id,
                incubator_id: req.user.incubator_id,
                incubator_name: req.user.incubator?.name,
                category: idea.category,
                reviewer_name: req.user.name
              },
              is_read: false
            })
          );
          
          await Promise.all(collegeNotificationPromises);
          
          console.log('✅ College admin notifications created for incubated idea:', {
            idea_id: idea.id,
            college_admins_notified: collegeAdmins.length
          });
        }
      }

    } catch (notificationError) {
      console.error('❌ Failed to create notifications:', notificationError);
      // Don't fail the main request if notification fails
    }

    res.json({
      success: true,
      message: 'Idea status updated successfully',
      data: {
        idea: {
          id: idea.id,
          title: idea.title,
          status: idea.status,
          feedback: idea.feedback,
          reviewed_by: req.user.id,
          reviewed_at: idea.reviewed_at,
        },
      },
    });
  } catch (error) {
    console.error('Update idea status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update idea status',
    });
  }
});

// ==================== WORKFLOW MANAGEMENT ENDPOINTS ====================

// @route   PUT /api/ideas/:id/workflow/status
// @desc    Update idea status with workflow management
// @access  Private (College Admin, Admin)
router.put('/:id/workflow/status', [
  authenticateToken,
  authorizeRoles('college_admin', 'admin'),
  body('status').isIn(['new_submission', 'under_review', 'nurture', 'pending_review', 'needs_development', 'updated_pending_review', 'endorsed', 'forwarded_to_incubation', 'incubated', 'rejected']).withMessage('Invalid status'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
  body('development_feedback').optional().isString().withMessage('Development feedback must be a string'),
  body('development_requirements').optional().isArray().withMessage('Development requirements must be an array'),
  body('assigned_mentor_id').optional().isInt().withMessage('Assigned mentor ID must be an integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { status, reason, development_feedback, development_requirements, assigned_mentor_id } = req.body;
    const ideaId = req.params.id;

    const additionalData = {};
    if (development_feedback) additionalData.development_feedback = development_feedback;
    if (development_requirements) additionalData.development_requirements = development_requirements;
    if (assigned_mentor_id) additionalData.assigned_mentor_id = assigned_mentor_id;

    const updatedIdea = await WorkflowService.updateIdeaStatus(
      ideaId,
      status,
      req.user.id,
      reason,
      additionalData
    );

    res.json({
      success: true,
      message: 'Idea status updated successfully',
      data: {
        idea: updatedIdea,
        workflow_stage: updatedIdea.workflow_stage,
        status: updatedIdea.status
      }
    });
  } catch (error) {
    console.error('Workflow status update error:', error);
    console.error('Error details:', {
      ideaId: req.params.id,
      newStatus: req.body.status,
      userId: req.user?.id,
      errorMessage: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update idea status',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   POST /api/ideas/:id/workflow/assign-mentor
// @desc    Assign mentor to idea
// @access  Private (College Admin, Admin)
router.post('/:id/workflow/assign-mentor', [
  authenticateToken,
  authorizeRoles('college_admin', 'admin'),
  body('mentor_id').isInt().withMessage('Mentor ID must be an integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { mentor_id } = req.body;
    const ideaId = req.params.id;

    const updatedIdea = await WorkflowService.assignMentor(ideaId, mentor_id, req.user.id);

    res.json({
      success: true,
      message: 'Mentor assigned successfully',
      data: {
        idea: updatedIdea,
        assigned_mentor_id: mentor_id
      }
    });
  } catch (error) {
    console.error('Mentor assignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign mentor',
    });
  }
});

// @route   GET /api/ideas/workflow/stats
// @desc    Get workflow statistics
// @access  Private (College Admin, Admin)
router.get('/workflow/stats', [
  authenticateToken,
  authorizeRoles('college_admin', 'admin'),
], async (req, res) => {
  try {
    const collegeId = req.user.role === 'college_admin' ? req.user.college_id : null;
    const stats = await WorkflowService.getWorkflowStats(collegeId);

    res.json({
      success: true,
      data: {
        workflow_stats: stats
      }
    });
  } catch (error) {
    console.error('Workflow stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workflow statistics',
    });
  }
});

// @route   GET /api/ideas/workflow/stage/:stage
// @desc    Get ideas by workflow stage
// @access  Private (College Admin, Admin)
router.get('/workflow/stage/:stage', [
  authenticateToken,
  authorizeRoles('college_admin', 'admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
], async (req, res) => {
  try {
    const { stage } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const collegeId = req.user.role === 'college_admin' ? req.user.college_id : null;
    const offset = (page - 1) * limit;

    const { ideas, count } = await WorkflowService.getIdeasByStage(stage, collegeId, parseInt(limit), offset);

    res.json({
      success: true,
      data: {
        ideas,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit),
        }
      }
    });
  } catch (error) {
    console.error('Workflow stage ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ideas by stage',
    });
  }
});

// @route   GET /api/ideas/workflow/upgraded
// @desc    Get upgraded ideas (ideas that moved from nurture to under_review)
// @access  Private (College Admin, Admin)
router.get('/workflow/upgraded', [
  authenticateToken,
  authorizeRoles('college_admin', 'admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const collegeId = req.user.role === 'college_admin' ? req.user.college_id : null;
    const offset = (page - 1) * limit;

    const { ideas, count } = await WorkflowService.getUpgradedIdeas(collegeId, parseInt(limit), offset);

    res.json({
      success: true,
      data: {
        ideas,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit),
        }
      }
    });
  } catch (error) {
    console.error('Upgraded ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upgraded ideas',
    });
  }
});

// @route   GET /api/ideas/:id/workflow/transitions
// @desc    Get valid status transitions for an idea
// @access  Private (College Admin, Admin)
router.get('/:id/workflow/transitions', [
  authenticateToken,
  authorizeRoles('college_admin', 'admin'),
], async (req, res) => {
  try {
    const ideaId = req.params.id;
    const idea = await Idea.findByPk(ideaId);

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    const validTransitions = WorkflowService.getValidTransitions(idea.status);

    res.json({
      success: true,
      data: {
        current_status: idea.status,
        valid_transitions: validTransitions
      }
    });
  } catch (error) {
    console.error('Workflow transitions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get valid transitions',
    });
  }
});

// @route   PUT /api/ideas/:id
// @desc    Update an idea
// @access  Private (Owner or Admin)
router.put('/:id', [
  authenticateToken,
  authorizeOwnerOrAdmin,
  body('title').optional().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').optional().isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
  body('category').optional().isIn(['Technology', 'Healthcare', 'Education', 'Finance', 'Environment', 'Agriculture', 'Transportation', 'Entertainment', 'Social Impact', 'Other', 'Education Technology']).withMessage('Invalid category'),
  body('tech_stack').optional().isArray().withMessage('Tech stack must be an array'),
  body('team_members').optional().isArray().withMessage('Team members must be an array'),
  body('expected_outcome').optional().isString().withMessage('Expected outcome must be a string'),
  body('target_audience').optional().isString().withMessage('Target audience must be a string'),
  body('implementation_plan').optional().isString().withMessage('Implementation plan must be a string'),
  body('budget_estimate').optional().isNumeric().withMessage('Budget estimate must be a number'),
  body('timeline').optional().isString().withMessage('Timeline must be a string'),
  body('is_public').optional().isBoolean().withMessage('is_public must be a boolean'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Find the idea
    const idea = await Idea.findByPk(id, {
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: College, as: 'college', attributes: ['id', 'name'] },
        { model: Incubator, as: 'incubator', attributes: ['id', 'name'] },
      ]
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check if idea was in 'nurture' or 'needs_development' status before update
    const wasNurture = idea.status === 'nurture' || idea.status === 'needs_development';
    const isStudentUpdate = req.user.role === 'student' && idea.student_id === req.user.id;
    console.log(`🔍 Debug: Idea ${id} current status: ${idea.status}, wasNurture: ${wasNurture}, isStudentUpdate: ${isStudentUpdate}`);
    console.log(`🔍 Debug: Update data keys: ${Object.keys(updateData).length}`);
    
    // Update the idea
    await idea.update(updateData);
    
    // If the idea was in 'nurture' or 'needs_development' status and is being updated by a student, change to 'pending_review'
    if (wasNurture && isStudentUpdate && Object.keys(updateData).length > 0) {
      console.log(`🔄 Changing idea ${id} status from '${idea.status}' to 'pending_review' after student update`);
      await idea.update({ 
        status: 'pending_review',
        updated_at: new Date(),
        previous_status: idea.status,
        status_change_reason: 'Student updated nurtured idea'
      });
      
      // Create notification for college admins about the update
      try {
        const { Notification } = require('../models');
        const { User } = require('../models');
        
        // Find college admins for this college
        const collegeAdmins = await User.findAll({
          where: { 
            role: 'college_admin',
            college_id: idea.college_id
          }
        });
        
        // Create notifications for each college admin
        for (const admin of collegeAdmins) {
          await Notification.create({
            user_id: admin.id,
            type: 'info',
            title: 'Idea Updated in Nurture Phase',
            message: `Student ${req.user.name} has updated their nurtured idea "${idea.title}". The idea is now pending review.`,
            data: {
              idea_id: idea.id,
              student_id: req.user.id,
              previous_status: idea.status,
              new_status: 'pending_review'
            }
          });
        }
        
        console.log(`✅ Created notifications for ${collegeAdmins.length} college admins about idea update`);
      } catch (notificationError) {
        console.error('❌ Failed to create notifications:', notificationError);
      }
      
      console.log(`🔄 Idea ${id} status changed from '${idea.status}' to 'pending_review' after student update`);
    } else {
      console.log(`⚠️ Not changing status - wasNurture: ${wasNurture}, isStudentUpdate: ${isStudentUpdate}, updateData keys: ${Object.keys(updateData).length}`);
    }

    // Refresh the idea with associations
    await idea.reload({
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: College, as: 'college', attributes: ['id', 'name'] },
        { model: Incubator, as: 'incubator', attributes: ['id', 'name'] },
      ]
    });

    res.json({
      success: true,
      message: 'Idea updated successfully',
      data: {
        idea: idea.toJSON()
      }
    });
  } catch (error) {
    console.error('Update idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update idea',
    });
  }
});

module.exports = router;
