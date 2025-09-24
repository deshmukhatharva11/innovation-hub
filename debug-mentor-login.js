const axios = require('axios');

async function debugMentorLogin() {
  try {
    console.log('🔧 Debugging Mentor Login...\n');

    // Test 1: Check if server is responding
    console.log('1. 🌐 Testing server health...');
    try {
      const healthResponse = await axios.get('http://localhost:3001/health');
      console.log('✅ Server is running:', healthResponse.data.message);
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
      return;
    }

    // Test 2: Test mentor login with detailed logging
    console.log('\n2. 👨‍🏫 Testing mentor login...');
    
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'sarah.johnson@example.com',
        password: 'admin123'
      });
      
      console.log('✅ Login successful!');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('❌ Login failed!');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full error:', error.response?.data);
      
      // Test 3: Try with different mentor emails
      console.log('\n3. 🔍 Testing other mentor emails...');
      
      const mentorEmails = [
        'sarah.johnson@example.com',
        'rajesh.kumar@example.com',
        'priya.sharma@example.com',
        'amit.patel@example.com',
        'sarah.johnson@college.edu',
        'michael.chen@college.edu',
        'emily.rodriguez@college.edu'
      ];
      
      for (const email of mentorEmails) {
        try {
          console.log(`   Testing: ${email}`);
          const testResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: email,
            password: 'admin123'
          });
          
          console.log(`   ✅ SUCCESS: ${email}`);
          console.log(`   User: ${testResponse.data.data.user.name} (${testResponse.data.data.user.role})`);
          break;
          
        } catch (testError) {
          console.log(`   ❌ FAILED: ${email} - ${testError.response?.data?.message || testError.message}`);
        }
      }
    }

    // Test 4: Test admin login for comparison
    console.log('\n4. 👨‍💼 Testing admin login for comparison...');
    try {
      const adminResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'admin1@college1.edu',
        password: 'admin123'
      });
      
      console.log('✅ Admin login successful!');
      console.log(`   User: ${adminResponse.data.data.user.name} (${adminResponse.data.data.user.role})`);
      
    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugMentorLogin();
