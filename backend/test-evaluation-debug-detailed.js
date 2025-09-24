const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testEvaluationDebugDetailed() {
  try {
    console.log('🔍 Testing Evaluation Debug Detailed...\n');
    
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
      
      // 3. Test with different recommendation values
      const testCases = [
        { recommendation: 'nurture', rating: 8 },
        { recommendation: 'forward', rating: 9 },
        { recommendation: 'reject', rating: 3 }
      ];
      
      for (const testCase of testCases) {
        console.log(`\nTesting with recommendation: ${testCase.recommendation}, rating: ${testCase.rating}`);
        
        const evaluationData = {
          rating: testCase.rating,
          comments: 'Test evaluation',
          recommendation: testCase.recommendation,
          nurture_notes: 'Test notes'
        };
        
        try {
          const response = await axios.post(
            `${BASE_URL}/college-coordinator/ideas/${ideaToEvaluate.id}/evaluate`,
            evaluationData,
            { headers: authHeaders }
          );
          console.log('✅ Evaluation successful:', response.data);
          break; // If successful, stop testing
        } catch (error) {
          console.log('❌ Evaluation failed:');
          console.log('Status:', error.response?.status);
          console.log('Data:', JSON.stringify(error.response?.data, null, 2));
          
          // If it's a "already evaluated" error, try with a different idea
          if (error.response?.data?.message?.includes('already evaluated')) {
            console.log('Trying with a different idea...');
            const anotherIdea = pendingIdeas.find(idea => idea.id !== ideaToEvaluate.id);
            if (anotherIdea) {
              console.log('Trying with idea:', anotherIdea.title, anotherIdea.id);
              try {
                const response = await axios.post(
                  `${BASE_URL}/college-coordinator/ideas/${anotherIdea.id}/evaluate`,
                  evaluationData,
                  { headers: authHeaders }
                );
                console.log('✅ Evaluation successful with different idea:', response.data);
                break;
              } catch (error2) {
                console.log('❌ Still failed:', error2.response?.data);
              }
            }
          }
        }
      }
    } else {
      console.log('No ideas available for evaluation');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testEvaluationDebugDetailed();
