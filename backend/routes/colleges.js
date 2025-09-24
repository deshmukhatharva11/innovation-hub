const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { College, User, Idea } = require('../models');
const { body, validationResult } = require('express-validator');

// Get all colleges (Super Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const colleges = await College.findAll({
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'email', 'role', 'is_active'],
          where: { role: { [require('sequelize').Op.in]: ['student', 'college_admin'] } },
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate stats for each college
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

      return {
        ...college.toJSON(),
        total_students: totalStudents,
        total_ideas: totalIdeas,
        endorsed_ideas: endorsedIdeas
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

// Get all colleges for public registration (no auth required)
router.get('/public', async (req, res) => {
  try {
    const { district } = req.query;
    console.log('Public colleges API called with district:', district);
    
    let whereClause = { is_active: true };
    if (district) {
      whereClause.district = district;
    }
    
    console.log('Where clause:', whereClause);

    const colleges = await College.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'city', 'state', 'district', 'country'],
      order: [['name', 'ASC']]
    });
    
    console.log('Found colleges:', colleges.length, 'for district:', district);

    res.json({
      success: true,
      data: { colleges }
    });
  } catch (error) {
    console.error('Error fetching public colleges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch colleges'
    });
  }
});

// Get college by ID
router.get('/:id', authenticateToken, authorizeRoles('admin', 'college_admin'), async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at']
        }
      ]
    });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    res.json({
      success: true,
      data: { college }
    });
  } catch (error) {
    console.error('Error fetching college:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch college'
    });
  }
});

// Create new college (Super Admin only)
router.post('/', 
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('name').notEmpty().withMessage('College name is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('contact_email').isEmail().withMessage('Valid contact email is required')
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

    const college = await College.create({
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
        is_active: req.body.is_active !== undefined ? req.body.is_active : true
    });

    res.status(201).json({
      success: true,
      message: 'College created successfully',
        data: { college }
    });
  } catch (error) {
      console.error('Error creating college:', error);
    res.status(500).json({
      success: false,
        message: 'Failed to create college'
      });
    }
  }
);

// Update college (Super Admin only)
router.put('/:id', 
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('name').optional().notEmpty().withMessage('College name cannot be empty'),
    body('contact_email').optional().isEmail().withMessage('Valid contact email is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required')
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

      const college = await College.findByPk(req.params.id);
    if (!college) {
      return res.status(404).json({
        success: false,
          message: 'College not found'
        });
      }

      await college.update(req.body);

    res.json({
      success: true,
      message: 'College updated successfully',
        data: { college }
    });
  } catch (error) {
      console.error('Error updating college:', error);
    res.status(500).json({
      success: false,
        message: 'Failed to update college'
      });
    }
  }
);

// Delete college (Super Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    // Check if college has users
    const userCount = await User.count({ where: { college_id: college.id } });
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete college with existing users'
      });
    }

    await college.destroy();

    res.json({
      success: true,
      message: 'College deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting college:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete college'
    });
  }
});

// Get college statistics
router.get('/:id/stats', authenticateToken, authorizeRoles('admin', 'college_admin'), async (req, res) => {
  try {
    const collegeId = req.params.id;
    
    const stats = await Promise.all([
      User.count({ where: { college_id: collegeId, role: 'student' } }),
      User.count({ where: { college_id: collegeId, role: 'college_admin' } }),
      Idea.count({ where: { college_id: collegeId } }),
      Idea.count({ where: { college_id: collegeId, status: 'submitted' } }),
      Idea.count({ where: { college_id: collegeId, status: 'endorsed' } }),
      Idea.count({ where: { college_id: collegeId, status: 'rejected' } })
    ]);

    res.json({
      success: true,
      data: {
        total_students: stats[0],
        total_admins: stats[1],
        total_ideas: stats[2],
        pending_ideas: stats[3],
        endorsed_ideas: stats[4],
        rejected_ideas: stats[5]
      }
    });
  } catch (error) {
    console.error('Error fetching college stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch college statistics'
    });
  }
});

module.exports = router;
