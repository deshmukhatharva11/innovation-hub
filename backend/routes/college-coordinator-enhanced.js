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

    // Check if already evaluated by this coordinator (allow re-evaluation)
    const existingEvaluation = await IdeaEvaluation.findOne({
      where: { 
        idea_id: id,
        evaluator_id: evaluatorId 
      }
    });

    if (existingEvaluation) {
      // Update existing evaluation instead of creating new one
      await existingEvaluation.update({
        rating: rating || existingEvaluation.rating,
        comments: comments || existingEvaluation.comments,
        recommendation: recommendation || existingEvaluation.recommendation,
        mentor_assigned: mentor_assigned || existingEvaluation.mentor_assigned,
        nurture_notes: nurture_notes || existingEvaluation.nurture_notes,
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

      res.json({
        success: true,
        message: 'Idea evaluation updated successfully',
        data: { 
          evaluation: existingEvaluation,
          idea: {
            id: idea.id,
            title: idea.title,
            status: idea.status
          }
        }
      });
      return;
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

// ==================== ENHANCED REPORTS MANAGEMENT ====================

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
        errors: errors.array(),
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
        { model: User, as: 'createdBy', attributes: ['id', 'name'] }
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
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get reports',
      error: error.message
    });
  }
});

// @route   POST /api/college-coordinator/reports
// @desc    Create comprehensive report
// @access  Private (college_admin)
router.post('/reports', [
  authenticateToken,
  authorizeRoles('college_admin'),
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('report_type').isIn(['quarterly', 'annual', 'idea_analytics', 'college_performance', 'mentor_effectiveness', 'incubation_pipeline', 'biannual', 'monthly', 'custom']).withMessage('Invalid report type'),
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

    // Generate report-specific data based on report type
    const { report_type, period_start, period_end } = req.body;
    const startDate = new Date(period_start);
    const endDate = new Date(period_end);

    let reportData = {};

    // Generate different data based on report type
    switch (report_type) {
      case 'quarterly':
        reportData = await generateQuarterlyReport(collegeId, startDate, endDate);
        break;
      case 'annual':
        reportData = await generateAnnualReport(collegeId, startDate, endDate);
        break;
      case 'idea_analytics':
        reportData = await generateIdeaAnalyticsReport(collegeId, startDate, endDate);
        break;
      case 'college_performance':
        reportData = await generateCollegePerformanceReport(collegeId, startDate, endDate);
        break;
      case 'mentor_effectiveness':
        reportData = await generateMentorEffectivenessReport(collegeId, startDate, endDate);
        break;
      case 'incubation_pipeline':
        reportData = await generateIncubationPipelineReport(collegeId, startDate, endDate);
        break;
      case 'monthly':
        reportData = await generateMonthlyReport(collegeId, startDate, endDate);
        break;
      case 'biannual':
        reportData = await generateBiannualReport(collegeId, startDate, endDate);
        break;
      default:
        reportData = await generateCustomReport(collegeId, startDate, endDate);
    }

    const report = {
      ...req.body,
      college_id: collegeId,
      created_by: req.user.id,
      content: JSON.stringify(reportData)
    };

    const createdReport = await Report.create(report);

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: { report: createdReport }
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

    // Generate CSV data based on report type
    const reportData = typeof report.content === 'string' ? JSON.parse(report.content) : report.content;
    
    // Convert report data to CSV format
    let csvContent = '';
    
    // Add report header
    csvContent += 'Report Summary\n';
    csvContent += `Title,${report.title}\n`;
    csvContent += `Type,${report.report_type}\n`;
    csvContent += `Report Type,${reportData.reportType || 'N/A'}\n`;
    csvContent += `Period,${report.period_start} to ${report.period_end}\n`;
    csvContent += `Generated,${report.created_at}\n\n`;
    
    // Generate CSV based on report type
    switch (report.report_type) {
      case 'quarterly':
        csvContent += generateQuarterlyCSV(reportData);
        break;
      case 'annual':
        csvContent += generateAnnualCSV(reportData);
        break;
      case 'idea_analytics':
        csvContent += generateIdeaAnalyticsCSV(reportData);
        break;
      case 'college_performance':
        csvContent += generateCollegePerformanceCSV(reportData);
        break;
      case 'mentor_effectiveness':
        csvContent += generateMentorEffectivenessCSV(reportData);
        break;
      case 'incubation_pipeline':
        csvContent += generateIncubationPipelineCSV(reportData);
        break;
      case 'monthly':
        csvContent += generateMonthlyCSV(reportData);
        break;
      case 'biannual':
        csvContent += generateBiannualCSV(reportData);
        break;
      default:
        csvContent += generateDefaultCSV(reportData);
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
      [Op.or]: [
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

// ==================== REPORT GENERATION FUNCTIONS ====================

// Quarterly Progress Report
async function generateQuarterlyReport(collegeId, startDate, endDate) {
  const [
    totalStudents,
    activeStudents,
    totalIdeas,
    ideasByStatus,
    ideasByCategory,
    recentIdeas,
    eventsCount,
    topPerformers
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
    Idea.findAll({
      where: { 
        college_id: collegeId,
        created_at: { [Op.between]: [startDate, endDate] }
      },
      include: [
        { model: User, as: 'student', attributes: ['name', 'email', 'department'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    }),
    Event.count({
      where: { 
        college_id: collegeId,
        is_active: true,
        created_at: { [Op.between]: [startDate, endDate] }
      }
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
      limit: 10
    })
  ]);

  const statusCounts = {};
  ideasByStatus.forEach(item => {
    statusCounts[item.status] = parseInt(item.count);
  });

  const categoryCounts = {};
  ideasByCategory.forEach(item => {
    categoryCounts[item.category] = parseInt(item.count);
  });

  return {
    reportType: 'Quarterly Progress Report',
    period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
    summary: {
      totalStudents,
      activeStudents,
      totalIdeas,
      eventsCount,
      participationRate: totalStudents > 0 ? (activeStudents / totalStudents * 100).toFixed(2) : 0,
      quarter: getQuarter(startDate)
    },
    ideasAnalysis: {
      byStatus: statusCounts,
      byCategory: categoryCounts,
      recentSubmissions: recentIdeas.map(idea => ({
        title: idea.title,
        student: idea.student?.name || 'Unknown',
        department: idea.student?.department || 'Unknown',
        status: idea.status,
        submittedAt: idea.created_at
      }))
    },
    topPerformers: topPerformers.map(student => ({
      name: student.name,
      email: student.email,
      department: student.department,
      ideasCount: student.ideas ? student.ideas.length : 0,
      activeIdeas: student.ideas ? student.ideas.filter(idea => idea.status !== 'rejected').length : 0
    })),
    recommendations: generateQuarterlyRecommendations(statusCounts, categoryCounts, totalIdeas)
  };
}

// Annual Report
async function generateAnnualReport(collegeId, startDate, endDate) {
  const [
    totalStudents,
    totalIdeas,
    ideasByStatus,
    ideasByCategory,
    monthlyTrends,
    departmentStats,
    eventsCount,
    yearOverYearGrowth
  ] = await Promise.all([
    User.count({
      where: { 
        college_id: collegeId, 
        role: 'student'
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
    Idea.findAll({
      where: { 
        college_id: collegeId,
        created_at: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        [require('sequelize').fn('strftime', '%Y-%m', require('sequelize').col('created_at')), 'month'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: [require('sequelize').fn('strftime', '%Y-%m', require('sequelize').col('created_at'))],
      order: [[require('sequelize').fn('strftime', '%Y-%m', require('sequelize').col('created_at')), 'ASC']],
      raw: true
    }),
    User.findAll({
      where: { 
        college_id: collegeId, 
        role: 'student',
        is_active: true
      },
      attributes: [
        'department',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'studentCount']
      ],
      group: ['department'],
      raw: true
    }),
    Event.count({
      where: { 
        college_id: collegeId,
        is_active: true,
        created_at: { [Op.between]: [startDate, endDate] }
      }
    }),
    // Year over year growth calculation
    Idea.count({
      where: { 
        college_id: collegeId,
        created_at: { [Op.between]: [new Date(startDate.getFullYear() - 1, startDate.getMonth(), startDate.getDate()), new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate())] }
      }
    })
  ]);

  const statusCounts = {};
  ideasByStatus.forEach(item => {
    statusCounts[item.status] = parseInt(item.count);
  });

  const categoryCounts = {};
  ideasByCategory.forEach(item => {
    categoryCounts[item.category] = parseInt(item.count);
  });

  const departmentStatsObj = {};
  departmentStats.forEach(dept => {
    departmentStatsObj[dept.department] = parseInt(dept.studentCount);
  });

  const monthlyTrendsObj = {};
  monthlyTrends.forEach(month => {
    monthlyTrendsObj[month.month] = parseInt(month.count);
  });

  const growthRate = yearOverYearGrowth > 0 ? ((totalIdeas - yearOverYearGrowth) / yearOverYearGrowth * 100).toFixed(2) : 0;

  return {
    reportType: 'Annual Comprehensive Report',
    period: `${startDate.getFullYear()}`,
    summary: {
      totalStudents,
      totalIdeas,
      eventsCount,
      yearOverYearGrowth: growthRate,
      year: startDate.getFullYear()
    },
    ideasAnalysis: {
      byStatus: statusCounts,
      byCategory: categoryCounts,
      monthlyTrends: monthlyTrendsObj
    },
    departmentAnalysis: departmentStatsObj,
    keyMetrics: {
      averageIdeasPerStudent: totalStudents > 0 ? (totalIdeas / totalStudents).toFixed(2) : 0,
      successRate: totalIdeas > 0 ? ((statusCounts.endorsed || 0) / totalIdeas * 100).toFixed(2) : 0,
      participationRate: totalStudents > 0 ? ((Object.values(departmentStatsObj).reduce((a, b) => a + b, 0) / totalStudents) * 100).toFixed(2) : 0
    },
    recommendations: generateAnnualRecommendations(statusCounts, categoryCounts, growthRate, totalIdeas)
  };
}

// Idea Analytics Report
async function generateIdeaAnalyticsReport(collegeId, startDate, endDate) {
  const [
    ideas,
    ideasByStatus,
    ideasByCategory,
    ideasByDepartment,
    ideasByMonth,
    topPerformingStudents,
    ideaQualityMetrics
  ] = await Promise.all([
    Idea.findAll({
      where: { 
        college_id: collegeId,
        created_at: { [Op.between]: [startDate, endDate] }
      },
      include: [
        { model: User, as: 'student', attributes: ['name', 'email', 'department'] }
      ],
      order: [['created_at', 'DESC']]
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
    Idea.findAll({
      where: { 
        college_id: collegeId,
        created_at: { [Op.between]: [startDate, endDate] }
      },
      include: [
        { model: User, as: 'student', attributes: ['department'] }
      ],
      attributes: [
        [require('sequelize').col('student.department'), 'department'],
        [require('sequelize').fn('COUNT', require('sequelize').col('Idea.id')), 'count']
      ],
      group: [require('sequelize').col('student.department')],
      raw: true
    }),
    Idea.findAll({
      where: { 
        college_id: collegeId,
        created_at: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        [require('sequelize').fn('strftime', '%Y-%m', require('sequelize').col('created_at')), 'month'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: [require('sequelize').fn('strftime', '%Y-%m', require('sequelize').col('created_at'))],
      order: [[require('sequelize').fn('strftime', '%Y-%m', require('sequelize').col('created_at')), 'ASC']],
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
        attributes: ['id', 'status', 'views_count', 'likes_count']
      }],
      attributes: ['id', 'name', 'email', 'department'],
      limit: 20
    }),
    Idea.findAll({
      where: { 
        college_id: collegeId,
        created_at: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        'status',
        [require('sequelize').fn('AVG', require('sequelize').col('views_count')), 'avgViews'],
        [require('sequelize').fn('AVG', require('sequelize').col('likes_count')), 'avgLikes'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    })
  ]);

  const statusCounts = {};
  ideasByStatus.forEach(item => {
    statusCounts[item.status] = parseInt(item.count);
  });

  const categoryCounts = {};
  ideasByCategory.forEach(item => {
    categoryCounts[item.category] = parseInt(item.count);
  });

  const departmentCounts = {};
  ideasByDepartment.forEach(item => {
    departmentCounts[item.department] = parseInt(item.count);
  });

  const monthlyCounts = {};
  ideasByMonth.forEach(item => {
    monthlyCounts[item.month] = parseInt(item.count);
  });

  const qualityMetrics = {};
  ideaQualityMetrics.forEach(item => {
    qualityMetrics[item.status] = {
      avgViews: parseFloat(item.avgViews || 0).toFixed(2),
      avgLikes: parseFloat(item.avgLikes || 0).toFixed(2),
      count: parseInt(item.count)
    };
  });

  return {
    reportType: 'Idea Analytics Report',
    period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
    summary: {
      totalIdeas: ideas.length,
      totalStudents: topPerformingStudents.length,
      averageIdeasPerStudent: topPerformingStudents.length > 0 ? (ideas.length / topPerformingStudents.length).toFixed(2) : 0
    },
    distributionAnalysis: {
      byStatus: statusCounts,
      byCategory: categoryCounts,
      byDepartment: departmentCounts,
      byMonth: monthlyCounts
    },
    qualityMetrics: qualityMetrics,
    topPerformers: topPerformingStudents.map(student => ({
      name: student.name,
      email: student.email,
      department: student.department,
      ideasCount: student.ideas ? student.ideas.length : 0,
      totalViews: student.ideas ? student.ideas.reduce((sum, idea) => sum + (idea.views_count || 0), 0) : 0,
      totalLikes: student.ideas ? student.ideas.reduce((sum, idea) => sum + (idea.likes_count || 0), 0) : 0,
      successRate: student.ideas ? (student.ideas.filter(idea => idea.status === 'endorsed').length / student.ideas.length * 100).toFixed(2) : 0
    })),
    insights: generateIdeaAnalyticsInsights(statusCounts, categoryCounts, qualityMetrics)
  };
}

// College Performance Report
async function generateCollegePerformanceReport(collegeId, startDate, endDate) {
  const [
    totalStudents,
    activeStudents,
    totalIdeas,
    ideasByStatus,
    departmentPerformance,
    monthlyPerformance,
    eventsCount,
    studentEngagement
  ] = await Promise.all([
    User.count({
      where: { 
        college_id: collegeId, 
        role: 'student'
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
        required: false,
        attributes: ['id', 'status']
      }],
      attributes: ['department'],
      group: ['department']
    }),
    Idea.findAll({
      where: { 
        college_id: collegeId,
        created_at: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        [require('sequelize').fn('strftime', '%Y-%m', require('sequelize').col('created_at')), 'month'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: [require('sequelize').fn('strftime', '%Y-%m', require('sequelize').col('created_at'))],
      order: [[require('sequelize').fn('strftime', '%Y-%m', require('sequelize').col('created_at')), 'ASC']],
      raw: true
    }),
    Event.count({
      where: { 
        college_id: collegeId,
        is_active: true,
        created_at: { [Op.between]: [startDate, endDate] }
      }
    }),
    User.findAll({
      where: { 
        college_id: collegeId, 
        role: 'student',
        is_active: true
      },
      attributes: [
        'id',
        'name',
        'email',
        'department',
        'last_login',
        'created_at'
      ],
      order: [['last_login', 'DESC']],
      limit: 50
    })
  ]);

  const statusCounts = {};
  ideasByStatus.forEach(item => {
    statusCounts[item.status] = parseInt(item.count);
  });

  const departmentStats = {};
  departmentPerformance.forEach(dept => {
    const deptName = dept.department;
    if (!departmentStats[deptName]) {
      departmentStats[deptName] = {
        totalStudents: 0,
        activeStudents: 0,
        totalIdeas: 0,
        averageIdeasPerStudent: 0
      };
    }
    departmentStats[deptName].totalStudents++;
    if (dept.ideas && dept.ideas.length > 0) {
      departmentStats[deptName].activeStudents++;
      departmentStats[deptName].totalIdeas += dept.ideas.length;
    }
  });

  // Calculate averages
  Object.keys(departmentStats).forEach(dept => {
    const stats = departmentStats[dept];
    stats.averageIdeasPerStudent = stats.totalStudents > 0 ? (stats.totalIdeas / stats.totalStudents).toFixed(2) : 0;
  });

  const monthlyCounts = {};
  monthlyPerformance.forEach(month => {
    monthlyCounts[month.month] = parseInt(month.count);
  });

  const engagementRate = totalStudents > 0 ? (activeStudents / totalStudents * 100).toFixed(2) : 0;
  const successRate = totalIdeas > 0 ? ((statusCounts.endorsed || 0) / totalIdeas * 100).toFixed(2) : 0;

  return {
    reportType: 'College Performance Report',
    period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
    summary: {
      totalStudents,
      activeStudents,
      totalIdeas,
      eventsCount,
      engagementRate,
      successRate
    },
    performanceMetrics: {
      ideasByStatus: statusCounts,
      monthlyTrends: monthlyCounts,
      departmentPerformance: departmentStats
    },
    studentEngagement: studentEngagement.map(student => ({
      name: student.name,
      email: student.email,
      department: student.department,
      lastLogin: student.last_login,
      daysSinceLastLogin: student.last_login ? Math.floor((new Date() - new Date(student.last_login)) / (1000 * 60 * 60 * 24)) : null
    })),
    recommendations: generatePerformanceRecommendations(departmentStats, engagementRate, successRate)
  };
}

// Mentor Effectiveness Report
async function generateMentorEffectivenessReport(collegeId, startDate, endDate) {
  // This would require mentor data and assignments
  // For now, return a basic structure
  return {
    reportType: 'Mentor Effectiveness Report',
    period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
    summary: {
      message: 'Mentor effectiveness data not available in current system'
    },
    recommendations: ['Implement mentor tracking system', 'Add mentor-student assignment tracking', 'Create mentor performance metrics']
  };
}

// Incubation Pipeline Report
async function generateIncubationPipelineReport(collegeId, startDate, endDate) {
  // This would require pre-incubatee data
  // For now, return a basic structure
  return {
    reportType: 'Incubation Pipeline Report',
    period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
    summary: {
      message: 'Incubation pipeline data not available in current system'
    },
    recommendations: ['Implement pre-incubatee tracking', 'Add incubation stage monitoring', 'Create pipeline progress metrics']
  };
}

// Monthly Report
async function generateMonthlyReport(collegeId, startDate, endDate) {
  const [
    totalStudents,
    activeStudents,
    totalIdeas,
    ideasByStatus,
    weeklyTrends,
    topPerformers
  ] = await Promise.all([
    User.count({
      where: { 
        college_id: collegeId, 
        role: 'student'
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
        [require('sequelize').fn('strftime', '%Y-%W', require('sequelize').col('created_at')), 'week'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: [require('sequelize').fn('strftime', '%Y-%W', require('sequelize').col('created_at'))],
      order: [[require('sequelize').fn('strftime', '%Y-%W', require('sequelize').col('created_at')), 'ASC']],
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
      limit: 10
    })
  ]);

  const statusCounts = {};
  ideasByStatus.forEach(item => {
    statusCounts[item.status] = parseInt(item.count);
  });

  const weeklyCounts = {};
  weeklyTrends.forEach(week => {
    weeklyCounts[week.week] = parseInt(week.count);
  });

  return {
    reportType: 'Monthly Progress Report',
    period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
    summary: {
      totalStudents,
      activeStudents,
      totalIdeas,
      month: startDate.getMonth() + 1,
      year: startDate.getFullYear()
    },
    performanceMetrics: {
      ideasByStatus: statusCounts,
      weeklyTrends: weeklyCounts
    },
    topPerformers: topPerformers.map(student => ({
      name: student.name,
      email: student.email,
      department: student.department,
      ideasCount: student.ideas ? student.ideas.length : 0
    })),
    recommendations: generateMonthlyRecommendations(statusCounts, totalIdeas)
  };
}

// Biannual Report
async function generateBiannualReport(collegeId, startDate, endDate) {
  // Similar to annual but for 6 months
  return await generateAnnualReport(collegeId, startDate, endDate);
}

// Custom Report
async function generateCustomReport(collegeId, startDate, endDate) {
  // Basic report for custom type
  return await generateQuarterlyReport(collegeId, startDate, endDate);
}

// Helper functions
function getQuarter(date) {
  const month = date.getMonth() + 1;
  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
}

function generateQuarterlyRecommendations(statusCounts, categoryCounts, totalIdeas) {
  const recommendations = [];
  
  if (statusCounts.rejected > totalIdeas * 0.3) {
    recommendations.push('High rejection rate detected. Consider improving idea quality through better guidance and training.');
  }
  
  if (statusCounts.endorsed < totalIdeas * 0.1) {
    recommendations.push('Low endorsement rate. Review evaluation criteria and provide more support to students.');
  }
  
  const topCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b, '');
  if (topCategory) {
    recommendations.push(`Focus on ${topCategory} category as it shows highest engagement.`);
  }
  
  return recommendations;
}

function generateAnnualRecommendations(statusCounts, categoryCounts, growthRate, totalIdeas) {
  const recommendations = [];
  
  if (growthRate < 0) {
    recommendations.push('Negative growth detected. Implement strategies to increase student participation.');
  } else if (growthRate > 50) {
    recommendations.push('Excellent growth rate. Consider scaling up resources to maintain quality.');
  }
  
  if (statusCounts.endorsed > totalIdeas * 0.2) {
    recommendations.push('Good endorsement rate. Consider expanding incubation opportunities.');
  }
  
  return recommendations;
}

function generateIdeaAnalyticsInsights(statusCounts, categoryCounts, qualityMetrics) {
  const insights = [];
  
  const topCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b, '');
  if (topCategory) {
    insights.push(`Most popular category: ${topCategory} (${categoryCounts[topCategory]} ideas)`);
  }
  
  const topStatus = Object.keys(statusCounts).reduce((a, b) => statusCounts[a] > statusCounts[b] ? a : b, '');
  if (topStatus) {
    insights.push(`Most common status: ${topStatus} (${statusCounts[topStatus]} ideas)`);
  }
  
  return insights;
}

function generatePerformanceRecommendations(departmentStats, engagementRate, successRate) {
  const recommendations = [];
  
  if (engagementRate < 50) {
    recommendations.push('Low student engagement. Implement more interactive activities and better communication.');
  }
  
  if (successRate < 10) {
    recommendations.push('Low success rate. Review evaluation process and provide better mentorship.');
  }
  
  const topDept = Object.keys(departmentStats).reduce((a, b) => 
    departmentStats[a].averageIdeasPerStudent > departmentStats[b].averageIdeasPerStudent ? a : b, '');
  if (topDept) {
    recommendations.push(`Learn from ${topDept} department's success in idea generation.`);
  }
  
  return recommendations;
}

function generateMonthlyRecommendations(statusCounts, totalIdeas) {
  const recommendations = [];
  
  if (totalIdeas < 5) {
    recommendations.push('Low idea submission count. Encourage more student participation.');
  }
  
  if (statusCounts.pending_review > totalIdeas * 0.5) {
    recommendations.push('High number of pending reviews. Consider increasing evaluation capacity.');
  }
  
  return recommendations;
}

// ==================== CSV GENERATION FUNCTIONS ====================

function generateQuarterlyCSV(reportData) {
  let csv = '';
  
  // Summary
  csv += 'Summary Statistics\n';
  csv += `Total Students,${reportData.summary.totalStudents}\n`;
  csv += `Active Students,${reportData.summary.activeStudents}\n`;
  csv += `Total Ideas,${reportData.summary.totalIdeas}\n`;
  csv += `Events Count,${reportData.summary.eventsCount}\n`;
  csv += `Participation Rate,${reportData.summary.participationRate}%\n`;
  csv += `Quarter,${reportData.summary.quarter}\n\n`;
  
  // Ideas by Status
  if (reportData.ideasAnalysis?.byStatus) {
    csv += 'Ideas by Status\n';
    csv += 'Status,Count\n';
    Object.entries(reportData.ideasAnalysis.byStatus).forEach(([status, count]) => {
      csv += `${status},${count}\n`;
    });
    csv += '\n';
  }
  
  // Ideas by Category
  if (reportData.ideasAnalysis?.byCategory) {
    csv += 'Ideas by Category\n';
    csv += 'Category,Count\n';
    Object.entries(reportData.ideasAnalysis.byCategory).forEach(([category, count]) => {
      csv += `${category},${count}\n`;
    });
    csv += '\n';
  }
  
  // Top Performers
  if (reportData.topPerformers && reportData.topPerformers.length > 0) {
    csv += 'Top Performers\n';
    csv += 'Name,Email,Department,Ideas Count,Active Ideas\n';
    reportData.topPerformers.forEach(performer => {
      csv += `${performer.name},${performer.email},${performer.department},${performer.ideasCount},${performer.activeIdeas}\n`;
    });
    csv += '\n';
  }
  
  // Recommendations
  if (reportData.recommendations && reportData.recommendations.length > 0) {
    csv += 'Recommendations\n';
    csv += 'Recommendation\n';
    reportData.recommendations.forEach(rec => {
      csv += `${rec}\n`;
    });
  }
  
  return csv;
}

function generateAnnualCSV(reportData) {
  let csv = '';
  
  // Summary
  csv += 'Annual Summary\n';
  csv += `Total Students,${reportData.summary.totalStudents}\n`;
  csv += `Total Ideas,${reportData.summary.totalIdeas}\n`;
  csv += `Events Count,${reportData.summary.eventsCount}\n`;
  csv += `Year-over-Year Growth,${reportData.summary.yearOverYearGrowth}%\n`;
  csv += `Year,${reportData.summary.year}\n\n`;
  
  // Key Metrics
  if (reportData.keyMetrics) {
    csv += 'Key Metrics\n';
    csv += `Average Ideas per Student,${reportData.keyMetrics.averageIdeasPerStudent}\n`;
    csv += `Success Rate,${reportData.keyMetrics.successRate}%\n`;
    csv += `Participation Rate,${reportData.keyMetrics.participationRate}%\n\n`;
  }
  
  // Ideas Analysis
  if (reportData.ideasAnalysis?.byStatus) {
    csv += 'Ideas by Status\n';
    csv += 'Status,Count\n';
    Object.entries(reportData.ideasAnalysis.byStatus).forEach(([status, count]) => {
      csv += `${status},${count}\n`;
    });
    csv += '\n';
  }
  
  if (reportData.ideasAnalysis?.byCategory) {
    csv += 'Ideas by Category\n';
    csv += 'Category,Count\n';
    Object.entries(reportData.ideasAnalysis.byCategory).forEach(([category, count]) => {
      csv += `${category},${count}\n`;
    });
    csv += '\n';
  }
  
  if (reportData.ideasAnalysis?.monthlyTrends) {
    csv += 'Monthly Trends\n';
    csv += 'Month,Count\n';
    Object.entries(reportData.ideasAnalysis.monthlyTrends).forEach(([month, count]) => {
      csv += `${month},${count}\n`;
    });
    csv += '\n';
  }
  
  // Department Analysis
  if (reportData.departmentAnalysis) {
    csv += 'Department Analysis\n';
    csv += 'Department,Student Count\n';
    Object.entries(reportData.departmentAnalysis).forEach(([dept, count]) => {
      csv += `${dept},${count}\n`;
    });
    csv += '\n';
  }
  
  // Recommendations
  if (reportData.recommendations && reportData.recommendations.length > 0) {
    csv += 'Recommendations\n';
    csv += 'Recommendation\n';
    reportData.recommendations.forEach(rec => {
      csv += `${rec}\n`;
    });
  }
  
  return csv;
}

function generateIdeaAnalyticsCSV(reportData) {
  let csv = '';
  
  // Summary
  csv += 'Analytics Summary\n';
  csv += `Total Ideas,${reportData.summary.totalIdeas}\n`;
  csv += `Total Students,${reportData.summary.totalStudents}\n`;
  csv += `Average Ideas per Student,${reportData.summary.averageIdeasPerStudent}\n\n`;
  
  // Distribution Analysis
  if (reportData.distributionAnalysis?.byStatus) {
    csv += 'Ideas by Status\n';
    csv += 'Status,Count\n';
    Object.entries(reportData.distributionAnalysis.byStatus).forEach(([status, count]) => {
      csv += `${status},${count}\n`;
    });
    csv += '\n';
  }
  
  if (reportData.distributionAnalysis?.byCategory) {
    csv += 'Ideas by Category\n';
    csv += 'Category,Count\n';
    Object.entries(reportData.distributionAnalysis.byCategory).forEach(([category, count]) => {
      csv += `${category},${count}\n`;
    });
    csv += '\n';
  }
  
  if (reportData.distributionAnalysis?.byDepartment) {
    csv += 'Ideas by Department\n';
    csv += 'Department,Count\n';
    Object.entries(reportData.distributionAnalysis.byDepartment).forEach(([dept, count]) => {
      csv += `${dept},${count}\n`;
    });
    csv += '\n';
  }
  
  if (reportData.distributionAnalysis?.byMonth) {
    csv += 'Ideas by Month\n';
    csv += 'Month,Count\n';
    Object.entries(reportData.distributionAnalysis.byMonth).forEach(([month, count]) => {
      csv += `${month},${count}\n`;
    });
    csv += '\n';
  }
  
  // Quality Metrics
  if (reportData.qualityMetrics) {
    csv += 'Quality Metrics\n';
    csv += 'Status,Average Views,Average Likes,Count\n';
    Object.entries(reportData.qualityMetrics).forEach(([status, metrics]) => {
      csv += `${status},${metrics.avgViews},${metrics.avgLikes},${metrics.count}\n`;
    });
    csv += '\n';
  }
  
  // Top Performers
  if (reportData.topPerformers && reportData.topPerformers.length > 0) {
    csv += 'Top Performers\n';
    csv += 'Name,Email,Department,Ideas Count,Total Views,Total Likes,Success Rate\n';
    reportData.topPerformers.forEach(performer => {
      csv += `${performer.name},${performer.email},${performer.department},${performer.ideasCount},${performer.totalViews},${performer.totalLikes},${performer.successRate}%\n`;
    });
    csv += '\n';
  }
  
  // Insights
  if (reportData.insights && reportData.insights.length > 0) {
    csv += 'Key Insights\n';
    csv += 'Insight\n';
    reportData.insights.forEach(insight => {
      csv += `${insight}\n`;
    });
  }
  
  return csv;
}

function generateCollegePerformanceCSV(reportData) {
  let csv = '';
  
  // Summary
  csv += 'Performance Summary\n';
  csv += `Total Students,${reportData.summary.totalStudents}\n`;
  csv += `Active Students,${reportData.summary.activeStudents}\n`;
  csv += `Total Ideas,${reportData.summary.totalIdeas}\n`;
  csv += `Events Count,${reportData.summary.eventsCount}\n`;
  csv += `Engagement Rate,${reportData.summary.engagementRate}%\n`;
  csv += `Success Rate,${reportData.summary.successRate}%\n\n`;
  
  // Performance Metrics
  if (reportData.performanceMetrics?.ideasByStatus) {
    csv += 'Ideas by Status\n';
    csv += 'Status,Count\n';
    Object.entries(reportData.performanceMetrics.ideasByStatus).forEach(([status, count]) => {
      csv += `${status},${count}\n`;
    });
    csv += '\n';
  }
  
  if (reportData.performanceMetrics?.monthlyTrends) {
    csv += 'Monthly Trends\n';
    csv += 'Month,Count\n';
    Object.entries(reportData.performanceMetrics.monthlyTrends).forEach(([month, count]) => {
      csv += `${month},${count}\n`;
    });
    csv += '\n';
  }
  
  if (reportData.performanceMetrics?.departmentPerformance) {
    csv += 'Department Performance\n';
    csv += 'Department,Total Students,Active Students,Total Ideas,Avg Ideas per Student\n';
    Object.entries(reportData.performanceMetrics.departmentPerformance).forEach(([dept, stats]) => {
      csv += `${dept},${stats.totalStudents},${stats.activeStudents},${stats.totalIdeas},${stats.averageIdeasPerStudent}\n`;
    });
    csv += '\n';
  }
  
  // Student Engagement
  if (reportData.studentEngagement && reportData.studentEngagement.length > 0) {
    csv += 'Student Engagement\n';
    csv += 'Name,Email,Department,Last Login,Days Since Last Login\n';
    reportData.studentEngagement.forEach(student => {
      csv += `${student.name},${student.email},${student.department},${student.lastLogin},${student.daysSinceLastLogin || 'N/A'}\n`;
    });
    csv += '\n';
  }
  
  // Recommendations
  if (reportData.recommendations && reportData.recommendations.length > 0) {
    csv += 'Recommendations\n';
    csv += 'Recommendation\n';
    reportData.recommendations.forEach(rec => {
      csv += `${rec}\n`;
    });
  }
  
  return csv;
}

function generateMentorEffectivenessCSV(reportData) {
  let csv = '';
  
  csv += 'Mentor Effectiveness Report\n';
  csv += `Message,${reportData.summary.message}\n\n`;
  
  csv += 'Recommendations\n';
  csv += 'Recommendation\n';
  reportData.recommendations.forEach(rec => {
    csv += `${rec}\n`;
  });
  
  return csv;
}

function generateIncubationPipelineCSV(reportData) {
  let csv = '';
  
  csv += 'Incubation Pipeline Report\n';
  csv += `Message,${reportData.summary.message}\n\n`;
  
  csv += 'Recommendations\n';
  csv += 'Recommendation\n';
  reportData.recommendations.forEach(rec => {
    csv += `${rec}\n`;
  });
  
  return csv;
}

function generateMonthlyCSV(reportData) {
  let csv = '';
  
  // Summary
  csv += 'Monthly Summary\n';
  csv += `Total Students,${reportData.summary.totalStudents}\n`;
  csv += `Active Students,${reportData.summary.activeStudents}\n`;
  csv += `Total Ideas,${reportData.summary.totalIdeas}\n`;
  csv += `Month,${reportData.summary.month}\n`;
  csv += `Year,${reportData.summary.year}\n\n`;
  
  // Performance Metrics
  if (reportData.performanceMetrics?.ideasByStatus) {
    csv += 'Ideas by Status\n';
    csv += 'Status,Count\n';
    Object.entries(reportData.performanceMetrics.ideasByStatus).forEach(([status, count]) => {
      csv += `${status},${count}\n`;
    });
    csv += '\n';
  }
  
  if (reportData.performanceMetrics?.weeklyTrends) {
    csv += 'Weekly Trends\n';
    csv += 'Week,Count\n';
    Object.entries(reportData.performanceMetrics.weeklyTrends).forEach(([week, count]) => {
      csv += `${week},${count}\n`;
    });
    csv += '\n';
  }
  
  // Top Performers
  if (reportData.topPerformers && reportData.topPerformers.length > 0) {
    csv += 'Top Performers\n';
    csv += 'Name,Email,Department,Ideas Count\n';
    reportData.topPerformers.forEach(performer => {
      csv += `${performer.name},${performer.email},${performer.department},${performer.ideasCount}\n`;
    });
    csv += '\n';
  }
  
  // Recommendations
  if (reportData.recommendations && reportData.recommendations.length > 0) {
    csv += 'Recommendations\n';
    csv += 'Recommendation\n';
    reportData.recommendations.forEach(rec => {
      csv += `${rec}\n`;
    });
  }
  
  return csv;
}

function generateBiannualCSV(reportData) {
  // Similar to annual
  return generateAnnualCSV(reportData);
}

function generateDefaultCSV(reportData) {
  // Basic CSV for unknown report types
  let csv = '';
  
  if (reportData.summary) {
    csv += 'Summary\n';
    Object.entries(reportData.summary).forEach(([key, value]) => {
      csv += `${key},${value}\n`;
    });
    csv += '\n';
  }
  
  return csv;
}

module.exports = router;
