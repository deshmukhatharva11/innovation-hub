const express = require('express');
const { body, validationResult, query, param } = require('express-validator');
const { User, College, Idea, Event, Report, Document, IdeaEvaluation, Notification, Conversation, Message } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const router = express.Router();

// ==================== ENHANCED DASHBOARD OVERVIEW ====================

// @route   GET /api/college-coordinator/dashboard
// @desc    Get comprehensive college coordinator dashboard overview
// @access  Private (college_admin)
router.get('/dashboard', [
  authenticateToken,
  authorizeRoles('college_admin'),
], async (req, res) => {
  try {
    const collegeId = req.user.college_id;
    
    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'College ID not found for user'
      });
    }

    // Get comprehensive stats with proper college isolation
    const [
      totalStudents,
      activeStudents,
      totalIdeas,
      ideasByStatus,
      recentIdeas,
      pendingEvaluations,
      endorsedIdeas,
      incubatedIdeas,
      rejectedIdeas,
      totalEvents,
      upcomingEvents,
      unreadNotifications
    ] = await Promise.all([
      // Student counts
      User.count({
        where: { 
          college_id: collegeId, 
          role: 'student',
          is_active: true 
        }
      }),
      
      User.count({
        where: { 
          college_id: collegeId, 
          role: 'student',
          is_active: true,
          last_login: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      }),

      // Idea counts
      Idea.count({
        where: { college_id: collegeId }
      }),

      // Ideas by status
      Idea.findAll({
        where: { college_id: collegeId },
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      }),

      // Recent ideas
      Idea.findAll({
        where: { college_id: collegeId },
        include: [
          { 
            model: User, 
            as: 'student', 
            attributes: ['id', 'name', 'email', 'department'] 
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 5
      }),

      // Pending evaluations
      Idea.count({
        where: { 
          college_id: collegeId,
          status: { [Op.in]: ['submitted', 'new_submission', 'under_review'] }
        }
      }),

      // Endorsed ideas
      Idea.count({
        where: { 
          college_id: collegeId,
          status: 'endorsed'
        }
      }),

      // Incubated ideas
      Idea.count({
        where: { 
          college_id: collegeId,
          status: 'incubated'
        }
      }),

      // Rejected ideas
      Idea.count({
        where: { 
          college_id: collegeId,
          status: 'rejected'
        }
      }),

      // Events
      Event.count({
        where: { college_id: collegeId, is_active: true }
      }),

      Event.findAll({
        where: { 
          college_id: collegeId,
          is_active: true,
          start_date: { [Op.gte]: new Date() }
        },
        order: [['created_at', 'DESC'], ['start_date', 'ASC']],
        limit: 3
      }),

      // Unread notifications
      Notification.count({
        where: { 
          user_id: req.user.id,
          is_read: false 
        }
      })
    ]);

    // Transform ideas by status
    const statusCounts = {
      submitted: 0,
      under_review: 0,
      endorsed: 0,
      incubated: 0,
      rejected: 0,
      new_submission: 0
    };
    
    ideasByStatus.forEach(item => {
      statusCounts[item.status] = parseInt(item.count);
    });

    // Calculate participation rate
    const studentsWithIdeas = await User.count({
      where: { 
        college_id: collegeId, 
        role: 'student', 
        is_active: true 
      },
      include: [{
        model: Idea,
        as: 'ideas',
        required: true
      }]
    });

    const participationRate = totalStudents > 0 ? (studentsWithIdeas / totalStudents * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          activeStudents,
          totalIdeas,
          pendingEvaluations,
          endorsedIdeas,
          incubatedIdeas,
          rejectedIdeas,
          totalEvents,
          participationRate: parseFloat(participationRate),
          ideasByStatus: statusCounts,
          unreadNotifications
        },
        recentIdeas,
        upcomingEvents
      }
    });
  } catch (error) {
    console.error('Enhanced dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

// ==================== ENHANCED IDEA MANAGEMENT ====================

// @route   GET /api/college-coordinator/ideas
// @desc    Get all ideas from college students with advanced filtering
// @access  Private (college_admin)
router.get('/ideas', [
  authenticateToken,
  authorizeRoles('college_admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isString().withMessage('Status must be a string'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('department').optional().isString().withMessage('Department must be a string'),
  query('sort_by').optional().isIn(['created_at', 'updated_at', 'title', 'status']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
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

    const { 
      page = 1, 
      limit = 10, 
      status, 
      search, 
      category, 
      department,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;
    
    const offset = (page - 1) * limit;
    const collegeId = req.user.college_id;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'College ID not found for user'
      });
    }

    const whereClause = { college_id: collegeId };
    
    // Apply filters
    if (status) {
      whereClause.status = status;
    }

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { problem_statement: { [Op.like]: `%${search}%` } },
        { solution_approach: { [Op.like]: `%${search}%` } }
      ];
    }

    // Build include conditions
    const includeConditions = [
      { 
        model: User, 
        as: 'student', 
        attributes: ['id', 'name', 'email', 'department', 'year_of_study'],
        where: department ? { department: department } : undefined,
        required: true
      },
      { 
        model: IdeaEvaluation, 
        as: 'evaluations',
        include: [
          { model: User, as: 'evaluator', attributes: ['id', 'name'] }
        ],
        required: false
      }
    ];

    const { count, rows: ideas } = await Idea.findAndCountAll({
      where: whereClause,
      include: includeConditions,
      order: [[sort_by, sort_order.toUpperCase()]],
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
      message: 'Failed to get ideas',
      error: error.message
    });
  }
});

// ==================== ENHANCED IDEA EVALUATION ====================

// @route   POST /api/college-coordinator/ideas/:id/evaluate
// @desc    Evaluate an idea with comprehensive workflow
// @access  Private (college_admin)
router.post('/ideas/:id/evaluate', [
  authenticateToken,
  authorizeRoles('college_admin'),
], async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comments, recommendation, mentor_assigned, nurture_notes } = req.body;
    const evaluatorId = req.user.id;
    const collegeId = req.user.college_id;

    // Check if idea exists and belongs to coordinator's college
    const idea = await Idea.findOne({
      where: { 
        id: id,
        college_id: collegeId 
      },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found or does not belong to your college'
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
    console.log('Creating evaluation with data:', {
      idea_id: id,
      evaluator_id: evaluatorId,
      rating,
      comments,
      recommendation,
      mentor_assigned,
      nurture_notes
    });
    
    const evaluation = await IdeaEvaluation.create({
      idea_id: id,
      evaluator_id: evaluatorId,
      rating: rating || 5,
      comments: comments || '',
      recommendation: recommendation || 'nurture',
      mentor_assigned: mentor_assigned || null,
      nurture_notes: nurture_notes || '',
      evaluation_date: new Date()
    });

    // Update idea status based on recommendation
    let newStatus = idea.status;
    if (recommendation === 'forward') {
      newStatus = 'endorsed';
    } else if (recommendation === 'reject') {
      newStatus = 'rejected';
    } else if (recommendation === 'nurture') {
      newStatus = 'nurture';
    }
    
    // Remove new_submission status after evaluation
    if (newStatus === 'new_submission') {
      newStatus = 'under_review';
    }

    await idea.update({ 
      status: newStatus,
      reviewed_by: evaluatorId,
      reviewed_at: new Date()
    });

    // Create notification for student
    try {
      await Notification.create({
        user_id: idea.student_id,
        title: 'Idea Evaluated',
        message: `Your idea "${idea.title}" has been evaluated with recommendation: ${recommendation}`,
        type: 'evaluation',
        data: {
          idea_id: idea.id,
          evaluation_id: evaluation.id,
          recommendation: recommendation,
          rating: rating
        },
        is_read: false
      });
    } catch (notificationError) {
      console.log('Notification creation failed (non-critical):', notificationError.message);
    }

    res.json({
      success: true,
      message: 'Idea evaluated successfully',
      data: { 
        evaluation,
        idea: {
          id: idea.id,
          title: idea.title,
          status: idea.status
        }
      }
    });
  } catch (error) {
    console.error('Evaluate idea error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate idea',
      error: error.message
    });
  }
});

// ==================== ENHANCED STUDENT MANAGEMENT ====================

// @route   GET /api/college-coordinator/students
// @desc    Get all students from college with comprehensive filtering
// @access  Private (college_admin)
router.get('/students', [
  authenticateToken,
  authorizeRoles('college_admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('department').optional().isString().withMessage('Department must be a string'),
  query('year').optional().isString().withMessage('Year must be a string'),
  query('status').optional().isString().withMessage('Status must be a string'),
  query('sort_by').optional().isIn(['name', 'email', 'created_at', 'last_login']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
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

    const { 
      page = 1, 
      limit = 10, 
      search, 
      department, 
      year, 
      status,
      sort_by = 'name',
      sort_order = 'asc'
    } = req.query;
    
    const offset = (page - 1) * limit;
    const collegeId = req.user.college_id;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'College ID not found for user'
      });
    }

    const whereClause = { 
      college_id: collegeId, 
      role: 'student' 
    };
    
    // Apply filters
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (department) {
      whereClause.department = department;
    }

    if (year) {
      whereClause.year_of_study = year;
    }

    if (status === 'active') {
      whereClause.is_active = true;
    } else if (status === 'inactive') {
      whereClause.is_active = false;
    }

    const { count, rows: students } = await User.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 'name', 'email', 'department', 'year_of_study', 
        'is_active', 'created_at', 'last_login', 'profile_image_url'
      ],
      include: [
        {
          model: Idea,
          as: 'ideas',
          attributes: ['id', 'title', 'status', 'created_at'],
          required: false
        }
      ],
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate performance metrics for each student
    const studentsWithMetrics = await Promise.all(students.map(async (student) => {
      const studentData = student.toJSON();
      
      // Get idea counts by status
      const ideaCounts = await Idea.findAll({
        where: { student_id: student.id },
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      const statusCounts = {};
      ideaCounts.forEach(item => {
        statusCounts[item.status] = parseInt(item.count);
      });

      return {
        ...studentData,
        created_at: studentData.created_at ? new Date(studentData.created_at).toLocaleDateString() : 'N/A',
        last_login: studentData.last_login ? new Date(studentData.last_login).toLocaleDateString() : 'Never',
        performance: {
          totalIdeas: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
          endorsedIdeas: statusCounts.endorsed || 0,
          incubatedIdeas: statusCounts.incubated || 0,
          rejectedIdeas: statusCounts.rejected || 0,
          pendingIdeas: (statusCounts.submitted || 0) + (statusCounts.under_review || 0) + (statusCounts.new_submission || 0)
        }
      };
    }));

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        students: studentsWithMetrics,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get students',
      error: error.message
    });
  }
});

// ==================== ADD STUDENT ====================

// @route   POST /api/college-coordinator/students
// @desc    Add new student to college
// @access  Private (college_admin)
router.post('/students', [
  authenticateToken,
  authorizeRoles('college_admin'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department').optional().isString().withMessage('Department must be a string'),
  body('year').optional().isString().withMessage('Year must be a string'),
  body('roll_number').optional().isString().withMessage('Roll number must be a string')
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

    const { name, email, password, department, year, roll_number } = req.body;
    const collegeId = req.user.college_id;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'College ID not found for user'
      });
    }

    // Check if student already exists
    const existingStudent = await User.findOne({
      where: { email, role: 'student' }
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new student
    const student = await User.create({
      name,
      email,
      password_hash: hashedPassword,
      role: 'student',
      college_id: collegeId,
      department: department || 'Not specified',
      year: year || 'Not specified',
      roll_number: roll_number || 'N/A',
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          department: student.department,
          year: student.year,
          roll_number: student.roll_number
        }
      }
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add student',
      error: error.message
    });
  }
});

// @route   GET /api/college-coordinator/students/:id
// @desc    Get single student details
// @access  Private (college_admin)
router.get('/students/:id', [
  authenticateToken,
  authorizeRoles('college_admin'),
  param('id').isInt().withMessage('Student ID must be an integer')
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
    const collegeId = req.user.college_id;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'College ID not found for user'
      });
    }

    // Get student with ideas
    const student = await User.findOne({
      where: { 
        id: parseInt(id),
        college_id: collegeId, 
        role: 'student' 
      },
      include: [
        {
          model: Idea,
          as: 'ideas',
          attributes: ['id', 'title', 'status', 'created_at'],
          required: false
        }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentData = student.toJSON();
    
    // Calculate performance metrics
    const ideaCounts = {};
    if (studentData.ideas) {
      studentData.ideas.forEach(idea => {
        ideaCounts[idea.status] = (ideaCounts[idea.status] || 0) + 1;
      });
    }

    const responseData = {
      ...studentData,
      created_at: studentData.created_at ? new Date(studentData.created_at).toLocaleDateString() : 'N/A',
      last_login: studentData.last_login ? new Date(studentData.last_login).toLocaleDateString() : 'Never',
      performance: {
        totalIdeas: Object.values(ideaCounts).reduce((sum, count) => sum + count, 0),
        endorsedIdeas: ideaCounts.endorsed || 0,
        incubatedIdeas: ideaCounts.incubated || 0,
        rejectedIdeas: ideaCounts.rejected || 0,
        pendingIdeas: (ideaCounts.submitted || 0) + (ideaCounts.under_review || 0) + (ideaCounts.new_submission || 0)
      }
    };

    res.json({
      success: true,
      data: { student: responseData }
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student',
      error: error.message
    });
  }
});

// @route   GET /api/college-coordinator/students/export
// @desc    Export students data as CSV
// @access  Private (college_admin)
router.get('/students/export', [
  authenticateToken,
  authorizeRoles('college_admin')
], async (req, res) => {
  try {
    const collegeId = req.user.college_id;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'College ID not found for user'
      });
    }

    // Get all students for the college
    const students = await User.findAll({
      where: { 
        college_id: collegeId, 
        role: 'student' 
      },
      include: [
        {
          model: Idea,
          as: 'ideas',
          attributes: ['id', 'title', 'status', 'created_at'],
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    // Generate CSV content
    let csvContent = 'Name,Email,Department,Year,Roll Number,Total Ideas,Endorsed Ideas,Incubated Ideas,Rejected Ideas,Status,Registered Date\n';
    
    students.forEach(student => {
      const studentData = student.toJSON();
      const ideaCounts = {};
      
      if (studentData.ideas) {
        studentData.ideas.forEach(idea => {
          ideaCounts[idea.status] = (ideaCounts[idea.status] || 0) + 1;
        });
      }
      
      const totalIdeas = studentData.ideas ? studentData.ideas.length : 0;
      const endorsedIdeas = ideaCounts.endorsed || 0;
      const incubatedIdeas = ideaCounts.incubated || 0;
      const rejectedIdeas = ideaCounts.rejected || 0;
      const status = studentData.is_active ? 'Active' : 'Inactive';
      const registeredDate = studentData.created_at ? new Date(studentData.created_at).toLocaleDateString() : 'N/A';
      
      csvContent += `"${studentData.name}","${studentData.email}","${studentData.department || 'Not specified'}","${studentData.year || 'Not specified'}","${studentData.roll_number || 'N/A'}",${totalIdeas},${endorsedIdeas},${incubatedIdeas},${rejectedIdeas},"${status}","${registeredDate}"\n`;
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students_export.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Export students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export students',
      error: error.message
    });
  }
});

// ==================== ENHANCED REPORTS MANAGEMENT ====================

// @route   POST /api/college-coordinator/reports
// @desc    Create comprehensive report
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

    const collegeId = req.user.college_id;
    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'College ID not found for user'
      });
    }

    // Generate comprehensive report data
    const { period_start, period_end } = req.body;
    const startDate = new Date(period_start);
    const endDate = new Date(period_end);

    // Get comprehensive statistics for the period
    const [
      totalStudents,
      activeStudents,
      totalIdeas,
      ideasByStatus,
      ideasByCategory,
      topPerformers,
      eventsCount
    ] = await Promise.all([
      User.count({
        where: { 
          college_id: collegeId, 
          role: 'student',
          created_at: { [Op.between]: [startDate, endDate] }
        }
      }),

      User.count({
        where: { 
          college_id: collegeId, 
          role: 'student',
          is_active: true,
          last_login: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }),

      Idea.count({
        where: { 
          college_id: collegeId,
          created_at: { [Op.between]: [startDate, endDate] }
        }
      }),

      Idea.findAll({
        where: { 
          college_id: collegeId,
          created_at: { [Op.between]: [startDate, endDate] }
        },
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      }),

      Idea.findAll({
        where: { 
          college_id: collegeId,
          created_at: { [Op.between]: [startDate, endDate] }
        },
        attributes: [
          'category',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['category'],
        raw: true
      }),

      User.findAll({
        where: { 
          college_id: collegeId, 
          role: 'student',
          is_active: true
        },
        include: [{
          model: Idea,
          as: 'ideas',
          where: { created_at: { [Op.between]: [startDate, endDate] } },
          required: true,
          attributes: ['id', 'status']
        }],
        attributes: ['id', 'name', 'email', 'department'],
        limit: 10,
        order: [[require('sequelize').fn('COUNT', require('sequelize').col('ideas.id')), 'DESC']]
      }),

      Event.count({
        where: { 
          college_id: collegeId,
          is_active: true,
          created_at: { [Op.between]: [startDate, endDate] }
        }
      })
    ]);

    // Transform data
    const statusCounts = {};
    ideasByStatus.forEach(item => {
      statusCounts[item.status] = parseInt(item.count);
    });

    const categoryCounts = {};
    ideasByCategory.forEach(item => {
      categoryCounts[item.category] = parseInt(item.count);
    });

    const reportData = {
      ...req.body,
      college_id: collegeId,
      created_by: req.user.id,
      content: JSON.stringify({
        summary: {
          totalStudents,
          activeStudents,
          totalIdeas,
          eventsCount,
          participationRate: totalStudents > 0 ? (activeStudents / totalStudents * 100).toFixed(2) : 0
        },
        ideasByStatus: statusCounts,
        ideasByCategory: categoryCounts,
        topPerformers: topPerformers.map(student => ({
          id: student.id,
          name: student.name,
          email: student.email,
          department: student.department,
          ideasCount: student.ideas ? student.ideas.length : 0
        }))
      })
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
      message: 'Failed to create report',
      error: error.message
    });
  }
});

// @route   GET /api/college-coordinator/reports/:id/download
// @desc    Download report
// @access  Private (college_admin)
router.get('/reports/:id/download', [
  authenticateToken,
  authorizeRoles('college_admin'),
], async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.user.college_id;

    const report = await Report.findOne({
      where: { 
        id: id,
        college_id: collegeId 
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Generate CSV data
    const reportData = typeof report.content === 'string' ? JSON.parse(report.content) : report.content;
    
    // Convert report data to CSV format
    let csvContent = '';
    
    // Add summary data
    csvContent += 'Report Summary\n';
    csvContent += `Title,${report.title}\n`;
    csvContent += `Type,${report.report_type}\n`;
    csvContent += `Period,${report.period_start} to ${report.period_end}\n`;
    csvContent += `Generated,${report.created_at}\n\n`;
    
    // Add summary statistics
    if (reportData.summary) {
      csvContent += 'Summary Statistics\n';
      csvContent += `Total Students,${reportData.summary.totalStudents}\n`;
      csvContent += `Active Students,${reportData.summary.activeStudents}\n`;
      csvContent += `Total Ideas,${reportData.summary.totalIdeas}\n`;
      csvContent += `Events Count,${reportData.summary.eventsCount}\n`;
      csvContent += `Participation Rate,${reportData.summary.participationRate}%\n\n`;
    }
    
    // Add ideas by status
    if (reportData.ideasByStatus) {
      csvContent += 'Ideas by Status\n';
      csvContent += 'Status,Count\n';
      Object.entries(reportData.ideasByStatus).forEach(([status, count]) => {
        csvContent += `${status},${count}\n`;
      });
      csvContent += '\n';
    }
    
    // Add ideas by category
    if (reportData.ideasByCategory) {
      csvContent += 'Ideas by Category\n';
      csvContent += 'Category,Count\n';
      Object.entries(reportData.ideasByCategory).forEach(([category, count]) => {
        csvContent += `${category},${count}\n`;
      });
      csvContent += '\n';
    }
    
    // Add top performers
    if (reportData.topPerformers && reportData.topPerformers.length > 0) {
      csvContent += 'Top Performers\n';
      csvContent += 'Name,Email,Department,Ideas Count\n';
      reportData.topPerformers.forEach(performer => {
        csvContent += `${performer.name},${performer.email},${performer.department},${performer.ideasCount}\n`;
      });
    }
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, '_')}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download report',
      error: error.message
    });
  }
});

// ==================== ENHANCED CHAT SYSTEM ====================

// @route   GET /api/college-coordinator/chat/students
// @desc    Get students for chat (college admin only)
// @access  Private (college_admin)
router.get('/chat/students', [
  authenticateToken,
  authorizeRoles('college_admin'),
], async (req, res) => {
  try {
    const collegeId = req.user.college_id;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'College ID not found for user'
      });
    }

    const students = await User.findAll({
      where: { 
        college_id: collegeId, 
        role: 'student',
        is_active: true 
      },
      attributes: ['id', 'name', 'email', 'profile_image_url'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { students }
    });
  } catch (error) {
    console.error('Get students for chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get students',
      error: error.message
    });
  }
});

// ==================== ENHANCED NOTIFICATIONS ====================

// @route   GET /api/college-coordinator/notifications
// @desc    Get notifications for college admin
// @access  Private (college_admin)
router.get('/notifications', [
  authenticateToken,
  authorizeRoles('college_admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('read').optional().isBoolean().withMessage('Read must be a boolean'),
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

    const { page = 1, limit = 20, read } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = { user_id: req.user.id };

    if (read !== undefined) {
      whereClause.is_read = read;
    }

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
});

module.exports = router;
