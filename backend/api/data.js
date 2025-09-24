// Comprehensive data endpoint for Innovation Hub
module.exports = (req, res) => {
  const { method, url } = req;
  
  // Mock data for the Innovation Hub
  const mockData = {
    circulars: [
      {
        id: 1,
        title: "Welcome to Innovation Hub",
        description: "This is a test circular for the Innovation Hub",
        category: "general",
        priority: "medium",
        file_name: "welcome.pdf",
        file_path: "/uploads/circulars/welcome.pdf",
        created_at: new Date().toISOString(),
        is_active: true,
        is_public: true,
        download_count: 0
      },
      {
        id: 2,
        title: "Student Registration Guidelines",
        description: "Important guidelines for student registration",
        category: "academic",
        priority: "high",
        file_name: "registration.pdf",
        file_path: "/uploads/circulars/registration.pdf",
        created_at: new Date().toISOString(),
        is_active: true,
        is_public: true,
        download_count: 0
      },
      {
        id: 3,
        title: "Innovation Challenge 2024",
        description: "Annual innovation challenge for students",
        category: "competition",
        priority: "high",
        file_name: "innovation-challenge.pdf",
        file_path: "/uploads/circulars/innovation-challenge.pdf",
        created_at: new Date().toISOString(),
        is_active: true,
        is_public: true,
        download_count: 0
      }
    ],
    statistics: {
      totalIdeas: 150,
      preIncubateesForwarded: 75,
      ideasIncubated: 12,
      collegesOnboarded: 25,
      activeUsers: 300,
      mentorsRegistered: 8,
      successfulStartups: 5
    },
    colleges: [
      {
        id: 1,
        name: "Sant Gadge Baba Amravati University",
        district: "Amravati",
        website: "https://www.sgbau.ac.in",
        logo_url: "/images/colleges/sgbau-logo.png",
        address: "Amravati, Maharashtra",
        contact_email: "info@sgbau.ac.in"
      },
      {
        id: 2,
        name: "Government College of Engineering",
        district: "Amravati",
        website: "https://www.gceamravati.ac.in",
        logo_url: "/images/colleges/gce-logo.png",
        address: "Amravati, Maharashtra",
        contact_email: "info@gceamravati.ac.in"
      }
    ],
    documents: [
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
  };

  // Handle different endpoints
  if (url.includes('/circulars')) {
    res.status(200).json({
      success: true,
      data: mockData.circulars
    });
  } else if (url.includes('/statistics')) {
    res.status(200).json({
      success: true,
      data: mockData.statistics
    });
  } else if (url.includes('/colleges')) {
    res.status(200).json({
      success: true,
      data: mockData.colleges
    });
  } else if (url.includes('/documents')) {
    res.status(200).json({
      success: true,
      data: mockData.documents
    });
  } else {
    res.status(200).json({
      success: true,
      message: 'Innovation Hub API is working',
      timestamp: new Date().toISOString(),
      available_endpoints: [
        '/api/public/cms/circulars',
        '/api/public/cms/statistics',
        '/api/public/cms/colleges',
        '/api/public/cms/documents'
      ]
    });
  }
};
