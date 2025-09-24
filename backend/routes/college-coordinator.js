const express = require('express');
const { body, validationResult, query, param } = require('express-validator');
const { User, College, Idea, Event, Report, Document, IdeaEvaluation, Notification } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ==================== DASHBOARD OVERVIEW ====================

// @route   GET /api/college-coordinator/dashboard
// @desc    Get college coordinator dashboard overview
// @access  Private (college_admin)
router.get('/dashboard', [
  authenticateToken,
  authorizeRoles('college_admin'),
], async (req, res) => {
  try {
    const collegeId = req.user.college_id;
    
    // Get basic stats
    const totalStudents = await User.count({
      where: { college_id: collegeId, role: 'student', is_active: true }
    });

    const totalIdeas = await Idea.count({
      where: { college_id: collegeId }
    });

    const ideasByStatus = await Idea.findAll({
      where: { college_id: collegeId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const recentIdeas = await Idea.findAll({
      where: { college_id: collegeId },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    const pendingEvaluations = await Idea.count({
      where: { 
        college_id: collegeId,
        status: ['submitted', 'new_submission', 'under_review']
      }
    });

    const totalEvents = await Event.count({
      where: { college_id: collegeId, is_active: true }
    });

    const upcomingEvents = await Event.findAll({
      where: { 
        college_id: collegeId,
        is_active: true,
        start_date: { [require('sequelize').Op.gte]: new Date() }
      },
      order: [['created_at', 'DESC'], ['start_date', 'ASC']],
      limit: 3
    });

    // Transform ideas by status
    const statusCounts = {};
    ideasByStatus.forEach(item => {
      statusCounts[item.status] = parseInt(item.count);
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalIdeas,
          pendingEvaluations,
          totalEvents,
          ideasByStatus: statusCounts
        },
        recentIdeas,
        upcomingEvents
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
});

// ==================== IDEA POOL ====================

// @route   GET /api/college-coordinator/ideas
// @desc    Get all ideas from college students
// @access  Private (college_admin)
router.get('/ideas', [
  authenticateToken,
  authorizeRoles('college_admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isString().withMessage('Status must be a string'),
  query('search').optional().isString().withMessage('Search must be a string'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;
    const collegeId = req.user.college_id;

    const whereClause = { college_id: collegeId };
    
    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.like]: `%${search}%` } },
        { description: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: ideas } = await Idea.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: 'student', 
          attributes: ['id', 'name', 'email', 'department', 'year_of_study'] 
        },
        { 
          model: IdeaEvaluation, 
          as: 'evaluations',
          include: [
            { model: User, as: 'evaluator', attributes: ['id', 'name'] }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        ideas,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ideas'
    });
  }
});

// ==================== EVALUATE IDEAS ====================

// @route   POST /api/college-coordinator/ideas/:id/evaluate
// @desc    Evaluate an idea
// @access  Private (college_admin)
router.post('/ideas/:id/evaluate', [
  authenticateToken,
  authorizeRoles('college_admin'),
  param('id').isInt().withMessage('Idea ID must be a valid integer'),
  body('rating').isInt({ min: 1, max: 10 }).withMessage('Rating must be between 1 and 10'),
  body('comments').optional().isString().withMessage('Comments must be a string'),
  body('recommendation').isIn(['nurture', 'forward', 'reject']).withMessage('Recommendation must be nurture, forward, or reject'),
  body('mentor_assigned').optional().isInt().withMessage('Mentor ID must be a valid integer'),
  body('nurture_notes').optional().isString().withMessage('Nurture notes must be a string'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { rating, comments, recommendation, mentor_assigned, nurture_notes } = req.body;
    const evaluatorId = req.user.id;

    // Check if idea exists and belongs to coordinator's college
    const idea = await Idea.findOne({
      where: { 
        id: id,
        college_id: req.user.college_id 
      }
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    // Check if already evaluated by this coordinator
    const existingEvaluation = await IdeaEvaluation.findOne({
      where: { 
        idea_id: id,
        evaluator_id: evaluatorId 
      }
    });

    if (existingEvaluation) {
      return res.status(400).json({
        success: false,
        message: 'Idea already evaluated by this coordinator'
      });
    }

    // Create evaluation
    const evaluation = await IdeaEvaluation.create({
      idea_id: id,
      evaluator_id: evaluatorId,
      rating,
      comments,
      recommendation,
      mentor_assigned,
      nurture_notes,
      evaluation_date: new Date()
    });

    // Update idea status based on recommendation
    let newStatus = idea.status;
    if (recommendation === 'forward') {
      newStatus = 'forwarded';
    } else if (recommendation === 'reject') {
      newStatus = 'rejected';
    } else if (recommendation === 'nurture') {
      newStatus = 'nurture';
    }

    await idea.update({ 
      status: newStatus,
      reviewed_by: evaluatorId,
      reviewed_at: new Date()
    });

    // Create notification for student
    await Notification.create({
      user_id: idea.student_id,
      title: 'Idea Evaluated',
      message: `Your idea "${idea.title}" has been evaluated with recommendation: ${recommendation}`,
      type: 'evaluation',
      is_read: false
    });

    res.json({
      success: true,
      message: 'Idea evaluated successfully',
      data: { evaluation }
    });
  } catch (error) {
    console.error('Evaluate idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate idea'
    });
  }
});

// ==================== EVENTS MANAGEMENT ====================

// @route   GET /api/college-coordinator/events
// @desc    Get all events for college
// @access  Private (college_admin)
router.get('/events', [
  authenticateToken,
  authorizeRoles('college_admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isString().withMessage('Status must be a string'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const collegeId = req.user.college_id;

    const whereClause = { college_id: collegeId, is_active: true };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC'], ['start_date', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get events'
    });
  }
});

// @route   POST /api/college-coordinator/events
// @desc    Create new event
// @access  Private (college_admin)
router.post('/events', [
  authenticateToken,
  authorizeRoles('college_admin'),
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('event_type').isIn(['webinar', 'ideathon', 'workshop', 'competition', 'seminar', 'conference', 'other']).withMessage('Invalid event type'),
  body('start_date').isISO8601().withMessage('Start date must be a valid date'),
  body('end_date').optional().isISO8601().withMessage('End date must be a valid date'),
  body('location').optional().isString().withMessage('Location must be a string'),
  body('is_online').optional().isBoolean().withMessage('is_online must be a boolean'),
  body('meeting_link').optional().isURL().withMessage('Meeting link must be a valid URL'),
  body('max_participants').optional().isInt({ min: 1 }).withMessage('Max participants must be a positive integer'),
  body('registration_deadline').optional().isISO8601().withMessage('Registration deadline must be a valid date'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const eventData = {
      ...req.body,
      college_id: req.user.college_id,
      created_by: req.user.id
    };

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

// ==================== REPORTS MANAGEMENT ====================

// @route   GET /api/college-coordinator/reports
// @desc    Get all reports for college
// @access  Private (college_admin)
router.get('/reports', [
  authenticateToken,
  authorizeRoles('college_admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('report_type').optional().isString().withMessage('Report type must be a string'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, report_type } = req.query;
    const offset = (page - 1) * limit;
    const collegeId = req.user.college_id;

    const whereClause = { college_id: collegeId, is_active: true };
    if (report_type) {
      whereClause.report_type = report_type;
    }

    const { count, rows: reports } = await Report.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports'
    });
  }
});

// @route   POST /api/college-coordinator/reports
// @desc    Create new report
// @access  Private (college_admin)
router.post('/reports', [
  authenticateToken,
  authorizeRoles('college_admin'),
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('report_type').isIn(['biannual', 'annual', 'quarterly', 'monthly', 'custom']).withMessage('Invalid report type'),
  body('period_start').isISO8601().withMessage('Period start must be a valid date'),
  body('period_end').isISO8601().withMessage('Period end must be a valid date'),
  body('content').optional().isString().withMessage('Content must be a string'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const reportData = {
      ...req.body,
      college_id: req.user.college_id,
      created_by: req.user.id
    };

    const report = await Report.create(reportData);

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report'
    });
  }
});

// ==================== DOCUMENTS MANAGEMENT ====================

// @route   GET /api/college-coordinator/documents
// @desc    Get all documents for college
// @access  Private (college_admin)
router.get('/documents', [
  authenticateToken,
  authorizeRoles('college_admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('document_type').optional().isString().withMessage('Document type must be a string'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, document_type } = req.query;
    const offset = (page - 1) * limit;
    const collegeId = req.user.college_id;

    const whereClause = { 
      [require('sequelize').Op.or]: [
        { college_id: collegeId },
        { is_public: true }
      ],
      is_active: true 
    };
    
    if (document_type) {
      whereClause.document_type = document_type;
    }

    const { count, rows: documents } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'name'] },
        { model: College, as: 'college', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get documents'
    });
  }
});

// @route   POST /api/college-coordinator/documents
// @desc    Upload document
// @access  Private (college_admin)
router.post('/documents', [
  authenticateToken,
  authorizeRoles('college_admin'),
  uploadConfigs.document,
  handleUploadError,
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('document_type').isIn(['circular', 'template', 'poster', 'guideline', 'form', 'other']).withMessage('Invalid document type'),
  body('is_public').optional().isBoolean().withMessage('is_public must be a boolean'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const documentData = {
      title: req.body.title,
      description: req.body.description,
      document_type: req.body.document_type,
      file_path: `documents/${req.file.filename}`,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      is_public: req.body.is_public === 'true',
      college_id: req.user.college_id,
      uploaded_by: req.user.id
    };

    const document = await Document.create(documentData);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { document }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
});

// ==================== ANALYTICS ====================

// @route   GET /api/college-coordinator/analytics
// @desc    Get college analytics
// @access  Private (college_admin)
router.get('/analytics', [
  authenticateToken,
  authorizeRoles('college_admin'),
], async (req, res) => {
  try {
    const collegeId = req.user.college_id;

    // Student engagement analytics
    const totalStudents = await User.count({
      where: { college_id: collegeId, role: 'student', is_active: true }
    });

    const studentsWithIdeas = await User.count({
      where: { college_id: collegeId, role: 'student', is_active: true },
      include: [{
        model: Idea,
        as: 'ideas',
        required: true
      }]
    });

    const totalIdeas = await Idea.count({
      where: { college_id: collegeId }
    });

    const ideasByStatus = await Idea.findAll({
      where: { college_id: collegeId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const ideasByMonth = await Idea.findAll({
      where: { college_id: collegeId },
      attributes: [
        [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('created_at')), 'month'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('created_at'))],
      order: [[require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('created_at')), 'ASC']],
      raw: true
    });

    // Transform data
    const statusCounts = {};
    ideasByStatus.forEach(item => {
      statusCounts[item.status] = parseInt(item.count);
    });

    res.json({
      success: true,
      data: {
        studentEngagement: {
          totalStudents,
          studentsWithIdeas,
          participationRate: totalStudents > 0 ? (studentsWithIdeas / totalStudents * 100).toFixed(2) : 0
        },
        ideaStats: {
          totalIdeas,
          ideasByStatus: statusCounts,
          ideasByMonth
        }
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
});

module.exports = router;
