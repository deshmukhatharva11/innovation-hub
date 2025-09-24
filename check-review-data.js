const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test credentials
const COLLEGE_ADMIN_CREDENTIALS = {
  email: 'college@example.com',
  password: 'password123'
};

const STUDENT_CREDENTIALS = {
  email: 'student@example.com',
  password: 'password123'
};

async function checkAndCreateReviewData() {
  try {
    console.log('🔄 Checking review data...');
    
    // Login as college admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, COLLEGE_ADMIN_CREDENTIALS);
    const token = loginResponse.data.data.token;
    console.log('✅ College admin login successful');
    
    // Check current ideas for review
    console.log('1. Checking existing ideas for review...');
    const reviewResponse = await axios.get(`${BASE_URL}/ideas/review?status=submitted`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Ideas for review: ${reviewResponse.data.data?.ideas?.length || 0}`);
    
    if (reviewResponse.data.data?.ideas?.length === 0) {
      console.log('2. No ideas for review found. Creating test idea...');
      
      // Login as student to create an idea
      const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, STUDENT_CREDENTIALS);
      const studentToken = studentLoginResponse.data.data.token;
      console.log('✅ Student login successful');
      
      // Create a test idea in submitted status
      const ideaData = {
        title: 'Smart Campus Energy Management System',
        description: 'An IoT-based system to monitor and optimize energy usage across campus buildings using machine learning algorithms to predict consumption patterns and automatically adjust systems for maximum efficiency.',
        category: 'Technology',
        status: 'submitted',
        problem_statement: 'High energy costs and wastage in campus buildings due to lack of real-time monitoring and inefficient manual controls.',
        solution_approach: 'Deploy IoT sensors throughout campus buildings to collect real-time energy usage data, implement ML algorithms for pattern recognition and prediction, and create an automated control system.',
        market_potential: 'Educational institutions globally spend billions on energy. A 20-30% reduction could save significant costs.',
        technical_feasibility: 'High - using existing IoT technologies, cloud computing, and proven ML algorithms.',
        funding_required: 250000,
        timeline: '6 months for prototype, 12 months for full deployment',
        team_size: 4,
        is_public: true
      };
      
      const createResponse = await axios.post(`${BASE_URL}/ideas`, ideaData, {
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Test idea created successfully');
      console.log(`📝 Idea: "${createResponse.data.data.idea.title}"`);
      console.log(`📊 Status: ${createResponse.data.data.idea.status}`);
      
      // Check again
      const reviewResponseAfter = await axios.get(`${BASE_URL}/ideas/review?status=submitted`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`🎉 Ideas for review now: ${reviewResponseAfter.data.data?.ideas?.length || 0}`);
    }
    
    // Test analytics endpoint
    console.log('3. Testing analytics endpoint...');
    const analyticsResponse = await axios.get(`${BASE_URL}/analytics/dashboard?period=30d`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Analytics response received');
    console.log('📊 Analytics data keys:', Object.keys(analyticsResponse.data.data || {}));
    
  } catch (error) {
    console.error('❌ Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
  }
}

checkAndCreateReviewData();
