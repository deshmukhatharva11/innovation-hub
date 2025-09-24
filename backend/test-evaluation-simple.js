const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testEvaluationSimple() {
  try {
    console.log('🔍 Testing Evaluation Simple...\n');
    
    // 1. Login as college admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Login successful\n');
    
    // 2. Create a new test idea first
    console.log('2. Creating new test idea...');
    const ideaResponse = await axios.post(`${BASE_URL}/ideas`, {
      title: 'Simple Test Idea for Evaluation',
      description: 'A simple test idea for evaluation testing',
      category: 'Technology',
      problem_statement: 'Testing evaluation system',
      solution_approach: 'Simple solution approach',
      team_size: 1,
      funding_required: 10000,
      timeline: '3 months'
    }, { headers: authHeaders });
    
    if (ideaResponse.data.success) {
      const ideaId = ideaResponse.data.data.id;
      console.log('✅ Test idea created:', ideaId);
      
      // 3. Test evaluation
      console.log('\n3. Testing evaluation...');
      const evaluationData = {
        rating: 7,
        comments: 'Good test idea',
        recommendation: 'nurture',
        nurture_notes: 'Needs more development'
      };
      
      try {
        const response = await axios.post(
          `${BASE_URL}/college-coordinator/ideas/${ideaId}/evaluate`,
          evaluationData,
          { headers: authHeaders }
        );
        console.log('✅ Evaluation successful:', response.data);
      } catch (error) {
        console.log('❌ Evaluation failed:');
        console.log('Status:', error.response?.status);
        console.log('Data:', JSON.stringify(error.response?.data, null, 2));
      }
    } else {
      console.log('❌ Failed to create test idea:', ideaResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testEvaluationSimple();
