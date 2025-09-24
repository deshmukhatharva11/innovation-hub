const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testEventsFix() {
  try {
    console.log('🔍 Testing Events Fix...\n');
    
    // 1. Test College Admin Login
    console.log('1. Testing College Admin Login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const adminToken = adminLoginResponse.data.data?.token || adminLoginResponse.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    console.log('✅ College Admin login successful\n');
    
    // 2. Test Events API
    console.log('2. Testing Events API...');
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/events?page=1&limit=10`, { headers: adminHeaders });
      console.log('✅ Events API working');
      console.log('Events count:', eventsResponse.data.data.events.length);
      
      if (eventsResponse.data.data.events.length > 0) {
        const event = eventsResponse.data.data.events[0];
        console.log('First event details:');
        console.log('  Title:', event.title);
        console.log('  Start Date:', event.start_date);
        console.log('  End Date:', event.end_date);
        console.log('  Event Type:', event.event_type);
        console.log('  Location:', event.location);
        console.log('  Status:', event.status);
        console.log('  Creator:', event.creator?.name || 'Unknown');
        console.log('  Max Participants:', event.max_participants);
        console.log('  Current Participants:', event.current_participants);
      }
    } catch (error) {
      console.log('❌ Events API failed:', error.response?.data?.message || error.message);
    }
    
    // 3. Test Event Creation
    console.log('\n3. Testing Event Creation...');
    try {
      const eventData = {
        title: 'Fixed Test Event',
        description: 'Testing event creation with proper date formatting',
        type: 'workshop',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        location: 'Fixed Campus',
        max_participants: 50
      };

      const eventResponse = await axios.post(`${BASE_URL}/events`, eventData, { headers: adminHeaders });
      console.log('✅ Event creation successful');
      console.log('Created event:', eventResponse.data.data.event.title);
    } catch (error) {
      console.log('❌ Event creation failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎯 Events fix test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testEventsFix();
