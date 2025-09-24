const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

// Use the universal database configuration
const { sequelize, connectDB } = require('./config/database-universal');

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

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ideaRoutes = require('./routes/ideas');
const collegeRoutes = require('./routes/colleges');
const mentorRoutes = require('./routes/mentors');
const adminRoutes = require('./routes/admin');
const adminCMSRoutes = require('./routes/admin-cms');
const publicCMSRoutes = require('./routes/public-cms');
const auditRoutes = require('./routes/audit');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const documentRoutes = require('./routes/documents');
const eventRoutes = require('./routes/events');
const reportRoutes = require('./routes/reports');
const cmsEnhancedRoutes = require('./routes/cms-enhanced');

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
    message: 'Innovation Hub API is running on Railway',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    uptime: process.uptime(),
    database: process.env.DB_TYPE || 'sqlite'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Innovation Hub API (Railway)!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
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

connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Innovation Hub API server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🗄️ Database: ${process.env.DB_TYPE || 'sqlite'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}).catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
