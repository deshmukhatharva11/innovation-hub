const axios = require('axios');

async function testMentorChatFrontend() {
  try {
    console.log('🔧 Testing Mentor Chat Frontend...\n');

    // 1. Login as mentor
    console.log('1. 👨‍🏫 Mentor Login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'sarah.johnson@example.com',
      password: 'mentor123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Mentor login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Mentor login successful');

    // 2. Test mentor chat conversations endpoint
    console.log('\n2. 💬 Testing mentor chat conversations...');
    try {
      const chatResponse = await axios.get('http://localhost:3001/api/mentor-chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Chat endpoint working');
      console.log('📊 Response structure:', JSON.stringify(chatResponse.data, null, 2));
      
      const conversations = chatResponse.data?.data?.chats || chatResponse.data?.data || [];
      console.log(`   Conversations count: ${Array.isArray(conversations) ? conversations.length : 'NOT AN ARRAY'}`);
      
      if (Array.isArray(conversations)) {
        console.log('✅ Conversations is properly formatted as array');
      } else {
        console.log('❌ Conversations is not an array:', typeof conversations);
      }
      
    } catch (error) {
      console.log('❌ Chat endpoint error:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Frontend Chat Test Complete!');
    console.log('The mentor chat should now work without the filter error.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMentorChatFrontend();
