const { CMSContent, CMSNotification, CMSMedia, User, College, Incubator } = require('../models');
const { Op } = require('sequelize');
const emailService = require('./emailService');
const AuditService = require('./auditService');

class CMSService {
  // ==================== CONTENT MANAGEMENT ====================

  /**
   * Create new CMS content
   */
  static async createContent(contentData, userId) {
    let contentDataToCreate;
    try {
      contentDataToCreate = {
        ...contentData
      };
      
      // Generate slug if not provided
      if (!contentDataToCreate.slug && contentDataToCreate.title) {
        contentDataToCreate.slug = contentDataToCreate.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
      }
      
      // Only add user IDs if userId is provided
      if (userId) {
        contentDataToCreate.author_id = userId;
        contentDataToCreate.last_modified_by = userId;
      }
      
      console.log('Creating content with data:', JSON.stringify(contentDataToCreate, null, 2));
      
      const content = await CMSContent.create(contentDataToCreate);

      // Log content creation (only if userId is provided)
      if (userId) {
        await AuditService.log({
          userId,
          action: 'CMS_CONTENT_CREATE',
          actionCategory: 'SYSTEM_CONFIGURATION',
          description: `Created ${contentData.content_type}: ${contentData.title}`,
          resource: {
            type: 'cms_content',
            id: content.id,
            name: contentData.title
          },
          metadata: {
            content_type: contentData.content_type,
            status: contentData.status
          }
        });
      }

      return content;
    } catch (error) {
      console.error('Error creating CMS content:', error);
      console.error('Error details:', error.errors || error.message);
      if (contentDataToCreate) {
        console.error('Content data that failed:', JSON.stringify(contentDataToCreate, null, 2));
      }
      throw error;
    }
  }

  /**
   * Update CMS content
   */
  static async updateContent(contentId, updateData, userId) {
    try {
      const content = await CMSContent.findByPk(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      const oldData = { ...content.toJSON() };
      await content.update({
        ...updateData,
        last_modified_by: userId
      });

      // Log content update
      await AuditService.log({
        userId,
        action: 'CMS_CONTENT_UPDATE',
        actionCategory: 'SYSTEM_CONFIGURATION',
        description: `Updated ${content.content_type}: ${content.title}`,
        resource: {
          type: 'cms_content',
          id: content.id,
          name: content.title
        },
        changes: {
          old: oldData,
          new: content.toJSON()
        },
        metadata: {
          content_type: content.content_type,
          status: content.status
        }
      });

      return content;
    } catch (error) {
      console.error('Error updating CMS content:', error);
      throw error;
    }
  }

  /**
   * Delete CMS content
   */
  static async deleteContent(contentId, userId) {
    try {
      const content = await CMSContent.findByPk(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      await content.update({ is_active: false });

      // Log content deletion
      await AuditService.log({
        userId,
        action: 'CMS_CONTENT_DELETE',
        actionCategory: 'SYSTEM_CONFIGURATION',
        description: `Deleted ${content.content_type}: ${content.title}`,
        resource: {
          type: 'cms_content',
          id: content.id,
          name: content.title
        },
        metadata: {
          content_type: content.content_type
        }
      });

      return true;
    } catch (error) {
      console.error('Error deleting CMS content:', error);
      throw error;
    }
  }

  /**
   * Get content by slug
   */
  static async getContentBySlug(slug) {
    try {
      const content = await CMSContent.findOne({
        where: {
          slug,
          status: 'published',
          is_active: true
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (content) {
        // Increment view count
        await content.incrementViews();
      }

      return content;
    } catch (error) {
      console.error('Error getting content by slug:', error);
      throw error;
    }
  }

  /**
   * Get content list with filters
   */
  static async getContentList(filters = {}, pagination = {}) {
    try {
      const {
        content_type,
        status,
        author_id,
        search,
        tags,
        categories,
        is_featured,
        is_sticky
      } = filters;

      const {
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = pagination;

      const whereClause = { is_active: true };

      if (content_type) whereClause.content_type = content_type;
      if (status) whereClause.status = status;
      if (author_id) whereClause.author_id = author_id;
      if (is_featured !== undefined) whereClause.is_featured = is_featured;
      if (is_sticky !== undefined) whereClause.is_sticky = is_sticky;
      if (tags) whereClause.tags = { [Op.contains]: tags };
      if (categories) whereClause.categories = { [Op.contains]: categories };

      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } },
          { excerpt: { [Op.like]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await CMSContent.findAndCountAll({
        where: whereClause,
        // Temporarily remove User include to avoid association errors
        // include: [
        //   {
        //     model: User,
        //     as: 'author',
        //     attributes: ['id', 'name', 'email'],
        //     required: false
        //   }
        // ],
        order: [[sort_by, sort_order]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        content: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Error getting content list:', error);
      throw error;
    }
  }

  // ==================== NOTIFICATION MANAGEMENT ====================

  /**
   * Create notification
   */
  static async createNotification(notificationData, userId) {
    try {
      const notification = await CMSNotification.create({
        ...notificationData,
        created_by: userId
      });

      // Log notification creation
      await AuditService.log({
        userId,
        action: 'CMS_NOTIFICATION_CREATE',
        actionCategory: 'NOTIFICATION',
        description: `Created notification: ${notificationData.title}`,
        resource: {
          type: 'cms_notification',
          id: notification.id,
          name: notificationData.title
        },
        metadata: {
          notification_type: notificationData.notification_type,
          target_audience: notificationData.target_audience,
          priority: notificationData.priority
        }
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send notification
   */
  static async sendNotification(notificationId, userId) {
    try {
      const notification = await CMSNotification.findByPk(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      if (!notification.canBeSent()) {
        throw new Error('Notification cannot be sent at this time');
      }

      // Update status to sending
      await notification.update({ status: 'sending' });

      // Get target users based on audience
      const targetUsers = await this.getTargetUsers(notification);

      // Send notifications
      const results = await this.deliverNotifications(notification, targetUsers);

      // Update notification status and stats
      await notification.update({
        status: 'sent',
        sent_at: new Date(),
        delivery_stats: {
          total_recipients: targetUsers.length,
          delivered: results.delivered,
          failed: results.failed
        }
      });

      // Log notification sending
      await AuditService.log({
        userId,
        action: 'CMS_NOTIFICATION_SEND',
        actionCategory: 'NOTIFICATION',
        description: `Sent notification: ${notification.title} to ${targetUsers.length} users`,
        resource: {
          type: 'cms_notification',
          id: notification.id,
          name: notification.title
        },
        metadata: {
          total_recipients: targetUsers.length,
          delivered: results.delivered,
          failed: results.failed
        }
      });

      return results;
    } catch (error) {
      console.error('Error sending notification:', error);
      await CMSNotification.update(
        { status: 'failed' },
        { where: { id: notificationId } }
      );
      throw error;
    }
  }

  /**
   * Get target users for notification
   */
  static async getTargetUsers(notification) {
    const { target_audience, target_user_ids, target_roles, target_colleges, target_incubators } = notification;

    let whereClause = { is_active: true };

    switch (target_audience) {
      case 'all':
        // No additional filters
        break;
      case 'students':
        whereClause.role = 'student';
        break;
      case 'mentors':
        whereClause.role = 'mentor';
        break;
      case 'college_admins':
        whereClause.role = 'college_admin';
        break;
      case 'incubator_managers':
        whereClause.role = 'incubator_manager';
        break;
      case 'super_admins':
        whereClause.role = 'super_admin';
        break;
      case 'specific_users':
        whereClause.id = { [Op.in]: target_user_ids || [] };
        break;
      case 'custom_roles':
        whereClause.role = { [Op.in]: target_roles || [] };
        break;
    }

    // Add college/incubator filters if specified
    if (target_colleges && target_colleges.length > 0) {
      whereClause.college_id = { [Op.in]: target_colleges };
    }
    if (target_incubators && target_incubators.length > 0) {
      whereClause.incubator_id = { [Op.in]: target_incubators };
    }

    return await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'role', 'college_id', 'incubator_id']
    });
  }

  /**
   * Deliver notifications through various channels
   */
  static async deliverNotifications(notification, targetUsers) {
    const results = { delivered: 0, failed: 0 };

    for (const user of targetUsers) {
      try {
        // In-app notification (always delivered)
        await this.createInAppNotification(notification, user);

        // Email notification
        if (notification.delivery_methods.includes('email')) {
          await this.sendEmailNotification(notification, user);
        }

        // SMS notification
        if (notification.delivery_methods.includes('sms')) {
          await this.sendSMSNotification(notification, user);
        }

        results.delivered++;
      } catch (error) {
        console.error(`Failed to deliver notification to user ${user.id}:`, error);
        results.failed++;
      }
    }

    return results;
  }

  /**
   * Create in-app notification
   */
  static async createInAppNotification(notification, user) {
    // This would integrate with your existing notification system
    // For now, we'll just log it
    console.log(`In-app notification for user ${user.id}: ${notification.title}`);
  }

  /**
   * Send email notification
   */
  static async sendEmailNotification(notification, user) {
    try {
      const emailData = {
        to: user.email,
        subject: notification.title,
        template: notification.email_template || 'notification',
        data: {
          user: user,
          notification: notification,
          action_url: notification.action_url,
          action_text: notification.action_text
        }
      };

      await emailService.sendNotificationEmail(emailData);
    } catch (error) {
      console.error(`Failed to send email to ${user.email}:`, error);
      throw error;
    }
  }

  /**
   * Send SMS notification
   */
  static async sendSMSNotification(notification, user) {
    // Implement SMS sending logic here
    console.log(`SMS notification for user ${user.id}: ${notification.title}`);
  }

  /**
   * Get notifications for user
   */
  static async getUserNotifications(userId, userRole, collegeId, incubatorId) {
    try {
      return await CMSNotification.getByUser(userId, userRole, collegeId, incubatorId);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // ==================== MEDIA MANAGEMENT ====================

  /**
   * Upload media file
   */
  static async uploadMedia(fileData, userId, contentId = null) {
    try {
      const mediaData = {
        ...fileData,
        content_id: contentId
      };
      
      // Only add uploaded_by if userId is provided
      if (userId) {
        mediaData.uploaded_by = userId;
      }
      
      const media = await CMSMedia.create(mediaData);

      // Log media upload (only if userId is provided)
      if (userId) {
        await AuditService.log({
          userId,
          action: 'CMS_MEDIA_UPLOAD',
          actionCategory: 'FILE_OPERATION',
          description: `Uploaded media: ${fileData.original_name}`,
          resource: {
            type: 'cms_media',
            id: media.id,
            name: fileData.original_name
          },
          metadata: {
            media_type: fileData.media_type,
            file_size: fileData.file_size,
            file_type: fileData.file_type
          }
        });
      }

      return media;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }

  /**
   * Get media list
   */
  static async getMediaList(filters = {}, pagination = {}) {
    try {
      const {
        media_type,
        is_public,
        access_level,
        uploaded_by,
        search
      } = filters;

      const {
        page = 1,
        limit = 20,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = pagination;

      const whereClause = { is_active: true };

      if (media_type) whereClause.media_type = media_type;
      if (is_public !== undefined) whereClause.is_public = is_public;
      if (access_level) whereClause.access_level = access_level;
      if (uploaded_by) whereClause.uploaded_by = uploaded_by;

      if (search) {
        whereClause[Op.or] = [
          { filename: { [Op.like]: `%${search}%` } },
          { original_name: { [Op.like]: `%${search}%` } },
          { title: { [Op.like]: `%${search}%` } },
          { alt_text: { [Op.like]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await CMSMedia.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [[sort_by, sort_order]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        media: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Error getting media list:', error);
      throw error;
    }
  }

  // ==================== TEMPLATE MANAGEMENT ====================

  /**
   * Get content templates
   */
  static getContentTemplates() {
    return {
      'home_page': {
        name: 'Home Page',
        description: 'Main landing page template',
        fields: ['hero_title', 'hero_subtitle', 'hero_image', 'features', 'testimonials']
      },
      'about_page': {
        name: 'About Page',
        description: 'About us page template',
        fields: ['title', 'content', 'team_section', 'mission', 'vision']
      },
      'contact_page': {
        name: 'Contact Page',
        description: 'Contact information page',
        fields: ['title', 'address', 'phone', 'email', 'form_fields']
      },
      'announcement': {
        name: 'Announcement',
        description: 'General announcement template',
        fields: ['title', 'content', 'priority', 'expiry_date']
      },
      'circular': {
        name: 'Circular',
        description: 'Official circular template',
        fields: ['title', 'content', 'reference_number', 'effective_date']
      }
    };
  }

  /**
   * Get notification templates
   */
  static getNotificationTemplates() {
    return {
      'welcome': {
        name: 'Welcome Notification',
        description: 'Welcome new users',
        template: 'Welcome to Innovation Hub! Get started by exploring our platform.'
      },
      'idea_submitted': {
        name: 'Idea Submitted',
        description: 'Notify when idea is submitted',
        template: 'Your idea "{{idea_title}}" has been submitted successfully and is under review.'
      },
      'idea_evaluated': {
        name: 'Idea Evaluated',
        description: 'Notify when idea is evaluated',
        template: 'Your idea "{{idea_title}}" has been evaluated with rating {{rating}}/5.'
      },
      'system_update': {
        name: 'System Update',
        description: 'System maintenance notifications',
        template: 'System will be under maintenance from {{start_time}} to {{end_time}}.'
      }
    };
  }

  // ==================== ANALYTICS ====================

  /**
   * Get CMS analytics
   */
  static async getAnalytics(filters = {}) {
    try {
      const { start_date, end_date } = filters;
      const dateFilter = {};

      if (start_date && end_date) {
        dateFilter.created_at = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }

      const [
        totalContent,
        publishedContent,
        totalNotifications,
        sentNotifications,
        totalMedia,
        contentByType,
        notificationByType
      ] = await Promise.all([
        CMSContent.count({ where: { ...dateFilter, is_active: true } }),
        CMSContent.count({ where: { ...dateFilter, status: 'published', is_active: true } }),
        CMSNotification.count({ where: { ...dateFilter, is_active: true } }),
        CMSNotification.count({ where: { ...dateFilter, status: 'sent' } }),
        CMSMedia.count({ where: { ...dateFilter, is_active: true } }),
        CMSContent.findAll({
          attributes: [
            'content_type',
            [CMSContent.sequelize.fn('COUNT', CMSContent.sequelize.col('id')), 'count']
          ],
          where: { ...dateFilter, is_active: true },
          group: ['content_type'],
          raw: true
        }),
        CMSNotification.findAll({
          attributes: [
            'notification_type',
            [CMSNotification.sequelize.fn('COUNT', CMSNotification.sequelize.col('id')), 'count']
          ],
          where: { ...dateFilter, is_active: true },
          group: ['notification_type'],
          raw: true
        })
      ]);

      return {
        content: {
          total: totalContent,
          published: publishedContent,
          by_type: contentByType
        },
        notifications: {
          total: totalNotifications,
          sent: sentNotifications,
          by_type: notificationByType
        },
        media: {
          total: totalMedia
        }
      };
    } catch (error) {
      console.error('Error getting CMS analytics:', error);
      throw error;
    }
  }
}

module.exports = CMSService;
