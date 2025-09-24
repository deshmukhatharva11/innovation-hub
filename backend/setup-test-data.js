const { User, College, Idea, Event, Report, Document, Notification } = require('./models');
const bcrypt = require('bcryptjs');

async function setupTestData() {
  try {
    console.log('🔧 Setting up test data...');

    // Create test college
    const [college, created] = await College.findOrCreate({
      where: { name: 'Test College' },
      defaults: {
        name: 'Test College',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        is_active: true
      }
    });

    console.log('✅ College created/found:', college.name);

    // Create test college admin
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const [collegeAdmin, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@testcollege.edu' },
      defaults: {
        name: 'Test College Admin',
        email: 'admin@testcollege.edu',
        password_hash: hashedPassword,
        role: 'college_admin',
        college_id: college.id,
        is_active: true
      }
    });

    if (adminCreated) {
      console.log('✅ College admin created');
    } else {
      console.log('✅ College admin already exists');
    }

    // Create test student
    const [student, studentCreated] = await User.findOrCreate({
      where: { email: 'student@testcollege.edu' },
      defaults: {
        name: 'Test Student',
        email: 'student@testcollege.edu',
        password_hash: hashedPassword,
        role: 'student',
        college_id: college.id,
        department: 'Computer Science',
        year_of_study: 3,
        is_active: true
      }
    });

    if (studentCreated) {
      console.log('✅ Student created');
    } else {
      console.log('✅ Student already exists');
    }

    // Create test ideas
    const testIdeas = [
      {
        title: 'AI-Powered Learning Platform',
        description: 'An intelligent learning platform that adapts to student needs',
        category: 'Technology',
        student_id: student.id,
        college_id: college.id,
        status: 'submitted',
        problem_statement: 'Traditional learning methods are not personalized',
        solution_approach: 'AI-driven adaptive learning',
        market_potential: 'High market potential in education sector',
        technical_feasibility: 'Technically feasible with current AI technologies',
        business_model: 'SaaS subscription model',
        is_public: true
      },
      {
        title: 'Smart Campus Management System',
        description: 'IoT-based system for efficient campus resource management',
        category: 'Technology',
        student_id: student.id,
        college_id: college.id,
        status: 'under_review',
        problem_statement: 'Campus resources are not efficiently utilized',
        solution_approach: 'IoT sensors and data analytics',
        market_potential: 'Medium market potential',
        technical_feasibility: 'Moderately feasible',
        business_model: 'Licensing model',
        is_public: true
      },
      {
        title: 'Sustainable Energy Solution',
        description: 'Renewable energy solution for rural areas',
        category: 'Environment',
        student_id: student.id,
        college_id: college.id,
        status: 'endorsed',
        problem_statement: 'Rural areas lack access to reliable energy',
        solution_approach: 'Solar and wind energy hybrid system',
        market_potential: 'Very high market potential',
        technical_feasibility: 'Highly feasible',
        business_model: 'B2B and B2C sales',
        is_public: true
      }
    ];

    for (const ideaData of testIdeas) {
      const [idea, ideaCreated] = await Idea.findOrCreate({
        where: { 
          title: ideaData.title,
          student_id: ideaData.student_id 
        },
        defaults: ideaData
      });

      if (ideaCreated) {
        console.log(`✅ Idea created: ${idea.title}`);
      } else {
        console.log(`✅ Idea already exists: ${idea.title}`);
      }
    }

    // Create test events
    const testEvents = [
      {
        title: 'Innovation Workshop 2024',
        description: 'Comprehensive workshop on innovation and entrepreneurship',
        event_type: 'workshop',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        location: 'Test College Campus',
        college_id: college.id,
        created_by: collegeAdmin.id,
        is_active: true
      },
      {
        title: 'Tech Startup Pitch Competition',
        description: 'Annual pitch competition for student startups',
        event_type: 'competition',
        start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        location: 'Test College Auditorium',
        college_id: college.id,
        created_by: collegeAdmin.id,
        is_active: true
      }
    ];

    for (const eventData of testEvents) {
      const [event, eventCreated] = await Event.findOrCreate({
        where: { 
          title: eventData.title,
          college_id: eventData.college_id 
        },
        defaults: eventData
      });

      if (eventCreated) {
        console.log(`✅ Event created: ${event.title}`);
      } else {
        console.log(`✅ Event already exists: ${event.title}`);
      }
    }

    // Create test documents
    const testDocuments = [
      {
        title: 'Innovation Guidelines 2024',
        description: 'Comprehensive guidelines for student innovation projects',
        document_type: 'guideline',
        file_path: 'documents/innovation-guidelines-2024.pdf',
        file_size: 1024000,
        mime_type: 'application/pdf',
        is_public: true,
        college_id: college.id,
        uploaded_by: collegeAdmin.id,
        is_active: true
      },
      {
        title: 'Project Proposal Template',
        description: 'Standard template for project proposals',
        document_type: 'template',
        file_path: 'documents/project-proposal-template.docx',
        file_size: 512000,
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        is_public: true,
        college_id: college.id,
        uploaded_by: collegeAdmin.id,
        is_active: true
      }
    ];

    for (const docData of testDocuments) {
      const [document, docCreated] = await Document.findOrCreate({
        where: { 
          title: docData.title,
          college_id: docData.college_id 
        },
        defaults: docData
      });

      if (docCreated) {
        console.log(`✅ Document created: ${document.title}`);
      } else {
        console.log(`✅ Document already exists: ${document.title}`);
      }
    }

    // Create test notifications
    const testNotifications = [
      {
        user_id: collegeAdmin.id,
        title: 'New Idea Submission',
        message: 'A new idea has been submitted for review',
        type: 'info',
        is_read: false
      },
      {
        user_id: collegeAdmin.id,
        title: 'System Update',
        message: 'The innovation hub system has been updated with new features',
        type: 'info',
        is_read: false
      },
      {
        user_id: student.id,
        title: 'Idea Status Update',
        message: 'Your idea status has been updated',
        type: 'success',
        is_read: false
      }
    ];

    for (const notifData of testNotifications) {
      const [notification, notifCreated] = await Notification.findOrCreate({
        where: { 
          user_id: notifData.user_id,
          title: notifData.title,
          message: notifData.message
        },
        defaults: notifData
      });

      if (notifCreated) {
        console.log(`✅ Notification created: ${notification.title}`);
      } else {
        console.log(`✅ Notification already exists: ${notification.title}`);
      }
    }

    console.log('\n🎉 Test data setup completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('College Admin: admin@testcollege.edu / password123');
    console.log('Student: student@testcollege.edu / password123');
    console.log(`College ID: ${college.id}`);

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  }
}

setupTestData();