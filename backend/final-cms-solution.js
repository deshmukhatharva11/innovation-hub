const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// In-memory storage
let content = [];
let notifications = [];
let media = [];

// Helper functions
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

function getNextId(array) {
  return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
}

// ==================== CONTENT MANAGEMENT ====================

// Get all content
app.get('/api/cms/content', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        content: content,
        pagination: {
          total: content.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(content.length / 10)
        }
      }
    });
  } catch (error) {
    console.error('Error getting content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message
    });
  }
});

// Create content
app.post('/api/cms/content', (req, res) => {
  try {
    console.log('📝 Creating content:', req.body.title);
    
    const newContent = {
      id: getNextId(content),
      title: req.body.title || 'Untitled',
      content: req.body.content || '',
      content_type: req.body.content_type || 'page',
      status: req.body.status || 'draft',
      slug: req.body.slug || generateSlug(req.body.title || 'untitled'),
      excerpt: req.body.excerpt || '',
      meta_title: req.body.meta_title || req.body.title,
      meta_description: req.body.meta_description || '',
      visibility: req.body.visibility || 'public',
      is_active: true,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    content.push(newContent);
    
    console.log('✅ Content created successfully:', newContent.id);
    
    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: newContent
    });
  } catch (error) {
    console.error('❌ Content creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create content',
      error: error.message
    });
  }
});

// ==================== NOTIFICATION MANAGEMENT ====================

// Get all notifications
app.get('/api/cms/notifications', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        notifications: notifications,
        pagination: {
          total: notifications.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(notifications.length / 10)
        }
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Create notification
app.post('/api/cms/notifications', (req, res) => {
  try {
    console.log('🔔 Creating notification:', req.body.title);
    
    const newNotification = {
      id: getNextId(notifications),
      title: req.body.title || 'Untitled Notification',
      message: req.body.message || req.body.content || '',
      notification_type: req.body.notification_type || 'info',
      priority: req.body.priority || 'normal',
      target_audience: req.body.target_audience || 'all',
      status: req.body.status || 'draft',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    notifications.push(newNotification);
    
    console.log('✅ Notification created successfully:', newNotification.id);
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: newNotification
    });
  } catch (error) {
    console.error('❌ Notification creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

// ==================== MEDIA MANAGEMENT ====================

// Get all media
app.get('/api/cms/media', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        media: media,
        pagination: {
          total: media.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(media.length / 10)
        }
      }
    });
  } catch (error) {
    console.error('Error getting media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media',
      error: error.message
    });
  }
});

// Upload media
app.post('/api/cms/media/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    console.log('📁 Uploading file:', req.file.originalname);
    
    const newMedia = {
      id: getNextId(media),
      original_name: req.file.originalname,
      file_name: req.file.filename,
      file_path: req.file.path,
      file_size: req.file.size,
      file_type: req.file.mimetype,
      media_type: req.file.mimetype.startsWith('image/') ? 'image' : 'document',
      is_public: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    media.push(newMedia);
    
    console.log('✅ Media uploaded successfully:', newMedia.id);
    
    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: newMedia
    });
  } catch (error) {
    console.error('❌ Media upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media',
      error: error.message
    });
  }
});

// ==================== TEMPLATE MANAGEMENT ====================

// Get templates
app.get('/api/cms/templates/content', (req, res) => {
  try {
    const templates = {
      home_page: {
        name: 'Home Page',
        description: 'Main landing page template',
        fields: ['hero_title', 'hero_subtitle', 'hero_image', 'features', 'testimonials']
      },
      about_page: {
        name: 'About Page',
        description: 'About us page template',
        fields: ['title', 'content', 'team_section', 'mission', 'vision']
      },
      contact_page: {
        name: 'Contact Page',
        description: 'Contact information page',
        fields: ['title', 'address', 'phone', 'email', 'form_fields']
      },
      announcement: {
        name: 'Announcement',
        description: 'General announcement template',
        fields: ['title', 'content', 'priority', 'expiry_date']
      },
      circular: {
        name: 'Circular',
        description: 'Official circular template',
        fields: ['title', 'content', 'reference_number', 'effective_date']
      }
    };
    
    res.json({
      success: true,
      data: {
        templates: templates,
        pagination: {
          total: Object.keys(templates).length,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
});

// ==================== ANALYTICS ====================

// Get analytics
app.get('/api/cms/analytics', (req, res) => {
  try {
    const analytics = {
      content: {
        total: content.length,
        published: content.filter(c => c.status === 'published').length
      },
      notifications: {
        total: notifications.length
      },
      media: {
        total: media.length
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Final CMS Solution is running',
    timestamp: new Date().toISOString(),
    environment: 'development',
    version: '1.0.0',
    endpoints: {
      content: '/api/cms/content',
      notifications: '/api/cms/notifications',
      media: '/api/cms/media',
      templates: '/api/cms/templates/content',
      analytics: '/api/cms/analytics'
    }
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('🚀 Final CMS Solution running on port', PORT);
  console.log('✅ All CMS endpoints are working');
  console.log('📝 Content API: http://localhost:' + PORT + '/api/cms/content');
  console.log('🔔 Notifications API: http://localhost:' + PORT + '/api/cms/notifications');
  console.log('📁 Media API: http://localhost:' + PORT + '/api/cms/media');
  console.log('📋 Templates API: http://localhost:' + PORT + '/api/cms/templates/content');
  console.log('📈 Analytics API: http://localhost:' + PORT + '/api/cms/analytics');
  console.log('🔗 Health check: http://localhost:' + PORT + '/health');
  console.log('');
  console.log('🎯 Ready to test all CMS functionality!');
});
