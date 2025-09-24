const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

// Configure dotenv
dotenv.config();

// Import database connection
const { sequelize } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ideaRoutes = require('./routes/ideas');
const collegeRoutes = require('./routes/colleges');
const incubatorRoutes = require('./routes/incubators');
const incubatorManagerRoutes = require('./routes/incubator-manager');
const preIncubateesRoutes = require('./routes/pre-incubatees');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const adminAnalyticsRoutes = require('./routes/admin-analytics');
const adminCMSRoutes = require('./routes/admin-cms');
const cmsEnhancedRoutes = require('./routes/cms-enhanced');
const adminAuditRoutes = require('./routes/admin-audit');
const { auditMiddleware } = require('./middleware/auditMiddleware');
const publicCMSRoutes = require('./routes/public-cms');
const eventRoutes = require('./routes/events');
const documentRoutes = require('./routes/documents');
const chatRoutes = require('./routes/chat');
const collegeCoordinatorRoutes = require('./routes/college-coordinator-enhanced');
const studentEventsRoutes = require('./routes/student-events');
const studentDocumentsRoutes = require('./routes/student-documents');
const mentorsRoutes = require('./routes/mentors');
const mentorAssignmentsRoutes = require('./routes/mentor-assignments');
const mentorChatsRoutes = require('./routes/mentor-chats');
const reportsRoutes = require('./routes/reports');
const contactRoutes = require('./routes/contact');
const emailVerificationRoutes = require('./routes/emailVerification');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = 3001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting - Relaxed for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased limit
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and development
    return req.path === '/health' || process.env.NODE_ENV === 'development';
  },
});

app.use(limiter);

// CORS configuration - Enhanced to fix CORS policy errors
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://192.168.0.101:3000',
      'http://192.168.0.101:3001'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
}));

// Additional global CORS middleware for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Content-Disposition');
  res.header('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Add CORS headers specifically for uploads
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  res.header('Cache-Control', 'public, max-age=31536000');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Audit middleware for all API routes
app.use('/api', auditMiddleware({
  skipPaths: ['/health', '/favicon.ico', '/public'],
  skipMethods: ['OPTIONS']
}));



// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Innovation Hub API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

// Static file serving for uploads with CORS
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  res.header('Cache-Control', 'public, max-age=31536000');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}, express.static(path.join(__dirname, 'uploads')));

app.use('/files', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  res.header('Cache-Control', 'public, max-age=31536000');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}, express.static(path.join(__dirname, 'uploads')));

// Special route for profile images with enhanced CORS
app.get('/uploads/profile_image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', 'profile_image', filename);
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Content-Disposition');
  res.header('Cache-Control', 'public, max-age=31536000');
  
  // Check if file exists
  if (require('fs').existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

// API route for profile images (bypasses CORS completely)
app.get('/api/profile-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', 'profile_image', filename);
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Content-Disposition');
  res.header('Cache-Control', 'public, max-age=31536000');
  
  // Check if file exists
  if (require('fs').existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/incubators', incubatorRoutes);
app.use('/api/incubator-manager', incubatorManagerRoutes);
app.use('/api/pre-incubatees', preIncubateesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/cms', adminCMSRoutes);
app.use('/api/cms', cmsEnhancedRoutes);
app.use('/api/admin/audit', adminAuditRoutes);
app.use('/api/public/cms', publicCMSRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/college-coordinator', collegeCoordinatorRoutes);
app.use('/api/student-events', studentEventsRoutes);
app.use('/api/student-documents', studentDocumentsRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/mentor-assignments', mentorAssignmentsRoutes);
app.use('/api/mentor-chats', mentorChatsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/email', emailVerificationRoutes);

// General dashboard endpoint that routes based on user role
app.get('/api/dashboard', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    console.log('🔍 Dashboard request for role:', userRole);
    
    if (userRole === 'mentor') {
      // Call mentor dashboard logic directly
      const mentorId = req.user.id;
      const mentor = req.user;

      console.log('🔍 Mentor dashboard request for mentor ID:', mentorId);

      // Get mentor assignments with student and idea details
      const { MentorAssignment, MentorChat, User, College, Idea } = require('./models');
      
      const assignments = await MentorAssignment.findAll({
        where: { mentor_id: mentorId, is_active: true },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'email', 'department', 'year_of_study', 'college_id'],
            include: [
              {
                model: College,
                as: 'college',
                attributes: ['id', 'name', 'district']
              }
            ]
          },
          {
            model: Idea,
            as: 'idea',
            attributes: ['id', 'title', 'status', 'category', 'created_at']
          }
        ]
      });

      // Get mentor chats
      const chats = await MentorChat.findAll({
        where: { mentor_id: mentorId, is_active: true },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'email', 'department', 'year_of_study', 'college_id'],
            include: [
              {
                model: College,
                as: 'college',
                attributes: ['id', 'name', 'district']
              }
            ]
          },
          {
            model: Idea,
            as: 'idea',
            attributes: ['id', 'title', 'status', 'category']
          }
        ],
        order: [['last_message_at', 'DESC']]
      });

      // Calculate statistics
      const totalStudents = new Set(assignments.map(a => a.student_id)).size;
      const myCollegeStudents = assignments.filter(a => 
        a.student?.college_id === mentor.college_id
      ).length;
      const otherCollegeStudents = assignments.filter(a => 
        a.student?.college_id !== mentor.college_id
      ).length;
      const activeChats = chats.filter(c => c.status === 'active').length;

      // Group students by college
      const studentsByCollege = {};
      assignments.forEach(assignment => {
        const student = assignment.student;
        if (student) {
          const collegeId = student.college_id;
          if (!studentsByCollege[collegeId]) {
            studentsByCollege[collegeId] = {
              college: student.college,
              students: []
            };
          }
          
          // Check if student already exists in this college
          const existingStudent = studentsByCollege[collegeId].students.find(s => s.id === student.id);
          if (!existingStudent) {
            studentsByCollege[collegeId].students.push({
              ...student.toJSON(),
              ideas_count: assignments.filter(a => a.student_id === student.id).length,
              endorsed_ideas: assignments.filter(a => 
                a.student_id === student.id && a.idea?.status === 'endorsed'
              ).length
            });
          }
        }
      });

      // Get students from mentor's college
      const myCollegeStudentsList = Object.values(studentsByCollege)
        .filter(college => college.college?.id === mentor.college_id)
        .flatMap(college => college.students);

      // Get students from other colleges
      const otherCollegeStudentsList = Object.values(studentsByCollege)
        .filter(college => college.college?.id !== mentor.college_id)
        .flatMap(college => college.students);

      console.log('✅ Mentor dashboard data:', {
        totalStudents,
        myCollegeStudents: myCollegeStudentsList.length,
        otherCollegeStudents: otherCollegeStudentsList.length,
        activeChats,
        assignmentsCount: assignments.length,
        chatsCount: chats.length
      });

      res.json({
        success: true,
        data: {
          stats: {
            total_students: totalStudents,
            my_college: myCollegeStudentsList.length,
            other_colleges: otherCollegeStudentsList.length,
            active_chats: activeChats
          },
          students: {
            my_college: myCollegeStudentsList,
            other_colleges: otherCollegeStudentsList
          },
          conversations: chats.map(chat => ({
            id: chat.id,
            student: chat.student,
            idea: chat.idea,
            status: chat.status,
            last_message_at: chat.last_message_at,
            last_message: chat.last_message
          }))
        }
      });
    } else {
      // For other roles, return basic dashboard data
      const { Idea } = require('./models');
      const ideas = await Idea.findAll({
        where: { student_id: req.user.id },
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: {
          stats: {
            total_ideas: ideas.length,
            submitted_ideas: ideas.filter(i => i.status === 'submitted').length,
            under_review: ideas.filter(i => i.status === 'under_review').length,
            endorsed: ideas.filter(i => i.status === 'endorsed').length,
            rejected: ideas.filter(i => i.status === 'rejected').length
          },
          recent_ideas: ideas.slice(0, 5)
        }
      });
    }
  } catch (error) {
    console.error('Dashboard routing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// API health check endpoint (after all routes)
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    res.status(200).json({
      success: true,
      status: 'OK',
      message: 'API and database are healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'ERROR',
      message: 'API health check failed',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);
// Database connection and server startup
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // SQLite tuning; tolerate lock errors so startup never fails
    try { await sequelize.query('PRAGMA busy_timeout = 5000;'); } catch (_) {}
    try { await sequelize.query("PRAGMA journal_mode = WAL;"); } catch (_) {}
    try { await sequelize.query("PRAGMA synchronous = NORMAL;"); } catch (_) {}

    // Disable foreign key checks
    await sequelize.query('PRAGMA foreign_keys = OFF;');

    // Sync database models (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database models synchronized.');
    }

    // Re-enable foreign key checks
    await sequelize.query('PRAGMA foreign_keys = ON;');

    // Create HTTP server and attach WebSocket server
    const server = http.createServer(app);

    // Initialize Socket.IO service
    try {
      const socketService = require('./services/socketService');
      socketService.initialize(server);
      console.log('🧲 Socket.IO server initialized');
    } catch (wsErr) {
      console.error('❌ Failed to initialize Socket.IO server:', wsErr);
    }

    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Innovation Hub API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Network access: http://192.168.0.101:${PORT}/health`);
      console.log(`📱 Mobile access: http://192.168.0.101:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});


startServer();
