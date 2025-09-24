const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { Sequelize } = require('sequelize');

dotenv.config();

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite::memory:', {
  logging: false,
  dialect: process.env.DATABASE_URL ? 'postgres' : 'sqlite'
});

// Define models
const Circular = sequelize.define('Circular', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT
  },
  category: {
    type: Sequelize.STRING,
    defaultValue: 'general'
  },
  priority: {
    type: Sequelize.STRING,
    defaultValue: 'medium'
  },
  file_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  file_path: {
    type: Sequelize.STRING,
    allowNull: false
  },
  is_active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  is_public: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
});

const Statistics = sequelize.define('Statistics', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  totalIdeas: {
    type: Sequelize.INTEGER,
    defaultValue: 150
  },
  preIncubateesForwarded: {
    type: Sequelize.INTEGER,
    defaultValue: 75
  },
  ideasIncubated: {
    type: Sequelize.INTEGER,
    defaultValue: 12
  },
  collegesOnboarded: {
    type: Sequelize.INTEGER,
    defaultValue: 25
  },
  activeUsers: {
    type: Sequelize.INTEGER,
    defaultValue: 300
  },
  mentorsRegistered: {
    type: Sequelize.INTEGER,
    defaultValue: 8
  },
  successfulStartups: {
    type: Sequelize.INTEGER,
    defaultValue: 5
  }
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database and seed data
const initializeDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    
    // Seed data
    await Circular.bulkCreate([
      {
        title: "Welcome to Innovation Hub",
        description: "This is a test circular for the Innovation Hub",
        category: "general",
        priority: "medium",
        file_name: "welcome.pdf",
        file_path: "/uploads/circulars/welcome.pdf",
        is_active: true,
        is_public: true
      },
      {
        title: "Student Registration Guidelines",
        description: "Important guidelines for student registration",
        category: "academic",
        priority: "high",
        file_name: "registration.pdf",
        file_path: "/uploads/circulars/registration.pdf",
        is_active: true,
        is_public: true
      }
    ]);

    await Statistics.create({
      totalIdeas: 150,
      preIncubateesForwarded: 75,
      ideasIncubated: 12,
      collegesOnboarded: 25,
      activeUsers: 300,
      mentorsRegistered: 8,
      successfulStartups: 5
    });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// API Routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Innovation Hub API is running on Railway',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL ? 'postgresql' : 'sqlite'
  });
});

app.get('/api/public/cms/circulars', async (req, res) => {
  try {
    const circulars = await Circular.findAll({
      where: {
        is_active: true,
        is_public: true
      },
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: circulars
    });
  } catch (error) {
    console.error('Error fetching circulars:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch circulars'
    });
  }
});

app.get('/api/public/cms/statistics', async (req, res) => {
  try {
    const stats = await Statistics.findOne({
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: stats || {
        totalIdeas: 0,
        preIncubateesForwarded: 0,
        ideasIncubated: 0,
        collegesOnboarded: 0,
        activeUsers: 0,
        mentorsRegistered: 0,
        successfulStartups: 0
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Innovation Hub API (Railway)!');
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// WebSocket
io.on('connection', (socket) => {
  console.log('User connected via WebSocket');
  socket.on('disconnect', () => {
    console.log('User disconnected from WebSocket');
  });
});

// Start server
const PORT = process.env.PORT || 3001;

initializeDatabase().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Innovation Hub API server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Database: ${process.env.DATABASE_URL ? 'postgresql' : 'sqlite'}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
