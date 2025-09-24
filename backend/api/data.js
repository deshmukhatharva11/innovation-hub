// Comprehensive data endpoint for Innovation Hub with Database
const { Circular, Statistics, College, initializeDatabase } = require('./database');

// Initialize database on first load
let dbInitialized = false;

const ensureDatabaseInitialized = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

module.exports = async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    
    const { method, url } = req;
    
    // Handle different endpoints with database queries
    if (url.includes('/circulars')) {
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
    } else if (url.includes('/statistics')) {
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
    } else if (url.includes('/colleges')) {
      const colleges = await College.findAll({
        where: {
          is_active: true
        },
        order: [['name', 'ASC']]
      });
      
      res.status(200).json({
        success: true,
        data: colleges
      });
    } else if (url.includes('/documents')) {
      // For now, return mock documents since we don't have a documents table
      res.status(200).json({
        success: true,
        data: [
          {
            id: 1,
            title: "Innovation Hub Guidelines",
            description: "Complete guidelines for the Innovation Hub",
            document_type: "guidelines",
            file_path: "/uploads/documents/guidelines.pdf",
            access_level: "public",
            created_at: new Date().toISOString()
          }
        ]
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'Innovation Hub API with Database is working',
        timestamp: new Date().toISOString(),
        database_connected: true,
        available_endpoints: [
          '/api/public/cms/circulars',
          '/api/public/cms/statistics',
          '/api/public/cms/colleges',
          '/api/public/cms/documents'
        ]
      });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message
    });
  }
};
