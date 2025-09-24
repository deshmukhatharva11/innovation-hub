const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAnalyticsDebug() {
  try {
    console.log('🔍 Testing Analytics Debug...\n');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Login successful');
      
      const analyticsResponse = await axios.get(`${BASE_URL}/analytics/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (analyticsResponse.data.success) {
        const analytics = analyticsResponse.data.data.analytics;
        console.log(`✅ Analytics response:`);
        console.log(`   Top Performers Count: ${analytics.top_performers?.length || 0}`);
        
        if (analytics.top_performers && analytics.top_performers.length > 0) {
          console.log('\n📊 Top Performers Data:');
          analytics.top_performers.forEach((student, index) => {
            console.log(`   ${index + 1}. ${student.name} - ${student.total_ideas} ideas`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAnalyticsDebug();
