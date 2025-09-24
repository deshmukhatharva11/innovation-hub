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
let analytics = {
  content: { total: 0, published: 0, draft: 0 },
  notifications: { total: 0 },
  media: { total: 0 }
};

// Helper functions
function getNextId(array) {
  return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
}

// ==================== CONTENT API ====================

// Get all content
app.get('/api/cms/content', (req, res) => {
  res.json({
    success: true,
    data: {
      content: content,
      pagination: {
        total: content.length,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  });
});

// Create content
app.post('/api/cms/content', (req, res) => {
  try {
    const newContent = {
      id: getNextId(content),
      title: req.body.title || 'Untitled',
      content: req.body.content || '',
      content_type: req.body.content_type || 'page',
      status: req.body.status || 'draft',
      slug: req.body.slug || req.body.title?.toLowerCase().replace(/\s+/g, '-') || 'untitled',
      excerpt: req.body.excerpt || '',
      meta_title: req.body.meta_title || req.body.title,
      meta_description: req.body.meta_description || '',
      meta_keywords: req.body.meta_keywords || '',
      visibility: req.body.visibility || 'public',
      featured_image: req.body.featured_image || null,
      template_id: req.body.template_id || 'homepage',
      sections: req.body.sections || {},
      tags: req.body.tags || [],
      category: req.body.category || 'general',
      is_featured: req.body.is_featured || false,
      is_sticky: req.body.is_sticky || false,
      priority: req.body.priority || 0,
      scheduled_at: req.body.scheduled_at || null,
      published_at: req.body.status === 'published' ? new Date().toISOString() : null,
      is_active: true,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'admin',
      last_modified_by: 'admin'
    };
    
    content.push(newContent);
    analytics.content.total = content.length;
    analytics.content.published = content.filter(c => c.status === 'published').length;
    analytics.content.draft = content.filter(c => c.status === 'draft').length;
    
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

// Get content by ID
app.get('/api/cms/content/:id', (req, res) => {
  const contentId = parseInt(req.params.id);
  const contentItem = content.find(c => c.id === contentId);
  
  if (!contentItem) {
    return res.status(404).json({
      success: false,
      message: 'Content not found'
    });
  }
  
  res.json({
    success: true,
    data: contentItem
  });
});

// Update content
app.put('/api/cms/content/:id', (req, res) => {
  try {
    const contentId = parseInt(req.params.id);
    const contentIndex = content.findIndex(c => c.id === contentId);
    
    if (contentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    const updatedContent = {
      ...content[contentIndex],
      ...req.body,
      id: contentId,
      updated_at: new Date().toISOString(),
      last_modified_by: 'admin',
      version: content[contentIndex].version + 1
    };
    
    content[contentIndex] = updatedContent;
    
    console.log('✅ Content updated successfully:', contentId);
    
    res.json({
      success: true,
      message: 'Content updated successfully',
      data: updatedContent
    });
  } catch (error) {
    console.error('❌ Content update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content',
      error: error.message
    });
  }
});

// Delete content
app.delete('/api/cms/content/:id', (req, res) => {
  try {
    const contentId = parseInt(req.params.id);
    const contentIndex = content.findIndex(c => c.id === contentId);
    
    if (contentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    content.splice(contentIndex, 1);
    analytics.content.total = content.length;
    
    console.log('✅ Content deleted successfully:', contentId);
    
    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('❌ Content deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message
    });
  }
});

// ==================== NOTIFICATIONS API ====================

// Get all notifications
app.get('/api/cms/notifications', (req, res) => {
  res.json({
    success: true,
    data: {
      notifications: notifications,
      pagination: {
        total: notifications.length,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  });
});

// Create notification
app.post('/api/cms/notifications', (req, res) => {
  try {
    const newNotification = {
      id: getNextId(notifications),
      title: req.body.title || 'Untitled Notification',
      message: req.body.message || req.body.content || '',
      notification_type: req.body.notification_type || 'info',
      priority: req.body.priority || 'normal',
      target_audience: req.body.target_audience || 'all',
      status: req.body.status || 'draft',
      is_global: req.body.is_global || false,
      scheduled_at: req.body.scheduled_at || null,
      expires_at: req.body.expires_at || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'admin'
    };
    
    notifications.push(newNotification);
    analytics.notifications.total = notifications.length;
    
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

// ==================== MEDIA API ====================

// Get all media
app.get('/api/cms/media', (req, res) => {
  res.json({
    success: true,
    data: {
      media: media,
      pagination: {
        total: media.length,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  });
});

// ==================== TEMPLATES API ====================

// Get templates
app.get('/api/cms/templates/content', (req, res) => {
  const templates = [
    {
      id: 'homepage',
      name: 'Homepage Template',
      description: 'Main homepage layout',
      sections: [
        { id: 'hero', name: 'Hero Section', type: 'hero', required: true },
        { id: 'about', name: 'About Us', type: 'about', required: true },
        { id: 'services', name: 'Services', type: 'services', required: true },
        { id: 'contact', name: 'Contact Information', type: 'contact', required: true }
      ],
      created_at: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: {
      templates: templates,
      pagination: {
        total: templates.length,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  });
});

// ==================== ANALYTICS API ====================

// Get analytics
app.get('/api/cms/analytics', (req, res) => {
  res.json({
    success: true,
    data: {
      content: analytics.content,
      notifications: analytics.notifications,
      media: analytics.media,
      lastUpdated: new Date().toISOString()
    }
  });
});

// ==================== HOMEPAGE API ====================

// Get homepage content
app.get('/api/homepage', (req, res) => {
  const homepageContent = content.find(c => 
    c.content_type === 'homepage' && 
    c.status === 'published' && 
    c.is_active
  );
  
  if (!homepageContent) {
    // Return default homepage structure
    return res.json({
      success: true,
      data: {
        hero: {
          title: "Welcome to Pre-Incubation Centre",
          subtitle: "Empowering Innovation and Entrepreneurship",
          background_image: null,
          cta_text: "Get Started",
          cta_link: "/contact"
        },
        about: {
          title: "About Us",
          content: "We support aspiring entrepreneurs and innovators in their journey to success.",
          image: null
        },
        services: {
          title: "Our Services",
          items: [
            {
              title: "Mentorship",
              description: "Expert guidance for your business journey",
              icon: "mentor"
            },
            {
              title: "Funding Support",
              description: "Access to funding opportunities",
              icon: "funding"
            },
            {
              title: "Networking",
              description: "Connect with like-minded entrepreneurs",
              icon: "network"
            }
          ]
        },
        contact: {
          title: "Contact Us",
          address: "Your Address Here",
          phone: "+1 234 567 8900",
          email: "info@preincubation.com"
        }
      }
    });
  }
  
  res.json({
    success: true,
    data: homepageContent.sections || {}
  });
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Simple CMS Server is running',
    timestamp: new Date().toISOString(),
    environment: 'development',
    version: '1.0.0'
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('🚀 Simple CMS Server running on port', PORT);
  console.log('✅ All CMS endpoints are working');
  console.log('');
  console.log('📋 Available Endpoints:');
  console.log('  📝 Content Management: /api/cms/content');
  console.log('  🔔 Notifications: /api/cms/notifications');
  console.log('  📁 Media Management: /api/cms/media');
  console.log('  📋 Templates: /api/cms/templates/content');
  console.log('  📈 Analytics: /api/cms/analytics');
  console.log('  🏠 Homepage: /api/homepage');
  console.log('  🔗 Health Check: /health');
  console.log('');
  console.log('🎯 Ready to manage your Pre-Incubation Centre content!');
});