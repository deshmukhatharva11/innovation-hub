const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const College = require('../models/College');
const Idea = require('../models/Idea');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const MentorAssignment = require('../models/MentorAssignment');

async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');

    // Clear existing data
    await sequelize.sync({ force: true });
    console.log('✅ Database cleared and tables created');

    // Create Colleges (All from Amravati Division)
    const colleges = await College.bulkCreate([
      {
        name: 'Sant Gadge Baba Amravati University',
        location: 'Amravati, Maharashtra',
        type: 'University',
        contact_email: 'admin@sgbau.ac.in',
        contact_phone: '+91-721-2662206',
        website: 'https://www.sgbau.ac.in',
        established_year: 1983,
        accreditation: 'NAAC B++',
        description: 'Premier university in Maharashtra offering diverse programs in science, technology, and management.'
      },
      {
        name: 'Government College of Engineering, Amravati',
        location: 'Amravati, Maharashtra',
        type: 'Engineering College',
        contact_email: 'principal@gcoea.ac.in',
        contact_phone: '+91-721-2662206',
        website: 'https://www.gcoea.ac.in',
        established_year: 1983,
        accreditation: 'NBA Accredited',
        description: 'Leading engineering college offering B.Tech and M.Tech programs.'
      },
      {
        name: 'Dr. Panjabrao Deshmukh Krishi Vidyapeeth',
        location: 'Akola, Maharashtra',
        type: 'Agricultural University',
        contact_email: 'registrar@pdpu.ac.in',
        contact_phone: '+91-724-2258465',
        website: 'https://www.pdpu.ac.in',
        established_year: 1969,
        accreditation: 'ICAR Accredited',
        description: 'Premier agricultural university focusing on agricultural innovation and research.'
      },
      {
        name: 'Shri Shivaji Science College',
        location: 'Amravati, Maharashtra',
        type: 'Science College',
        contact_email: 'principal@sssc.ac.in',
        contact_phone: '+91-721-2662206',
        website: 'https://www.sssc.ac.in',
        established_year: 1955,
        accreditation: 'NAAC A',
        description: 'Renowned science college offering undergraduate and postgraduate programs.'
      },
      {
        name: 'Government Polytechnic, Amravati',
        location: 'Amravati, Maharashtra',
        type: 'Polytechnic',
        contact_email: 'principal@gpamravati.ac.in',
        contact_phone: '+91-721-2662206',
        website: 'https://www.gpamravati.ac.in',
        established_year: 1960,
        accreditation: 'AICTE Approved',
        description: 'Technical education institute offering diploma programs in various engineering fields.'
      },
      {
        name: 'Government College of Engineering, Akola',
        location: 'Akola, Maharashtra',
        type: 'Engineering College',
        contact_email: 'principal@gcoea.ac.in',
        contact_phone: '+91-724-2258465',
        website: 'https://www.gcoea.ac.in',
        established_year: 1983,
        accreditation: 'NBA Accredited',
        description: 'Engineering college offering B.Tech programs in various disciplines.'
      },
      {
        name: 'Shri Shivaji College of Engineering and Technology',
        location: 'Amravati, Maharashtra',
        type: 'Engineering College',
        contact_email: 'principal@sscet.ac.in',
        contact_phone: '+91-721-2662206',
        website: 'https://www.sscet.ac.in',
        established_year: 1995,
        accreditation: 'AICTE Approved',
        description: 'Private engineering college offering quality technical education.'
      },
      {
        name: 'Government Polytechnic, Akola',
        location: 'Akola, Maharashtra',
        type: 'Polytechnic',
        contact_email: 'principal@gpakola.ac.in',
        contact_phone: '+91-724-2258465',
        website: 'https://www.gpakola.ac.in',
        established_year: 1965,
        accreditation: 'AICTE Approved',
        description: 'Technical education institute offering diploma programs.'
      }
    ]);
    console.log('✅ Created 8 colleges (all from Amravati Division)');

    // Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.bulkCreate([
      // Super Admin
      {
        name: 'Dr. Rajesh Kumar',
        email: 'admin@innovationhub.com',
        password: hashedPassword,
        role: 'super_admin',
        phone: '+91-9876543210',
        college_id: colleges[0].id,
        is_verified: true,
        profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      
      // College Admins
      {
        name: 'Prof. Sunita Sharma',
        email: 'admin@sgbau.ac.in',
        password: hashedPassword,
        role: 'college_admin',
        phone: '+91-9876543211',
        college_id: colleges[0].id,
        is_verified: true,
        profile_image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Dr. Amit Patel',
        email: 'admin@gcoea.ac.in',
        password: hashedPassword,
        role: 'college_admin',
        phone: '+91-9876543212',
        college_id: colleges[1].id,
        is_verified: true,
        profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      
      // Incubator Managers
      {
        name: 'Ms. Priya Singh',
        email: 'incubator@techpark.com',
        password: hashedPassword,
        role: 'incubator',
        phone: '+91-9876543213',
        college_id: colleges[0].id,
        is_verified: true,
        profile_image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Mr. Vikram Joshi',
        email: 'incubator@startupindia.com',
        password: hashedPassword,
        role: 'incubator',
        phone: '+91-9876543214',
        college_id: colleges[1].id,
        is_verified: true,
        profile_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      },
      
      // Students
      {
        name: 'Rahul Kumar',
        email: 'rahul.kumar@student.sgbau.ac.in',
        password: hashedPassword,
        role: 'student',
        phone: '+91-9876543215',
        college_id: colleges[0].id,
        is_verified: true,
        student_id: 'SGB2023001',
        course: 'B.Tech Computer Science',
        year: 3,
        profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@student.sgbau.ac.in',
        password: hashedPassword,
        role: 'student',
        phone: '+91-9876543216',
        college_id: colleges[0].id,
        is_verified: true,
        student_id: 'SGB2023002',
        course: 'B.Tech Information Technology',
        year: 2,
        profile_image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@student.gcoea.ac.in',
        password: hashedPassword,
        role: 'student',
        phone: '+91-9876543217',
        college_id: colleges[1].id,
        is_verified: true,
        student_id: 'GCO2023001',
        course: 'B.Tech Mechanical Engineering',
        year: 4,
        profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Sneha Gupta',
        email: 'sneha.gupta@student.pdpu.ac.in',
        password: hashedPassword,
        role: 'student',
        phone: '+91-9876543218',
        college_id: colleges[2].id,
        is_verified: true,
        student_id: 'PDP2023001',
        course: 'B.Sc Agriculture',
        year: 3,
        profile_image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@student.sssc.ac.in',
        password: hashedPassword,
        role: 'student',
        phone: '+91-9876543219',
        college_id: colleges[3].id,
        is_verified: true,
        student_id: 'SSS2023001',
        course: 'B.Sc Physics',
        year: 2,
        profile_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      }
    ]);
    console.log('✅ Created 10 users');

    // Create Ideas
    const ideas = await Idea.bulkCreate([
      {
        title: 'Smart Agriculture Monitoring System',
        description: 'IoT-based system to monitor soil moisture, temperature, and crop health in real-time using sensors and mobile app.',
        problem_statement: 'Farmers face challenges in monitoring crop health and soil conditions, leading to reduced yields and resource wastage.',
        solution: 'Develop an IoT-based monitoring system with sensors, mobile app, and data analytics for precision agriculture.',
        target_market: 'Small and medium-scale farmers in Maharashtra',
        business_model: 'Hardware sales + subscription-based data analytics service',
        team_size: 4,
        budget_required: 500000,
        timeline: '12 months',
        status: 'under_review',
        category: 'Agriculture Technology',
        student_id: users[5].id, // Rahul Kumar
        college_id: colleges[0].id,
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-01-20')
      },
      {
        title: 'AI-Powered Waste Management System',
        description: 'Smart waste sorting and management system using computer vision and machine learning to optimize waste collection routes.',
        problem_statement: 'Inefficient waste management leads to environmental pollution and increased operational costs for municipalities.',
        solution: 'AI-powered waste sorting system with optimized collection routes and real-time monitoring.',
        target_market: 'Municipal corporations and waste management companies',
        business_model: 'SaaS platform with per-route pricing',
        team_size: 3,
        budget_required: 750000,
        timeline: '18 months',
        status: 'approved',
        category: 'Environmental Technology',
        student_id: users[6].id, // Priya Sharma
        college_id: colleges[0].id,
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-01-25')
      },
      {
        title: 'Renewable Energy Monitoring Platform',
        description: 'Comprehensive platform for monitoring and optimizing renewable energy systems including solar, wind, and hydro power.',
        problem_statement: 'Renewable energy systems lack efficient monitoring and optimization tools, leading to suboptimal performance.',
        solution: 'Integrated monitoring platform with predictive analytics and optimization algorithms.',
        target_market: 'Renewable energy companies and industrial consumers',
        business_model: 'Subscription-based monitoring service',
        team_size: 5,
        budget_required: 1000000,
        timeline: '24 months',
        status: 'incubated',
        category: 'Clean Energy',
        student_id: users[7].id, // Amit Patel
        college_id: colleges[1].id,
        created_at: new Date('2023-12-01'),
        updated_at: new Date('2024-01-30')
      },
      {
        title: 'Digital Health Monitoring for Rural Areas',
        description: 'Telemedicine platform connecting rural patients with urban doctors through video consultations and health monitoring devices.',
        problem_statement: 'Rural areas lack access to quality healthcare services and specialist doctors.',
        solution: 'Telemedicine platform with IoT health monitoring devices and AI-powered diagnostics.',
        target_market: 'Rural healthcare centers and patients',
        business_model: 'Per-consultation fees + device rental',
        team_size: 6,
        budget_required: 800000,
        timeline: '15 months',
        status: 'submitted',
        category: 'Healthcare Technology',
        student_id: users[8].id, // Sneha Gupta
        college_id: colleges[2].id,
        created_at: new Date('2024-02-01'),
        updated_at: new Date('2024-02-05')
      },
      {
        title: 'Smart Classroom Management System',
        description: 'AI-powered system for managing classroom activities, attendance, and student performance analytics.',
        problem_statement: 'Traditional classroom management is inefficient and lacks data-driven insights for student performance.',
        solution: 'AI-powered classroom management system with attendance tracking and performance analytics.',
        target_market: 'Educational institutions and coaching centers',
        business_model: 'SaaS subscription model',
        team_size: 4,
        budget_required: 600000,
        timeline: '10 months',
        status: 'under_review',
        category: 'Educational Technology',
        student_id: users[9].id, // Vikram Singh
        college_id: colleges[3].id,
        created_at: new Date('2024-01-20'),
        updated_at: new Date('2024-01-28')
      }
    ]);
    console.log('✅ Created 5 ideas');

    // Create Events
    const events = await Event.bulkCreate([
      {
        title: 'Innovation Hub Launch Event',
        description: 'Grand launch of the SGBAU Innovation Hub with keynote speakers, startup showcases, and networking opportunities.',
        date: new Date('2024-03-15'),
        time: '10:00:00',
        location: 'SGBAU Main Campus, Amravati',
        event_type: 'workshop',
        max_participants: 200,
        registration_deadline: new Date('2024-03-10'),
        status: 'upcoming',
        organizer_id: users[0].id, // Super Admin
        college_id: colleges[0].id
      },
      {
        title: 'Startup Pitch Competition',
        description: 'Annual startup pitch competition for students to showcase their innovative ideas and win funding opportunities.',
        date: new Date('2024-04-20'),
        time: '09:00:00',
        location: 'GCOEA Auditorium, Amravati',
        event_type: 'competition',
        max_participants: 50,
        registration_deadline: new Date('2024-04-15'),
        status: 'upcoming',
        organizer_id: users[1].id, // College Admin
        college_id: colleges[1].id
      },
      {
        title: 'Technology Innovation Workshop',
        description: 'Hands-on workshop on emerging technologies including AI, IoT, and blockchain for students and faculty.',
        date: new Date('2024-02-28'),
        time: '14:00:00',
        location: 'PDKV Conference Hall, Akola',
        event_type: 'workshop',
        max_participants: 100,
        registration_deadline: new Date('2024-02-25'),
        status: 'completed',
        organizer_id: users[3].id, // Incubator
        college_id: colleges[2].id
      },
      {
        title: 'Entrepreneurship Bootcamp',
        description: 'Intensive 3-day bootcamp covering business planning, market research, and funding strategies for aspiring entrepreneurs.',
        date: new Date('2024-05-10'),
        time: '09:00:00',
        location: 'SSSC Seminar Hall, Amravati',
        event_type: 'bootcamp',
        max_participants: 75,
        registration_deadline: new Date('2024-05-05'),
        status: 'upcoming',
        organizer_id: users[4].id, // Incubator
        college_id: colleges[3].id
      }
    ]);
    console.log('✅ Created 4 events');

    // Create Announcements
    const announcements = await Announcement.bulkCreate([
      {
        title: 'Innovation Hub Registration Open',
        content: 'Registration for the SGBAU Innovation Hub is now open for all students. Submit your innovative ideas and get mentorship from industry experts.',
        type: 'general',
        priority: 'high',
        target_audience: 'all',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        is_active: true,
        created_by: users[0].id // Super Admin
      },
      {
        title: 'Startup Funding Opportunities',
        content: 'Multiple funding opportunities available for student startups. Apply now for seed funding up to ₹10 lakhs.',
        type: 'funding',
        priority: 'high',
        target_audience: 'students',
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-06-30'),
        is_active: true,
        created_by: users[1].id // College Admin
      },
      {
        title: 'Mentorship Program Launch',
        content: 'Industry mentorship program launched. Connect with successful entrepreneurs and get guidance for your startup journey.',
        type: 'mentorship',
        priority: 'medium',
        target_audience: 'students',
        start_date: new Date('2024-01-15'),
        end_date: new Date('2024-12-31'),
        is_active: true,
        created_by: users[3].id // Incubator
      },
      {
        title: 'Technology Workshop Series',
        content: 'Monthly technology workshops covering AI, IoT, blockchain, and other emerging technologies. Register now!',
        type: 'workshop',
        priority: 'medium',
        target_audience: 'all',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        is_active: true,
        created_by: users[4].id // Incubator
      }
    ]);
    console.log('✅ Created 4 announcements');

    // Create Mentor Assignments
    const mentorAssignments = await MentorAssignment.bulkCreate([
      {
        idea_id: ideas[0].id, // Smart Agriculture
        mentor_id: users[3].id, // Priya Singh (Incubator)
        student_id: users[5].id, // Rahul Kumar
        status: 'active',
        start_date: new Date('2024-01-20'),
        notes: 'Focus on IoT sensor integration and mobile app development'
      },
      {
        idea_id: ideas[1].id, // AI Waste Management
        mentor_id: users[4].id, // Vikram Joshi (Incubator)
        student_id: users[6].id, // Priya Sharma
        status: 'active',
        start_date: new Date('2024-01-25'),
        notes: 'Emphasize AI model training and route optimization algorithms'
      },
      {
        idea_id: ideas[2].id, // Renewable Energy
        mentor_id: users[3].id, // Priya Singh (Incubator)
        student_id: users[7].id, // Amit Patel
        status: 'completed',
        start_date: new Date('2023-12-01'),
        end_date: new Date('2024-01-30'),
        notes: 'Successfully completed prototype development and market validation'
      }
    ]);
    console.log('✅ Created 3 mentor assignments');

    console.log('🎉 Comprehensive database seeding completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log(`- Colleges: ${colleges.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Ideas: ${ideas.length}`);
    console.log(`- Events: ${events.length}`);
    console.log(`- Announcements: ${announcements.length}`);
    console.log(`- Mentor Assignments: ${mentorAssignments.length}`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('Super Admin: admin@innovationhub.com / password123');
    console.log('College Admin: admin@sgbau.ac.in / password123');
    console.log('Incubator: incubator@techpark.com / password123');
    console.log('Student: rahul.kumar@student.sgbau.ac.in / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
