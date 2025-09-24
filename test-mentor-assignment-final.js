const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testMentorAssignmentFinal() {
  try {
    console.log('🧪 Testing Mentor Assignment (Final)...\n');

    // 1. Login as college admin
    console.log('1. Logging in as college admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Login successful');
    console.log('User role:', user.role);
    console.log('User college_id:', user.college_id);

    // 2. Get students
    console.log('\n2. Getting students...');
    const studentsResponse = await axios.get(`${API_BASE}/users/students`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const students = studentsResponse.data.data.students;
    console.log(`✅ Found ${students.length} students`);

    // 3. Get a student's ideas
    if (students.length > 0) {
      const studentId = students[0].id;
      console.log(`\n3. Getting ideas for student ${studentId}...`);
      
      const ideasResponse = await axios.get(`${API_BASE}/users/${studentId}/ideas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const ideas = ideasResponse.data.data.ideas;
      console.log(`✅ Found ${ideas.length} ideas for student`);
      
      if (ideas.length > 0) {
        const idea = ideas[0];
        console.log(`\n4. Found idea: ${idea.title} (Status: ${idea.status})`);
        
        // 5. Move idea to nurture status for mentor assignment
        console.log('\n5. Moving idea to nurture status for mentor assignment...');
        
        const statusUpdateResponse = await axios.put(`${API_BASE}/ideas/${idea.id}/status`, {
          status: 'nurture',
          feedback: 'Moving to nurture phase for mentor assignment'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Idea moved to nurture status');
        console.log('New status:', statusUpdateResponse.data.data.idea.status);
        
        // 6. Get available mentors
        console.log('\n6. Getting available mentors...');
        const mentorsResponse = await axios.get(`${API_BASE}/mentors?availability=available&limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const mentors = mentorsResponse.data.data.mentors;
        console.log(`✅ Found ${mentors.length} available mentors`);
        
        if (mentors.length > 0) {
          const mentor = mentors[0];
          console.log(`\n7. Assigning mentor ${mentor.name} to idea ${idea.title}...`);
          
          const assignmentResponse = await axios.post(`${API_BASE}/mentor-assignments/assign`, {
            idea_id: idea.id,
            mentor_id: mentor.id,
            assignment_type: 'college',
            assignment_reason: 'College admin assignment for idea development'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('✅ Mentor assignment successful!');
          console.log('Assignment ID:', assignmentResponse.data.data.assignment.id);
          console.log('Status:', assignmentResponse.data.data.assignment.status);
          
          // 8. Test mentor chat creation
          console.log('\n8. Testing mentor chat creation...');
          const chatResponse = await axios.post(`${API_BASE}/mentor-chats`, {
            idea_id: idea.id,
            mentor_id: mentor.id,
            student_id: studentId,
            assignment_id: assignmentResponse.data.data.assignment.id
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('✅ Mentor chat created successfully!');
          console.log('Chat ID:', chatResponse.data.data.chat.id);
          
          // 9. Test sending a message
          console.log('\n9. Testing mentor chat message...');
          const messageResponse = await axios.post(`${API_BASE}/mentor-chats/${chatResponse.data.data.chat.id}/messages`, {
            message: 'Hello! I\'m your assigned mentor. Let\'s work together on this idea!',
            message_type: 'text'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('✅ Message sent successfully!');
          console.log('Message ID:', messageResponse.data.data.message.id);
          
        } else {
          console.log('❌ No available mentors found');
        }
      } else {
        console.log('❌ No ideas found for student');
      }
    } else {
      console.log('❌ No students found');
    }

    console.log('\n🎉 Mentor assignment workflow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMentorAssignmentFinal();
