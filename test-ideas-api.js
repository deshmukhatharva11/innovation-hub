const axios = require('axios');

const testIdeasAPI = async () => {
  try {
    console.log('🔍 Testing Ideas API...');
    
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'manager1@incubator1.edu',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received');
    
    // Test ideas API
    const ideasResponse = await axios.get('http://localhost:3001/api/ideas', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        page: 1,
        limit: 12
      }
    });
    
    console.log('📡 Ideas API Response:');
    console.log('Status:', ideasResponse.status);
    console.log('Success:', ideasResponse.data.success);
    console.log('Data structure:', Object.keys(ideasResponse.data));
    
    if (ideasResponse.data.data) {
      console.log('Ideas count:', ideasResponse.data.data.ideas?.length || 0);
      console.log('Pagination:', ideasResponse.data.data.pagination);
      
      if (ideasResponse.data.data.ideas && ideasResponse.data.data.ideas.length > 0) {
        console.log('First idea:', {
          id: ideasResponse.data.data.ideas[0].id,
          title: ideasResponse.data.data.ideas[0].title,
          status: ideasResponse.data.data.ideas[0].status
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testIdeasAPI();
