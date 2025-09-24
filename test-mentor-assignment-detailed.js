const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testMentorAssignmentDetailed() {
  try {
    console.log('🧪 Testing Mentor Assignment Fix (Detailed)...\n');

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
        console.log('Idea details:');
        ideas.forEach(idea => {
          console.log(`  - ID: ${idea.id}, Title: ${idea.title}, Status: ${idea.status}`);
        });
      }

      // 4. Get mentors
      console.log('\n4. Getting mentors...');
      const mentorsResponse = await axios.get(`${API_BASE}/mentors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const mentors = mentorsResponse.data.data.mentors;
      console.log(`✅ Found ${mentors.length} mentors`);

      // 5. Test mentor assignment
      if (mentors.length > 0 && ideas.length > 0) {
        const mentorId = mentors[0].id;
        const ideaId = ideas[0].id;
        
        console.log(`\n5. Testing mentor assignment...`);
        console.log(`   Mentor ID: ${mentorId}`);
        console.log(`   Idea ID: ${ideaId}`);
        console.log(`   Idea Status: ${ideas[0].status}`);
        
        // Check if idea is in correct status
        if (!['nurture', 'needs_development'].includes(ideas[0].status)) {
          console.log('❌ Idea is not in nurture or needs_development phase');
          console.log('   Current status:', ideas[0].status);
          console.log('   Required status: nurture or needs_development');
          return;
        }
        
        try {
          const assignmentResponse = await axios.post(`${API_BASE}/mentor-assignments/assign`, {
            idea_id: ideaId,
            mentor_id: mentorId,
            assignment_type: 'college',
            assignment_reason: 'Test assignment by college admin'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('✅ Mentor assignment successful!');
          console.log('Response:', assignmentResponse.data);
          
        } catch (assignmentError) {
          console.log('❌ Mentor assignment failed:');
          console.log('Status:', assignmentError.response?.status);
          console.log('Message:', assignmentError.response?.data?.message);
          console.log('Error:', assignmentError.response?.data);
          
          // If it's a permission error, let's check the mentor details
          if (assignmentError.response?.status === 403) {
            console.log('\n🔍 Checking mentor details...');
            try {
              const mentorResponse = await axios.get(`${API_BASE}/mentors/${mentorId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              const mentor = mentorResponse.data.data;
              console.log('Mentor details:');
              console.log('  - ID:', mentor.id);
              console.log('  - Name:', mentor.name);
              console.log('  - Availability:', mentor.availability);
              console.log('  - Is Active:', mentor.is_active);
              console.log('  - Is Verified:', mentor.is_verified);
              console.log('  - Mentor Type:', mentor.mentor_type);
              console.log('  - College ID:', mentor.college_id);
              console.log('  - Current Students:', mentor.current_students);
              console.log('  - Max Students:', mentor.max_students);
              
              // Check if mentor has isAvailable method
              if (typeof mentor.isAvailable === 'function') {
                console.log('  - Is Available (method):', mentor.isAvailable());
              } else {
                console.log('  - Is Available (calculated):', mentor.availability === 'available' && mentor.is_active && mentor.is_verified);
              }
            } catch (mentorError) {
              console.log('❌ Failed to get mentor details:', mentorError.response?.data || mentorError.message);
            }
          }
        }
      } else {
        console.log('❌ No mentors or ideas available for testing');
      }
    } else {
      console.log('❌ No students available for testing');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMentorAssignmentDetailed();
