const express = require('express');
const { param, query, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { User, College, Event, Idea } = require('../models');

const router = express.Router();

// ==================== STUDENT EVENTS ====================

// @route   GET /api/student-events
// @desc    Get events for student's college
// @access  Private (student)
router.get('/', [
  authenticateToken,
  authorizeRoles('student'),
], async (req, res) => {
  try {
    const studentId = req.user.id;
    const collegeId = req.user.college_id;

    // Get student's college events
    const events = await Event.findAll({
      where: { 
        college_id: collegeId,
        is_active: true
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC'], ['start_date', 'ASC']]
    });

    // Get upcoming events (next 30 days)
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.start_date);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      return eventDate >= now && eventDate <= thirtyDaysFromNow;
    });

    // Get past events (last 30 days)
    const pastEvents = events.filter(event => {
      const eventDate = new Date(event.start_date);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      return eventDate >= thirtyDaysAgo && eventDate < now;
    });

    res.json({
      success: true,
      data: {
        allEvents: events,
        upcomingEvents,
        pastEvents,
        totalEvents: events.length
      }
    });
  } catch (error) {
    console.error('Get student events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get events'
    });
  }
});

// @route   GET /api/student-events/:id
// @desc    Get specific event details
// @access  Private (student)
router.get('/:id', [
  authenticateToken,
  authorizeRoles('student'),
  param('id').isInt().withMessage('Event ID must be a valid integer'),
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

    const event = await Event.findOne({
      where: { 
        id: id,
        college_id: collegeId,
        is_active: true
      },
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
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event details'
    });
  }
});

// @route   GET /api/student-events/upcoming
// @desc    Get upcoming events for student
// @access  Private (student)
router.get('/upcoming', [
  authenticateToken,
  authorizeRoles('student'),
], async (req, res) => {
  try {
    const collegeId = req.user.college_id;
    const now = new Date();

    const upcomingEvents = await Event.findAll({
      where: { 
        college_id: collegeId,
        is_active: true,
        start_date: { [require('sequelize').Op.gte]: now }
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC'], ['start_date', 'ASC']],
      limit: 10
    });

    res.json({
      success: true,
      data: upcomingEvents
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upcoming events'
    });
  }
});

// @route   GET /api/student-events/calendar
// @desc    Get events for calendar view
// @access  Private (student)
router.get('/calendar', [
  authenticateToken,
  authorizeRoles('student'),
  query('start').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('end').optional().isISO8601().withMessage('End date must be valid ISO date'),
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

    const { start, end } = req.query;
    const collegeId = req.user.college_id;

    let whereClause = {
      college_id: collegeId,
      is_active: true
    };

    if (start && end) {
      whereClause.start_date = {
        [require('sequelize').Op.between]: [new Date(start), new Date(end)]
      };
    }

    const events = await Event.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC'], ['start_date', 'ASC']]
    });

    // Format events for calendar
    const calendarEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start_date,
      end: event.end_date || event.start_date,
      description: event.description,
      location: event.location,
      is_online: event.is_online,
      meeting_link: event.meeting_link,
      event_type: event.event_type,
      status: event.status
    }));

    res.json({
      success: true,
      data: calendarEvents
    });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get calendar events'
    });
  }
});

module.exports = router;
