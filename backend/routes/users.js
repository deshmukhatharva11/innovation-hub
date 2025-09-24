const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { User, College, Incubator, Idea } = require('../models');
const { authenticateToken, authorizeRoles, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { uploadConfigs, handleUploadError, getFileType, generateChecksum } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (with filtering and pagination)
// @access  Private (Admin, College Admin, Incubator Manager)
router.get('/', [
  authenticateToken,
  authorizeRoles('admin', 'college_admin', 'incubator_manager'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 10000 }).withMessage('Limit must be between 1 and 10000'),
  query('role').optional().isIn(['student', 'college_admin', 'incubator_manager', 'admin']).withMessage('Invalid role'),
  query('college_id').optional().isInt().withMessage('College ID must be a valid integer'),
  query('incubator_id').optional().isInt().withMessage('Incubator ID must be a valid integer'),
  query('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
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

    const {
      page = 1,
      limit = 10,
      role,
      college_id,
      incubator_id,
      is_active,
      search,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters based on user role
    if (req.user.role === 'college_admin') {
      whereClause.college_id = req.user.college_id;
    } else if (req.user.role === 'incubator_manager') {
      whereClause.incubator_id = req.user.incubator_id;
    }

    // Apply additional filters
    if (role) whereClause.role = role;
    if (college_id) whereClause.college_id = college_id;
    if (incubator_id) whereClause.incubator_id = incubator_id;
    if (is_active !== undefined) whereClause.is_active = is_active;

    // Search functionality
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${search}%` } },
        { email: { [require('sequelize').Op.like]: `%${search}%` } },
        { department: { [require('sequelize').Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [
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
      attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expires', 'email_verification_token'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
    });
  }
});

// @route   GET /api/users/students
// @desc    Get all students (with filtering)
// @access  Private (Admin, College Admin, Incubator Manager, Mentor)
router.get('/students', [
  authenticateToken,
  authorizeRoles('admin', 'college_admin', 'incubator_manager', 'mentor'),
  query('college_id').optional().isInt().withMessage('College ID must be a valid integer'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 10000 }).withMessage('Limit must be between 1 and 10000'),
  query('sort').optional().isString().withMessage('Sort must be a string'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  query('sort_by').optional().isString().withMessage('Sort by must be a string'),
  query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('department').optional().isString().withMessage('Department must be a string'),
  query('year').optional().isString().withMessage('Year must be a string'),
  query('status').optional().isString().withMessage('Status must be a string'),
], async (req, res) => {
  try {
    console.log('Students endpoint called by user:', req.user.role, 'college_id:', req.query.college_id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { 
      college_id, 
      page = 1, 
      limit = 10, 
      search, 
      department, 
      year, 
      status 
    } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = { 
      role: 'student',
      is_active: true 
    };

    // Apply college filter
    if (req.user.role === 'college_admin') {
      whereClause.college_id = req.user.college_id;
    } else if (college_id) {
      whereClause.college_id = college_id;
    }

    // Apply search filter
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { department: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    // Apply department filter
    if (department && department !== 'all') {
      whereClause.department = department;
    }

    // Apply year filter
    if (year && year !== 'all') {
      whereClause.year_of_study = year;
    }

    const { count, rows: students } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'city', 'district', 'state'],
        },
        {
          model: Idea,
          as: 'ideas',
          attributes: ['id', 'title', 'status'],
          required: false,
        },
      ],
      attributes: [
        'id', 'name', 'email', 'phone', 'department', 'year_of_study',
        'roll_number', 'gpa', 'bio', 'skills', 'profile_image_url',
        'created_at', 'updated_at', 'last_login'
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    console.log(`Found ${count} students for college_id: ${college_id}`);
    console.log('Where clause:', whereClause);

    // Transform students data to include performance metrics
    const transformedStudents = students.map(student => {
      const studentData = student.toJSON();
      const ideas = studentData.ideas || [];
      return {
        ...studentData,
        ideas_count: ideas.length,
        endorsed_ideas: ideas.filter(idea => idea.status === 'endorsed').length,
        incubated_ideas: ideas.filter(idea => idea.status === 'incubated').length,
        performance: {
          totalIdeas: ideas.length,
          endorsedIdeas: ideas.filter(idea => idea.status === 'endorsed').length,
          incubatedIdeas: ideas.filter(idea => idea.status === 'incubated').length,
          avgIdeasPerStudent: ideas.length > 0 ? (ideas.length / 1).toFixed(2) : 0
        }
      };
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        students: transformedStudents,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get students',
    });
  }
});

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', [
  authenticateToken,
], async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: College, as: 'college', attributes: ['id', 'name'] },
        { model: Incubator, as: 'incubator', attributes: ['id', 'name'] }
      ],
      attributes: { exclude: ['password_hash', 'reset_password_token', 'email_verification_token'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', [
  authenticateToken,
  require('express-validator').param('id').isInt().withMessage('User ID must be a valid integer'),
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

    // Check if user can access this profile
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      // College admin can only access users from their college
      if (req.user.role === 'college_admin') {
        const targetUser = await User.findByPk(id);
        if (!targetUser || targetUser.college_id !== req.user.college_id) {
          return res.status(403).json({
            success: false,
            message: 'Access denied',
          });
        }
      }
      // Incubator manager can only access users from their incubator
      else if (req.user.role === 'incubator_manager') {
        const targetUser = await User.findByPk(id);
        if (!targetUser || targetUser.incubator_id !== req.user.incubator_id) {
          return res.status(403).json({
            success: false,
            message: 'Access denied',
          });
        }
      }
    }

    const user = await User.findByPk(id, {
      include: [
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
        {
          model: Idea,
          as: 'ideas',
          attributes: ['id', 'title', 'status', 'created_at'],
          limit: 5,
          order: [['created_at', 'DESC']],
        },
      ],
      attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expires', 'email_verification_token'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userData = user.toJSON();
    console.log('Backend - User data:', userData);
    console.log('Backend - College data:', userData.college);
    console.log('Backend - College name:', userData.college?.name);
    
    // Transform timestamps to snake_case
    const transformedUserData = {
      ...userData,
      created_at: userData.createdAt,
      updated_at: userData.updatedAt,
      college: userData.college ? {
        ...userData.college,
        created_at: userData.college.createdAt,
        updated_at: userData.college.updatedAt
      } : null,
      incubator: userData.incubator ? {
        ...userData.incubator,
        created_at: userData.incubator.createdAt,
        updated_at: userData.incubator.updatedAt
      } : null
    };

    res.json({
      success: true,
      data: {
        user: transformedUserData,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (Owner or Admin)
router.put('/:id', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('department').optional().trim().isLength({ max: 100 }).withMessage('Department must be less than 100 characters'),
  body('phone').optional().matches(/^[\+]?[\d\-\s\(\)]{0,20}$/).withMessage('Invalid phone number'),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('social_links').optional().isObject().withMessage('Social links must be an object'),
  body('date_of_birth').optional().isISO8601().withMessage('Invalid date format'),
  body('linkedin_url').optional().isURL().withMessage('Invalid LinkedIn URL'),
  body('github_url').optional().isURL().withMessage('Invalid GitHub URL'),
  body('portfolio_url').optional().isURL().withMessage('Invalid portfolio URL'),
  body('year_of_study').optional().isInt({ min: 1, max: 10 }).withMessage('Year of study must be between 1 and 10'),
  body('roll_number').optional().isString().withMessage('Roll number must be a string'),
  body('gpa').optional().isFloat({ min: 0, max: 4 }).withMessage('GPA must be between 0 and 4'),
  body('position').optional().isString().withMessage('Position must be a string'),
  body('experience_years').optional().isInt({ min: 0, max: 50 }).withMessage('Experience years must be between 0 and 50'),
  body('designation').optional().isString().withMessage('Designation must be a string'),
  body('expertise_areas').optional().isString().withMessage('Expertise areas must be a string'),
  body('profile_image_url').optional().isString().withMessage('Profile image URL must be a string'),
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

    // Check if user can update this profile
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user fields
    const updateFields = [
      'name', 'department', 'phone', 'bio', 'skills', 'social_links',
      'date_of_birth', 'linkedin_url', 'github_url', 'portfolio_url',
      'year_of_study', 'roll_number', 'gpa', 'position', 'experience_years', 
      'designation', 'expertise_areas', 'profile_image_url'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    // Reload user with associations to get updated college/incubator info
    const updatedUser = await User.findByPk(id, {
      include: [
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
      attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expires', 'email_verification_token'] },
    });

    const userData = updatedUser.toJSON();
    
    // Transform timestamps to snake_case
    const transformedUserData = {
      ...userData,
      created_at: userData.createdAt,
      updated_at: userData.updatedAt,
      college: userData.college ? {
        ...userData.college,
        created_at: userData.college.createdAt,
        updated_at: userData.college.updatedAt
      } : null,
      incubator: userData.incubator ? {
        ...userData.incubator,
        created_at: userData.incubator.createdAt,
        updated_at: userData.incubator.updatedAt
      } : null
    };

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: transformedUserData,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
});

// @route   POST /api/users/students
// @desc    Add new student (College Admin only)
// @access  Private (college_admin, admin)
router.post('/students', [
  authenticateToken,
  authorizeRoles('admin', 'college_admin'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().matches(/^[\+]?[\d\-\s\(\)]{0,20}$/).withMessage('Invalid phone number'),
  body('department').optional().isString().withMessage('Department must be a string'),
  body('year_of_study').optional().isInt({ min: 1, max: 6 }).withMessage('Year of study must be between 1 and 6'),
  body('roll_number').optional().isString().withMessage('Roll number must be a string'),
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

    const { name, email, password, phone, department, year_of_study, roll_number } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Determine college_id
    let college_id = null;
    if (req.user.role === 'college_admin') {
      college_id = req.user.college_id;
    } else if (req.body.college_id) {
      college_id = req.body.college_id;
    }

    // Create new student
    const newStudent = await User.create({
      name,
      email,
      password_hash,
      role: 'student',
      college_id,
      phone,
      department,
      year_of_study,
      roll_number,
      is_active: true,
      email_verified: true, // Auto-verify for admin-created accounts
    });

    // Remove password from response
    const studentData = newStudent.toJSON();
    delete studentData.password_hash;

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: {
        student: studentData,
      },
    });

  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add student',
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin or Owner)
router.delete('/:id', [
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

    // Soft delete by setting is_active to false
    user.is_active = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
});

// @route   POST /api/users/:id/profile-image
// @desc    Upload profile image
// @access  Private (Owner)
router.post('/:id/profile-image', [
  authenticateToken,
  uploadConfigs.profileImage,
  handleUploadError,
], async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can update this profile
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete old profile image if exists
    if (user.profile_image_url) {
      const oldImagePath = path.join(process.env.UPLOAD_PATH || './uploads', user.profile_image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update profile image URL
    user.profile_image_url = `profile_image/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profile_image_url: user.profile_image_url,
      },
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
    });
  }
});

// @route   GET /api/users/colleges
// @desc    Get all colleges
// @access  Private
router.get('/colleges', [
  authenticateToken,
], async (req, res) => {
  try {
    const colleges = await College.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'city', 'state', 'district', 'country'],
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        colleges,
      },
    });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get colleges',
    });
  }
});

// @route   GET /api/users/incubators
// @desc    Get all incubators
// @access  Private
router.get('/incubators', [
  authenticateToken,
], async (req, res) => {
  try {
    const incubators = await Incubator.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'city', 'state', 'country', 'focus_areas'],
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        incubators,
      },
    });
  } catch (error) {
    console.error('Get incubators error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get incubators',
    });
  }
});

// @route   GET /api/users/:id/ideas
// @desc    Get user's ideas
// @access  Private
router.get('/:id/ideas', [
  authenticateToken,
  require('express-validator').param('id').isInt().withMessage('User ID must be a valid integer'),
], async (req, res) => {
  console.log('🔍 /api/users/:id/ideas endpoint hit with ID:', req.params.id);
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

    // Check if user can access this data
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      // College admin can only access users from their college
      if (req.user.role === 'college_admin') {
        const targetUser = await User.findByPk(id);
        if (!targetUser || targetUser.college_id !== req.user.college_id) {
          return res.status(403).json({
            success: false,
            message: 'Access denied',
          });
        }
      }
      // Incubator manager can only access users from their incubator
      else if (req.user.role === 'incubator_manager') {
        const targetUser = await User.findByPk(id);
        if (!targetUser || targetUser.incubator_id !== req.user.incubator_id) {
          return res.status(403).json({
            success: false,
            message: 'Access denied',
          });
        }
      }
    }

    const ideas = await Idea.findAll({
      where: { student_id: id },
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name'],
        },
      ],
      attributes: ['id', 'title', 'description', 'status', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        ideas,
      },
    });
  } catch (error) {
    console.error('Get user ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user ideas',
    });
  }
});


module.exports = router;
