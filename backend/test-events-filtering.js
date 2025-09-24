const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testEventsFiltering() {
  try {
    console.log('🔍 Testing Events Filtering...\n');
    
    // 1. Login as college admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    const user = loginResponse.data.data?.user || loginResponse.data.user;
    
    console.log('✅ Logged in as:', user.role, 'College ID:', user.college_id);
    
    // 2. Test events API
    const eventsResponse = await axios.get(`${BASE_URL}/events`, { headers });
    console.log('✅ Events API response:');
    console.log('Total events returned:', eventsResponse.data.data.events.length);
    
    // 3. Check each event
    eventsResponse.data.data.events.forEach((event, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log(`  ID: ${event.id}`);
      console.log(`  Title: "${event.title}"`);
      console.log(`  Status: ${event.status}`);
      console.log(`  College ID: ${event.college_id}`);
      console.log(`  Creator: ${event.creator?.name || 'Unknown'}`);
      console.log(`  Start Date: ${event.start_date}`);
    });
    
    // 4. Check if all events belong to the same college
    const collegeIds = [...new Set(eventsResponse.data.data.events.map(e => e.college_id))];
    console.log('\n📊 College IDs in response:', collegeIds);
    
    if (collegeIds.length === 1) {
      console.log('✅ All events belong to the same college');
    } else {
      console.log('❌ Events from multiple colleges found');
    }
    
    console.log('\n🎯 Events filtering test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testEventsFiltering();
