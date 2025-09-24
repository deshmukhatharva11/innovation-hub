const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testStudentEvents() {
  try {
    console.log('🔍 Testing Student Events...\n');
    
    // 1. Login as student
    console.log('1. Testing Student Login...');
    const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@college1.edu',
      password: 'password123'
    });
    
    const studentToken = studentLoginResponse.data.data?.token || studentLoginResponse.data.token;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };
    const student = studentLoginResponse.data.data?.user || studentLoginResponse.data.user;
    
    console.log('✅ Student login successful');
    console.log('Student role:', student.role);
    console.log('Student college_id:', student.college_id);
    
    // 2. Test student events API
    console.log('\n2. Testing Student Events API...');
    try {
      const studentEventsResponse = await axios.get(`${BASE_URL}/student-events`, { headers: studentHeaders });
      console.log('✅ Student Events API working');
      console.log('Student events count:', studentEventsResponse.data.data.allEvents.length);
      console.log('Upcoming events:', studentEventsResponse.data.data.upcomingEvents.length);
      console.log('Past events:', studentEventsResponse.data.data.pastEvents.length);
    } catch (error) {
      console.log('❌ Student Events API failed:', error.response?.status, error.response?.data?.message);
    }
    
    // 3. Test regular events API for student
    console.log('\n3. Testing Regular Events API for Student...');
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/events`, { headers: studentHeaders });
      console.log('✅ Regular Events API working for student');
      console.log('Events count:', eventsResponse.data.data.events.length);
      
      if (eventsResponse.data.data.events.length > 0) {
        eventsResponse.data.data.events.forEach((event, index) => {
          console.log(`Event ${index + 1}: "${event.title}" (${event.status})`);
        });
      }
    } catch (error) {
      console.log('❌ Regular Events API failed for student:', error.response?.status, error.response?.data?.message);
    }
    
    // 4. Test college admin events for comparison
    console.log('\n4. Testing College Admin Events for Comparison...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'password123'
    });
    
    const adminToken = adminLoginResponse.data.data?.token || adminLoginResponse.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    
    try {
      const adminEventsResponse = await axios.get(`${BASE_URL}/events`, { headers: adminHeaders });
      console.log('✅ Admin Events API working');
      console.log('Admin events count:', adminEventsResponse.data.data.events.length);
    } catch (error) {
      console.log('❌ Admin Events API failed:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('\n🎯 Student events test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testStudentEvents();
