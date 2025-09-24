const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testMarkAllAsRead() {
  try {
    console.log('🔐 Logging in...');
    
    // Login first
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin2@college2.edu',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error(`Login failed: ${loginResponse.data.message}`);
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Get current notifications
    console.log('📄 Getting current notifications...');
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📄 Current notifications:', notificationsResponse.data);
    
    // Mark all as read
    console.log('✅ Marking all notifications as read...');
    const markAllResponse = await axios.put(`${BASE_URL}/notifications/read-all`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Mark all as read response:', markAllResponse.data);
    
    // Get notifications again to verify
    console.log('📄 Getting notifications after marking as read...');
    const afterResponse = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📄 Notifications after marking as read:', afterResponse.data);
    
  } catch (error) {
    console.error('❌ Error testing mark all as read:', error.response?.data || error.message);
  }
}

testMarkAllAsRead();
