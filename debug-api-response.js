const axios = require('axios');

async function debugAPIResponse() {
  try {
    console.log('🔧 Debugging API Response...\n');

    // 1. Login as incubator manager
    console.log('1. 👨‍💼 Incubator Manager Login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'manager@sgbau.edu.in',
      password: 'manager123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Login successful');
    console.log('👤 User incubator_id:', user.incubator_id);

    // 2. Test pre-incubatees API
    console.log('\n2. 📊 Testing pre-incubatees API...');
    try {
      const response = await axios.get('http://localhost:3001/api/pre-incubatees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const preIncubatees = response.data.data.preIncubatees;
        console.log('✅ Pre-incubatees API working');
        console.log(`📊 Found ${preIncubatees.length} pre-incubatees`);
        
        if (preIncubatees.length > 0) {
          console.log('\n📋 First 3 pre-incubatees:');
          preIncubatees.slice(0, 3).forEach((pi, index) => {
            console.log(`   ${index + 1}. ID: ${pi.id}, Progress: ${pi.progress_percentage}%, Phase: ${pi.current_phase}, Status: ${pi.status}`);
            console.log(`      Incubator ID: ${pi.incubator_id}, Student: ${pi.student?.name}`);
          });
        }
        
        console.log('\n🔍 Full API response structure:');
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log('❌ API failed:', response.data.message);
      }
      
    } catch (error) {
      console.log('❌ API error:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

debugAPIResponse();
