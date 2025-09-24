// Database initialization endpoint
const { initializeDatabase } = require('./database');

module.exports = async (req, res) => {
  try {
    await initializeDatabase();
    res.status(200).json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Database initialization failed',
      message: error.message
    });
  }
};
