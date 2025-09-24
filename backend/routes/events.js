const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Event, User, College, Incubator } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events (with filtering and pagination)
// @access  Private
router.get('/', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('type').optional().isString().withMessage('Type must be a string'),
  query('college_id').optional().isInt().withMessage('College ID must be a valid integer'),
  query('incubator_id').optional().isInt().withMessage('Incubator ID must be a valid integer'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('filter').optional().isIn(['latest', 'upcoming', 'past']).withMessage('Filter must be latest, upcoming, or past'),
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
      type,
      college_id,
      incubator_id,
      search,
      filter,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters based on user role
    if (req.user.role === 'student') {
      // Students can see events from their college OR incubator events
      whereClause[require('sequelize').Op.or] = [
        { college_id: req.user.college_id },
        { incubator_id: { [require('sequelize').Op.ne]: null } } // Show incubator events to all students
      ];
    } else if (req.user.role === 'college_admin') {
      // College admins can see events from their college OR incubator events
      whereClause[require('sequelize').Op.or] = [
        { college_id: req.user.college_id },
        { incubator_id: { [require('sequelize').Op.ne]: null } } // Show incubator events to all college admins
      ];
    } else if (req.user.role === 'incubator_manager') {
      // Incubator managers can see events from their incubator
      whereClause.incubator_id = req.user.incubator_id;
    }

    console.log('🔍 Event filtering for role:', req.user.role);
    console.log('🔍 Where clause before additional filters:', JSON.stringify(whereClause, null, 2));

    // Apply additional filters (but don't override the role-based OR clause)
    const additionalFilters = {};
    if (status) additionalFilters.status = status;
    if (type) additionalFilters.event_type = type;
    if (college_id) additionalFilters.college_id = college_id;
    if (incubator_id) additionalFilters.incubator_id = incubator_id;
    
    // Apply time-based filters
    const now = new Date();
    if (filter === 'latest') {
      // Show events created in the last 7 days, ordered by creation date
      additionalFilters.created_at = {
        [require('sequelize').Op.gte]: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      };
    } else if (filter === 'upcoming') {
      // Show events that start in the future
      additionalFilters.start_date = {
        [require('sequelize').Op.gte]: now
      };
    } else if (filter === 'past') {
      // Show events that have already ended
      additionalFilters.end_date = {
        [require('sequelize').Op.lt]: now
      };
    }

    // Combine role-based filtering with additional filters
    if (Object.keys(additionalFilters).length > 0) {
      if (whereClause[require('sequelize').Op.or]) {
        whereClause[require('sequelize').Op.and] = [
          whereClause[require('sequelize').Op.or],
          additionalFilters
        ];
        delete whereClause[require('sequelize').Op.or];
      } else {
        Object.assign(whereClause, additionalFilters);
      }
    }

    // Search functionality
    if (search) {
      const searchCondition = {
        [require('sequelize').Op.or]: [
          { title: { [require('sequelize').Op.like]: `%${search}%` } },
          { description: { [require('sequelize').Op.like]: `%${search}%` } },
          { location: { [require('sequelize').Op.like]: `%${search}%` } }
        ]
      };
      
      if (whereClause[require('sequelize').Op.and]) {
        whereClause[require('sequelize').Op.and].push(searchCondition);
      } else if (whereClause[require('sequelize').Op.or]) {
        whereClause[require('sequelize').Op.and] = [
          whereClause[require('sequelize').Op.or],
          searchCondition
        ];
        delete whereClause[require('sequelize').Op.or];
      } else {
        Object.assign(whereClause, searchCondition);
      }
    }

    console.log('🔍 Final where clause:', JSON.stringify(whereClause, null, 2));

    // Get events from database
    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'district'],
          required: false // LEFT JOIN to include events without college
        }
      ],
      order: [['created_at', 'DESC'], ['start_date', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        events: events,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get events',
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Private
router.get('/:id', [
  authenticateToken,
], async (req, res) => {
  try {
    const { id } = req.params;

    // Get event from database
    const event = await Event.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      data: {
        event,
      },
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event',
    });
  }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private (College Admin, Incubator Manager, Admin)
router.post('/', [
  authenticateToken,
  authorizeRoles('college_admin', 'incubator_manager', 'admin'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Description must be between 1 and 2000 characters'),
  body('type').isIn(['workshop', 'seminar', 'competition', 'networking', 'conference', 'webinar', 'ideathon', 'guest_lecture', 'panel_discussion', 'hackathon', 'award_ceremony', 'training', 'other']).withMessage('Invalid event type'),
  body('start_date').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('end_date').isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  body('location').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Location must be between 1 and 200 characters'),
  body('max_participants').optional().isInt({ min: 1, max: 1000 }).withMessage('Max participants must be between 1 and 1000'),
], async (req, res) => {
  try {
    console.log('🔍 Event creation request:', {
      user: req.user ? {
        id: req.user.id,
        role: req.user.role,
        college_id: req.user.college_id,
        email: req.user.email
      } : 'No user',
      body: req.body
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      title,
      description = 'No description provided',
      type,
      start_date,
      end_date,
      location = 'TBD',
      max_participants = 100,
      is_online = false,
      meeting_link,
      registration_deadline
    } = req.body;

    // Get the primary incubator ID for events
    let incubatorId = req.user.incubator_id;
    if (!incubatorId) {
      // If user doesn't have incubator_id, get the primary incubator
      const { Incubator } = require('../models');
      const primaryIncubator = await Incubator.findOne({
        where: { name: 'SGBAU Innovation Hub' }
      });
      if (primaryIncubator) {
        incubatorId = primaryIncubator.id;
        console.log('🔧 Using primary incubator ID:', incubatorId);
      }
    }

    // Create event in database
    console.log('🔍 Creating event with data:', {
      title,
      description,
      event_type: type,
      start_date,
      end_date,
      location,
      max_participants,
      college_id: req.user.college_id,
      incubator_id: incubatorId,
      created_by: req.user.id
    });
    
    const event = await Event.create({
      title,
      description,
      event_type: type,
      status: 'published',
      start_date,
      end_date,
      location,
      is_online,
      meeting_link,
      max_participants,
      registration_deadline,
      current_participants: 0,
      college_id: req.user.college_id, // Can be null for incubator managers
      incubator_id: incubatorId, // Always set to primary incubator
      created_by: req.user.id,
      is_active: true
    });

    console.log('✅ Event created successfully with ID:', event.id);
    console.log('🔍 User college_id:', req.user.college_id);
    console.log('🔍 User role:', req.user.role);

    // Send notifications to students of the college
    if (req.user.college_id) {
      console.log('🔍 College ID exists, proceeding with notification creation...');
      try {
        const { Notification } = require('../models');
        const { User } = require('../models');
        
        // Get all students from the same college
        const students = await User.findAll({
          where: {
            role: 'student',
            college_id: req.user.college_id,
            is_active: true
          },
          attributes: ['id']
        });

        // Create notifications for each student
        const notifications = students.map(student => ({
          user_id: student.id,
          type: 'info', // Use valid notification type
          title: 'New Event Created',
          message: `A new event "${title}" has been created by your college. Check it out!`,
          data: JSON.stringify({
            event_id: event.id,
            event_title: title,
            event_type: type,
            start_date: start_date,
            notification_type: 'event_created' // Store the specific type in data
          }),
          is_read: false,
          created_at: new Date(),
          updated_at: new Date()
        }));

        console.log(`🔍 Found ${students.length} students to notify`);
        console.log(`🔍 Notification data sample:`, notifications[0]);
        
        if (notifications.length > 0) {
          try {
            // Create notifications one by one to catch any errors
            let successCount = 0;
            for (const notificationData of notifications) {
              try {
                console.log(`🔍 Creating notification for user ${notificationData.user_id}...`);
                const createdNotification = await Notification.create(notificationData);
                console.log(`✅ Notification created with ID: ${createdNotification.id}`);
                successCount++;
              } catch (createError) {
                console.error('❌ Error creating notification for user', notificationData.user_id, ':', createError.message);
                console.error('❌ Error details:', createError);
              }
            }
            console.log(`✅ Notifications sent to ${successCount} out of ${notifications.length} students`);
          } catch (bulkError) {
            console.error('❌ Bulk notification creation failed:', bulkError.message);
            console.error('❌ Bulk error details:', bulkError);
          }
        } else {
          console.log('⚠️ No students found to notify');
        }
      } catch (notificationError) {
        console.error('❌ Error sending notifications:', notificationError);
        // Don't fail the event creation if notifications fail
      }
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event,
      },
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message,
    });
  }
});

module.exports = router;
