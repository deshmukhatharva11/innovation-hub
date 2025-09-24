const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Incubator, User, Idea, College } = require('../models');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Get incubator manager's own incubator details
router.get('/my-incubator', authenticateToken, authorizeRoles('incubator_manager'), async (req, res) => {
  try {
    const incubator = await Incubator.findByPk(req.user.incubator_id, {
      include: [
        {
          model: User,
          as: 'managers',
          attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at']
        }
      ]
    });

    if (!incubator) {
      return res.status(404).json({
        success: false,
        message: 'Incubator not found'
      });
    }

    res.json({
      success: true,
      data: { incubator }
    });
  } catch (error) {
    console.error('Error fetching incubator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incubator'
    });
  }
});

// Get ideas assigned to this incubator
router.get('/ideas', authenticateToken, authorizeRoles('incubator_manager'), async (req, res) => {
  try {
    const { 
      status = 'all', 
      page = 1, 
      limit = 10, 
      search = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      incubator_id: req.user.incubator_id
    };

    // Filter by status
    if (status !== 'all') {
      whereClause.status = status;
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } }
      ];
    }

    const ideas = await Idea.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'college_id'],
          include: [
            {
              model: College,
              as: 'college',
              attributes: ['id', 'name', 'city', 'state']
            }
          ]
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        ideas: ideas.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(ideas.count / limit),
          total_items: ideas.count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching incubator ideas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ideas'
    });
  }
});

// Get endorsed ideas for review (incubator manager specific)
router.get('/ideas/endorsed', authenticateToken, authorizeRoles('incubator_manager'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const ideas = await Idea.findAndCountAll({
      where: {
        incubator_id: req.user.incubator_id,
        status: 'endorsed'
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'college_id'],
          include: [
            {
              model: College,
              as: 'college',
              attributes: ['id', 'name', 'city', 'state']
            }
          ]
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        ideas: ideas.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(ideas.count / limit),
          total_items: ideas.count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching endorsed ideas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch endorsed ideas'
    });
  }
});

// Review idea (incubator manager specific)
router.put('/ideas/:id/review', 
  authenticateToken, 
  authorizeRoles('incubator_manager'),
  [
    body('status').isIn(['incubated', 'rejected']).withMessage('Status must be incubated or rejected'),
    body('feedback').optional().isString().withMessage('Feedback must be a string')
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

      const idea = await Idea.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!idea) {
        return res.status(404).json({
          success: false,
          message: 'Idea not found'
        });
      }

      // Check if idea belongs to this incubator
      if (idea.incubator_id !== req.user.incubator_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only review ideas from your incubator'
        });
      }

      // Check if idea is endorsed
      if (idea.status !== 'endorsed') {
        return res.status(400).json({
          success: false,
          message: 'You can only review endorsed ideas'
        });
      }

      const { status, feedback } = req.body;

      // Update idea status
      await idea.update({
        status,
        feedback: feedback || idea.feedback,
        reviewed_by: req.user.id,
        reviewed_at: new Date()
      });

      // Update incubator occupancy if incubated
      if (status === 'incubated') {
        const incubator = await Incubator.findByPk(req.user.incubator_id);
        if (incubator) {
          await incubator.update({
            current_occupancy: incubator.current_occupancy + 1
          });
        }
      }

      res.json({
        success: true,
        message: `Idea ${status} successfully`,
        data: { idea }
      });
    } catch (error) {
      console.error('Error reviewing idea:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to review idea'
      });
    }
  }
);

// Get incubator statistics
router.get('/statistics', authenticateToken, authorizeRoles('incubator_manager'), async (req, res) => {
  try {
    const incubatorId = req.user.incubator_id;
    
    const stats = await Promise.all([
      User.count({ where: { incubator_id: incubatorId, role: 'incubator_manager' } }),
      User.count({ where: { incubator_id: incubatorId, role: 'startup_owner' } }),
      Idea.count({ where: { incubator_id: incubatorId } }),
      Idea.count({ where: { incubator_id: incubatorId, status: 'endorsed' } }),
      Idea.count({ where: { incubator_id: incubatorId, status: 'incubated' } }),
      Idea.count({ where: { incubator_id: incubatorId, status: 'rejected' } })
    ]);

    // Get incubator capacity info
    const incubator = await Incubator.findByPk(incubatorId);
    const occupancyRate = incubator.capacity ? (incubator.current_occupancy / incubator.capacity) * 100 : 0;

    res.json({
      success: true,
      data: {
        total_managers: stats[0],
        total_startups: stats[1],
        total_ideas: stats[2],
        endorsed_ideas: stats[3],
        incubated_ideas: stats[4],
        rejected_ideas: stats[5],
        capacity: incubator.capacity,
        current_occupancy: incubator.current_occupancy,
        occupancy_rate: Math.round(occupancyRate * 100) / 100,
        funding_available: incubator.funding_available
      }
    });
  } catch (error) {
    console.error('Error fetching incubator statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incubator statistics'
    });
  }
});

// Get colleges in incubator's area
router.get('/colleges', authenticateToken, authorizeRoles('incubator_manager', 'admin', 'super_admin'), async (req, res) => {
  try {
    const incubator = await Incubator.findByPk(req.user.incubator_id);
    if (!incubator) {
      return res.status(404).json({
        success: false,
        message: 'Incubator not found'
      });
    }

    // Get all colleges (removed location filtering for now)
    const colleges = await College.findAll({
      attributes: ['id', 'name', 'city', 'state', 'district', 'country'],
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id'],
          where: { role: 'student' },
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    console.log(`Found ${colleges.length} colleges for incubator manager`);

    // Calculate college statistics
    const collegesWithStats = await Promise.all(colleges.map(async (college) => {
      const totalStudents = await User.count({
        where: { college_id: college.id, role: 'student' }
      });

      const totalIdeas = await Idea.count({
        where: { college_id: college.id }
      });

      const endorsedIdeas = await Idea.count({
        where: { college_id: college.id, status: 'endorsed' }
      });

      const incubatedIdeas = await Idea.count({
        where: { college_id: college.id, status: 'incubated' }
      });

      return {
        ...college.toJSON(),
        total_students: totalStudents,
        total_ideas: totalIdeas,
        endorsed_ideas: endorsedIdeas,
        incubated_ideas: incubatedIdeas
      };
    }));

    res.json({
      success: true,
      data: { colleges: collegesWithStats }
    });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch colleges'
    });
  }
});

// Update incubator occupancy
router.put('/occupancy', 
  authenticateToken, 
  authorizeRoles('incubator_manager'),
  [
    body('current_occupancy').isInt({ min: 0 }).withMessage('Current occupancy must be a non-negative integer')
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

      const incubator = await Incubator.findByPk(req.user.incubator_id);
      if (!incubator) {
        return res.status(404).json({
          success: false,
          message: 'Incubator not found'
        });
      }

      const { current_occupancy } = req.body;

      // Check if occupancy doesn't exceed capacity
      if (incubator.capacity && current_occupancy > incubator.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Current occupancy cannot exceed incubator capacity'
        });
      }

      await incubator.update({ current_occupancy });

      res.json({
        success: true,
        message: 'Occupancy updated successfully',
        data: { incubator }
      });
    } catch (error) {
      console.error('Error updating occupancy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update occupancy'
      });
    }
  }
);

module.exports = router;
