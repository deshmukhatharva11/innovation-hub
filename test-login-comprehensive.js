const axios = require('axios');
const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function testLoginComprehensive() {
  console.log('🧪 COMPREHENSIVE LOGIN TEST');
  console.log('============================');
  
  try {
    // Test 1: Check if user exists
    console.log('\n1️⃣ Testing user existence...');
    const user = await User.findOne({ 
      where: { email: 'admin1@college1.edu' },
      attributes: ['id', 'email', 'role', 'college_id', 'is_active', 'password_hash']
    });
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      college_id: user.college_id,
      is_active: user.is_active
    });
    
    // Test 2: Check password
    console.log('\n2️⃣ Testing password...');
    const password = 'admin123';
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('🔧 Fixing password...');
      const newHash = await bcrypt.hash(password, 10);
      await user.update({ password_hash: newHash });
      console.log('✅ Password fixed');
    }
    
    // Test 3: Check server health
    console.log('\n3️⃣ Testing server health...');
    try {
      const healthResponse = await axios.get('http://localhost:3001/api/health');
      console.log('✅ Server health:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server health failed:', error.message);
      return;
    }
    
    // Test 4: Test login API
    console.log('\n4️⃣ Testing login API...');
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'admin1@college1.edu',
        password: 'admin123'
      });
      
      console.log('✅ Login successful!');
      console.log('User data:', {
        email: loginResponse.data.user.email,
        role: loginResponse.data.user.role,
        college_id: loginResponse.data.user.college_id
      });
      console.log('Token length:', loginResponse.data.token.length);
      
      // Test 5: Test ideas API with token
      console.log('\n5️⃣ Testing ideas API...');
      const token = loginResponse.data.token;
      const ideasResponse = await axios.get('http://localhost:3001/api/ideas?college_id=36&limit=500&sort_by=created_at&sort_order=desc', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Ideas API successful!');
      console.log('Total ideas:', ideasResponse.data.data.ideas.length);
      console.log('First idea:', ideasResponse.data.data.ideas[0]?.title || 'No ideas');
      
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data || loginError.message);
      
      // Test 6: Debug login route
      console.log('\n6️⃣ Debugging login route...');
      console.log('Request URL:', 'http://localhost:3001/api/auth/login');
      console.log('Request body:', { email: 'admin1@college1.edu', password: 'admin123' });
      console.log('Error status:', loginError.response?.status);
      console.log('Error data:', loginError.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginComprehensive();
