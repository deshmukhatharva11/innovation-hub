const axios = require('axios');

async function testComprehensiveEvents() {
  try {
    console.log('🔍 Testing comprehensive event visibility...\n');
    
    // Test 1: College Admin
    console.log('👨‍💼 Testing College Admin...');
    const adminLogin = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin1@college1.edu',
      password: 'admin123'
    });
    
    if (adminLogin.data.success) {
      const adminToken = adminLogin.data.data.token;
      const adminEvents = await axios.get('http://localhost:3001/api/events', {
        headers: { 'Authorization': 'Bearer ' + adminToken }
      });
      
      console.log('  📋 Total events:', adminEvents.data.data.events.length);
      
      const incubatorEvents = adminEvents.data.data.events.filter(e => e.incubator_id);
      const collegeEvents = adminEvents.data.data.events.filter(e => e.college_id && !e.incubator_id);
      
      console.log('  🎯 Incubator events:', incubatorEvents.length);
      console.log('  🏫 College events:', collegeEvents.length);
      
      if (incubatorEvents.length > 0) {
        console.log('  ✅ College admin can see incubator events!');
        incubatorEvents.slice(0, 2).forEach(e => {
          console.log('    -', e.title, '(incubator_id:', e.incubator_id, ')');
        });
      } else {
        console.log('  ❌ College admin cannot see incubator events');
      }
    }
    
    // Test 2: Student
    console.log('\n👨‍🎓 Testing Student...');
    const studentLogin = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'student1@college1.edu',
      password: 'admin123'
    });
    
    if (studentLogin.data.success) {
      const studentToken = studentLogin.data.data.token;
      const studentEvents = await axios.get('http://localhost:3001/api/events', {
        headers: { 'Authorization': 'Bearer ' + studentToken }
      });
      
      console.log('  📋 Total events:', studentEvents.data.data.events.length);
      
      const incubatorEvents = studentEvents.data.data.events.filter(e => e.incubator_id);
      console.log('  🎯 Incubator events:', incubatorEvents.length);
      
      if (incubatorEvents.length > 0) {
        console.log('  ✅ Student can see incubator events!');
      } else {
        console.log('  ❌ Student cannot see incubator events');
      }
    }
    
    // Test 3: Incubator Manager
    console.log('\n👨‍💼 Testing Incubator Manager...');
    const managerLogin = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'manager@sgbau.edu.in',
      password: 'admin123'
    });
    
    if (managerLogin.data.success) {
      const managerToken = managerLogin.data.data.token;
      const managerEvents = await axios.get('http://localhost:3001/api/events', {
        headers: { 'Authorization': 'Bearer ' + managerToken }
      });
      
      console.log('  📋 Total events:', managerEvents.data.data.events.length);
      
      const incubatorEvents = managerEvents.data.data.events.filter(e => e.incubator_id);
      console.log('  🎯 Incubator events:', incubatorEvents.length);
      
      if (incubatorEvents.length > 0) {
        console.log('  ✅ Incubator manager can see incubator events!');
      } else {
        console.log('  ❌ Incubator manager cannot see incubator events');
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testComprehensiveEvents();
