const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { User, College, Message, Conversation } = require('../models');

const router = express.Router();

// ==================== CONVERSATIONS ====================

// @route   GET /api/chat/conversations
// @desc    Get all conversations for the user
// @access  Private
router.get('/conversations', [
  authenticateToken,
], async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let conversations;

    if (userRole === 'student') {
      // Students can see conversations with their college admin
      conversations = await Conversation.findAll({
        where: {
          [require('sequelize').Op.or]: [
            { student_id: userId },
            { college_admin_id: userId }
          ]
        },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'email', 'profile_image_url']
          },
          {
            model: User,
            as: 'college_admin',
            attributes: ['id', 'name', 'email', 'profile_image_url']
          },
          {
            model: Message,
            as: 'lastMessage',
            attributes: ['id', 'content', 'created_at', 'sender_id'],
            include: [{
              model: User,
              as: 'sender',
              attributes: ['id', 'name']
            }]
          }
        ],
        order: [['updated_at', 'DESC']]
      });
    } else if (userRole === 'college_admin') {
      // College admins can see conversations with students from their college
      conversations = await Conversation.findAll({
        where: { college_admin_id: userId },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'email', 'profile_image_url']
          },
          {
            model: User,
            as: 'college_admin',
            attributes: ['id', 'name', 'email', 'profile_image_url']
          },
          {
            model: Message,
            as: 'lastMessage',
            attributes: ['id', 'content', 'created_at', 'sender_id'],
            include: [{
              model: User,
              as: 'sender',
              attributes: ['id', 'name']
            }]
          }
        ],
        order: [['updated_at', 'DESC']]
      });
    }

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations'
    });
  }
});

// @route   POST /api/chat/conversations
// @desc    Create a new conversation
// @access  Private
router.post('/conversations', [
  authenticateToken,
  body('student_id').isInt().withMessage('Student ID must be a valid integer'),
  body('subject').optional().isString().withMessage('Subject must be a string'),
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

    const { student_id, subject } = req.body;
    const collegeAdminId = req.user.id;

    // Check if student exists and belongs to the same college
    const student = await User.findOne({
      where: { 
        id: student_id,
        role: 'student',
        college_id: req.user.college_id
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or not in your college'
      });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      where: {
        student_id: student_id,
        college_admin_id: collegeAdminId
      }
    });

    if (existingConversation) {
      return res.status(400).json({
        success: false,
        message: 'Conversation already exists with this student'
      });
    }

    // Create conversation
    const conversation = await Conversation.create({
      student_id: student_id,
      college_admin_id: collegeAdminId,
      subject: subject || 'General Discussion',
      status: 'active'
    });

    // Get the conversation with includes
    const newConversation = await Conversation.findByPk(conversation.id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'profile_image_url']
        },
        {
          model: User,
          as: 'college_admin',
          attributes: ['id', 'name', 'email', 'profile_image_url']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Conversation created successfully',
      data: newConversation
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
});

// ==================== MESSAGES ====================

// @route   GET /api/chat/conversations/:id/messages
// @desc    Get messages for a conversation
// @access  Private
router.get('/conversations/:id/messages', [
  authenticateToken,
  param('id').isInt().withMessage('Conversation ID must be a valid integer'),
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
    const userId = req.user.id;

    // Check if user has access to this conversation
    const conversation = await Conversation.findOne({
      where: {
        id: id,
        [require('sequelize').Op.or]: [
          { student_id: userId },
          { college_admin_id: userId }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Get messages
    const messages = await Message.findAll({
      where: { conversation_id: id },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'profile_image_url']
      }],
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
});

// @route   POST /api/chat/conversations/:id/messages
// @desc    Send a message in a conversation
// @access  Private
router.post('/conversations/:id/messages', [
  authenticateToken,
  param('id').isInt().withMessage('Conversation ID must be a valid integer'),
  body('content').notEmpty().withMessage('Message content is required'),
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
    const { content } = req.body;
    const senderId = req.user.id;

    // Check if user has access to this conversation
    const conversation = await Conversation.findOne({
      where: {
        id: id,
        [require('sequelize').Op.or]: [
          { student_id: senderId },
          { college_admin_id: senderId }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Create message
    const message = await Message.create({
      conversation_id: id,
      sender_id: senderId,
      content: content,
      message_type: 'text'
    });

    // Update conversation timestamp
    await conversation.update({ updated_at: new Date() });

    // Get the message with sender info
    const newMessage = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'profile_image_url']
      }]
    });

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// ==================== STUDENTS FOR CHAT ====================

// @route   GET /api/chat/students
// @desc    Get students for college admin to start conversations
// @access  Private (college_admin)
router.get('/students', [
  authenticateToken,
  authorizeRoles('college_admin'),
], async (req, res) => {
  try {
    const collegeId = req.user.college_id;

    const students = await User.findAll({
      where: {
        role: 'student',
        college_id: collegeId,
        is_active: true
      },
      attributes: ['id', 'name', 'email', 'profile_image_url', 'created_at'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get students'
    });
  }
});

module.exports = router;