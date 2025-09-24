const axios = require('axios');

async function testProgressBarFix() {
  try {
    console.log('🔧 Testing Progress Bar Fix...\n');

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
    console.log('✅ Login successful');

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
          console.log('\n📋 Progress data for first few pre-incubatees:');
          preIncubatees.slice(0, 3).forEach((pi, index) => {
            console.log(`   ${index + 1}. ID: ${pi.id}, Progress: ${pi.progress_percentage}%, Phase: ${pi.current_phase}, Status: ${pi.status}`);
          });
          
          // Check if progress_percentage is properly included
          const hasProgressData = preIncubatees.every(pi => pi.hasOwnProperty('progress_percentage'));
          console.log(`\n✅ Progress data included: ${hasProgressData ? 'YES' : 'NO'}`);
          
          if (hasProgressData) {
            console.log('🎉 Progress bar should now work correctly!');
          } else {
            console.log('❌ Progress data still missing');
          }
        }
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

testProgressBarFix();
