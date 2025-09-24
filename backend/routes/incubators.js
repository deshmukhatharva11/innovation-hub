const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Incubator, User, Idea } = require('../models');
const { body, validationResult } = require('express-validator');

// Get all incubators (Super Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const incubators = await Incubator.findAll({
      include: [
        {
          model: User,
          as: 'managers',
          attributes: ['id', 'name', 'email', 'role', 'is_active'],
          where: { role: 'incubator_manager' },
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate stats for each incubator
    const incubatorsWithStats = await Promise.all(incubators.map(async (incubator) => {
      const totalManagers = await User.count({
        where: { incubator_id: incubator.id, role: 'incubator_manager' }
      });

      const totalIdeas = await Idea.count({
        where: { incubator_id: incubator.id }
      });

      const incubatedIdeas = await Idea.count({
        where: { incubator_id: incubator.id, status: 'incubated' }
      });

      return {
        ...incubator.toJSON(),
        total_managers: totalManagers,
        total_ideas: totalIdeas,
        incubated_ideas: incubatedIdeas
      };
    }));

    res.json({
      success: true,
      data: { incubators: incubatorsWithStats }
    });
  } catch (error) {
    console.error('Error fetching incubators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incubators'
    });
  }
});

// Get incubator by ID
router.get('/:id', authenticateToken, authorizeRoles('admin', 'incubator_manager', 'super_admin'), async (req, res) => {
  try {
    const incubator = await Incubator.findByPk(req.params.id, {
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

// Create new incubator (Super Admin only)
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin'),
  [
    body('name').notEmpty().withMessage('Incubator name is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('contact_email').isEmail().withMessage('Valid contact email is required'),
    body('funding_available').optional().isNumeric().withMessage('Funding must be a number'),
    body('capacity').optional().isNumeric().withMessage('Capacity must be a number')
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

      const incubator = await Incubator.create({
        name: req.body.name,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country || 'India',
        address: req.body.address,
        phone: req.body.phone,
        contact_email: req.body.contact_email,
        website: req.body.website,
        established_year: req.body.established_year,
        description: req.body.description,
        focus_areas: req.body.focus_areas || [],
        funding_available: req.body.funding_available || 0,
        capacity: req.body.capacity || 0,
        is_active: req.body.is_active !== undefined ? req.body.is_active : true
      });

      res.status(201).json({
        success: true,
        message: 'Incubator created successfully',
        data: { incubator }
      });
    } catch (error) {
      console.error('Error creating incubator:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create incubator'
      });
    }
  }
);

// Update incubator (Super Admin only)
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('admin'),
  [
    body('name').optional().notEmpty().withMessage('Incubator name cannot be empty'),
    body('contact_email').optional().isEmail().withMessage('Valid contact email is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('funding_available').optional().isNumeric().withMessage('Funding must be a number'),
    body('capacity').optional().isNumeric().withMessage('Capacity must be a number')
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

      const incubator = await Incubator.findByPk(req.params.id);
      if (!incubator) {
        return res.status(404).json({
          success: false,
          message: 'Incubator not found'
        });
      }

      await incubator.update(req.body);

      res.json({
        success: true,
        message: 'Incubator updated successfully',
        data: { incubator }
      });
    } catch (error) {
      console.error('Error updating incubator:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update incubator'
      });
    }
  }
);

// Delete incubator (Super Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const incubator = await Incubator.findByPk(req.params.id);
    if (!incubator) {
      return res.status(404).json({
        success: false,
        message: 'Incubator not found'
      });
    }

    // Check if incubator has users
    const userCount = await User.count({ where: { incubator_id: incubator.id } });
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete incubator with existing users'
      });
    }

    await incubator.destroy();

    res.json({
      success: true,
      message: 'Incubator deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting incubator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete incubator'
    });
  }
});

// Get incubator statistics
router.get('/:id/stats', authenticateToken, authorizeRoles('admin', 'incubator_manager'), async (req, res) => {
  try {
    const incubatorId = req.params.id;
    
    const stats = await Promise.all([
      User.count({ where: { incubator_id: incubatorId, role: 'incubator_manager' } }),
      User.count({ where: { incubator_id: incubatorId, role: 'startup_owner' } }),
      Idea.count({ where: { incubator_id: incubatorId } }),
      Idea.count({ where: { incubator_id: incubatorId, status: 'endorsed' } }),
      Idea.count({ where: { incubator_id: incubatorId, status: 'incubated' } }),
      Idea.count({ where: { incubator_id: incubatorId, status: 'rejected' } })
    ]);

    res.json({
      success: true,
      data: {
        total_managers: stats[0],
        total_startups: stats[1],
        total_ideas: stats[2],
        endorsed_ideas: stats[3],
        incubated_ideas: stats[4],
        rejected_ideas: stats[5]
      }
    });
  } catch (error) {
    console.error('Error fetching incubator stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incubator statistics'
    });
  }
});

module.exports = router;
