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
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

    await sequelize.authenticate();
    console.log('✔ PostgreSQL database connection established successfully');
    
    // Import and sync models
    const { User, Idea, College, Incubator, Comment, Like, TeamMember, File, Notification, Mentor, MentorAssignment, PreIncubatee, Event, Document, AuditLog } = require('./models');
    
    // Sync database
    await sequelize.sync({ alter: true });
    console.log('✔ PostgreSQL tables created successfully');
    
    dbConnected = true;
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ideaRoutes = require('./routes/ideas');
const collegeRoutes = require('./routes/colleges');
const incubatorRoutes = require('./routes/incubators');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const teamMemberRoutes = require('./routes/teamMembers');
const fileRoutes = require('./routes/files');
const notificationRoutes = require('./routes/notifications');
const mentorRoutes = require('./routes/mentors');
const mentorAssignmentRoutes = require('./routes/mentorAssignments');
const preIncubateeRoutes = require('./routes/preIncubatees');
const eventRoutes = require('./routes/events');
const documentRoutes = require('./routes/documents');
const auditRoutes = require('./routes/audit');
const adminRoutes = require('./routes/admin');
const cmsRoutes = require('./routes/cms');
const analyticsRoutes = require('./routes/analytics');
const healthRoutes = require('./routes/health');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/incubators', incubatorRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/team-members', teamMemberRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/mentor-assignments', mentorAssignmentRoutes);
app.use('/api/pre-incubatees', preIncubateeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', healthRoutes);

// Serve React frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
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
    console.log(`🚀 Innovation Hub Full-Stack server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`🗄️ Database: ${dbConnected ? 'PostgreSQL connected' : 'not connected'}`);
    console.log(`🌐 Frontend: React app served from /frontend/build`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}).catch((error) => {
  console.error('❌ Failed to start server:', error);
  // Still start the server even if database fails
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Innovation Hub Full-Stack server running on port ${PORT} (without database)`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`🗄️ Database: not connected`);
    console.log(`🌐 Frontend: React app served from /frontend/build`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
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

module.exports = { app, server, io };
