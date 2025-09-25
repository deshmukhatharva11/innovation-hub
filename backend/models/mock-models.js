// Mock models for Vercel deployment without real database
console.log('⚠️  Using mock models for Vercel deployment');

// Mock User model
const mockUser = {
  findOne: async (options) => {
    // Return a mock user for testing
    if (options.where && options.where.email === 'admin@innovationhub.com') {
      return {
        id: 1,
        name: 'Admin User',
        email: 'admin@innovationhub.com',
        role: 'super_admin',
        is_verified: true,
        password: '$2a$10$mockhashedpassword'
      };
    }
    return null;
  },
  findAll: async () => {
    return [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@innovationhub.com',
        role: 'super_admin',
        is_verified: true
      }
    ];
  },
  create: async (data) => {
    return { id: 1, ...data };
  },
  update: async (data, options) => {
    return [1];
  },
  destroy: async (options) => {
    return 1;
  }
};

// Mock College model
const mockCollege = {
  findAll: async () => {
    return [
      {
        id: 1,
        name: 'Sant Gadge Baba Amravati University',
        location: 'Amravati, Maharashtra',
        type: 'University'
      }
    ];
  },
  findOne: async (options) => {
    return {
      id: 1,
      name: 'Sant Gadge Baba Amravati University',
      location: 'Amravati, Maharashtra',
      type: 'University'
    };
  },
  create: async (data) => {
    return { id: 1, ...data };
  }
};

// Mock Idea model
const mockIdea = {
  findAll: async () => {
    return [
      {
        id: 1,
        title: 'Smart Agriculture System',
        description: 'IoT-based agriculture monitoring',
        status: 'under_review',
        student_id: 1,
        college_id: 1
      }
    ];
  },
  findOne: async (options) => {
    return {
      id: 1,
      title: 'Smart Agriculture System',
      description: 'IoT-based agriculture monitoring',
      status: 'under_review',
      student_id: 1,
      college_id: 1
    };
  },
  create: async (data) => {
    return { id: 1, ...data };
  },
  update: async (data, options) => {
    return [1];
  }
};

// Mock Event model
const mockEvent = {
  findAll: async () => {
    return [
      {
        id: 1,
        title: 'Innovation Hub Launch',
        description: 'Grand launch event',
        date: new Date(),
        status: 'upcoming'
      }
    ];
  },
  create: async (data) => {
    return { id: 1, ...data };
  }
};

// Export mock models
module.exports = {
  User: mockUser,
  College: mockCollege,
  Idea: mockIdea,
  Event: mockEvent
};
