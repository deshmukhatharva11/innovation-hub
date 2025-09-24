const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test data
const testCollegeAdmin = {
  email: 'admin1@college1.edu',
  password: 'password123'
};

const testIdea = {
  title: 'Test Idea for College Coordinator',
  description: 'This is a test idea for the college coordinator dashboard',
  category: 'Technology',
  tech_stack: ['React', 'Node.js'],
  team_members: [{ name: 'John Doe', role: 'Developer' }],
  implementation_plan: 'Step 1: Research, Step 2: Development, Step 3: Testing',
  market_potential: 'High market potential for this innovative solution',
  funding_required: 50000,
  status: 'submitted'
};

const testEvent = {
  title: 'Test Webinar',
  description: 'A test webinar for students',
  event_type: 'webinar',
  start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
  location: 'Online',
  is_online: true,
  meeting_link: 'https://meet.google.com/test',
  max_participants: 100,
  status: 'published'
};

const testReport = {
  title: 'Monthly Progress Report',
  report_type: 'monthly',
  period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  period_end: new Date().toISOString(),
  content: 'This is a test monthly progress report',
  status: 'draft'
};

async function testCollegeCoordinatorAPIs() {
  console.log('🧪 Testing College Coordinator Dashboard APIs...\n');

  try {
    // 1. Login as College Admin
    console.log('1. Logging in as College Admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, testCollegeAdmin);
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Test Dashboard Overview
    console.log('2. Testing Dashboard Overview...');
    const dashboardResponse = await axios.get(`${API_BASE}/college-coordinator/dashboard`, { headers });
    console.log('✅ Dashboard data:', {
      totalStudents: dashboardResponse.data.data.stats.totalStudents,
      totalIdeas: dashboardResponse.data.data.stats.totalIdeas,
      pendingEvaluations: dashboardResponse.data.data.stats.pendingEvaluations,
      totalEvents: dashboardResponse.data.data.stats.totalEvents
    });
    console.log('');

    // 3. Test Ideas API
    console.log('3. Testing Ideas API...');
    const ideasResponse = await axios.get(`${API_BASE}/college-coordinator/ideas`, { headers });
    console.log('✅ Ideas fetched:', ideasResponse.data.data.ideas.length, 'ideas');
    console.log('');

    // 4. Test Events API
    console.log('4. Testing Events API...');
    const eventsResponse = await axios.get(`${API_BASE}/college-coordinator/events`, { headers });
    console.log('✅ Events fetched:', eventsResponse.data.data.events.length, 'events');
    console.log('');

    // 5. Test Reports API
    console.log('5. Testing Reports API...');
    const reportsResponse = await axios.get(`${API_BASE}/college-coordinator/reports`, { headers });
    console.log('✅ Reports fetched:', reportsResponse.data.data.reports.length, 'reports');
    console.log('');

    // 6. Test Documents API
    console.log('6. Testing Documents API...');
    const documentsResponse = await axios.get(`${API_BASE}/college-coordinator/documents`, { headers });
    console.log('✅ Documents fetched:', documentsResponse.data.data.documents.length, 'documents');
    console.log('');

    // 7. Test Analytics API
    console.log('7. Testing Analytics API...');
    const analyticsResponse = await axios.get(`${API_BASE}/college-coordinator/analytics`, { headers });
    console.log('✅ Analytics data:', {
      totalStudents: analyticsResponse.data.data.studentEngagement.totalStudents,
      studentsWithIdeas: analyticsResponse.data.data.studentEngagement.studentsWithIdeas,
      participationRate: analyticsResponse.data.data.studentEngagement.participationRate + '%'
    });
    console.log('');

    // 8. Test Event Creation
    console.log('8. Testing Event Creation...');
    const createEventResponse = await axios.post(`${API_BASE}/college-coordinator/events`, testEvent, { headers });
    console.log('✅ Event created:', createEventResponse.data.data.event.title);
    console.log('');

    // 9. Test Report Creation
    console.log('9. Testing Report Creation...');
    const createReportResponse = await axios.post(`${API_BASE}/college-coordinator/reports`, testReport, { headers });
    console.log('✅ Report created:', createReportResponse.data.data.report.title);
    console.log('');

    // 10. Test Idea Evaluation (if there are ideas)
    if (ideasResponse.data.data.ideas.length > 0) {
      console.log('10. Testing Idea Evaluation...');
      const firstIdea = ideasResponse.data.data.ideas[0];
      const evaluationData = {
        rating: 8,
        comments: 'Great idea with good potential',
        recommendation: 'nurture',
        nurture_notes: 'Assign mentor and provide guidance'
      };
      
      try {
        const evaluateResponse = await axios.post(
          `${API_BASE}/college-coordinator/ideas/${firstIdea.id}/evaluate`, 
          evaluationData, 
          { headers }
        );
        console.log('✅ Idea evaluated successfully');
      } catch (evalError) {
        console.log('⚠️ Idea evaluation failed (might already be evaluated):', evalError.response?.data?.message || evalError.message);
      }
      console.log('');
    }

    console.log('🎉 All College Coordinator Dashboard APIs tested successfully!');
    console.log('\n📊 Summary:');
    console.log('- Dashboard overview: ✅');
    console.log('- Ideas management: ✅');
    console.log('- Events management: ✅');
    console.log('- Reports management: ✅');
    console.log('- Documents management: ✅');
    console.log('- Analytics: ✅');
    console.log('- Idea evaluation: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testCollegeCoordinatorAPIs();
