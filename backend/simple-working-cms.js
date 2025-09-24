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

// ==================== CMS ROUTES ====================

// Content routes
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

// Notification routes
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

// Media routes
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

// Template routes
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

// Analytics routes
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
  res.json({
    status: 'OK',
    message: 'Simple Working CMS is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Simple Working CMS running on port', PORT);
  console.log('✅ All CMS endpoints are working');
});
