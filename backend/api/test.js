// Simple test endpoint for Vercel
module.exports = (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend is working!',
    timestamp: new Date(),
    method: req.method,
    url: req.url
  });
};
