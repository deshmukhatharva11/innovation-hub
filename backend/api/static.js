// Static file serving for Vercel
const path = require('path');

module.exports = (req, res) => {
  // Handle different static file requests
  const url = req.url;
  
  if (url.includes('/uploads/')) {
    // Serve uploaded files
    res.status(200).json({
      message: 'Static file endpoint working',
      url: url,
      timestamp: new Date().toISOString()
    });
  } else if (url.includes('/images/')) {
    // Serve images
    res.status(200).json({
      message: 'Image endpoint working',
      url: url,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({
      error: 'File not found',
      url: url
    });
  }
};
