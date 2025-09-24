const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const TEST_URL = 'http://localhost:3002';

async function testSimpleEvaluation() {
  try {
    console.log('🔍 Testing Simple Evaluation...\n');
    
    // 1. Login as college admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Login successful\n');
    
    // 2. Get ideas that need evaluation
    const ideasResponse = await axios.get(`${BASE_URL}/college-coordinator/ideas`, { headers: authHeaders });
    const pendingIdeas = ideasResponse.data.data.ideas.filter(idea => 
      ['submitted', 'new_submission', 'under_review'].includes(idea.status)
    );
    
    console.log('Pending ideas:', pendingIdeas.length);
    
    if (pendingIdeas.length > 0) {
      const ideaToEvaluate = pendingIdeas[0];
      console.log('Idea to evaluate:', {
        id: ideaToEvaluate.id,
        title: ideaToEvaluate.title,
        status: ideaToEvaluate.status
      });
      
      // 3. Test evaluation with simple server
      const evaluationData = {
        rating: 8,
        comments: 'Great idea with potential',
        recommendation: 'nurture',
        nurture_notes: 'Needs more technical details'
      };
      
      try {
        const response = await axios.post(
          `${TEST_URL}/test-evaluate/${ideaToEvaluate.id}`,
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
      console.log('No ideas available for evaluation');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSimpleEvaluation();
