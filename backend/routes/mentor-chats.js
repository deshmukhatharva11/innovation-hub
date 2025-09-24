const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { MentorChat, MentorChatMessage, Mentor, User, Idea, MentorAssignment } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// Get all chats for a user (student or mentor)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status = 'active' } = req.query;

    let whereClause = { is_active: true };
    if (status !== 'all') {
      whereClause.status = status;
    }

    if (userRole === 'student') {
      whereClause.student_id = userId;
    } else if (userRole === 'mentor') {
      whereClause.mentor_id = userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const chats = await MentorChat.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'student' },
        { model: Mentor, as: 'mentor' },
        { model: Idea, as: 'idea' },
        { 
          model: MentorChatMessage, 
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']],
          include: [{ model: User, as: 'sender' }]
        }
      ],
      order: [['last_message_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { chats }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
});

// Get specific chat with messages
router.get('/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const chat = await MentorChat.findOne({
      where: { 
        id: chatId, 
        is_active: true 
      },
      include: [
        { model: User, as: 'student' },
        { model: Mentor, as: 'mentor' },
        { model: Idea, as: 'idea' },
        { model: MentorAssignment, as: 'assignment' }
      ]
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check permissions
    if (userRole === 'student' && chat.student_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'mentor' && chat.mentor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get messages
    const messages = await MentorChatMessage.findAll({
      where: { chat_id: chatId, is_active: true },
      include: [{ model: User, as: 'sender' }],
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: { 
        chat,
        messages
      }
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat',
      error: error.message
    });
  }
});

// Send message in chat
router.post('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message, message_type = 'text', file_url, file_name, file_size } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('🔍 Send message request:', {
      chatId,
      userId,
      userRole,
      message: message?.substring(0, 50) + '...',
      body: req.body
    });

    const chat = await MentorChat.findOne({
      where: { 
        id: chatId, 
        is_active: true 
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check permissions
    if (userRole === 'student' && chat.student_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'mentor' && chat.mentor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Determine sender type
    let senderType = 'student';
    if (userRole === 'mentor') {
      senderType = 'mentor';
    } else if (userRole === 'admin' || userRole === 'college_admin' || userRole === 'incubator_manager') {
      senderType = 'admin';
    }

    // Create message
    const newMessage = await MentorChatMessage.create({
      chat_id: chatId,
      sender_id: userId,
      sender_type: senderType,
      message,
      message_type,
      file_url,
      file_name,
      file_size
    });

    // Update chat's last message info
    await chat.updateLastMessage(userId);

    // Get the created message with sender info
    const messageWithSender = await MentorChatMessage.findByPk(newMessage.id, {
      include: [{ model: User, as: 'sender' }]
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: messageWithSender }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Get messages for a chat (with pagination)
router.get('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    const chat = await MentorChat.findOne({
      where: { 
        id: chatId, 
        is_active: true 
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check permissions
    if (userRole === 'student' && chat.student_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'mentor' && chat.mentor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const offset = (page - 1) * limit;

    const { count, rows: messages } = await MentorChatMessage.findAndCountAll({
      where: { chat_id: chatId, is_active: true },
      include: [{ model: User, as: 'sender' }],
      order: [['created_at', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_messages: count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Mark messages as read
router.put('/:chatId/read', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const chat = await MentorChat.findOne({
      where: { 
        id: chatId, 
        is_active: true 
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check permissions
    if (userRole === 'student' && chat.student_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'mentor' && chat.mentor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark all unread messages as read
    await MentorChatMessage.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          chat_id: chatId,
          sender_id: { [Op.ne]: userId },
          is_read: false,
          is_active: true
        }
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

// Edit message
router.put('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    const messageRecord = await MentorChatMessage.findByPk(messageId, {
      include: [{ model: MentorChat, as: 'chat' }]
    });

    if (!messageRecord) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (messageRecord.sender_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if message is not too old (e.g., within 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (messageRecord.created_at < oneHourAgo) {
      return res.status(400).json({
        success: false,
        message: 'Message is too old to edit'
      });
    }

    // Update message
    await messageRecord.update({
      message,
      is_edited: true,
      edited_at: new Date()
    });

    // Emit to socket
    const io = req.app.get('io');
    if (io) {
      io.to(`chat_${messageRecord.chat_id}`).emit('messageEdited', messageRecord);
    }

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: { message: messageRecord }
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message',
      error: error.message
    });
  }
});

// Delete message
router.delete('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const messageRecord = await MentorChatMessage.findByPk(messageId, {
      include: [{ model: MentorChat, as: 'chat' }]
    });

    if (!messageRecord) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (messageRecord.sender_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if message is not too old (e.g., within 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (messageRecord.created_at < oneHourAgo) {
      return res.status(400).json({
        success: false,
        message: 'Message is too old to delete'
      });
    }

    // Soft delete message
    await messageRecord.update({ is_active: false });

    // Emit to socket
    const io = req.app.get('io');
    if (io) {
      io.to(`chat_${messageRecord.chat_id}`).emit('messageDeleted', messageId);
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
});

// Archive chat
router.put('/:chatId/archive', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const chat = await MentorChat.findOne({
      where: { 
        id: chatId, 
        is_active: true 
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check permissions
    if (userRole === 'student' && chat.student_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'mentor' && chat.mentor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Archive chat
    await chat.archive();

    res.json({
      success: true,
      message: 'Chat archived successfully'
    });
  } catch (error) {
    console.error('Archive chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive chat',
      error: error.message
    });
  }
});

// Close chat
router.put('/:chatId/close', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const chat = await MentorChat.findOne({
      where: { 
        id: chatId, 
        is_active: true 
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check permissions
    if (userRole === 'student' && chat.student_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'mentor' && chat.mentor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Close chat
    await chat.close();

    res.json({
      success: true,
      message: 'Chat closed successfully'
    });
  } catch (error) {
    console.error('Close chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close chat',
      error: error.message
    });
  }
});

// Get unread message count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = { 
      is_active: true,
      status: 'active'
    };

    if (userRole === 'student') {
      whereClause.student_id = userId;
    } else if (userRole === 'mentor') {
      whereClause.mentor_id = userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const chats = await MentorChat.findAll({
      where: whereClause,
      attributes: ['id']
    });

    const chatIds = chats.map(chat => chat.id);

    const unreadCount = await MentorChatMessage.count({
      where: {
        chat_id: { [Op.in]: chatIds },
        sender_id: { [Op.ne]: userId },
        is_read: false,
        is_active: true
      }
    });

    res.json({
      success: true,
      data: { unread_count: unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
});

module.exports = router;
