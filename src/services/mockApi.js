// Mock API service for demonstration
const mockData = {
  circulars: [
    {
      id: 1,
      title: "Welcome to Innovation Hub",
      description: "This is a test circular for the Innovation Hub",
      category: "general",
      priority: "medium",
      file_name: "welcome.pdf",
      created_at: new Date().toISOString(),
      is_active: true,
      is_public: true
    },
    {
      id: 2,
      title: "Student Registration Guidelines",
      description: "Important guidelines for student registration",
      category: "academic",
      priority: "high",
      file_name: "registration.pdf",
      created_at: new Date().toISOString(),
      is_active: true,
      is_public: true
    }
  ],
  stats: {
    totalIdeas: 150,
    preIncubateesForwarded: 75,
    ideasIncubated: 12,
    collegesOnboarded: 25,
    activeUsers: 300,
    mentorsRegistered: 8,
    successfulStartups: 5
  }
};

export const mockApi = {
  // Circulars
  getCirculars: () => Promise.resolve({
    success: true,
    data: mockData.circulars
  }),
  
  // Statistics
  getStats: () => Promise.resolve({
    success: true,
    data: mockData.stats
  }),
  
  // Health check
  healthCheck: () => Promise.resolve({
    status: 'OK',
    message: 'Mock API is working',
    timestamp: new Date().toISOString()
  })
};

export default mockApi;
