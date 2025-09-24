const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { PreIncubatee, Idea, User, College, Incubator } = require('../models');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Get all pre-incubatees for incubator manager
router.get('/', authenticateToken, authorizeRoles('incubator_manager'), async (req, res) => {
  try {
    const { 
      status = 'all', 
      phase = 'all',
      page = 1, 
      limit = 10, 
      search = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    
    if (!req.user || !req.user.incubator_id) {
      return res.status(400).json({
        success: false,
        message: 'User incubator_id not found'
      });
    }
    
    const whereClause = {
      incubator_id: req.user.incubator_id
    };

    // Filter by status
    if (status !== 'all') {
      whereClause.status = status;
    }

    // Filter by phase
    if (phase !== 'all') {
      whereClause.current_phase = phase;
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { '$idea.title$': { [Op.like]: `%${search}%` } },
        { '$student.name$': { [Op.like]: `%${search}%` } },
        { '$college.name$': { [Op.like]: `%${search}%` } }
      ];
    }

    const preIncubatees = await PreIncubatee.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'idea_id', 'incubator_id', 'student_id', 'college_id', 'current_phase', 'progress_percentage', 'phase_description', 'funding_required', 'funding_received', 'expected_completion_date', 'status', 'incubator_decision', 'incubator_decision_date', 'start_date', 'notes', 'created_at', 'updated_at'],
      include: [
        {
          model: Idea,
          as: 'idea',
          attributes: ['id', 'title', 'description', 'category', 'status', 'views_count', 'likes_count']
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'city', 'state']
        }
      ],
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        preIncubatees: preIncubatees.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(preIncubatees.count / limit),
          total_items: preIncubatees.count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching pre-incubatees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pre-incubatees'
    });
  }
});

// Get pre-incubatee by ID
router.get('/:id', authenticateToken, authorizeRoles('incubator_manager'), async (req, res) => {
  try {
    const preIncubatee = await PreIncubatee.findByPk(req.params.id, {
      attributes: ['id', 'idea_id', 'incubator_id', 'student_id', 'college_id', 'current_phase', 'progress_percentage', 'phase_description', 'funding_required', 'funding_received', 'expected_completion_date', 'status', 'incubator_decision', 'incubator_decision_date', 'start_date', 'notes', 'created_at', 'updated_at'],
      include: [
        {
          model: Idea,
          as: 'idea',
          attributes: ['id', 'title', 'description', 'category', 'technology_stack', 'implementation_plan']
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'phone', 'college_id']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'city', 'state']
        },
        {
          model: User,
          as: 'mentor',
          attributes: ['id', 'name', 'email', 'phone'],
          required: false
        }
      ]
    });

    if (!preIncubatee) {
      return res.status(404).json({
        success: false,
        message: 'Pre-incubatee not found'
      });
    }

    // Check if pre-incubatee belongs to this incubator
    if (preIncubatee.incubator_id !== req.user.incubator_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view pre-incubatees from your incubator'
      });
    }

    res.json({
      success: true,
      data: { preIncubatee }
    });
  } catch (error) {
    console.error('Error fetching pre-incubatee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pre-incubatee'
    });
  }
});

// Create new pre-incubatee (from incubated idea)
router.post('/', 
  authenticateToken, 
  authorizeRoles('incubator_manager'),
  [
    body('idea_id').isInt().withMessage('Idea ID must be a number'),
    body('current_phase').isIn(['research', 'development', 'testing', 'market_validation', 'scaling']).withMessage('Invalid phase'),
    body('progress_percentage').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
    body('funding_required').optional().isNumeric().withMessage('Funding required must be a number'),
    body('expected_completion_date').optional().isISO8601().withMessage('Invalid date format')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { idea_id, current_phase, progress_percentage, phase_description, funding_required, expected_completion_date, notes } = req.body;

      // Check if idea exists and is incubated
      const idea = await Idea.findByPk(idea_id, {
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'college_id']
          }
        ]
      });

      if (!idea) {
        return res.status(404).json({
          success: false,
          message: 'Idea not found'
        });
      }

      if (idea.status !== 'incubated') {
        return res.status(400).json({
          success: false,
          message: 'Only incubated ideas can become pre-incubatees'
        });
      }

      if (idea.incubator_id !== req.user.incubator_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only create pre-incubatees from ideas in your incubator'
        });
      }

      // Check if pre-incubatee already exists for this idea
      const existingPreIncubatee = await PreIncubatee.findOne({
        where: { idea_id }
      });

      if (existingPreIncubatee) {
        return res.status(400).json({
          success: false,
          message: 'Pre-incubatee already exists for this idea'
        });
      }

      const preIncubatee = await PreIncubatee.create({
        idea_id,
        incubator_id: req.user.incubator_id,
        student_id: idea.student_id,
        college_id: idea.college_id,
        current_phase,
        progress_percentage,
        phase_description,
        funding_required: funding_required || 0,
        expected_completion_date,
        notes,
        start_date: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Pre-incubatee created successfully',
        data: { preIncubatee }
      });
    } catch (error) {
      console.error('Error creating pre-incubatee:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create pre-incubatee'
      });
    }
  }
);

// Student update pre-incubatee progress (limited fields)
router.put('/:id/student-update', 
  authenticateToken, 
  authorizeRoles('student'),
  [
    body('progress_percentage').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
    body('phase_description').optional().isString().withMessage('Phase description must be a string'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const preIncubatee = await PreIncubatee.findByPk(req.params.id, {
        include: [
          { model: Idea, as: 'idea', attributes: ['id', 'title', 'status'] },
          { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
          { model: College, as: 'college', attributes: ['id', 'name'] }
        ]
      });

      if (!preIncubatee) {
        return res.status(404).json({
          success: false,
          message: 'Pre-incubatee not found'
        });
      }

      // Check if student owns this pre-incubatee
      if (preIncubatee.student_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own pre-incubatee progress'
        });
      }

      // Students can only update limited fields
      const allowedUpdates = {
        progress_percentage: req.body.progress_percentage,
        phase_description: req.body.phase_description,
        notes: req.body.notes,
        last_review_date: new Date()
      };

      await preIncubatee.update(allowedUpdates);

      // Create notification for incubator manager
      try {
        const { Notification } = require('../models');
        const incubatorManager = await User.findOne({
          where: { 
            role: 'incubator_manager',
            incubator_id: preIncubatee.incubator_id
          }
        });

        if (incubatorManager) {
          await Notification.create({
            user_id: incubatorManager.id,
            type: 'info',
            title: 'Student Progress Update',
            message: `Student ${req.user.name} updated progress for "${preIncubatee.idea.title}" to ${req.body.progress_percentage}%`,
            data: {
              pre_incubatee_id: preIncubatee.id,
              student_id: req.user.id,
              progress_percentage: req.body.progress_percentage,
              phase_description: req.body.phase_description
            }
          });
        }
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }

      res.json({
        success: true,
        message: 'Progress updated successfully',
        data: { preIncubatee }
      });
    } catch (error) {
      console.error('Error updating pre-incubatee progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update progress'
      });
    }
  }
);

// Get student's pre-incubatees
router.get('/student/my-pre-incubatees', 
  authenticateToken, 
  authorizeRoles('student'),
  async (req, res) => {
    try {
      const preIncubatees = await PreIncubatee.findAll({
        where: { student_id: req.user.id },
        attributes: ['id', 'idea_id', 'incubator_id', 'student_id', 'college_id', 'current_phase', 'progress_percentage', 'phase_description', 'funding_required', 'funding_received', 'expected_completion_date', 'status', 'incubator_decision', 'incubator_decision_date', 'start_date', 'notes', 'created_at', 'updated_at'],
        include: [
          {
            model: Idea,
            as: 'idea',
            attributes: ['id', 'title', 'description', 'category', 'status']
          },
          {
            model: College,
            as: 'college',
            attributes: ['id', 'name', 'city', 'state']
          },
          {
            model: Incubator,
            as: 'incubator',
            attributes: ['id', 'name']
          }
        ],
        order: [['updated_at', 'DESC']]
      });

      res.json({
        success: true,
        data: { preIncubatees }
      });
    } catch (error) {
      console.error('Error fetching student pre-incubatees:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pre-incubatees'
      });
    }
  }
);

// Update pre-incubatee progress (incubator manager)
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('incubator_manager'),
  [
    body('current_phase').optional().isIn(['research', 'development', 'testing', 'market_validation', 'scaling']).withMessage('Invalid phase'),
    body('progress_percentage').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
    body('funding_received').optional().isNumeric().withMessage('Funding received must be a number'),
    body('status').optional().isIn(['active', 'completed', 'paused', 'terminated']).withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const preIncubatee = await PreIncubatee.findByPk(req.params.id);

      if (!preIncubatee) {
        return res.status(404).json({
          success: false,
          message: 'Pre-incubatee not found'
        });
      }

      // Check if pre-incubatee belongs to this incubator
      if (preIncubatee.incubator_id !== req.user.incubator_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update pre-incubatees from your incubator'
        });
      }

      const updateData = {
        ...req.body,
        last_review_date: new Date()
      };

      await preIncubatee.update(updateData);

      res.json({
        success: true,
        message: 'Pre-incubatee updated successfully',
        data: { preIncubatee }
      });
    } catch (error) {
      console.error('Error updating pre-incubatee:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update pre-incubatee'
      });
    }
  }
);

// Assign mentor to pre-incubatee
router.put('/:id/assign-mentor', 
  authenticateToken, 
  authorizeRoles('incubator_manager'),
  [
    body('mentor_id').isInt().withMessage('Mentor ID must be a number')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const preIncubatee = await PreIncubatee.findByPk(req.params.id);

      if (!preIncubatee) {
        return res.status(404).json({
          success: false,
          message: 'Pre-incubatee not found'
        });
      }

      // Check if pre-incubatee belongs to this incubator
      if (preIncubatee.incubator_id !== req.user.incubator_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only assign mentors to pre-incubatees from your incubator'
        });
      }

      const { mentor_id } = req.body;

      // Check if mentor exists
      const mentor = await User.findByPk(mentor_id);
      if (!mentor) {
        return res.status(404).json({
          success: false,
          message: 'Mentor not found'
        });
      }

      await preIncubatee.update({ mentor_id });

      res.json({
        success: true,
        message: 'Mentor assigned successfully',
        data: { preIncubatee }
      });
    } catch (error) {
      console.error('Error assigning mentor:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign mentor'
      });
    }
  }
);

// Get pre-incubatee statistics
router.get('/statistics/overview', authenticateToken, authorizeRoles('incubator_manager'), async (req, res) => {
  try {
    const incubatorId = req.user.incubator_id;
    
    const stats = await Promise.all([
      PreIncubatee.count({ where: { incubator_id: incubatorId, status: 'active' } }),
      PreIncubatee.count({ where: { incubator_id: incubatorId, status: 'completed' } }),
      PreIncubatee.count({ where: { incubator_id: incubatorId, status: 'paused' } }),
      PreIncubatee.count({ where: { incubator_id: incubatorId, current_phase: 'research' } }),
      PreIncubatee.count({ where: { incubator_id: incubatorId, current_phase: 'development' } }),
      PreIncubatee.count({ where: { incubator_id: incubatorId, current_phase: 'testing' } }),
      PreIncubatee.count({ where: { incubator_id: incubatorId, current_phase: 'market_validation' } }),
      PreIncubatee.count({ where: { incubator_id: incubatorId, current_phase: 'scaling' } })
    ]);

    // Calculate average progress
    const avgProgress = await PreIncubatee.findOne({
      where: { incubator_id: incubatorId, status: 'active' },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('progress_percentage')), 'avg_progress']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        total_active: stats[0],
        total_completed: stats[1],
        total_paused: stats[2],
        by_phase: {
          research: stats[3],
          development: stats[4],
          testing: stats[5],
          market_validation: stats[6],
          scaling: stats[7]
        },
        average_progress: Math.round(avgProgress?.avg_progress || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching pre-incubatee statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pre-incubatee statistics'
    });
  }
});

module.exports = router;
