// Database connection and models for Vercel serverless functions
const { Sequelize } = require('sequelize');

// Create database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // Use in-memory database for Vercel
  logging: false,
  define: {
    timestamps: true,
    underscored: true
  }
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
    type: Sequelize.ENUM('academic', 'administrative', 'examination', 'admission', 'other'),
    defaultValue: 'other'
  },
  priority: {
    type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
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
  file_size: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  mime_type: {
    type: Sequelize.STRING
  },
  uploaded_by: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  download_count: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  expires_at: {
    type: Sequelize.DATE
  },
  is_active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  is_public: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'circulars'
});

const Statistics = sequelize.define('Statistics', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  totalIdeas: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  preIncubateesForwarded: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  ideasIncubated: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  collegesOnboarded: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  activeUsers: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  mentorsRegistered: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  successfulStartups: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'statistics'
});

const College = sequelize.define('College', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  district: {
    type: Sequelize.STRING
  },
  website: {
    type: Sequelize.STRING
  },
  logo_url: {
    type: Sequelize.STRING
  },
  address: {
    type: Sequelize.TEXT
  },
  contact_email: {
    type: Sequelize.STRING
  },
  is_active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'colleges'
});

// Initialize database and seed data
const initializeDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    
    // Seed initial data
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
      },
      {
        title: "Innovation Challenge 2024",
        description: "Annual innovation challenge for students",
        category: "competition",
        priority: "high",
        file_name: "innovation-challenge.pdf",
        file_path: "/uploads/circulars/innovation-challenge.pdf",
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

    await College.bulkCreate([
      {
        name: "Sant Gadge Baba Amravati University",
        district: "Amravati",
        website: "https://www.sgbau.ac.in",
        logo_url: "/images/colleges/sgbau-logo.png",
        address: "Amravati, Maharashtra",
        contact_email: "info@sgbau.ac.in",
        is_active: true
      },
      {
        name: "Government College of Engineering",
        district: "Amravati",
        website: "https://www.gceamravati.ac.in",
        logo_url: "/images/colleges/gce-logo.png",
        address: "Amravati, Maharashtra",
        contact_email: "info@gceamravati.ac.in",
        is_active: true
      }
    ]);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = {
  sequelize,
  Circular,
  Statistics,
  College,
  initializeDatabase
};
