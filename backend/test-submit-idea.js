const axios = require('axios');

const testSubmitIdea = async () => {
  try {
    console.log('🧪 Testing idea submission with team members...');
    
    // First, let's login to get a token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'student@test.com',
      password: 'password123'
    });
    
    console.log('🔍 Login response:', loginResponse.data);
    const token = loginResponse.data.data.token;
    if (token) {
      console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
    } else {
      console.log('❌ No token in response');
      return;
    }
    
    // Now submit an idea with team members
    const ideaData = {
      title: 'Test Idea with Team Members',
      description: 'This is a comprehensive test idea to verify team members functionality',
      category: 'Technology',
      teamMembers: [
        { name: 'John Doe', role: 'Lead Developer', email: 'john@example.com' },
        { name: 'Jane Smith', role: 'UI/UX Designer', email: 'jane@example.com' },
        { name: 'Mike Johnson', role: 'Backend Developer', email: 'mike@example.com' }
      ],
      techStack: ['React', 'Node.js', 'MongoDB', 'Express'],
      implementationPlan: 'This is a detailed implementation plan for the test idea. We will start with the frontend development using React, then move to backend development with Node.js and Express, and finally integrate with MongoDB for data storage.',
      marketPotential: 'This idea has significant market potential in the technology sector, targeting small to medium businesses looking for digital transformation solutions.',
      fundingRequired: 500000,
      timeline: '6 months'
    };
    
    console.log('\n📝 Submitting idea with data:', JSON.stringify(ideaData, null, 2));
    
    const submitResponse = await axios.post('http://localhost:3001/api/ideas', ideaData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Idea submitted successfully:', submitResponse.data);
    
    // Now let's fetch the idea to see if team members were saved
    const ideaId = submitResponse.data.data.idea.id;
    console.log('\n🔍 Fetching idea to verify team members...');
    
    const fetchResponse = await axios.get(`http://localhost:3001/api/ideas/${ideaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Fetched idea:', JSON.stringify(fetchResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testSubmitIdea();
