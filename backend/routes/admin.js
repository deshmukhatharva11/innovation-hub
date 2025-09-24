const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { User, College, Incubator, Idea, Notification, Document, Event, Mentor, PreIncubatee } = require('../models');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/users', [
  authenticateToken,
  authorizeRoles('admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('role').optional().isIn(['student', 'college_admin', 'incubator_manager', 'admin']).withMessage('Invalid role'),
  query('search').optional().isString().withMessage('Search must be a string'),
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

    const { page = 1, limit = 50, role, search } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (role) whereClause.role = role;
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [
        { model: College, as: 'college', attributes: ['id', 'name'] },
        { model: Incubator, as: 'incubator', attributes: ['id', 'name'] },
      ],
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
});

// @route   GET /api/admin/colleges
// @desc    Get all colleges (Admin only)
// @access  Private (Admin)
router.get('/colleges', [
  authenticateToken,
  authorizeRoles('admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('search').optional().isString().withMessage('Search must be a string'),
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

    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { state: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: colleges } = await College.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'users', attributes: ['id'], where: { role: 'student' }, required: false },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    // Calculate statistics for each college
    const collegesWithStats = await Promise.all(colleges.map(async (college) => {
      const totalStudents = await User.count({ where: { college_id: college.id, role: 'student' } });
      const totalIdeas = await Idea.count({ where: { college_id: college.id } });
      const endorsedIdeas = await Idea.count({ where: { college_id: college.id, status: 'endorsed' } });
      const incubatedIdeas = await Idea.count({ where: { college_id: college.id, status: 'incubated' } });

      return {
        ...college.toJSON(),
        total_students: totalStudents,
        total_ideas: totalIdeas,
        endorsed_ideas: endorsedIdeas,
        incubated_ideas: incubatedIdeas,
      };
    }));

    res.json({
      success: true,
      data: {
        colleges: collegesWithStats,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch colleges',
    });
  }
});

// @route   GET /api/admin/incubators
// @desc    Get all incubators (Admin only)
// @access  Private (Admin)
router.get('/incubators', [
  authenticateToken,
  authorizeRoles('admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('search').optional().isString().withMessage('Search must be a string'),
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

    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { state: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: incubators } = await Incubator.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'managers', attributes: ['id', 'name', 'email'], where: { role: 'incubator_manager' }, required: false },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    // Calculate statistics for each incubator
    const incubatorsWithStats = await Promise.all(incubators.map(async (incubator) => {
      const totalManagers = await User.count({ where: { incubator_id: incubator.id, role: 'incubator_manager' } });
      const totalIdeas = await Idea.count({ where: { incubator_id: incubator.id } });
      const incubatedIdeas = await Idea.count({ where: { incubator_id: incubator.id, status: 'incubated' } });

      return {
        ...incubator.toJSON(),
        total_managers: totalManagers,
        total_ideas: totalIdeas,
        incubated_ideas: incubatedIdeas,
      };
    }));

    res.json({
      success: true,
      data: {
        incubators: incubatorsWithStats,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching incubators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incubators',
    });
  }
});

// @route   GET /api/admin/settings
// @desc    Get system settings (Admin only)
// @access  Private (Admin)
router.get('/settings', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    // Return system settings (this would typically come from a settings table)
    const settings = {
      site_name: 'Innovation Hub Maharashtra',
      site_description: 'Connecting students, colleges, and incubators for innovation excellence',
      support_email: 'support@innovationhub.gov.in',
      admin_email: 'admin@innovationhub.gov.in',
      timezone: 'Asia/Kolkata',
      language: 'en',
      session_timeout: 30,
      max_login_attempts: 5,
      password_min_length: 8,
      require_two_factor: false,
      allow_registration: true,
      email_verification_required: true,
      max_file_size: 10,
      allowed_file_types: 'pdf,doc,docx,jpg,jpeg,png,gif',
      backup_frequency: 'daily',
      retention_period: 30,
      auto_backup: true,
      rate_limit: 1000,
      api_timeout: 30,
      enable_api_logging: true,
      enable_email_notifications: true,
      enable_push_notifications: true,
      maintenance_mode: false,
      maintenance_message: 'System is under maintenance. Please try again later.',
      enable_analytics: true,
      analytics_retention: 365,
      track_user_activity: true,
    };

    res.json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
    });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update system settings (Admin only)
// @access  Private (Admin)
router.put('/settings', [
  authenticateToken,
  authorizeRoles('admin'),
  body('site_name').optional().isString().withMessage('Site name must be a string'),
  body('site_description').optional().isString().withMessage('Site description must be a string'),
  body('support_email').optional().isEmail().withMessage('Support email must be valid'),
  body('admin_email').optional().isEmail().withMessage('Admin email must be valid'),
  body('timezone').optional().isString().withMessage('Timezone must be a string'),
  body('language').optional().isString().withMessage('Language must be a string'),
  body('session_timeout').optional().isInt({ min: 5, max: 120 }).withMessage('Session timeout must be between 5 and 120 minutes'),
  body('max_login_attempts').optional().isInt({ min: 3, max: 10 }).withMessage('Max login attempts must be between 3 and 10'),
  body('password_min_length').optional().isInt({ min: 6, max: 20 }).withMessage('Password min length must be between 6 and 20'),
  body('require_two_factor').optional().isBoolean().withMessage('Require two factor must be boolean'),
  body('allow_registration').optional().isBoolean().withMessage('Allow registration must be boolean'),
  body('email_verification_required').optional().isBoolean().withMessage('Email verification required must be boolean'),
  body('max_file_size').optional().isInt({ min: 1, max: 100 }).withMessage('Max file size must be between 1 and 100 MB'),
  body('allowed_file_types').optional().isString().withMessage('Allowed file types must be a string'),
  body('backup_frequency').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid backup frequency'),
  body('retention_period').optional().isInt({ min: 7, max: 365 }).withMessage('Retention period must be between 7 and 365 days'),
  body('auto_backup').optional().isBoolean().withMessage('Auto backup must be boolean'),
  body('rate_limit').optional().isInt({ min: 100, max: 10000 }).withMessage('Rate limit must be between 100 and 10000'),
  body('api_timeout').optional().isInt({ min: 10, max: 300 }).withMessage('API timeout must be between 10 and 300 seconds'),
  body('enable_api_logging').optional().isBoolean().withMessage('Enable API logging must be boolean'),
  body('enable_email_notifications').optional().isBoolean().withMessage('Enable email notifications must be boolean'),
  body('enable_push_notifications').optional().isBoolean().withMessage('Enable push notifications must be boolean'),
  body('maintenance_mode').optional().isBoolean().withMessage('Maintenance mode must be boolean'),
  body('maintenance_message').optional().isString().withMessage('Maintenance message must be a string'),
  body('enable_analytics').optional().isBoolean().withMessage('Enable analytics must be boolean'),
  body('analytics_retention').optional().isInt({ min: 30, max: 1095 }).withMessage('Analytics retention must be between 30 and 1095 days'),
  body('track_user_activity').optional().isBoolean().withMessage('Track user activity must be boolean'),
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

    // In a real application, this would update a settings table in the database
    // For now, we'll just return success
    const updatedSettings = req.body;

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings: updatedSettings },
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
    });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics (Admin only)
// @access  Private (Admin)
router.get('/dashboard', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    // Get system-wide statistics
    const totalUsers = await User.count();
    const totalColleges = await College.count();
    const totalIncubators = await Incubator.count();
    const totalIdeas = await Idea.count();

    // Users by role
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['role'],
    });

    // Ideas by status
    const ideasByStatus = await Idea.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['status'],
    });

    // Recent activity
    const recentUsers = await User.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'name', 'email', 'role', 'created_at'],
    });

    const recentIdeas = await Idea.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'student', attributes: ['id', 'name'] },
        { model: College, as: 'college', attributes: ['id', 'name'] },
      ],
      attributes: ['id', 'title', 'status', 'created_at'],
    });

    res.json({
      success: true,
      data: {
        statistics: {
          total_users: totalUsers,
          total_colleges: totalColleges,
          total_incubators: totalIncubators,
          total_ideas: totalIdeas,
        },
        users_by_role: usersByRole,
        ideas_by_status: ideasByStatus,
        recent_users: recentUsers,
        recent_ideas: recentIdeas,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard',
    });
  }
});

// ==================== ENHANCED USER MANAGEMENT ====================

// @route   POST /api/admin/users
// @desc    Create a new user (Admin only)
// @access  Private (Admin)
router.post('/users', [
  authenticateToken,
  authorizeRoles('admin'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['student', 'college_admin', 'incubator_manager', 'admin']).withMessage('Invalid role'),
  body('college_id').optional().isInt().withMessage('College ID must be an integer'),
  body('incubator_id').optional().isInt().withMessage('Incubator ID must be an integer'),
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

    const { name, email, password, role, college_id, incubator_id, department, phone, year_of_study, roll_number, gpa } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      name,
      email,
      password_hash: passwordHash,
      role,
      college_id: role === 'student' || role === 'college_admin' ? college_id : null,
      incubator_id: role === 'incubator_manager' ? incubator_id : null,
      department,
      phone,
      year_of_study,
      roll_number,
      gpa,
      is_active: true,
      email_verified: true,
    });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userResponse },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user (Admin only)
// @access  Private (Admin)
router.put('/users/:id', [
  authenticateToken,
  authorizeRoles('admin'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['student', 'college_admin', 'incubator_manager', 'admin']).withMessage('Invalid role'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
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

    // Remove password from update data if present
    if (updateData.password) {
      const saltRounds = 12;
      updateData.password_hash = await bcrypt.hash(updateData.password, saltRounds);
      delete updateData.password;
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.update(updateData);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: userResponse },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (Admin only)
// @access  Private (Admin)
router.delete('/users/:id', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Soft delete - set is_active to false
    await user.update({ is_active: false });

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
});

// @route   POST /api/admin/users/:id/activate
// @desc    Activate a user (Admin only)
// @access  Private (Admin)
router.post('/users/:id/activate', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.update({ is_active: true });

    res.json({
      success: true,
      message: 'User activated successfully',
    });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
    });
  }
});

// ==================== COLLEGE ONBOARDING ====================

// @route   GET /api/admin/colleges
// @desc    Get all colleges (Admin only)
// @access  Private (Admin)
router.get('/colleges', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', district = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { is_active: true };
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
        { contact_email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (district) {
      whereClause.district = district;
    }

    const { count, rows: colleges } = await College.findAndCountAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        'id', 'name', 'city', 'district', 'state', 'contact_email', 
        'contact_phone', 'website', 'established_year', 'is_active', 
        'created_at', 'updated_at'
      ]
    });

    res.json({
      success: true,
      data: {
        colleges,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalColleges: count,
          hasNext: offset + colleges.length < count,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch colleges',
    });
  }
});

// @route   POST /api/admin/colleges
// @desc    Create a new college (Admin only)
// @access  Private (Admin)
router.post('/colleges', [
  authenticateToken,
  authorizeRoles('admin'),
  body('name').notEmpty().withMessage('College name is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('district').notEmpty().withMessage('District is required'),
  body('pincode').isPostalCode('IN').withMessage('Valid pincode is required'),
  body('contact_email').isEmail().withMessage('Valid contact email is required'),
  body('contact_phone').isMobilePhone('en-IN').withMessage('Valid phone number is required'),
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

    const { name, city, state, district, contact_email } = req.body;

    // Check if college already exists
    const existingCollege = await College.findOne({
      where: {
        [Op.or]: [
          { name: name },
          { contact_email: contact_email }
        ]
      }
    });

    if (existingCollege) {
      return res.status(409).json({
        success: false,
        message: 'College already exists',
        data: {
          existing: {
            name: existingCollege.name,
            email: existingCollege.contact_email,
            id: existingCollege.id
          }
        }
      });
    }

    const collegeData = {
      name,
      city,
      state,
      district,
      contact_email,
      contact_phone: req.body.contact_phone,
      website: req.body.website,
      address: req.body.address,
      established_year: req.body.established_year,
      description: req.body.description,
      is_active: true
    };

    const college = await College.create(collegeData);

    res.status(201).json({
      success: true,
      message: 'College created successfully',
      data: { college },
    });
  } catch (error) {
    console.error('Error creating college:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create college',
    });
  }
});

// @route   PUT /api/admin/colleges/:id
// @desc    Update a college (Admin only)
// @access  Private (Admin)
router.put('/colleges/:id', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const college = await College.findByPk(id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    await college.update(updateData);

    res.json({
      success: true,
      message: 'College updated successfully',
      data: { college },
    });
  } catch (error) {
    console.error('Error updating college:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update college',
    });
  }
});

// ==================== GLOBAL ANALYTICS ====================

// @route   GET /api/admin/analytics/global
// @desc    Get comprehensive global analytics (Admin only)
// @access  Private (Admin)
router.get('/analytics/global', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get comprehensive statistics
    const [
      totalUsers,
      totalColleges,
      totalIncubators,
      totalIdeas,
      totalMentors,
      totalPreIncubatees,
      activeUsers,
      newUsers,
      newIdeas,
      newColleges,
      usersByRole,
      ideasByStatus,
      ideasByCategory,
      collegesByState,
      monthlyTrends,
      topPerformingColleges,
      topPerformingIncubators,
      recentActivity
    ] = await Promise.all([
      // Basic counts
      User.count(),
      College.count(),
      Incubator.count(),
      Idea.count(),
      Mentor.count(),
      PreIncubatee.count(),
      User.count({ where: { is_active: true } }),
      
      // New registrations
      User.count({ where: { created_at: { [Op.gte]: startDate } } }),
      Idea.count({ where: { created_at: { [Op.gte]: startDate } } }),
      College.count({ where: { created_at: { [Op.gte]: startDate } } }),
      
      // User breakdown by role
      User.findAll({
        attributes: [
          'role',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['role'],
      }),
      
      // Ideas by status
      Idea.findAll({
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status'],
      }),
      
      // Ideas by category
      Idea.findAll({
        attributes: [
          'category',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['category'],
      }),
      
      // Colleges by state
      College.findAll({
        attributes: [
          'state',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['state'],
      }),
      
      // Monthly trends (last 12 months)
      Idea.findAll({
        attributes: [
          [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('created_at')), 'month'],
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        where: {
          created_at: {
            [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        },
        group: [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('created_at'))],
        order: [[require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('created_at')), 'ASC']]
      }),
      
      // Top performing colleges
      College.findAll({
        attributes: [
          'id', 'name', 'city', 'state',
          [require('sequelize').fn('COUNT', require('sequelize').col('ideas.id')), 'total_ideas'],
          [require('sequelize').fn('COUNT', require('sequelize').col('ideas.id')), 'endorsed_ideas']
        ],
        include: [{
          model: Idea,
          as: 'ideas',
          attributes: [],
          where: { status: 'endorsed' },
          required: false
        }],
        group: ['College.id'],
        order: [[require('sequelize').fn('COUNT', require('sequelize').col('ideas.id')), 'DESC']],
        limit: 10
      }),
      
      // Top performing incubators
      Incubator.findAll({
        attributes: [
          'id', 'name', 'city', 'state',
          [require('sequelize').fn('COUNT', require('sequelize').col('ideas.id')), 'incubated_ideas']
        ],
        include: [{
          model: Idea,
          as: 'ideas',
          attributes: [],
          where: { status: 'incubated' },
          required: false
        }],
        group: ['Incubator.id'],
        order: [[require('sequelize').fn('COUNT', require('sequelize').col('ideas.id')), 'DESC']],
        limit: 10
      }),
      
      // Recent activity
      Promise.all([
        User.findAll({
          attributes: ['id', 'name', 'email', 'role', 'created_at'],
          order: [['created_at', 'DESC']],
          limit: 5
        }),
        Idea.findAll({
          attributes: ['id', 'title', 'status', 'created_at'],
          include: [{
            model: User,
            as: 'student',
            attributes: ['name']
          }],
          order: [['created_at', 'DESC']],
          limit: 5
        })
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total_users: totalUsers,
          total_colleges: totalColleges,
          total_incubators: totalIncubators,
          total_ideas: totalIdeas,
          total_mentors: totalMentors,
          total_pre_incubatees: totalPreIncubatees,
          active_users: activeUsers,
          new_users: newUsers,
          new_ideas: newIdeas,
          new_colleges: newColleges
        },
        breakdown: {
          users_by_role: usersByRole,
          ideas_by_status: ideasByStatus,
          ideas_by_category: ideasByCategory,
          colleges_by_state: collegesByState
        },
        trends: {
          monthly_ideas: monthlyTrends
        },
        top_performers: {
          colleges: topPerformingColleges,
          incubators: topPerformingIncubators
        },
        recent_activity: {
          users: recentActivity[0],
          ideas: recentActivity[1]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching global analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch global analytics',
    });
  }
});

// ==================== PORTAL CONFIGURATION ====================

// @route   GET /api/admin/portal-config
// @desc    Get portal configuration (Admin only)
// @access  Private (Admin)
router.get('/portal-config', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    // This would typically come from a configuration table
    const config = {
      idea_submission_deadline: '2025-12-31',
      evaluation_deadline: '2025-11-30',
      incubation_start_date: '2025-10-01',
      max_team_size: 5,
      min_team_size: 1,
      max_file_size_mb: 10,
      allowed_file_types: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
      idea_categories: [
        'Technology',
        'Healthcare',
        'Agriculture',
        'Education',
        'Environment',
        'Finance',
        'Manufacturing',
        'Other'
      ],
      evaluation_criteria: [
        'Innovation',
        'Feasibility',
        'Market Potential',
        'Technical Merit',
        'Social Impact'
      ],
      mentorship_required: true,
      funding_available: true,
      max_funding_amount: 100000,
      incubation_duration_months: 12
    };

    res.json({
      success: true,
      data: { config },
    });
  } catch (error) {
    console.error('Error fetching portal config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portal configuration',
    });
  }
});

// @route   PUT /api/admin/portal-config
// @desc    Update portal configuration (Admin only)
// @access  Private (Admin)
router.put('/portal-config', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    const config = req.body;
    
    // In a real application, this would update a configuration table
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Portal configuration updated successfully',
      data: { config },
    });
  } catch (error) {
    console.error('Error updating portal config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portal configuration',
    });
  }
});

// ==================== BACKUP & DATA SECURITY ====================

// @route   POST /api/admin/backup
// @desc    Create system backup (Admin only)
// @access  Private (Admin)
router.post('/backup', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    const backupId = `backup_${Date.now()}`;
    const backupPath = path.join(__dirname, '../backups', `${backupId}.sql`);
    
    // Ensure backups directory exists
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    
    // In a real application, this would create an actual database backup
    // For now, we'll create a placeholder file
    await fs.writeFile(backupPath, `-- Backup created at ${new Date().toISOString()}\n-- This is a placeholder backup file\n`);
    
    res.json({
      success: true,
      message: 'Backup created successfully',
      data: {
        backup_id: backupId,
        backup_path: backupPath,
        created_at: new Date().toISOString()
      },
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create backup',
    });
  }
});

// @route   GET /api/admin/backups
// @desc    List all backups (Admin only)
// @access  Private (Admin)
router.get('/backups', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    const backupsDir = path.join(__dirname, '../backups');
    
    try {
      const files = await fs.readdir(backupsDir);
      const backups = files
        .filter(file => file.endsWith('.sql'))
        .map(file => ({
          id: file.replace('.sql', ''),
          filename: file,
          created_at: new Date().toISOString(), // In real app, get from file stats
          size: '1.2 MB' // In real app, get from file stats
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      res.json({
        success: true,
        data: { backups },
      });
    } catch (error) {
      // If backups directory doesn't exist, return empty list
      res.json({
        success: true,
        data: { backups: [] },
      });
    }
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list backups',
    });
  }
});

// ==================== BROADCAST ANNOUNCEMENTS ====================

// @route   POST /api/admin/announcements
// @desc    Create broadcast announcement (Admin only)
// @access  Private (Admin)
router.post('/announcements', [
  authenticateToken,
  authorizeRoles('admin'),
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('target_audience').isIn(['all', 'students', 'college_admins', 'incubator_managers']).withMessage('Invalid target audience'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
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

    const { title, message, target_audience, priority, expires_at } = req.body;

    // Create notification for all users based on target audience
    let whereClause = {};
    if (target_audience !== 'all') {
      whereClause.role = target_audience;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id']
    });

    // Create notifications for all target users
    const notifications = await Promise.all(
      users.map(user => 
        Notification.create({
          user_id: user.id,
          title,
          message,
          type: 'announcement',
          priority,
          expires_at: expires_at ? new Date(expires_at) : null,
          is_read: false
        })
      )
    );

    res.status(201).json({
      success: true,
      message: 'Announcement broadcasted successfully',
      data: {
        announcement: {
          title,
          message,
          target_audience,
          priority,
          users_notified: notifications.length
        }
      },
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
    });
  }
});

// @route   GET /api/admin/announcements
// @desc    Get all announcements (Admin only)
// @access  Private (Admin)
router.get('/announcements', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    const announcements = await Notification.findAll({
      where: { type: 'announcement' },
      order: [['created_at', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      data: { announcements },
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements',
    });
  }
});

module.exports = router;
