const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test credentials
const STUDENT_CREDENTIALS = {
  email: 'student@example.com',
  password: 'password123'
};

async function createTestIdea() {
  try {
    console.log('🔄 Logging in as student...');
    
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, STUDENT_CREDENTIALS);
    const token = loginResponse.data.token;
    
    console.log('✅ Student login successful');
    console.log('🔑 Token:', token ? 'received' : 'missing');
    console.log('📋 Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    // Create a new idea
    const ideaData = {
      title: 'Smart Campus Management System',
      description: 'An AI-powered system to manage campus resources, track student activities, and optimize facility usage.',
      category: 'Education Technology',
      status: 'submitted',
      technology_stack: ['React', 'Node.js', 'AI/ML', 'IoT'],
      implementation_plan: 'Phase 1: Requirements gathering\nPhase 2: System design\nPhase 3: Development\nPhase 4: Testing and deployment',
      market_potential: 'High demand in educational institutions across India. Market size estimated at $2B.',
      funding_required: 500000
    };
    
    console.log('🔄 Creating test idea for endorsement...');
    
    const createResponse = await axios.post(`${BASE_URL}/ideas`, ideaData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Test idea created successfully');
    console.log('💡 Idea ID:', createResponse.data.data.id);
    console.log('📝 Title:', createResponse.data.data.title);
    console.log('📊 Status:', createResponse.data.data.status);
    
    return createResponse.data.data.id;
    
  } catch (error) {
    console.error('❌ Error creating test idea:', error.response?.data || error.message);
    throw error;
  }
}

// Run the script
createTestIdea()
  .then((ideaId) => {
    console.log(`\n🎉 Test idea created with ID: ${ideaId}`);
    console.log('🔄 Now you can test idea endorsement functionality!');
  })
  .catch((error) => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
