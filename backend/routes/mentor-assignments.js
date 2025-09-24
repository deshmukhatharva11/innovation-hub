const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { MentorAssignment, Mentor, User, Idea, College, Incubator, Notification, MentorChat } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// Assign mentor to idea (by college admin or incubator manager)
router.post('/assign', authenticateToken, authorizeRoles('college_admin', 'incubator_manager', 'admin'), async (req, res) => {
  try {
    console.log('🔍 Mentor assignment request:', {
      userRole: req.user?.role,
      userId: req.user?.id,
      collegeId: req.user?.college_id,
      body: req.body
    });

    const {
      idea_id,
      mentor_id,
      assignment_type = 'college',
      assignment_reason
    } = req.body;

    const assignedBy = req.user.id;

    // Get idea details
    const idea = await Idea.findByPk(idea_id, {
      include: [
        { model: User, as: 'student' },
        { model: College, as: 'college' }
      ]
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    // Check if idea is in appropriate phase for mentor assignment
    if (!['nurture', 'needs_development', 'endorsed'].includes(idea.status)) {
      return res.status(400).json({
        success: false,
        message: 'Mentor can only be assigned to ideas in nurture, needs_development, or endorsed phase'
      });
    }

    // Get mentor details
    const mentor = await Mentor.findByPk(mentor_id, {
      include: [
        { model: College, as: 'college' },
        { model: Incubator, as: 'incubator' }
      ]
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // Check if mentor is available
    if (!mentor.isAvailable()) {
      return res.status(400).json({
        success: false,
        message: 'Mentor is not available for new assignments'
      });
    }

    // Check if mentor is already assigned to this idea
    const existingAssignment = await MentorAssignment.findOne({
      where: {
        idea_id,
        mentor_id,
        student_id: idea.student_id,
        is_active: true
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Mentor is already assigned to this idea'
      });
    }

    // Create mentor assignment
    const assignment = await MentorAssignment.create({
      idea_id,
      mentor_id,
      student_id: idea.student_id,
      assignment_type,
      assigned_by: assignedBy,
      assignment_reason,
      status: 'pending',
      start_date: new Date()
    });

    // Update mentor's current students count
    await mentor.update({
      current_students: mentor.current_students + 1
    });

    // Create mentor chat
    const chat = await MentorChat.create({
      idea_id,
      mentor_id,
      student_id: idea.student_id,
      assignment_id: assignment.id,
      chat_type: 'idea_mentoring',
      status: 'active'
    });

    // Send notifications
    try {
      // Notify student
      await Notification.create({
        user_id: idea.student_id,
        type: 'info',
        title: 'Mentor Assigned',
        message: `A mentor has been assigned to your idea "${idea.title}". You can now communicate with them through the chat system.`,
        data: JSON.stringify({
          idea_id: idea.id,
          mentor_id: mentor.id,
          assignment_id: assignment.id,
          chat_id: chat.id,
          notification_type: 'mentor_assigned'
        }),
        is_read: false
      });

      // Notify mentor
      await Notification.create({
        user_id: mentor.id,
        type: 'info',
        title: 'New Assignment',
        message: `You have been assigned to mentor the idea "${idea.title}" by ${idea.student.name}.`,
        data: JSON.stringify({
          idea_id: idea.id,
          student_id: idea.student_id,
          assignment_id: assignment.id,
          chat_id: chat.id,
          notification_type: 'mentor_assignment'
        }),
        is_read: false
      });
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'Mentor assigned successfully',
      data: {
        assignment: {
          id: assignment.id,
          idea: {
            id: idea.id,
            title: idea.title,
            student: idea.student
          },
          mentor: {
            id: mentor.id,
            name: mentor.name,
            specialization: mentor.specialization
          },
          assignment_type,
          status: assignment.status,
          chat_id: chat.id
        }
      }
    });
  } catch (error) {
    console.error('Assign mentor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign mentor',
      error: error.message
    });
  }
});

// Get assignments for an idea
router.get('/idea/:ideaId', authenticateToken, async (req, res) => {
  try {
    const { ideaId } = req.params;
    const userRole = req.user.role;

    // Check permissions
    if (userRole === 'student') {
      // Students can only see assignments for their own ideas
      const idea = await Idea.findOne({
        where: { id: ideaId, student_id: req.user.id }
      });
      if (!idea) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const assignments = await MentorAssignment.findAll({
      where: { idea_id: ideaId, is_active: true },
      include: [
        { model: Mentor, as: 'mentor' },
        { model: User, as: 'student' },
        { model: User, as: 'assignedBy' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { assignments }
    });
  } catch (error) {
    console.error('Get idea assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
});

// Get assignments for a student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userRole = req.user.role;

    // Check permissions
    if (userRole === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const assignments = await MentorAssignment.findAll({
      where: { student_id: studentId, is_active: true },
      include: [
        { 
          model: Idea, 
          as: 'idea',
          include: [
            { model: User, as: 'student' },
            { model: College, as: 'college' }
          ]
        },
        { model: Mentor, as: 'mentor' },
        { model: User, as: 'assignedBy' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { assignments }
    });
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
});

// Get assignments for a mentor
router.get('/mentor/:mentorId', authenticateToken, async (req, res) => {
  try {
    const { mentorId } = req.params;
    const userRole = req.user.role;

    // Check permissions
    if (userRole === 'mentor' && req.user.id !== parseInt(mentorId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const assignments = await MentorAssignment.findAll({
      where: { mentor_id: mentorId, is_active: true },
      include: [
        { 
          model: Idea, 
          as: 'idea',
          include: [
            { model: User, as: 'student' },
            { model: College, as: 'college' }
          ]
        },
        { model: User, as: 'student' },
        { model: User, as: 'assignedBy' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { assignments }
    });
  } catch (error) {
    console.error('Get mentor assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
});

// Update assignment status
router.put('/:assignmentId/status', authenticateToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status, notes, rating } = req.body;
    const userRole = req.user.role;

    const assignment = await MentorAssignment.findByPk(assignmentId, {
      include: [
        { model: Idea, as: 'idea' },
        { model: Mentor, as: 'mentor' },
        { model: User, as: 'student' }
      ]
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check permissions
    if (userRole === 'mentor' && assignment.mentor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'student' && assignment.student_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update assignment
    const updateData = { status };
    if (notes) updateData.mentor_notes = notes;
    if (rating) updateData.rating = rating;

    if (status === 'completed' || status === 'terminated') {
      updateData.end_date = new Date();
    }

    await assignment.update(updateData);

    // If completing assignment, update mentor's student count
    if (status === 'completed' || status === 'terminated') {
      const mentor = await Mentor.findByPk(assignment.mentor_id);
      if (mentor && mentor.current_students > 0) {
        await mentor.update({
          current_students: mentor.current_students - 1
        });
      }
    }

    res.json({
      success: true,
      message: 'Assignment status updated successfully',
      data: { assignment }
    });
  } catch (error) {
    console.error('Update assignment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment status',
      error: error.message
    });
  }
});

// Get available mentors for assignment
router.get('/available-mentors', authenticateToken, authorizeRoles('college_admin', 'incubator_manager', 'admin'), async (req, res) => {
  try {
    const { 
      college_id, 
      district, 
      specialization, 
      mentor_type = 'college',
      idea_id 
    } = req.query;

    // Get idea details to determine requirements
    let idea = null;
    if (idea_id) {
      idea = await Idea.findByPk(idea_id, {
        include: [{ model: College, as: 'college' }]
      });
    }

    const whereClause = {
      is_active: true,
      is_verified: true,
      availability: 'available'
    };

    // Filter by mentor type
    if (mentor_type === 'college') {
      whereClause.mentor_type = 'college';
      if (college_id) whereClause.college_id = college_id;
    } else if (mentor_type === 'incubator') {
      whereClause.mentor_type = 'incubator';
    } else if (mentor_type === 'independent') {
      whereClause.mentor_type = 'independent';
    }

    // Filter by district
    if (district) {
      whereClause.district = district;
    } else if (idea && idea.college && idea.college.district) {
      whereClause.district = idea.college.district;
    }

    // Filter by specialization
    if (specialization) {
      whereClause.specialization = { [Op.like]: `%${specialization}%` };
    }

    const mentors = await Mentor.findAll({
      where: whereClause,
      include: [
        { model: College, as: 'college' },
        { model: Incubator, as: 'incubator' }
      ],
      order: [['rating', 'DESC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { mentors }
    });
  } catch (error) {
    console.error('Get available mentors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available mentors',
      error: error.message
    });
  }
});

// Request mentor assignment (by student)
router.post('/request', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { idea_id, mentor_id, message } = req.body;
    const studentId = req.user.id;

    // Get idea details
    const idea = await Idea.findByPk(idea_id, {
      include: [
        { model: User, as: 'student' },
        { model: College, as: 'college' }
      ]
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    // Check if idea belongs to student
    if (idea.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if idea is in appropriate phase for mentor assignment
    if (!['nurture', 'needs_development', 'endorsed'].includes(idea.status)) {
      return res.status(400).json({
        success: false,
        message: 'Mentor can only be requested for ideas in nurture, needs_development, or endorsed phase'
      });
    }

    // Get mentor details
    const mentor = await Mentor.findByPk(mentor_id, {
      include: [
        { model: College, as: 'college' },
        { model: Incubator, as: 'incubator' }
      ]
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // Check if mentor is available
    if (!mentor.isAvailable()) {
      return res.status(400).json({
        success: false,
        message: 'Mentor is not available for new assignments'
      });
    }

    // Check if mentor is already assigned to this idea
    const existingAssignment = await MentorAssignment.findOne({
      where: {
        idea_id,
        mentor_id,
        student_id: studentId,
        is_active: true
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Mentor is already assigned to this idea'
      });
    }

    // Create assignment request
    const assignment = await MentorAssignment.create({
      idea_id,
      mentor_id,
      student_id: studentId,
      assignment_type: 'independent',
      assigned_by: studentId,
      assignment_reason: message || 'Student requested mentor assignment',
      status: 'pending'
    });

    // Send notification to mentor
    try {
      await Notification.create({
        user_id: mentor.id,
        type: 'info',
        title: 'Mentor Assignment Request',
        message: `Student ${idea.student.name} has requested you to mentor their idea "${idea.title}". Please review and accept if you're available.`,
        data: JSON.stringify({
          idea_id: idea.id,
          student_id: studentId,
          assignment_id: assignment.id,
          notification_type: 'mentor_request'
        }),
        is_read: false
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'Mentor assignment request sent successfully',
      data: { assignment }
    });
  } catch (error) {
    console.error('Request mentor assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request mentor assignment',
      error: error.message
    });
  }
});

// Accept/Reject mentor assignment request
router.put('/:assignmentId/respond', authenticateToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { action, message } = req.body; // action: 'accept' or 'reject'
    const mentorId = req.user.id;

    const assignment = await MentorAssignment.findByPk(assignmentId, {
      include: [
        { model: Idea, as: 'idea' },
        { model: User, as: 'student' },
        { model: Mentor, as: 'mentor' }
      ]
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if mentor owns this assignment
    if (assignment.mentor_id !== mentorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if assignment is pending
    if (assignment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Assignment is not pending'
      });
    }

    if (action === 'accept') {
      // Accept assignment
      await assignment.update({
        status: 'active',
        start_date: new Date()
      });

      // Update mentor's student count
      const mentor = await Mentor.findByPk(mentorId);
      await mentor.update({
        current_students: mentor.current_students + 1
      });

      // Create mentor chat
      const chat = await MentorChat.create({
        idea_id: assignment.idea_id,
        mentor_id: mentorId,
        student_id: assignment.student_id,
        assignment_id: assignment.id,
        chat_type: 'idea_mentoring',
        status: 'active'
      });

      // Send notification to student
      try {
        await Notification.create({
          user_id: assignment.student_id,
          type: 'success',
          title: 'Mentor Assignment Accepted',
          message: `Your mentor assignment request has been accepted. You can now communicate with your mentor through the chat system.`,
          data: JSON.stringify({
            idea_id: assignment.idea_id,
            mentor_id: mentorId,
            assignment_id: assignment.id,
            chat_id: chat.id,
            notification_type: 'mentor_accepted'
          }),
          is_read: false
        });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      res.json({
        success: true,
        message: 'Assignment accepted successfully',
        data: { 
          assignment,
          chat_id: chat.id
        }
      });
    } else if (action === 'reject') {
      // Reject assignment
      await assignment.update({
        status: 'terminated',
        assignment_reason: message || 'Assignment rejected by mentor'
      });

      // Send notification to student
      try {
        await Notification.create({
          user_id: assignment.student_id,
          type: 'warning',
          title: 'Mentor Assignment Rejected',
          message: `Your mentor assignment request has been rejected. You can request another mentor.`,
          data: JSON.stringify({
            idea_id: assignment.idea_id,
            mentor_id: mentorId,
            assignment_id: assignment.id,
            notification_type: 'mentor_rejected'
          }),
          is_read: false
        });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      res.json({
        success: true,
        message: 'Assignment rejected successfully',
        data: { assignment }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "accept" or "reject"'
      });
    }
  } catch (error) {
    console.error('Respond to assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to assignment',
      error: error.message
    });
  }
});

module.exports = router;
