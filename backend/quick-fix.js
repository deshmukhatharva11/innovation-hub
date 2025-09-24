// Quick fix to test CMS functionality
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Simple in-memory storage for testing
let content = [];
let media = [];

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads', 'cms');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// CMS Routes
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

app.post('/api/cms/content', (req, res) => {
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
      created_at: new Date(),
      updated_at: new Date()
    };
    
    content.push(newContent);
    
    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: newContent
    });
  } catch (error) {
    console.error('Content creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create content',
      error: error.message
    });
  }
});

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

app.post('/api/cms/media/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const newMedia = {
    id: Date.now(),
    filename: req.file.filename,
    original_name: req.file.originalname,
    file_url: `/uploads/cms/${req.file.filename}`,
    file_type: req.file.mimetype,
    file_size: req.file.size,
    title: req.body.title || req.file.originalname,
    created_at: new Date()
  };
  
  media.push(newMedia);
  
  res.status(201).json({
    success: true,
    message: 'Media uploaded successfully',
    data: newMedia
  });
});

app.get('/api/cms/notifications', (req, res) => {
  res.json({
    success: true,
    data: {
      notifications: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  });
});

app.get('/api/cms/templates/content', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.get('/api/cms/analytics', (req, res) => {
  res.json({
    success: true,
    data: {
      content: { total: content.length, published: content.filter(c => c.status === 'published').length },
      notifications: { total: 0 },
      media: { total: media.length }
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Quick CMS Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${uploadsDir}`);
  console.log(`✅ Ready for testing!`);
});
