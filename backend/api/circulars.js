// Simple circulars endpoint for testing
module.exports = (req, res) => {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: [
        {
          id: 1,
          title: "Welcome to Innovation Hub",
          description: "This is a test circular",
          category: "general",
          priority: "medium",
          file_name: "welcome.pdf",
          created_at: new Date().toISOString(),
          is_active: true,
          is_public: true
        }
      ]
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
