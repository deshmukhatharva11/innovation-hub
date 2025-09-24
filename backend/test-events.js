const axios = require('axios');

async function testEventVisibility() {
  try {
    console.log('🔍 Testing event visibility...\n');
    
    // Test college admin
    const adminLogin = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin1@college1.edu',
      password: 'admin123'
    });
    
    if (adminLogin.data.success) {
      const adminToken = adminLogin.data.data.token;
      console.log('✅ College admin logged in');
      
      const adminEvents = await axios.get('http://localhost:3001/api/events', {
        headers: { 'Authorization': 'Bearer ' + adminToken }
      });
      
      console.log('📋 College admin events count:', adminEvents.data.data.events.length);
      
      // Show all events
      adminEvents.data.data.events.forEach(e => {
        console.log('  -', e.title, '(incubator_id:', e.incubator_id, ', college_id:', e.college_id, ')');
      });
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testEventVisibility();
