const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testMentorAssignmentNewIdea() {
  try {
    console.log('🧪 Testing Mentor Assignment with New Idea...\n');

    // 1. Login as student to create a new idea
    console.log('1. Logging in as student...');
    const studentLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'student1@college1.edu',
      password: 'admin123'
    });
    
    const studentToken = studentLoginResponse.data.data.token;
    const student = studentLoginResponse.data.data.user;
    console.log('✅ Student login successful');
    console.log('Student ID:', student.id);
    console.log('Student college_id:', student.college_id);

    // 2. Create a new idea
    console.log('\n2. Creating a new idea...');
    const ideaData = {
      title: 'AI-Powered Learning Assistant',
      description: 'An intelligent learning assistant that helps students with personalized study plans and real-time tutoring.',
      category: 'Education Technology',
      team_size: 3,
      funding_required: 50000,
      timeline: '6 months',
      problem_statement: 'Students struggle with personalized learning and need adaptive tutoring systems.',
      solution_approach: 'AI-powered platform with machine learning algorithms for personalized education.',
      market_potential: 'Large market in education technology sector.',
      technical_feasibility: 'High - using existing AI/ML frameworks.',
      business_model: 'Freemium with premium features.',
      competitive_analysis: 'Competing with existing edtech platforms but with better personalization.',
      risk_assessment: 'Medium risk due to competition but high potential.',
      success_metrics: ['User engagement', 'Learning outcomes', 'Revenue growth'],
      tags: ['AI', 'Education', 'Machine Learning', 'Personalization'],
      is_public: true,
      techStack: ['React', 'Node.js', 'Python', 'TensorFlow', 'MongoDB'],
      teamMembers: [
        { name: 'John Doe', role: 'Lead Developer', email: 'john@example.com' },
        { name: 'Jane Smith', role: 'AI Engineer', email: 'jane@example.com' }
      ],
      implementationPlan: 'Phase 1: MVP development, Phase 2: AI integration, Phase 3: Scale and optimize'
    };
    
    const ideaResponse = await axios.post(`${API_BASE}/ideas`, ideaData, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    const idea = ideaResponse.data.data.idea;
    console.log('✅ Idea created successfully!');
    console.log('Idea ID:', idea.id);
    console.log('Idea Title:', idea.title);
    console.log('Initial Status:', idea.status);

    // 3. Login as college admin
    console.log('\n3. Logging in as college admin...');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'admin123'
    });
    
    const adminToken = adminLoginResponse.data.data.token;
    const admin = adminLoginResponse.data.data.user;
    console.log('✅ Admin login successful');
    console.log('Admin role:', admin.role);
    console.log('Admin college_id:', admin.college_id);

    // 4. Move idea to nurture status
    console.log('\n4. Moving idea to nurture status...');
    const statusUpdateResponse = await axios.put(`${API_BASE}/ideas/${idea.id}/status`, {
      status: 'nurture',
      feedback: 'Great idea! Moving to nurture phase for development with mentor support.'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Idea moved to nurture status');
    console.log('New status:', statusUpdateResponse.data.data.idea.status);

    // 5. Get available mentors
    console.log('\n5. Getting available mentors...');
    const mentorsResponse = await axios.get(`${API_BASE}/mentors?availability=available&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const mentors = mentorsResponse.data.data.mentors;
    console.log(`✅ Found ${mentors.length} available mentors`);
    
    if (mentors.length > 0) {
      const mentor = mentors[0];
      console.log(`\n6. Assigning mentor ${mentor.name} to idea ${idea.title}...`);
      
      const assignmentResponse = await axios.post(`${API_BASE}/mentor-assignments/assign`, {
        idea_id: idea.id,
        mentor_id: mentor.id,
        assignment_type: 'college',
        assignment_reason: 'College admin assignment for idea development'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Mentor assignment successful!');
      console.log('Assignment ID:', assignmentResponse.data.data.assignment.id);
      console.log('Status:', assignmentResponse.data.data.assignment.status);
      
      // 7. Test mentor chat creation
      console.log('\n7. Testing mentor chat creation...');
      const chatResponse = await axios.post(`${API_BASE}/mentor-chats`, {
        idea_id: idea.id,
        mentor_id: mentor.id,
        student_id: student.id,
        assignment_id: assignmentResponse.data.data.assignment.id
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Mentor chat created successfully!');
      console.log('Chat ID:', chatResponse.data.data.chat.id);
      
      // 8. Test sending a message as admin
      console.log('\n8. Testing mentor chat message from admin...');
      const messageResponse = await axios.post(`${API_BASE}/mentor-chats/${chatResponse.data.data.chat.id}/messages`, {
        message: 'Hello! I\'ve assigned a mentor to help you develop this idea. The mentor will contact you soon!',
        message_type: 'text'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Admin message sent successfully!');
      console.log('Message ID:', messageResponse.data.data.message.id);
      
      // 9. Test student accessing their assignments
      console.log('\n9. Testing student accessing mentor assignments...');
      const studentAssignmentsResponse = await axios.get(`${API_BASE}/mentor-assignments/student/${student.id}`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      
      console.log('✅ Student assignments retrieved successfully!');
      console.log('Assignments count:', studentAssignmentsResponse.data.data.assignments.length);
      
      // 10. Test student accessing their chats
      console.log('\n10. Testing student accessing mentor chats...');
      const studentChatsResponse = await axios.get(`${API_BASE}/mentor-chats?student_id=${student.id}`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      
      console.log('✅ Student chats retrieved successfully!');
      console.log('Chats count:', studentChatsResponse.data.data.chats.length);
      
    } else {
      console.log('❌ No available mentors found');
    }

    console.log('\n🎉 Complete mentor assignment workflow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMentorAssignmentNewIdea();
