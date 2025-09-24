const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { User, Mentor, MentorChat, MentorChatMessage, College } = require('../models');

const router = express.Router();

// ==================== MENTOR CHAT CONVERSATIONS ====================

// @route   GET /api/mentor-chat/conversations
// @desc    Get all mentor conversations for the user
// @access  Private
router.get('/conversations', [
  authenticateToken,
], async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let conversations;

    if (userRole === 'student') {
      // Students can see conversations with their mentors
      conversations = await MentorChat.findAll({
        where: {
          student_id: userId
        },
        include: [
          {
            model: Mentor,
            as: 'mentor',
            attributes: ['id', 'name', 'email', 'specialization', 'bio'],
            include: [
              {
                model: College,
                as: 'college',
                attributes: ['id', 'name']
              }
            ]
          },
          {
            model: MentorChatMessage,
            as: 'messages',
            limit: 1,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'message', 'sender_type', 'created_at']
          }
        ],
        order: [['last_message_at', 'DESC']]
      });
    } else if (userRole === 'college_admin') {
      // College admins can see all mentor conversations in their college
      conversations = await MentorChat.findAll({
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'email', 'profile_image_url'],
            where: {
              college_id: req.user.college_id
            }
          },
          {
            model: Mentor,
            as: 'mentor',
            attributes: ['id', 'name', 'email', 'specialization'],
            include: [
              {
                model: College,
                as: 'college',
                attributes: ['id', 'name']
              }
            ]
          },
          {
            model: MentorChatMessage,
            as: 'messages',
            limit: 1,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'message', 'sender_type', 'created_at']
          }
        ],
        order: [['last_message_at', 'DESC']]
      });
    } else if (userRole === 'mentor') {
      // Mentors can see conversations with their assigned students
      // First, find the mentor record for this user
      const mentor = await Mentor.findOne({
        where: { email: req.user.email }
      });

      if (!mentor) {
        return res.status(404).json({
          success: false,
          message: 'Mentor profile not found'
        });
      }

      conversations = await MentorChat.findAll({
        where: {
          mentor_id: mentor.id
        },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'email', 'profile_image_url']
          },
          {
            model: MentorChatMessage,
            as: 'messages',
            limit: 1,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'message', 'sender_type', 'created_at']
          }
        ],
        order: [['last_message_at', 'DESC']]
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add unread message counts for each conversation
    const conversationsWithCounts = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await MentorChatMessage.count({
          where: {
            chat_id: conversation.id,
            sender_type: conversation.userRole === 'student' ? 'mentor' : 'student',
            is_read: false
          }
        });

        return {
          ...conversation.toJSON(),
          unread_count: unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: conversationsWithCounts
    });

  } catch (error) {
    console.error('Error fetching mentor conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// @route   GET /api/mentor-chat/conversations/:id/messages
// @desc    Get messages for a specific mentor conversation
// @access  Private
router.get('/conversations/:id/messages', [
  authenticateToken,
  param('id').isInt().withMessage('Valid conversation ID is required')
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

    const conversationId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find conversation and verify access
    const conversation = await MentorChat.findOne({
      where: { id: conversationId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'college_id']
        },
        {
          model: Mentor,
          as: 'mentor',
          attributes: ['id', 'name', 'email', 'specialization']
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check access permissions
    if (userRole === 'student' && conversation.student_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'college_admin' && conversation.student.college_id !== req.user.college_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get messages
    const messages = await MentorChatMessage.findAll({
      where: { chat_id: conversationId },
      order: [['created_at', 'ASC']]
    });

    // Mark messages as read for the current user
    if (userRole === 'student') {
      await MentorChat.update(
        { student_unread_count: 0 },
        { where: { id: conversationId } }
      );
    }

    res.json({
      success: true,
      data: {
        conversation,
        messages
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// @route   POST /api/mentor-chat/conversations/:id/messages
// @desc    Send a message in a mentor conversation
// @access  Private
router.post('/conversations/:id/messages', [
  authenticateToken,
  param('id').isInt().withMessage('Valid conversation ID is required'),
  body('message').notEmpty().withMessage('Message content is required')
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

    const conversationId = req.params.id;
    const { message } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find conversation and verify access
    const conversation = await MentorChat.findOne({
      where: { id: conversationId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'college_id']
        },
        {
          model: Mentor,
          as: 'mentor',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check access permissions
    if (userRole === 'student' && conversation.student_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'college_admin' && conversation.student.college_id !== req.user.college_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'mentor') {
      // Find the mentor record for this user
      const mentor = await Mentor.findOne({
        where: { email: req.user.email }
      });

      if (!mentor || conversation.mentor_id !== mentor.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Determine sender type
    let senderType;
    if (userRole === 'student') {
      senderType = 'student';
    } else if (userRole === 'college_admin') {
      // College admin can send messages on behalf of mentor
      senderType = 'mentor';
    } else if (userRole === 'mentor') {
      senderType = 'mentor';
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create message
    const newMessage = await MentorChatMessage.create({
      chat_id: conversationId,
      sender_id: userId,
      sender_type: senderType,
      message: message,
      message_type: 'text',
      is_read: false
    });

    // Update conversation
    await conversation.update({
      last_message_at: new Date(),
      student_unread_count: senderType === 'mentor' ? conversation.student_unread_count + 1 : conversation.student_unread_count,
      mentor_unread_count: senderType === 'student' ? conversation.mentor_unread_count + 1 : conversation.mentor_unread_count
    });

    res.json({
      success: true,
      data: newMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// @route   PUT /api/mentor-chat/conversations/:id/mark-read
// @desc    Mark messages as read in a conversation
// @access  Private
router.put('/conversations/:id/mark-read', [
  authenticateToken,
  param('id').isInt().withMessage('Invalid conversation ID'),
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

    const conversationId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify user has access to this conversation
    const conversation = await MentorChat.findByPk(conversationId, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'college_id']
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check access permissions
    let hasAccess = false;
    if (userRole === 'student' && conversation.student_id === userId) {
      hasAccess = true;
    } else if (userRole === 'mentor') {
      const mentor = await Mentor.findOne({ where: { email: req.user.email } });
      if (mentor && conversation.mentor_id === mentor.id) {
        hasAccess = true;
      }
    } else if (userRole === 'college_admin') {
      // College admins can mark messages as read for their college students
      if (conversation.student && conversation.student.college_id === req.user.college_id) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark messages as read
    const senderType = userRole === 'student' ? 'mentor' : 'student';
    await MentorChatMessage.update(
      { is_read: true },
      {
        where: {
          chat_id: conversationId,
          sender_type: senderType,
          is_read: false
        }
      }
    );

    // Update conversation unread counts
    if (userRole === 'student') {
      await conversation.update({ student_unread_count: 0 });
    } else if (userRole === 'mentor') {
      await conversation.update({ mentor_unread_count: 0 });
    }

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

module.exports = router;
