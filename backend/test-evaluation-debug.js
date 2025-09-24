const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testEvaluationDebug() {
  try {
    console.log('🔍 Testing Evaluation Debug...\n');
    
    // 1. Login as college admin
    console.log('1. Logging in as college admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Login successful\n');
    
    // 2. Get ideas that need evaluation
    console.log('2. Getting ideas that need evaluation...');
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
      
      // 3. Test evaluation with detailed error handling
      console.log('\n3. Testing evaluation with detailed error handling...');
      const evaluationData = {
        rating: 8,
        comments: 'Great idea with potential',
        recommendation: 'nurture',
        nurture_notes: 'Needs more technical details'
      };
      
      try {
        const evaluateResponse = await axios.post(
          `${BASE_URL}/college-coordinator/ideas/${ideaToEvaluate.id}/evaluate`,
          evaluationData,
          { headers: authHeaders }
        );
        console.log('✅ Evaluation successful:', evaluateResponse.data);
      } catch (evalError) {
        console.log('❌ Evaluation failed:');
        console.log('Status:', evalError.response?.status);
        console.log('Data:', JSON.stringify(evalError.response?.data, null, 2));
        console.log('Headers:', evalError.response?.headers);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testEvaluationDebug();
