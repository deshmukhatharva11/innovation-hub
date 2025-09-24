const { sequelize, User, College, Incubator, Idea, Comment, Like, TeamMember, IdeaFile, Notification } = require('../models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Disable foreign key checks temporarily
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    
    // Clear existing data in correct order
    await clearExistingData();
    
    // Create seed data
    await createSeedData();
    
    // Re-enable foreign key checks
    await sequelize.query('PRAGMA foreign_keys = ON;');
    
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

async function clearExistingData() {
  try {
    console.log('Clearing existing data...');
    
    // Clear in reverse dependency order
    await Like.destroy({ where: {}, force: true });
    await Comment.destroy({ where: {}, force: true });
    await IdeaFile.destroy({ where: {}, force: true });
    await TeamMember.destroy({ where: {}, force: true });
    await Idea.destroy({ where: {}, force: true });
    await Notification.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await College.destroy({ where: {}, force: true });
    await Incubator.destroy({ where: {}, force: true });
    
    console.log('✅ Existing data cleared successfully');
  } catch (error) {
    console.error('Error clearing existing data:', error);
    throw error;
  }
}

async function createSeedData() {
  try {
    console.log('Seeding data...');

    // Seed colleges
    await seedColleges();
    await seedIncubators();
    await seedUsers();
    await seedIdeas();
    await seedTeamMembers();
    await seedComments();
    await seedLikes();

    console.log('✅ Data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

async function seedColleges() {
  try {
    const currentDate = new Date();
    const colleges = [
      {
        name: 'Government College of Engineering, Amravati',
        address: 'Near Kathora Naka, Amravati, Maharashtra 444604',
        contact_email: 'principal@gcoea.ac.in',
        website: 'https://www.gcoea.ac.in',
        phone: '+91-721-2662146',
        city: 'Amravati',
        state: 'Maharashtra',
        country: 'India',
        postal_code: '444604',
        established_year: 1983,
        accreditation: 'AICTE, NBA',
        description: 'Premier government engineering college in Amravati region',
        is_active: true,
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        name: 'P.R. Pote Patil College of Engineering and Management, Amravati',
        address: 'Near Airport, Amravati, Maharashtra 444701',
        contact_email: 'info@prpceam.ac.in',
        website: 'https://www.prpceam.ac.in',
        phone: '+91-721-2662147',
        city: 'Amravati',
        state: 'Maharashtra',
        country: 'India',
        postal_code: '444701',
        established_year: 2008,
        accreditation: 'AICTE, NBA',
        description: 'Private engineering college with focus on innovation and entrepreneurship',
        is_active: true,
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        name: 'Shri Sant Gajanan Maharaj College of Engineering, Shegaon',
        address: 'Shegaon, Buldhana, Maharashtra 444203',
        contact_email: 'principal@ssgmce.ac.in',
        website: 'https://www.ssgmce.ac.in',
        phone: '+91-7263-256001',
        city: 'Shegaon',
        state: 'Maharashtra',
        country: 'India',
        postal_code: '444203',
        established_year: 1983,
        accreditation: 'AICTE, NBA',
        description: 'Engineering college with strong focus on rural development and innovation',
        is_active: true,
        created_at: currentDate,
        updated_at: currentDate,
      }
    ];

    const createdColleges = await College.bulkCreate(colleges);
    console.log(`Created ${createdColleges.length} colleges.`);
    return createdColleges;
  } catch (error) {
    console.error('Error seeding colleges:', error);
    throw error;
  }
}

async function seedIncubators() {
  try {
    const currentDate = new Date();
    const incubators = [
      {
        name: 'Amravati Innovation Hub',
        description: 'Technology innovation and startup incubation center for Amravati region',
        focus_areas: ['Technology', 'AI/ML', 'IoT', 'Clean Energy', 'Agriculture'],
        address: 'Government College of Engineering, Amravati Campus',
        contact_email: 'innovation@gcoea.ac.in',
        website: 'https://innovation.gcoea.ac.in',
        phone: '+91-721-2662146',
        city: 'Amravati',
        state: 'Maharashtra',
        country: 'India',
        established_year: 2018,
        capacity: 30,
        current_occupancy: 20,
        funding_available: 5000000,
        services_offered: ['Mentoring', 'Funding', 'Workspace', 'Networking', 'Technical Support'],
        success_stories: ['AgriTech Solutions', 'Smart City Innovations'],
        is_active: true,
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        name: 'PRPCEAM Startup Village',
        description: 'Student startup incubation and innovation center',
        focus_areas: ['Software', 'Hardware', 'Biotechnology', 'Agriculture', 'Education'],
        address: 'P.R. Pote Patil College Campus, Amravati',
        contact_email: 'startup@prpceam.ac.in',
        website: 'https://startup.prpceam.ac.in',
        phone: '+91-721-2662147',
        city: 'Amravati',
        state: 'Maharashtra',
        country: 'India',
        established_year: 2019,
        capacity: 25,
        current_occupancy: 15,
        funding_available: 3000000,
        services_offered: ['Incubation', 'Mentoring', 'Funding', 'Market Access', 'Industry Connect'],
        success_stories: ['EduTech Platform', 'Rural Innovation Hub'],
        is_active: true,
        created_at: currentDate,
        updated_at: currentDate,
      }
    ];

    const createdIncubators = await Incubator.bulkCreate(incubators);
    console.log(`Created ${createdIncubators.length} incubators.`);
    return createdIncubators;
  } catch (error) {
    console.error('Error seeding incubators:', error);
    throw error;
  }
}

async function seedUsers() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const currentDate = new Date();
    
    // Get the actual created colleges and incubators to link properly
    const colleges = await College.findAll();
    const incubators = await Incubator.findAll();
    
    console.log(`Found ${colleges.length} colleges and ${incubators.length} incubators for linking users`);
    
    // Create 10 students distributed across colleges
    const students = [];
    for (let i = 1; i <= 10; i++) {
      const collegeIndex = (i - 1) % colleges.length;
      students.push({
        name: `Student ${i}`,
        email: `student${i}@college${collegeIndex + 1}.edu`,
        password_hash: hashedPassword,
        role: 'student',
        college_id: colleges[collegeIndex].id,
        department: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Information Technology'][i % 4],
        phone: `+91-98765${String(i).padStart(5, '0')}`,
        bio: `Student ${i} studying at college ${collegeIndex + 1}`,
        skills: ['Programming', 'Problem Solving', 'Team Work'],
        social_links: { linkedin: `https://linkedin.com/in/student${i}` },
        is_active: true,
        email_verified: true,
        created_at: currentDate,
        updated_at: currentDate,
      });
    }

    // Create college admins
    const collegeAdmins = colleges.map((college, index) => ({
      name: `Dr. Admin ${index + 1}`,
      email: `admin${index + 1}@college${index + 1}.edu`,
      password_hash: hashedPassword,
      role: 'college_admin',
      college_id: college.id,
      department: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering'][index % 3],
      phone: `+91-98765${String(index + 100).padStart(5, '0')}`,
      bio: `College Administrator at College ${index + 1}`,
      skills: ['Management', 'Leadership', 'Education'],
      social_links: { linkedin: `https://linkedin.com/in/admin${index + 1}` },
      is_active: true,
      email_verified: true,
      created_at: currentDate,
      updated_at: currentDate,
    }));

    // Create incubator managers
    const incubatorManagers = incubators.map((incubator, index) => ({
      name: `Manager ${index + 1}`,
      email: `manager${index + 1}@incubator${index + 1}.edu`,
      password_hash: hashedPassword,
      role: 'incubator_manager',
      incubator_id: incubator.id,
      department: 'Innovation Hub',
      phone: `+91-98765${String(index + 200).padStart(5, '0')}`,
      bio: `Incubator Manager at Incubator ${index + 1}`,
      skills: ['Startup Mentoring', 'Business Development', 'Innovation'],
      social_links: { linkedin: `https://linkedin.com/in/manager${index + 1}` },
      is_active: true,
      email_verified: true,
      created_at: currentDate,
      updated_at: currentDate,
    }));

    // Create super admin
    const superAdmin = {
      name: 'Super Admin',
      email: 'admin@innovationhub.com',
      password_hash: hashedPassword,
      role: 'admin',
      department: 'Administration',
      phone: '+91-9876500000',
      bio: 'System Super Administrator',
      skills: ['System Administration', 'Management', 'Security'],
      social_links: { linkedin: 'https://linkedin.com/in/superadmin' },
      is_active: true,
      email_verified: true,
      created_at: currentDate,
      updated_at: currentDate,
    };

    // Insert all users
    const allUsers = [superAdmin, ...collegeAdmins, ...incubatorManagers, ...students];
    const createdUsers = await User.bulkCreate(allUsers);
    console.log(`Created ${createdUsers.length} users (1 super admin, ${collegeAdmins.length} college admins, ${incubatorManagers.length} incubator managers, ${students.length} students)`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedIdeas() {
  try {
    const currentDate = new Date();
    
    // Get the actual created users and colleges to link properly
    const students = await User.findAll({ where: { role: 'student' } });
    const colleges = await College.findAll();
    const incubators = await Incubator.findAll();
    
    const ideas = [
      {
        title: 'AI-Powered Smart Agriculture System',
        description: 'An intelligent system that uses AI and IoT to optimize agricultural practices, monitor crop health, and predict yields.',
        category: 'Agriculture',
        status: 'submitted',
        student_id: students[0].id,
        college_id: students[0].college_id,
        team_size: 4,
        funding_required: 500000,
        timeline: '12 months',
        likes_count: 15,
        views_count: 120,
        problem_statement: 'Traditional farming methods are inefficient and lack real-time monitoring capabilities.',
        solution_approach: 'IoT sensors + AI algorithms for crop monitoring and optimization',
        market_potential: 'Large market in Indian agriculture sector',
        technical_feasibility: 'High - proven technologies available',
        business_model: 'SaaS subscription for farmers',
        competitive_analysis: 'Limited competition in Indian market',
        risk_assessment: 'Medium - requires farmer adoption',
        success_metrics: ['Crop yield improvement', 'Water usage reduction', 'Farmer adoption rate'],
        tags: ['AI', 'IoT', 'Agriculture', 'Sustainability'],
        is_public: true,
        is_featured: true,
        created_at: currentDate,
        updated_at: currentDate,
        submission_date: currentDate,
      },
      {
        title: 'Eco-Friendly Electric Vehicle Charging Network',
        description: 'A network of solar-powered EV charging stations with smart grid integration and mobile app for users.',
        category: 'Clean Energy',
        status: 'under_review',
        student_id: students[1].id,
        college_id: students[1].college_id,
        team_size: 6,
        funding_required: 2000000,
        timeline: '18 months',
        likes_count: 28,
        views_count: 200,
        problem_statement: 'Limited EV charging infrastructure and high electricity costs for charging.',
        solution_approach: 'Solar-powered charging stations with smart grid integration',
        market_potential: 'Growing EV market in India',
        technical_feasibility: 'High - proven solar and EV technologies',
        business_model: 'Charging fees + government subsidies',
        competitive_analysis: 'Competitive market with established players',
        risk_assessment: 'Medium - requires significant infrastructure investment',
        success_metrics: ['Number of charging stations', 'Daily usage', 'Revenue per station'],
        tags: ['EV', 'Solar', 'Clean Energy', 'Infrastructure'],
        is_public: true,
        is_featured: true,
        created_at: currentDate,
        updated_at: currentDate,
        submission_date: currentDate,
      },
      {
        title: 'Smart Healthcare Monitoring Device',
        description: 'A wearable device that monitors vital signs and provides early warning for health issues.',
        category: 'Healthcare',
        status: 'endorsed',
        student_id: students[2].id,
        college_id: students[2].college_id,
        incubator_id: incubators[0].id,
        team_size: 5,
        funding_required: 800000,
        timeline: '15 months',
        likes_count: 42,
        views_count: 350,
        problem_statement: 'Lack of continuous health monitoring for elderly and patients with chronic conditions.',
        solution_approach: 'Wearable device with AI-powered health analytics',
        market_potential: 'Large healthcare market, especially for elderly care',
        technical_feasibility: 'High - proven sensor and AI technologies',
        business_model: 'Device sales + subscription for health monitoring service',
        competitive_analysis: 'Competitive but growing market',
        risk_assessment: 'Medium - requires medical device certification',
        success_metrics: ['Device accuracy', 'User adoption', 'Health outcomes improvement'],
        tags: ['Healthcare', 'IoT', 'AI', 'Wearable'],
        is_public: true,
        is_featured: true,
        created_at: currentDate,
        updated_at: currentDate,
        submission_date: currentDate,
      },
      {
        title: 'Educational VR Platform for STEM',
        description: 'Virtual reality platform for interactive STEM education with immersive learning experiences.',
        category: 'Education',
        status: 'incubated',
        student_id: students[3].id,
        college_id: students[3].college_id,
        incubator_id: incubators[1].id,
        team_size: 7,
        funding_required: 1200000,
        timeline: '20 months',
        likes_count: 35,
        views_count: 280,
        problem_statement: 'Traditional STEM education lacks hands-on experience and engagement.',
        solution_approach: 'VR-based interactive learning modules',
        market_potential: 'Large education market, especially K-12 and higher education',
        technical_feasibility: 'High - VR technology is mature',
        business_model: 'Subscription for schools and institutions',
        competitive_analysis: 'Growing market with several players',
        risk_assessment: 'Medium - requires content development and school adoption',
        success_metrics: ['Student engagement', 'Learning outcomes', 'School adoption'],
        tags: ['VR', 'Education', 'STEM', 'Interactive Learning'],
        is_public: true,
        is_featured: true,
        created_at: currentDate,
        updated_at: currentDate,
        submission_date: currentDate,
      },
      {
        title: 'Biodegradable Packaging Solution',
        description: 'Eco-friendly packaging material made from agricultural waste and natural polymers.',
        category: 'Sustainability',
        status: 'draft',
        student_id: students[4].id,
        college_id: students[4].college_id,
        team_size: 3,
        funding_required: 300000,
        timeline: '10 months',
        likes_count: 8,
        views_count: 45,
        problem_statement: 'Plastic packaging pollution and lack of sustainable alternatives.',
        solution_approach: 'Biodegradable material from agricultural waste',
        market_potential: 'Large packaging market with growing environmental awareness',
        technical_feasibility: 'Medium - requires material science research',
        business_model: 'B2B sales to packaging companies',
        competitive_analysis: 'Growing market with several players',
        risk_assessment: 'Medium - requires material certification and testing',
        success_metrics: ['Material performance', 'Cost competitiveness', 'Market adoption'],
        tags: ['Sustainability', 'Biodegradable', 'Packaging', 'Agriculture'],
        is_public: false,
        is_featured: false,
        created_at: currentDate,
        updated_at: currentDate,
        submission_date: currentDate,
      }
    ];

    const createdIdeas = await Idea.bulkCreate(ideas);
    console.log(`Created ${createdIdeas.length} ideas.`);
    return createdIdeas;
  } catch (error) {
    console.error('Error seeding ideas:', error);
    throw error;
  }
}

async function seedTeamMembers() {
  try {
    // Get the actual created ideas to link properly
    const ideas = await Idea.findAll();
    const currentDate = new Date();
    
    const teamMembers = [
      {
        idea_id: ideas[0].id,
        name: 'Priya Sharma',
        role: 'AI/ML Engineer',
        email: 'priya.sharma@college1.edu',
        phone: '+91-9876543222',
        department: 'Computer Science',
        year_of_study: 3,
        skills: ['Python', 'TensorFlow', 'Computer Vision'],
        is_lead: false,
        contribution_percentage: 25,
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        idea_id: ideas[0].id,
        name: 'Amit Kumar',
        role: 'IoT Developer',
        email: 'amit.kumar@college1.edu',
        phone: '+91-9876543223',
        department: 'Electronics',
        year_of_study: 3,
        skills: ['Arduino', 'Raspberry Pi', 'Sensor Networks'],
        is_lead: false,
        contribution_percentage: 25,
        created_at: currentDate,
        updated_at: currentDate,
      }
    ];

    const createdTeamMembers = await TeamMember.bulkCreate(teamMembers);
    console.log(`Created ${createdTeamMembers.length} team members.`);
    return createdTeamMembers;
  } catch (error) {
    console.error('Error seeding team members:', error);
    throw error;
  }
}

async function seedComments() {
  try {
    // Get the actual created ideas and users to link properly
    const ideas = await Idea.findAll();
    const users = await User.findAll();
    const currentDate = new Date();
    
    const comments = [
      {
        idea_id: ideas[0].id,
        user_id: users.find(u => u.role === 'college_admin')?.id,
        content: 'Excellent idea! The AI integration for crop monitoring could revolutionize Indian agriculture.',
        likes_count: 5,
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        idea_id: ideas[1].id,
        user_id: users.find(u => u.role === 'incubator_manager')?.id,
        content: 'Great initiative for promoting clean energy! The solar integration is a smart approach.',
        likes_count: 7,
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        idea_id: ideas[2].id,
        user_id: users.find(u => u.role === 'college_admin')?.id,
        content: 'This has great potential in the healthcare sector. Consider partnering with hospitals for pilot testing.',
        likes_count: 4,
        created_at: currentDate,
        updated_at: currentDate,
      }
    ];

    const createdComments = await Comment.bulkCreate(comments);
    console.log(`Created ${createdComments.length} comments.`);
    return createdComments;
  } catch (error) {
    console.error('Error seeding comments:', error);
    throw error;
  }
}

async function seedLikes() {
  try {
    // Get the actual created ideas and users to link properly
    const ideas = await Idea.findAll();
    const users = await User.findAll();
    const currentDate = new Date();
    
    // Get different users for different roles to avoid duplicates
    const collegeAdmins = users.filter(u => u.role === 'college_admin');
    const incubatorManagers = users.filter(u => u.role === 'incubator_manager');
    
    const likes = [
      { idea_id: ideas[0].id, user_id: collegeAdmins[0]?.id, like_type: 'like', created_at: currentDate, updated_at: currentDate },
      { idea_id: ideas[0].id, user_id: incubatorManagers[0]?.id, like_type: 'love', created_at: currentDate, updated_at: currentDate },
      { idea_id: ideas[1].id, user_id: collegeAdmins[1]?.id, like_type: 'like', created_at: currentDate, updated_at: currentDate },
      { idea_id: ideas[2].id, user_id: incubatorManagers[0]?.id, like_type: 'love', created_at: currentDate, updated_at: currentDate },
    ];

    const createdLikes = await Like.bulkCreate(likes);
    console.log(`Created ${createdLikes.length} likes.`);
    return createdLikes;
  } catch (error) {
    console.error('Error seeding likes:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed();
}

module.exports = { seed };
