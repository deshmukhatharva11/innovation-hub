// Simple health check endpoint
module.exports = (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Innovation Hub API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
};
