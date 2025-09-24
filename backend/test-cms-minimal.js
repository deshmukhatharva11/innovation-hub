const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage
let content = [];
let notifications = [];
let media = [];

// Test content creation with detailed logging
app.post('/api/cms/content', (req, res) => {
  console.log('=== CONTENT CREATION REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const newContent = {
      id: Date.now(),
      title: req.body.title || 'Untitled',
      content: req.body.content || '',
      content_type: req.body.content_type || 'page',
      status: req.body.status || 'draft',
      slug: req.body.slug || (req.body.title || 'untitled').toLowerCase().replace(/\s+/g, '-'),
      excerpt: req.body.excerpt || '',
      meta_title: req.body.meta_title || req.body.title,
      meta_description: req.body.meta_description || '',
      visibility: req.body.visibility || 'public',
      is_active: true,
      version: 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('Creating content:', JSON.stringify(newContent, null, 2));
    
    content.push(newContent);
    
    console.log('✅ Content created successfully');
    console.log('Total content items:', content.length);
    
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

// Test notification creation
app.post('/api/cms/notifications', (req, res) => {
  console.log('=== NOTIFICATION CREATION REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const newNotification = {
      id: Date.now(),
      title: req.body.title || 'Untitled Notification',
      message: req.body.message || req.body.content || '',
      notification_type: req.body.notification_type || 'info',
      priority: req.body.priority || 'normal',
      target_audience: req.body.target_audience || 'all',
      status: req.body.status || 'draft',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('Creating notification:', JSON.stringify(newNotification, null, 2));
    
    notifications.push(newNotification);
    
    console.log('✅ Notification created successfully');
    console.log('Total notifications:', notifications.length);
    
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

// Get content
app.get('/api/cms/content', (req, res) => {
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
});

// Get notifications
app.get('/api/cms/notifications', (req, res) => {
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
});

// Get media
app.get('/api/cms/media', (req, res) => {
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
});

// Get templates
app.get('/api/cms/templates/content', (req, res) => {
  res.json({
    success: true,
    data: {
      templates: {
        home_page: {
          name: 'Home Page',
          description: 'Main landing page template',
          fields: ['hero_title', 'hero_subtitle', 'hero_image', 'features', 'testimonials']
        },
        about_page: {
          name: 'About Page',
          description: 'About us page template',
          fields: ['title', 'content', 'team_section', 'mission', 'vision']
        }
      },
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  });
});

// Get analytics
app.get('/api/cms/analytics', (req, res) => {
  res.json({
    success: true,
    data: {
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
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal CMS Test Server running on port ${PORT}`);
  console.log(`📊 Ready to test CMS functionality`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
