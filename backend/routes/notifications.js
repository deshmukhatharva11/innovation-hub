const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { User, Idea, Comment, Like, Notification } = require('../models');
const { authenticateToken, authorizeOwnerOrAdmin } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('read').optional().isBoolean().withMessage('Read must be a boolean'),
  query('type').optional().isString().withMessage('Type must be a string'),
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
      limit = 20,
      read,
      type,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { user_id: req.user.id };

    // Apply filters
    if (read !== undefined) whereClause.is_read = read;
    if (type) whereClause.type = type;

    // Get notifications from database
    const { rows: notifications, count: totalCount } = await Notification.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Transform notifications to use snake_case for timestamps
    const transformedNotifications = notifications.map(notification => {
      const notificationData = notification.toJSON();
      return {
        ...notificationData,
        created_at: notificationData.created_at || notificationData.createdAt,
        updated_at: notificationData.updated_at || notificationData.updatedAt
      };
    });

    res.json({
      success: true,
      data: {
        notifications: transformedNotifications,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: totalCount,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
    });
  }
});

// @route   GET /api/notifications/:id
// @desc    Get notification by ID
// @access  Private
router.get('/:id', [
  authenticateToken,
], async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { 
        id: id,
        user_id: req.user.id 
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    const notificationData = notification.toJSON();
    
    // Transform timestamps to snake_case
    const transformedNotification = {
      ...notificationData,
      created_at: notificationData.created_at || notificationData.createdAt,
      updated_at: notificationData.updated_at || notificationData.updatedAt
    };

    res.json({
      success: true,
      data: {
        notification: transformedNotification,
      },
    });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification',
    });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', [
  authenticateToken,
], async (req, res) => {
  try {
    // Query the database for unread notifications
    const unreadCount = await Notification.getUnreadCountForUser(req.user.id);

    res.json({
      success: true,
      data: {
        unread_count: unreadCount,
      },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', [
  authenticateToken,
], async (req, res) => {
  try {
    const { id } = req.params;

    // In real app, you'd update the notification in the database
    const success = await markNotificationAsRead(id, req.user.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', [
  authenticateToken,
], async (req, res) => {
  try {
    // In real app, you'd update all notifications for the user
    await markAllNotificationsAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', [
  authenticateToken,
], async (req, res) => {
  try {
    const { id } = req.params;

    // In real app, you'd delete the notification from the database
    const success = await deleteNotification(id, req.user.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
    });
  }
});

// @route   DELETE /api/notifications/clear-all
// @desc    Clear all notifications
// @access  Private
router.delete('/clear-all', [
  authenticateToken,
], async (req, res) => {
  try {
    // In real app, you'd delete all notifications for the user
    await clearAllNotifications(req.user.id);

    res.json({
      success: true,
      message: 'All notifications cleared',
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear all notifications',
    });
  }
});

// @route   GET /api/notifications/preferences
// @desc    Get notification preferences
// @access  Private
router.get('/preferences', [
  authenticateToken,
], async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    // Get notification preferences from user settings
    const preferences = {
      email_notifications: user.email_notifications || true,
      push_notifications: user.push_notifications || true,
      idea_updates: user.notify_idea_updates || true,
      comments: user.notify_comments || true,
      likes: user.notify_likes || true,
      endorsements: user.notify_endorsements || true,
      weekly_digest: user.weekly_digest || false,
    };

    res.json({
      success: true,
      data: {
        preferences,
      },
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences',
    });
  }
});

// @route   PUT /api/notifications/preferences
// @desc    Update notification preferences
// @access  Private
router.put('/preferences', [
  authenticateToken,
  body('email_notifications').optional().isBoolean().withMessage('Email notifications must be a boolean'),
  body('push_notifications').optional().isBoolean().withMessage('Push notifications must be a boolean'),
  body('idea_updates').optional().isBoolean().withMessage('Idea updates must be a boolean'),
  body('comments').optional().isBoolean().withMessage('Comments must be a boolean'),
  body('likes').optional().isBoolean().withMessage('Likes must be a boolean'),
  body('endorsements').optional().isBoolean().withMessage('Endorsements must be a boolean'),
  body('weekly_digest').optional().isBoolean().withMessage('Weekly digest must be a boolean'),
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

    const user = await User.findByPk(req.user.id);
    
    // Update notification preferences
    const updateFields = [
      'email_notifications', 'push_notifications', 'idea_updates',
      'comments', 'likes', 'endorsements', 'weekly_digest'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: {
        preferences: {
          email_notifications: user.email_notifications,
          push_notifications: user.push_notifications,
          idea_updates: user.idea_updates,
          comments: user.comments,
          likes: user.likes,
          endorsements: user.endorsements,
          weekly_digest: user.weekly_digest,
        },
      },
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
    });
  }
});

// @route   POST /api/notifications/test-email
// @desc    Send test email notification
// @access  Private
router.post('/test-email', [
  authenticateToken,
], async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: 'User does not have an email address',
      });
    }

    // Send test email
    await sendTestEmail(user.email, user.name);

    res.json({
      success: true,
      message: 'Test email sent successfully',
    });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
    });
  }
});

// Helper function to generate user notifications (simplified)
async function generateUserNotifications(userId, whereClause, limit, offset) {
  // In a real application, you would have a Notification model
  // For now, we'll simulate notifications based on user activity
  
  const notifications = [];
  
  // Get recent ideas by the user
  const recentIdeas = await Idea.findAll({
    where: { student_id: userId },
    order: [['created_at', 'DESC']],
    limit: 5,
  });

  // Get recent comments on user's ideas
  const recentComments = await Comment.findAll({
    include: [
      {
        model: Idea,
        as: 'idea',
        where: { student_id: userId },
        attributes: ['id', 'title'],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: 5,
  });

  // Get recent likes on user's ideas
  const recentLikes = await Like.findAll({
    include: [
      {
        model: Idea,
        as: 'idea',
        where: { student_id: userId },
        attributes: ['id', 'title'],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: 5,
  });

  // Generate notification objects
  recentIdeas.forEach((idea, index) => {
    notifications.push({
      id: `idea_${idea.id}`,
      type: 'idea_created',
      title: 'Idea Created',
      message: `Your idea "${idea.title}" has been created successfully.`,
      data: {
        idea_id: idea.id,
        idea_title: idea.title,
      },
      is_read: false,
      created_at: idea.created_at,
    });
  });

  recentComments.forEach((comment, index) => {
    notifications.push({
      id: `comment_${comment.id}`,
      type: 'comment_received',
      title: 'New Comment',
      message: `${comment.user.name} commented on your idea "${comment.idea.title}".`,
      data: {
        comment_id: comment.id,
        idea_id: comment.idea.id,
        idea_title: comment.idea.title,
        user_id: comment.user.id,
        user_name: comment.user.name,
      },
      is_read: false,
      created_at: comment.created_at,
    });
  });

  recentLikes.forEach((like, index) => {
    notifications.push({
      id: `like_${like.id}`,
      type: 'like_received',
      title: 'New Like',
      message: `${like.user.name} liked your idea "${like.idea.title}".`,
      data: {
        like_id: like.id,
        idea_id: like.idea.id,
        idea_title: like.idea.title,
        user_id: like.user.id,
        user_name: like.user.name,
        like_type: like.like_type,
      },
      is_read: false,
      created_at: like.created_at,
    });
  });

  // Sort by creation date and apply pagination
  notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  return notifications.slice(offset, offset + limit);
}

// Helper function to get unread notifications count
async function getUnreadNotificationsCount(userId) {
  // In a real application, you would query the database
  // For now, return a simulated count
  return Math.floor(Math.random() * 10);
}

// Helper function to mark notification as read
async function markNotificationAsRead(notificationId, userId) {
  try {
    const notification = await Notification.findOne({
      where: { 
        id: notificationId,
        user_id: userId 
      }
    });

    if (!notification) {
      return false;
    }

    await notification.markAsRead();
    return true;
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return false;
  }
}

// Helper function to mark all notifications as read
async function markAllNotificationsAsRead(userId) {
  try {
    await Notification.markAllAsReadForUser(userId);
    return true;
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return false;
  }
}

// Helper function to delete notification
async function deleteNotification(notificationId, userId) {
  try {
    const notification = await Notification.findOne({
      where: { 
        id: notificationId,
        user_id: userId 
      }
    });

    if (!notification) {
      return false;
    }

    await notification.destroy();
    return true;
  } catch (error) {
    console.error('Delete notification error:', error);
    return false;
  }
}

// Helper function to clear all notifications
async function clearAllNotifications(userId) {
  try {
    await Notification.destroy({
      where: { user_id: userId }
    });
    return true;
  } catch (error) {
    console.error('Clear all notifications error:', error);
    return false;
  }
}

// Helper function to send test email
async function sendTestEmail(email, name) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Test Email - Innovation Hub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Test Email from Innovation Hub</h2>
        <p>Hello ${name},</p>
        <p>This is a test email to verify that your email notifications are working correctly.</p>
        <p>If you received this email, your notification settings are properly configured.</p>
        <br>
        <p>Best regards,<br>Innovation Hub Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Helper function to send idea status update notification
async function sendIdeaStatusNotification(userId, ideaId, status, message) {
  try {
    const user = await User.findByPk(userId);
    const idea = await Idea.findByPk(ideaId);

    if (!user || !user.email || !idea) {
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Idea Status Update - ${idea.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Idea Status Update</h2>
          <p>Hello ${user.name},</p>
          <p>Your idea "<strong>${idea.title}</strong>" has been updated to status: <strong>${status}</strong></p>
          <p>${message}</p>
          <br>
          <p>You can view your idea and any feedback by logging into your Innovation Hub account.</p>
          <br>
          <p>Best regards,<br>Innovation Hub Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Send idea status notification error:', error);
    return false;
  }
}

// Helper function to send comment notification
async function sendCommentNotification(userId, commentId, ideaId) {
  try {
    const user = await User.findByPk(userId);
    const comment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
        {
          model: Idea,
          as: 'idea',
          attributes: ['id', 'title'],
        },
      ],
    });

    if (!user || !user.email || !comment) {
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `New Comment on Your Idea - ${comment.idea.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Comment on Your Idea</h2>
          <p>Hello ${user.name},</p>
          <p><strong>${comment.user.name}</strong> commented on your idea "<strong>${comment.idea.title}</strong>":</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
            <p style="margin: 0;">${comment.content}</p>
          </div>
          <br>
          <p>You can view and respond to this comment by logging into your Innovation Hub account.</p>
          <br>
          <p>Best regards,<br>Innovation Hub Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Send comment notification error:', error);
    return false;
  }
}

// Helper function to send like notification
async function sendLikeNotification(userId, likeId, ideaId) {
  try {
    const user = await User.findByPk(userId);
    const like = await Like.findByPk(likeId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
        {
          model: Idea,
          as: 'idea',
          attributes: ['id', 'title'],
        },
      ],
    });

    if (!user || !user.email || !like) {
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `New Like on Your Idea - ${like.idea.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Like on Your Idea</h2>
          <p>Hello ${user.name},</p>
          <p><strong>${like.user.name}</strong> liked your idea "<strong>${like.idea.title}</strong>"!</p>
          <p>Like type: <strong>${like.like_type}</strong></p>
          <br>
          <p>Keep up the great work! You can view all likes and engagement on your idea by logging into your Innovation Hub account.</p>
          <br>
          <p>Best regards,<br>Innovation Hub Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Send like notification error:', error);
    return false;
  }
}

// Export helper functions for use in other modules
module.exports = router;
