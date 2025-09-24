// Vercel serverless function for Innovation Hub API
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import your existing routes
const authRoutes = require('../backend/routes/auth');
const userRoutes = require('../backend/routes/users');
const ideaRoutes = require('../backend/routes/ideas');
const collegeRoutes = require('../backend/routes/colleges');
const mentorRoutes = require('../backend/routes/mentors');
const adminRoutes = require('../backend/routes/admin');
const adminCMSRoutes = require('../backend/routes/admin-cms');
const publicCMSRoutes = require('../backend/routes/public-cms');
const auditRoutes = require('../backend/routes/audit');
const chatRoutes = require('../backend/routes/chat');
const notificationRoutes = require('../backend/routes/notifications');
const documentRoutes = require('../backend/routes/documents');
const eventRoutes = require('../backend/routes/events');
const reportRoutes = require('../backend/routes/reports');
const cmsEnhancedRoutes = require('../backend/routes/cms-enhanced');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/cms', adminCMSRoutes);
app.use('/api/public/cms', publicCMSRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/cms', cmsEnhancedRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Innovation Hub API is running on Vercel',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Innovation Hub API on Vercel!');
});

module.exports = app;
