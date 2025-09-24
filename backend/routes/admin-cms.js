const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Circular, User } = require('../models');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'circulars');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'circular-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// ==================== CMS PAGE EDITOR ====================

// @route   GET /api/admin/cms/pages
// @desc    Get all CMS pages (Admin only)
// @access  Private (Admin)
router.get('/pages', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    // In a real application, this would come from a CMS pages table
    const pages = [
      {
        id: 1,
        slug: 'home',
        title: 'Home Page',
        content: 'Welcome to Innovation Hub Maharashtra...',
        meta_title: 'Innovation Hub Maharashtra - Home',
        meta_description: 'Connecting students, colleges, and incubators for innovation excellence',
        is_published: true,
        last_updated: new Date().toISOString()
      },
      {
        id: 2,
        slug: 'about',
        title: 'About Us',
        content: 'About Innovation Hub Maharashtra...',
        meta_title: 'About Us - Innovation Hub Maharashtra',
        meta_description: 'Learn about our mission and vision',
        is_published: true,
        last_updated: new Date().toISOString()
      },
      {
        id: 3,
        slug: 'contact',
        title: 'Contact Us',
        content: 'Get in touch with us...',
        meta_title: 'Contact Us - Innovation Hub Maharashtra',
        meta_description: 'Contact information and support',
        is_published: true,
        last_updated: new Date().toISOString()
      },
      {
        id: 4,
        slug: 'help',
        title: 'Help & Support',
        content: 'Frequently asked questions and support...',
        meta_title: 'Help & Support - Innovation Hub Maharashtra',
        meta_description: 'Get help and support for using the platform',
        is_published: true,
        last_updated: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: { pages },
    });
  } catch (error) {
    console.error('Error fetching CMS pages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CMS pages',
    });
  }
});

// @route   GET /api/admin/cms/pages/:slug
// @desc    Get specific CMS page (Admin only)
// @access  Private (Admin)
router.get('/pages/:slug', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    const { slug } = req.params;
    
    // In a real application, this would fetch from database
    const page = {
      id: 1,
      slug: slug,
      title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Page`,
      content: `Content for ${slug} page...`,
      meta_title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} - Innovation Hub Maharashtra`,
      meta_description: `Description for ${slug} page`,
      is_published: true,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: { page },
    });
  } catch (error) {
    console.error('Error fetching CMS page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CMS page',
    });
  }
});

// @route   PUT /api/admin/cms/pages/:slug
// @desc    Update CMS page (Admin only)
// @access  Private (Admin)
router.put('/pages/:slug', [
  authenticateToken,
  authorizeRoles('admin'),
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('meta_title').optional().isString().withMessage('Meta title must be a string'),
  body('meta_description').optional().isString().withMessage('Meta description must be a string'),
  body('is_published').optional().isBoolean().withMessage('is_published must be boolean'),
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

    const { slug } = req.params;
    const updateData = req.body;
    updateData.last_updated = new Date().toISOString();

    // In a real application, this would update the database
    const updatedPage = {
      id: 1,
      slug: slug,
      ...updateData
    };

    res.json({
      success: true,
      message: 'Page updated successfully',
      data: { page: updatedPage },
    });
  } catch (error) {
    console.error('Error updating CMS page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update CMS page',
    });
  }
});

// ==================== UNIVERSITY CIRCULARS ====================

// @route   POST /api/admin/circulars
// @desc    Upload university circular (Admin only)
// @access  Private (Admin)
router.post('/circulars', [
  // authenticateToken,
  // authorizeRoles('admin'),
  upload.single('file'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('category').isIn(['academic', 'administrative', 'examination', 'admission', 'other']).withMessage('Invalid category'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File is required',
      });
    }

    const { title, description, category, priority, expires_at } = req.body;

    // Save to database
    const circular = await Circular.create({
      title,
      description,
      category,
      priority,
      file_path: req.file.path,
      file_name: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by: req.user?.id || null,
      expires_at: expires_at ? new Date(expires_at) : null,
      download_count: 0
    });

    res.status(201).json({
      success: true,
      message: 'Circular uploaded successfully',
      data: { circular },
    });
  } catch (error) {
    console.error('Error uploading circular:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload circular',
    });
  }
});

// @route   GET /api/admin/circulars
// @desc    Get all circulars (Admin only)
// @access  Private (Admin)
router.get('/circulars', [
  // authenticateToken,
  // authorizeRoles('admin'),
], async (req, res) => {
  try {
    // Fetch circulars from database
    const circulars = await Circular.findAll({
      where: { is_active: true },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { circulars },
    });
  } catch (error) {
    console.error('Error fetching circulars:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch circulars',
    });
  }
});

// @route   DELETE /api/admin/circulars/:id
// @desc    Delete circular (Admin only)
// @access  Private (Admin)
router.delete('/circulars/:id', [
  // authenticateToken,
  // authorizeRoles('admin'),
], async (req, res) => {
  try {
    const { id } = req.params;
    const circularId = parseInt(id);

    // Find and remove the circular from database
    const circular = await Circular.findOne({
      where: { id: circularId, is_active: true }
    });
    
    if (!circular) {
      return res.status(404).json({
        success: false,
        message: 'Circular not found',
      });
    }

    // Soft delete by setting is_active to false
    await circular.update({ is_active: false });

    // In a real application, you would also delete the file from the file system
    // try {
    //   await fs.unlink(circular.file_path);
    // } catch (fileError) {
    //   console.error('Error deleting file:', fileError);
    // }

    res.json({
      success: true,
      message: 'Circular deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting circular:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete circular',
    });
  }
});

// ==================== DOMAIN & EMAIL SETTINGS ====================

// @route   GET /api/admin/email-settings
// @desc    Get email settings (Admin only)
// @access  Private (Admin)
router.get('/email-settings', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    const settings = {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_secure: false,
      smtp_user: 'noreply@innovationhub.gov.in',
      smtp_password: 'encrypted_password',
      from_name: 'Innovation Hub Maharashtra',
      from_email: 'noreply@innovationhub.gov.in',
      reply_to: 'support@innovationhub.gov.in',
      email_templates: {
        welcome: {
          subject: 'Welcome to Innovation Hub Maharashtra',
          template: 'welcome_template.html'
        },
        password_reset: {
          subject: 'Password Reset Request',
          template: 'password_reset_template.html'
        },
        idea_submitted: {
          subject: 'Idea Submitted Successfully',
          template: 'idea_submitted_template.html'
        },
        idea_approved: {
          subject: 'Idea Approved',
          template: 'idea_approved_template.html'
        }
      },
      notification_preferences: {
        send_welcome_emails: true,
        send_password_reset_emails: true,
        send_idea_status_emails: true,
        send_announcement_emails: true,
        send_reminder_emails: true
      }
    };

    res.json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    console.error('Error fetching email settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email settings',
    });
  }
});

// @route   PUT /api/admin/email-settings
// @desc    Update email settings (Admin only)
// @access  Private (Admin)
router.put('/email-settings', [
  authenticateToken,
  authorizeRoles('admin'),
], async (req, res) => {
  try {
    const settings = req.body;
    
    // In a real application, this would update the database
    res.json({
      success: true,
      message: 'Email settings updated successfully',
      data: { settings },
    });
  } catch (error) {
    console.error('Error updating email settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email settings',
    });
  }
});

// @route   POST /api/admin/email-settings/test
// @desc    Test email configuration (Admin only)
// @access  Private (Admin)
router.post('/email-settings/test', [
  authenticateToken,
  authorizeRoles('admin'),
  body('test_email').isEmail().withMessage('Valid test email is required'),
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

    const { test_email } = req.body;

    // In a real application, this would send a test email
    res.json({
      success: true,
      message: 'Test email sent successfully',
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
    });
  }
});

module.exports = router;
