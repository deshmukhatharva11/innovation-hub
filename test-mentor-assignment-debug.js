const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testMentorAssignmentDebug() {
  try {
    console.log('🧪 Testing Mentor Assignment (Debug)...\n');

    // 1. Login as college admin
    console.log('1. Logging in as college admin...');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin1@college1.edu',
      password: 'admin123'
    });
    
    const adminToken = adminLoginResponse.data.data.token;
    const admin = adminLoginResponse.data.data.user;
    console.log('✅ Admin login successful');
    console.log('Admin role:', admin.role);
    console.log('Admin college_id:', admin.college_id);

    // 2. Get available mentors with detailed info
    console.log('\n2. Getting available mentors with detailed info...');
    const mentorsResponse = await axios.get(`${API_BASE}/mentors?availability=available&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const mentors = mentorsResponse.data.data.mentors;
    console.log(`✅ Found ${mentors.length} available mentors`);
    
    if (mentors.length > 0) {
      const mentor = mentors[0];
      console.log('\n3. Mentor details:');
      console.log('ID:', mentor.id);
      console.log('Name:', mentor.name);
      console.log('Availability:', mentor.availability);
      console.log('Current students:', mentor.current_students);
      console.log('Max students:', mentor.max_students);
      console.log('Is active:', mentor.is_active);
      console.log('Is verified:', mentor.is_verified);
      console.log('Mentor type:', mentor.mentor_type);
      console.log('College ID:', mentor.college_id);
      
      // 4. Get a student's ideas
      console.log('\n4. Getting students...');
      const studentsResponse = await axios.get(`${API_BASE}/users/students`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      const students = studentsResponse.data.data.students;
      console.log(`✅ Found ${students.length} students`);

      if (students.length > 0) {
        const studentId = students[0].id;
        console.log(`\n5. Getting ideas for student ${studentId}...`);
        
        const ideasResponse = await axios.get(`${API_BASE}/users/${studentId}/ideas`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const ideas = ideasResponse.data.data.ideas;
        console.log(`✅ Found ${ideas.length} ideas for student`);
        
        if (ideas.length > 0) {
          const idea = ideas[0];
          console.log(`\n6. Found idea: ${idea.title} (Status: ${idea.status})`);
          
          // 7. Try to assign mentor
          console.log(`\n7. Attempting to assign mentor ${mentor.name} to idea ${idea.title}...`);
          
          try {
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
            
          } catch (assignmentError) {
            console.log('❌ Mentor assignment failed:');
            console.log('Error:', assignmentError.response?.data || assignmentError.message);
            
            // Let's try to create a new idea in the correct status
            console.log('\n8. Creating a new idea and moving it to endorsed status...');
            
            // Login as student
            const studentLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
              email: 'student1@college1.edu',
              password: 'admin123'
            });
            
            const studentToken = studentLoginResponse.data.data.token;
            const student = studentLoginResponse.data.data.user;
            
            // Create new idea
            const ideaData = {
              title: 'Debug Test Idea',
              description: 'A test idea for debugging mentor assignment.',
              category: 'Technology',
              team_size: 1,
              funding_required: 10000,
              timeline: '3 months',
              is_public: true
            };
            
            const newIdeaResponse = await axios.post(`${API_BASE}/ideas`, ideaData, {
              headers: { Authorization: `Bearer ${studentToken}` }
            });
            
            const newIdea = newIdeaResponse.data.data.idea;
            console.log('✅ New idea created:', newIdea.title, '(Status:', newIdea.status + ')');
            
            // Move to endorsed status
            const endorsedResponse = await axios.put(`${API_BASE}/ideas/${newIdea.id}/status`, {
              status: 'endorsed',
              feedback: 'Endorsed for testing'
            }, {
              headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            console.log('✅ Idea endorsed:', endorsedResponse.data.data.idea.status);
            
            // Try assignment again
            console.log('\n9. Trying mentor assignment with new endorsed idea...');
            const newAssignmentResponse = await axios.post(`${API_BASE}/mentor-assignments/assign`, {
              idea_id: newIdea.id,
              mentor_id: mentor.id,
              assignment_type: 'college',
              assignment_reason: 'College admin assignment for idea development'
            }, {
              headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            console.log('✅ Mentor assignment successful!');
            console.log('Assignment ID:', newAssignmentResponse.data.data.assignment.id);
            console.log('Status:', newAssignmentResponse.data.data.assignment.status);
          }
        } else {
          console.log('❌ No ideas found for student');
        }
      } else {
        console.log('❌ No students found');
      }
    } else {
      console.log('❌ No available mentors found');
    }

    console.log('\n🎉 Debug test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMentorAssignmentDebug();
