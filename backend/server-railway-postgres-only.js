const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection (PostgreSQL only)
let sequelize = null;
let dbConnected = false;

const connectDB = async () => {
  try {
    // Only connect if DATABASE_URL is available and is PostgreSQL
    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('postgresql://')) {
      console.log('⚠️ No PostgreSQL DATABASE_URL found, running without database');
      return false;
    }

    const { Sequelize } = require('sequelize');
    
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

    await sequelize.authenticate();
    console.log('✅ PostgreSQL database connection established successfully');
    
    // Create tables manually (without importing models that might have SQLite dependencies)
    try {
      // Create basic tables for Innovation Hub
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "Users" (
          "id" SERIAL PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "email" VARCHAR(255) UNIQUE NOT NULL,
          "password" VARCHAR(255) NOT NULL,
          "role" VARCHAR(50) DEFAULT 'student',
          "collegeId" INTEGER,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "Colleges" (
          "id" SERIAL PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "code" VARCHAR(50) UNIQUE NOT NULL,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "Circulars" (
          "id" SERIAL PRIMARY KEY,
          "title" VARCHAR(255) NOT NULL,
          "content" TEXT,
          "filePath" VARCHAR(500),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "Ideas" (
          "id" SERIAL PRIMARY KEY,
          "title" VARCHAR(255) NOT NULL,
          "description" TEXT,
          "status" VARCHAR(50) DEFAULT 'pending',
          "studentId" INTEGER,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      console.log('✅ PostgreSQL tables created successfully');
      dbConnected = true;
    } catch (tableError) {
      console.log('⚠️ Table creation failed, continuing without database features:', tableError.message);
    }
    
    return true;
  } catch (error) {
    console.log('⚠️ PostgreSQL connection failed, running without database:', error.message);
    return false;
  }
};

// Import routes (with error handling)
let authRoutes, userRoutes, ideaRoutes, collegeRoutes, mentorRoutes, adminRoutes;
let adminCMSRoutes, publicCMSRoutes, auditRoutes, chatRoutes, notificationRoutes;
let documentRoutes, eventRoutes, reportRoutes, cmsEnhancedRoutes;

try {
  authRoutes = require('./routes/auth');
  userRoutes = require('./routes/users');
  ideaRoutes = require('./routes/ideas');
  collegeRoutes = require('./routes/colleges');
  mentorRoutes = require('./routes/mentors');
  adminRoutes = require('./routes/admin');
  adminCMSRoutes = require('./routes/admin-cms');
  publicCMSRoutes = require('./routes/public-cms');
  auditRoutes = require('./routes/audit');
  chatRoutes = require('./routes/chat');
  notificationRoutes = require('./routes/notifications');
  documentRoutes = require('./routes/documents');
  eventRoutes = require('./routes/events');
  reportRoutes = require('./routes/reports');
  cmsEnhancedRoutes = require('./routes/cms-enhanced');
} catch (routeError) {
  console.log('⚠️ Some routes failed to load:', routeError.message);
}

// API Routes (only if routes loaded successfully)
if (authRoutes) app.use('/api/auth', authRoutes);
if (userRoutes) app.use('/api/users', userRoutes);
if (ideaRoutes) app.use('/api/ideas', ideaRoutes);
if (collegeRoutes) app.use('/api/colleges', collegeRoutes);
if (mentorRoutes) app.use('/api/mentors', mentorRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);
if (adminCMSRoutes) app.use('/api/admin/cms', adminCMSRoutes);
if (publicCMSRoutes) app.use('/api/public/cms', publicCMSRoutes);
if (auditRoutes) app.use('/api/audit', auditRoutes);
if (chatRoutes) app.use('/api/chat', chatRoutes);
if (notificationRoutes) app.use('/api/notifications', notificationRoutes);
if (documentRoutes) app.use('/api/documents', documentRoutes);
if (eventRoutes) app.use('/api/events', eventRoutes);
if (reportRoutes) app.use('/api/reports', reportRoutes);
if (cmsEnhancedRoutes) app.use('/api/cms', cmsEnhancedRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Innovation Hub API is running on Railway',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0',
    uptime: process.uptime(),
    database: dbConnected ? 'connected' : 'not connected',
    port: process.env.PORT || 3001
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Innovation Hub API (Railway)!');
});

// Simple API endpoints for testing
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    timestamp: new Date(),
    database: dbConnected ? 'connected' : 'not connected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', message: err.message });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('🔌 A user connected via WebSocket');

  socket.on('disconnect', () => {
    console.log('❌ User disconnected from WebSocket');
  });

  socket.on('chat message', (msg) => {
    console.log('💬 Message received:', msg);
    io.emit('chat message', msg);
  });
});

// Start the server
const PORT = process.env.PORT || 3001;

// Connect to database first, then start server
connectDB().then((dbSuccess) => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Innovation Hub API server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`🗄️ Database: ${dbConnected ? 'PostgreSQL connected' : 'not connected'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}).catch((error) => {
  console.error('❌ Failed to start server:', error);
  // Still start the server even if database fails
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Innovation Hub API server running on port ${PORT} (without database)`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`🗄️ Database: not connected`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (sequelize) {
    sequelize.close();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (sequelize) {
    sequelize.close();
  }
  process.exit(0);
});
