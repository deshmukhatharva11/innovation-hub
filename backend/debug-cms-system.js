const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testCMSSystem() {
  console.log('🔍 DEBUGGING CMS SYSTEM - COMPREHENSIVE TEST');
  console.log('===============================================\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connectivity...');
    const healthCheck = await axios.get(`${BASE_URL}/cms/content`);
    console.log('✅ Server is running');
    console.log('📊 Current content count:', healthCheck.data.data.content.length);
    console.log('');

    // Test 2: Test content creation
    console.log('2️⃣ Testing content creation...');
    try {
      const contentData = {
        title: "Welcome to Innovation Hub",
        content: "This is the main welcome page for our innovation hub. We support students and entrepreneurs in their journey.",
        content_type: "page",
        status: "published"
      };
      
      const createResponse = await axios.post(`${BASE_URL}/cms/content`, contentData);
      console.log('✅ Content created successfully');
      console.log('📝 Created content ID:', createResponse.data.data.id);
      console.log('📝 Created content slug:', createResponse.data.data.slug);
      console.log('');
    } catch (error) {
      console.log('❌ Content creation failed');
      console.log('🔍 Error details:', error.response?.data || error.message);
      console.log('');
    }

    // Test 3: Test content retrieval
    console.log('3️⃣ Testing content retrieval...');
    try {
      const getResponse = await axios.get(`${BASE_URL}/cms/content`);
      console.log('✅ Content retrieved successfully');
      console.log('📊 Total content items:', getResponse.data.data.content.length);
      if (getResponse.data.data.content.length > 0) {
        console.log('📝 First content item:', getResponse.data.data.content[0].title);
      }
      console.log('');
    } catch (error) {
      console.log('❌ Content retrieval failed');
      console.log('🔍 Error details:', error.response?.data || error.message);
      console.log('');
    }

    // Test 4: Test media endpoints
    console.log('4️⃣ Testing media endpoints...');
    try {
      const mediaResponse = await axios.get(`${BASE_URL}/cms/media`);
      console.log('✅ Media endpoint working');
      console.log('📊 Total media items:', mediaResponse.data.data.media.length);
      console.log('');
    } catch (error) {
      console.log('❌ Media endpoint failed');
      console.log('🔍 Error details:', error.response?.data || error.message);
      console.log('');
    }

    // Test 5: Test notifications endpoints
    console.log('5️⃣ Testing notifications endpoints...');
    try {
      const notificationsResponse = await axios.get(`${BASE_URL}/cms/notifications`);
      console.log('✅ Notifications endpoint working');
      console.log('📊 Total notifications:', notificationsResponse.data.data.notifications.length);
      console.log('');
    } catch (error) {
      console.log('❌ Notifications endpoint failed');
      console.log('🔍 Error details:', error.response?.data || error.message);
      console.log('');
    }

    // Test 6: Test templates endpoints
    console.log('6️⃣ Testing templates endpoints...');
    try {
      const templatesResponse = await axios.get(`${BASE_URL}/cms/templates/content`);
      console.log('✅ Templates endpoint working');
      console.log('📊 Templates data:', templatesResponse.data.data);
      console.log('');
    } catch (error) {
      console.log('❌ Templates endpoint failed');
      console.log('🔍 Error details:', error.response?.data || error.message);
      console.log('');
    }

    // Test 7: Test analytics endpoints
    console.log('7️⃣ Testing analytics endpoints...');
    try {
      const analyticsResponse = await axios.get(`${BASE_URL}/cms/analytics`);
      console.log('✅ Analytics endpoint working');
      console.log('📊 Analytics data:', analyticsResponse.data.data);
      console.log('');
    } catch (error) {
      console.log('❌ Analytics endpoint failed');
      console.log('🔍 Error details:', error.response?.data || error.message);
      console.log('');
    }

    // Test 8: Test notification creation
    console.log('8️⃣ Testing notification creation...');
    try {
      const notificationData = {
        title: "Test Notification",
        message: "This is a test notification for the CMS system.",
        notification_type: "info",
        priority: "normal",
        target_audience: "all",
        status: "draft"
      };
      
      const createNotificationResponse = await axios.post(`${BASE_URL}/cms/notifications`, notificationData);
      console.log('✅ Notification created successfully');
      console.log('📝 Created notification ID:', createNotificationResponse.data.data.id);
      console.log('');
    } catch (error) {
      console.log('❌ Notification creation failed');
      console.log('🔍 Error details:', error.response?.data || error.message);
      console.log('');
    }

    console.log('🎯 CMS SYSTEM DEBUG COMPLETE');
    console.log('=============================');

  } catch (error) {
    console.log('❌ CRITICAL ERROR: Server is not responding');
    console.log('🔍 Error details:', error.message);
    console.log('');
    console.log('💡 TROUBLESHOOTING STEPS:');
    console.log('1. Make sure the backend server is running on port 3001');
    console.log('2. Check if there are any syntax errors in the server code');
    console.log('3. Verify database connection is working');
    console.log('4. Check if all required dependencies are installed');
  }
}

// Run the test
testCMSSystem();
