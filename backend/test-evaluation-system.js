const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testEvaluationSystem() {
  try {
    console.log('🔍 Testing Evaluation System...\n');
    
    // 1. Login as college admin
    console.log('1. Logging in as college admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    if (!token) {
      throw new Error('No token received');
    }
    
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 20) + '...\n');
    
    // 2. Test dashboard to see pending evaluations
    console.log('2. Testing dashboard for pending evaluations...');
    const dashboardResponse = await axios.get(`${BASE_URL}/college-coordinator/dashboard`, { headers: authHeaders });
    console.log('Dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));
    console.log('Pending evaluations:', dashboardResponse.data.data.stats.pendingEvaluations);
    
    // 3. Test ideas endpoint to see what ideas are available
    console.log('\n3. Testing ideas endpoint...');
    const ideasResponse = await axios.get(`${BASE_URL}/college-coordinator/ideas`, { headers: authHeaders });
    console.log('Total ideas:', ideasResponse.data.data.pagination.total_items);
    
    // Filter ideas that need evaluation
    const pendingIdeas = ideasResponse.data.data.ideas.filter(idea => 
      ['submitted', 'new_submission', 'under_review'].includes(idea.status)
    );
    console.log('Ideas needing evaluation:', pendingIdeas.length);
    console.log('Ideas by status:');
    ideasResponse.data.data.ideas.forEach(idea => {
      console.log(`- ${idea.title} (${idea.status})`);
    });
    
    // 4. Test evaluation endpoint if there are pending ideas
    if (pendingIdeas.length > 0) {
      const ideaToEvaluate = pendingIdeas[0];
      console.log(`\n4. Testing evaluation for idea: ${ideaToEvaluate.title}`);
      
      const evaluationData = {
        rating: 8,
        comments: 'Great idea with potential',
        recommendation: 'nurture',
        nurture_notes: 'Needs more technical details'
      };
      
      console.log('Evaluation data:', evaluationData);
      
      try {
        const evaluateResponse = await axios.post(
          `${BASE_URL}/college-coordinator/ideas/${ideaToEvaluate.id}/evaluate`,
          evaluationData,
          { headers: authHeaders }
        );
        console.log('✅ Evaluation successful:', evaluateResponse.data);
      } catch (evalError) {
        console.log('❌ Evaluation failed:', evalError.response?.data || evalError.message);
      }
    } else {
      console.log('\n4. No ideas available for evaluation');
    }
    
    // 5. Test students endpoint
    console.log('\n5. Testing students endpoint...');
    try {
      const studentsResponse = await axios.get(`${BASE_URL}/college-coordinator/students`, { headers: authHeaders });
      console.log('✅ Students endpoint working:', studentsResponse.data.data.students.length, 'students found');
    } catch (studentsError) {
      console.log('❌ Students endpoint failed:', studentsError.response?.data || studentsError.message);
    }
    
    // 6. Test notifications endpoint
    console.log('\n6. Testing notifications endpoint...');
    try {
      const notificationsResponse = await axios.get(`${BASE_URL}/college-coordinator/notifications`, { headers: authHeaders });
      console.log('✅ Notifications endpoint working:', notificationsResponse.data.data.notifications.length, 'notifications found');
    } catch (notificationsError) {
      console.log('❌ Notifications endpoint failed:', notificationsError.response?.data || notificationsError.message);
    }
    
    // 7. Test chat students endpoint
    console.log('\n7. Testing chat students endpoint...');
    try {
      const chatStudentsResponse = await axios.get(`${BASE_URL}/college-coordinator/chat/students`, { headers: authHeaders });
      console.log('✅ Chat students endpoint working:', chatStudentsResponse.data.data.students.length, 'students found');
    } catch (chatError) {
      console.log('❌ Chat students endpoint failed:', chatError.response?.data || chatError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testEvaluationSystem();
