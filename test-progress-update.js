const axios = require('axios');

async function testProgressUpdate() {
  try {
    console.log('🔧 Testing Progress Update...\n');

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

    // 2. Update progress for first pre-incubatee
    console.log('\n2. 📊 Updating progress for pre-incubatee ID 89...');
    try {
      const updateResponse = await axios.put('http://localhost:3001/api/pre-incubatees/89', {
        progress_percentage: 45,
        current_phase: 'development',
        phase_description: 'Prototype development in progress',
        notes: 'Updated progress for testing'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (updateResponse.data.success) {
        console.log('✅ Progress updated successfully');
        console.log('📊 Updated data:', JSON.stringify(updateResponse.data.data, null, 2));
      } else {
        console.log('❌ Update failed:', updateResponse.data.message);
      }
      
    } catch (error) {
      console.log('❌ Update error:', error.response?.data?.message || error.message);
    }

    // 3. Verify the update by fetching the pre-incubatee
    console.log('\n3. 🔍 Verifying the update...');
    try {
      const fetchResponse = await axios.get('http://localhost:3001/api/pre-incubatees/89', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (fetchResponse.data.success) {
        const preIncubatee = fetchResponse.data.data;
        console.log('✅ Fetch successful');
        console.log(`📊 Progress: ${preIncubatee.progress_percentage}%`);
        console.log(`📊 Phase: ${preIncubatee.current_phase}`);
        console.log(`📊 Description: ${preIncubatee.phase_description}`);
        
        if (preIncubatee.progress_percentage === 45) {
          console.log('🎉 Progress bar should now show 45%!');
        } else {
          console.log('❌ Progress not updated correctly');
        }
      } else {
        console.log('❌ Fetch failed:', fetchResponse.data.message);
      }
      
    } catch (error) {
      console.log('❌ Fetch error:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProgressUpdate();
