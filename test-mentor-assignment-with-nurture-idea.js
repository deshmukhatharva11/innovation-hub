const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testMentorAssignmentWithNurtureIdea() {
  try {
    console.log('🧪 Testing Mentor Assignment with Nurture Idea...\n');

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

    // 3. Find a student with a nurture or needs_development idea
    let nurtureIdea = null;
    let studentWithNurtureIdea = null;
    
    for (const student of students) {
      console.log(`\n3. Checking ideas for student ${student.id} (${student.name})...`);
      
      try {
        const ideasResponse = await axios.get(`${API_BASE}/users/${student.id}/ideas`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const ideas = ideasResponse.data.data.ideas;
        console.log(`   Found ${ideas.length} ideas`);
        
        // Look for nurture or needs_development ideas
        const nurtureIdeas = ideas.filter(idea => 
          ['nurture', 'needs_development'].includes(idea.status)
        );
        
        if (nurtureIdeas.length > 0) {
          nurtureIdea = nurtureIdeas[0];
          studentWithNurtureIdea = student;
          console.log(`   ✅ Found nurture idea: ID ${nurtureIdea.id}, Status: ${nurtureIdea.status}`);
          break;
        } else {
          console.log(`   Ideas statuses: ${ideas.map(i => i.status).join(', ')}`);
        }
      } catch (error) {
        console.log(`   ❌ Error getting ideas for student ${student.id}:`, error.response?.data?.message);
      }
    }

    if (!nurtureIdea) {
      console.log('\n❌ No students have ideas in nurture or needs_development phase');
      console.log('Let\'s try to update an idea status to nurture...');
      
      // Try to find any idea and update its status
      for (const student of students.slice(0, 3)) { // Check first 3 students
        try {
          const ideasResponse = await axios.get(`${API_BASE}/users/${student.id}/ideas`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const ideas = ideasResponse.data.data.ideas;
          if (ideas.length > 0) {
            const idea = ideas[0];
            console.log(`\n4. Updating idea ${idea.id} status from ${idea.status} to nurture...`);
            
            try {
              const updateResponse = await axios.put(`${API_BASE}/ideas/${idea.id}/status`, {
                status: 'nurture',
                comments: 'Updated for mentor assignment testing'
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              console.log('✅ Idea status updated successfully');
              nurtureIdea = { ...idea, status: 'nurture' };
              studentWithNurtureIdea = student;
              break;
            } catch (updateError) {
              console.log('❌ Failed to update idea status:', updateError.response?.data?.message);
            }
          }
        } catch (error) {
          console.log(`   ❌ Error getting ideas for student ${student.id}:`, error.response?.data?.message);
        }
      }
    }

    if (!nurtureIdea) {
      console.log('\n❌ Could not find or create a nurture idea for testing');
      return;
    }

    // 4. Get mentors
    console.log('\n5. Getting mentors...');
    const mentorsResponse = await axios.get(`${API_BASE}/mentors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const mentors = mentorsResponse.data.data.mentors;
    console.log(`✅ Found ${mentors.length} mentors`);

    // 5. Test mentor assignment
    if (mentors.length > 0) {
      const mentorId = mentors[0].id;
      const ideaId = nurtureIdea.id;
      
      console.log(`\n6. Testing mentor assignment...`);
      console.log(`   Mentor ID: ${mentorId}`);
      console.log(`   Idea ID: ${ideaId}`);
      console.log(`   Idea Status: ${nurtureIdea.status}`);
      console.log(`   Student: ${studentWithNurtureIdea.name}`);
      
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
        console.log('Response:', JSON.stringify(assignmentResponse.data, null, 2));
        
      } catch (assignmentError) {
        console.log('❌ Mentor assignment failed:');
        console.log('Status:', assignmentError.response?.status);
        console.log('Message:', assignmentError.response?.data?.message);
        console.log('Error:', assignmentError.response?.data);
      }
    } else {
      console.log('❌ No mentors available for testing');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMentorAssignmentWithNurtureIdea();
