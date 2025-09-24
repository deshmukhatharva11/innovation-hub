// Vercel serverless function for Innovation Hub API
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import your existing routes
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const ideaRoutes = require('../routes/ideas');
const collegeRoutes = require('../routes/colleges');
const mentorRoutes = require('../routes/mentors');
const adminRoutes = require('../routes/admin');
const adminCMSRoutes = require('../routes/admin-cms');
const publicCMSRoutes = require('../routes/public-cms');
const auditRoutes = require('../routes/audit');
const chatRoutes = require('../routes/chat');
const notificationRoutes = require('../routes/notifications');
const documentRoutes = require('../routes/documents');
const eventRoutes = require('../routes/events');
const reportRoutes = require('../routes/reports');
const cmsEnhancedRoutes = require('../routes/cms-enhanced');

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
