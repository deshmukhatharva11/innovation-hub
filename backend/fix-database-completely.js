const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const path = require('path');

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'backend/database.sqlite'),
  logging: false
});

async function fixDatabaseCompletely() {
  console.log('🔧 Fixing Database Completely...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Clear all data completely
    console.log('🗑️ Clearing all existing data...');
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    
    const tables = ['likes', 'comments', 'idea_files', 'team_members', 'ideas', 'notifications', 'users', 'colleges', 'incubators'];
    for (const table of tables) {
      await sequelize.query(`DELETE FROM ${table};`);
      console.log(`   Cleared ${table}`);
    }
    
    // Reset auto-increment
    await sequelize.query('DELETE FROM sqlite_sequence;');
    console.log('   Reset auto-increment sequences');

    await sequelize.query('PRAGMA foreign_keys = ON;');

    // Create colleges
    console.log('\n🏫 Creating colleges...');
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
        created_at: new Date(),
        updated_at: new Date(),
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
        created_at: new Date(),
        updated_at: new Date(),
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
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];

    const createdColleges = await sequelize.query(
      `INSERT INTO colleges (name, address, contact_email, website, phone, city, state, country, postal_code, established_year, accreditation, description, is_active, created_at, updated_at) VALUES 
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          colleges[0].name, colleges[0].address, colleges[0].contact_email, colleges[0].website, colleges[0].phone, colleges[0].city, colleges[0].state, colleges[0].country, colleges[0].postal_code, colleges[0].established_year, colleges[0].accreditation, colleges[0].description, colleges[0].is_active, colleges[0].created_at, colleges[0].updated_at,
          colleges[1].name, colleges[1].address, colleges[1].contact_email, colleges[1].website, colleges[1].phone, colleges[1].city, colleges[1].state, colleges[1].country, colleges[1].postal_code, colleges[1].established_year, colleges[1].accreditation, colleges[1].description, colleges[1].is_active, colleges[1].created_at, colleges[1].updated_at,
          colleges[2].name, colleges[2].address, colleges[2].contact_email, colleges[2].website, colleges[2].phone, colleges[2].city, colleges[2].state, colleges[2].country, colleges[2].postal_code, colleges[2].established_year, colleges[2].accreditation, colleges[2].description, colleges[2].is_active, colleges[2].created_at, colleges[2].updated_at
        ],
        type: Sequelize.QueryTypes.INSERT
      }
    );
    console.log(`   Created ${colleges.length} colleges`);

    // Get college IDs
    const collegeIds = await sequelize.query('SELECT id FROM colleges ORDER BY id', { type: Sequelize.QueryTypes.SELECT });
    console.log(`   College IDs: ${collegeIds.map(c => c.id).join(', ')}`);

    // Create incubators
    console.log('\n🚀 Creating incubators...');
    const incubators = [
      {
        name: 'Amravati Innovation Hub',
        description: 'Technology innovation and startup incubation center for Amravati region',
        focus_areas: JSON.stringify(['Technology', 'AI/ML', 'IoT', 'Clean Energy', 'Agriculture']),
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
        services_offered: JSON.stringify(['Mentoring', 'Funding', 'Workspace', 'Networking', 'Technical Support']),
        success_stories: JSON.stringify(['AgriTech Solutions', 'Smart City Innovations']),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'PRPCEAM Startup Village',
        description: 'Student startup incubation and innovation center',
        focus_areas: JSON.stringify(['Software', 'Hardware', 'Biotechnology', 'Agriculture', 'Education']),
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
        services_offered: JSON.stringify(['Incubation', 'Mentoring', 'Funding', 'Market Access', 'Industry Connect']),
        success_stories: JSON.stringify(['EduTech Platform', 'Rural Innovation Hub']),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];

    await sequelize.query(
      `INSERT INTO incubators (name, description, focus_areas, address, contact_email, website, phone, city, state, country, established_year, capacity, current_occupancy, funding_available, services_offered, success_stories, is_active, created_at, updated_at) VALUES 
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          incubators[0].name, incubators[0].description, incubators[0].focus_areas, incubators[0].address, incubators[0].contact_email, incubators[0].website, incubators[0].phone, incubators[0].city, incubators[0].state, incubators[0].country, incubators[0].established_year, incubators[0].capacity, incubators[0].current_occupancy, incubators[0].funding_available, incubators[0].services_offered, incubators[0].success_stories, incubators[0].is_active, incubators[0].created_at, incubators[0].updated_at,
          incubators[1].name, incubators[1].description, incubators[1].focus_areas, incubators[1].address, incubators[1].contact_email, incubators[1].website, incubators[1].phone, incubators[1].city, incubators[1].state, incubators[1].country, incubators[1].established_year, incubators[1].capacity, incubators[1].current_occupancy, incubators[1].funding_available, incubators[1].services_offered, incubators[1].success_stories, incubators[1].is_active, incubators[1].created_at, incubators[1].updated_at
        ],
        type: Sequelize.QueryTypes.INSERT
      }
    );
    console.log(`   Created ${incubators.length} incubators`);

    // Get incubator IDs
    const incubatorIds = await sequelize.query('SELECT id FROM incubators ORDER BY id', { type: Sequelize.QueryTypes.SELECT });
    console.log(`   Incubator IDs: ${incubatorIds.map(i => i.id).join(', ')}`);

    // Create users with proper relationships
    console.log('\n👥 Creating users with proper relationships...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    const currentDate = new Date();

    // Create 10 students distributed across colleges
    const students = [];
    for (let i = 1; i <= 10; i++) {
      const collegeIndex = (i - 1) % collegeIds.length;
      students.push({
        name: `Student ${i}`,
        email: `student${i}@college${collegeIndex + 1}.edu`,
        password_hash: hashedPassword,
        role: 'student',
        college_id: collegeIds[collegeIndex].id,
        department: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Information Technology'][i % 4],
        phone: `+91-98765${String(i).padStart(5, '0')}`,
        bio: `Student ${i} studying at college ${collegeIndex + 1}`,
        skills: JSON.stringify(['Programming', 'Problem Solving', 'Team Work']),
        social_links: JSON.stringify({ linkedin: `https://linkedin.com/in/student${i}` }),
        is_active: true,
        email_verified: true,
        created_at: currentDate,
        updated_at: currentDate,
      });
    }

    // Create college admins
    const collegeAdmins = collegeIds.map((college, index) => ({
      name: `Dr. Admin ${index + 1}`,
      email: `admin${index + 1}@college${index + 1}.edu`,
      password_hash: hashedPassword,
      role: 'college_admin',
      college_id: college.id,
      department: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering'][index % 3],
      phone: `+91-98765${String(index + 100).padStart(5, '0')}`,
      bio: `College Administrator at College ${index + 1}`,
      skills: JSON.stringify(['Management', 'Leadership', 'Education']),
      social_links: JSON.stringify({ linkedin: `https://linkedin.com/in/admin${index + 1}` }),
      is_active: true,
      email_verified: true,
      created_at: currentDate,
      updated_at: currentDate,
    }));

    // Create incubator managers
    const incubatorManagers = incubatorIds.map((incubator, index) => ({
      name: `Manager ${index + 1}`,
      email: `manager${index + 1}@incubator${index + 1}.edu`,
      password_hash: hashedPassword,
      role: 'incubator_manager',
      incubator_id: incubator.id,
      department: 'Innovation Hub',
      phone: `+91-98765${String(index + 200).padStart(5, '0')}`,
      bio: `Incubator Manager at Incubator ${index + 1}`,
      skills: JSON.stringify(['Startup Mentoring', 'Business Development', 'Innovation']),
      social_links: JSON.stringify({ linkedin: `https://linkedin.com/in/manager${index + 1}` }),
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
      skills: JSON.stringify(['System Administration', 'Management', 'Security']),
      social_links: JSON.stringify({ linkedin: 'https://linkedin.com/in/superadmin' }),
      is_active: true,
      email_verified: true,
      created_at: currentDate,
      updated_at: currentDate,
    };

    // Insert all users
    const allUsers = [superAdmin, ...collegeAdmins, ...incubatorManagers, ...students];
    for (const user of allUsers) {
      await sequelize.query(
        `INSERT INTO users (name, email, password_hash, role, college_id, incubator_id, department, phone, bio, skills, social_links, is_active, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            user.name, user.email, user.password_hash, user.role, user.college_id || null, user.incubator_id || null, user.department, user.phone, user.bio, user.skills, user.social_links, user.is_active, user.email_verified, user.created_at, user.updated_at
          ],
          type: Sequelize.QueryTypes.INSERT
        }
      );
    }
    console.log(`   Created ${allUsers.length} users (1 super admin, ${collegeAdmins.length} college admins, ${incubatorManagers.length} incubator managers, ${students.length} students)`);

    // Get user IDs for relationships
    const userIds = await sequelize.query('SELECT id, role, college_id FROM users ORDER BY id', { type: Sequelize.QueryTypes.SELECT });
    const studentIds = userIds.filter(u => u.role === 'student');
    const collegeAdminIds = userIds.filter(u => u.role === 'college_admin');
    const incubatorManagerIds = userIds.filter(u => u.role === 'incubator_manager');

    console.log(`   User IDs - Students: ${studentIds.length}, College Admins: ${collegeAdminIds.length}, Incubator Managers: ${incubatorManagerIds.length}`);

    // Create ideas with proper relationships
    console.log('\n💡 Creating ideas with proper relationships...');
    const ideas = [
      {
        title: 'AI-Powered Smart Agriculture System',
        description: 'An intelligent system that uses AI and IoT to optimize agricultural practices, monitor crop health, and predict yields.',
        category: 'Agriculture',
        status: 'submitted',
        student_id: studentIds[0].id,
        college_id: studentIds[0].college_id,
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
        success_metrics: JSON.stringify(['Crop yield improvement', 'Water usage reduction', 'Farmer adoption rate']),
        tags: JSON.stringify(['AI', 'IoT', 'Agriculture', 'Sustainability']),
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
        student_id: studentIds[1].id,
        college_id: studentIds[1].college_id,
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
        success_metrics: JSON.stringify(['Number of charging stations', 'Daily usage', 'Revenue per station']),
        tags: JSON.stringify(['EV', 'Solar', 'Clean Energy', 'Infrastructure']),
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
        student_id: studentIds[2].id,
        college_id: studentIds[2].college_id,
        incubator_id: incubatorIds[0].id,
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
        success_metrics: JSON.stringify(['Device accuracy', 'User adoption', 'Health outcomes improvement']),
        tags: JSON.stringify(['Healthcare', 'IoT', 'AI', 'Wearable']),
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
        student_id: studentIds[3].id,
        college_id: studentIds[3].college_id,
        incubator_id: incubatorIds[1].id,
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
        success_metrics: JSON.stringify(['Student engagement', 'Learning outcomes', 'School adoption']),
        tags: JSON.stringify(['VR', 'Education', 'STEM', 'Interactive Learning']),
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
        student_id: studentIds[4].id,
        college_id: studentIds[4].college_id,
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
        success_metrics: JSON.stringify(['Material performance', 'Cost competitiveness', 'Market adoption']),
        tags: JSON.stringify(['Sustainability', 'Biodegradable', 'Packaging', 'Agriculture']),
        is_public: false,
        is_featured: false,
        created_at: currentDate,
        updated_at: currentDate,
        submission_date: currentDate,
      }
    ];

    for (const idea of ideas) {
      await sequelize.query(
        `INSERT INTO ideas (title, description, category, status, student_id, college_id, incubator_id, team_size, funding_required, timeline, likes_count, views_count, problem_statement, solution_approach, market_potential, technical_feasibility, business_model, competitive_analysis, risk_assessment, success_metrics, tags, is_public, is_featured, created_at, updated_at, submission_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            idea.title, idea.description, idea.category, idea.status, idea.student_id, idea.college_id, idea.incubator_id, idea.team_size, idea.funding_required, idea.timeline, idea.likes_count, idea.views_count, idea.problem_statement, idea.solution_approach, idea.market_potential, idea.technical_feasibility, idea.business_model, idea.competitive_analysis, idea.risk_assessment, idea.success_metrics, idea.tags, idea.is_public, idea.is_featured, idea.created_at, idea.updated_at, idea.submission_date
          ],
          type: Sequelize.QueryTypes.INSERT
        }
      );
    }
    console.log(`   Created ${ideas.length} ideas`);

    // Get idea IDs
    const ideaIds = await sequelize.query('SELECT id FROM ideas ORDER BY id', { type: Sequelize.QueryTypes.SELECT });
    console.log(`   Idea IDs: ${ideaIds.map(i => i.id).join(', ')}`);

    // Create team members
    console.log('\n👥 Creating team members...');
    const teamMembers = [
      {
        idea_id: ideaIds[0].id,
        name: 'Priya Sharma',
        role: 'AI/ML Engineer',
        email: 'priya.sharma@college1.edu',
        phone: '+91-9876543222',
        department: 'Computer Science',
        year_of_study: 3,
        skills: JSON.stringify(['Python', 'TensorFlow', 'Computer Vision']),
        is_lead: false,
        contribution_percentage: 25,
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        idea_id: ideaIds[0].id,
        name: 'Amit Kumar',
        role: 'IoT Developer',
        email: 'amit.kumar@college1.edu',
        phone: '+91-9876543223',
        department: 'Electronics',
        year_of_study: 3,
        skills: JSON.stringify(['Arduino', 'Raspberry Pi', 'Sensor Networks']),
        is_lead: false,
        contribution_percentage: 25,
        created_at: currentDate,
        updated_at: currentDate,
      }
    ];

    for (const member of teamMembers) {
      await sequelize.query(
        `INSERT INTO team_members (idea_id, name, role, email, phone, department, year_of_study, skills, is_lead, contribution_percentage, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            member.idea_id, member.name, member.role, member.email, member.phone, member.department, member.year_of_study, member.skills, member.is_lead, member.contribution_percentage, member.created_at, member.updated_at
          ],
          type: Sequelize.QueryTypes.INSERT
        }
      );
    }
    console.log(`   Created ${teamMembers.length} team members`);

    // Create comments from college admins to students
    console.log('\n💬 Creating comments from college admins...');
    const comments = [
      {
        idea_id: ideaIds[0].id,
        user_id: collegeAdminIds[0].id,
        content: 'Excellent idea! The AI integration for crop monitoring could revolutionize Indian agriculture.',
        likes_count: 5,
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        idea_id: ideaIds[1].id,
        user_id: collegeAdminIds[1].id,
        content: 'Great initiative for promoting clean energy! The solar integration is a smart approach.',
        likes_count: 7,
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        idea_id: ideaIds[2].id,
        user_id: collegeAdminIds[0].id,
        content: 'This has great potential in the healthcare sector. Consider partnering with hospitals for pilot testing.',
        likes_count: 4,
        created_at: currentDate,
        updated_at: currentDate,
      }
    ];

    for (const comment of comments) {
      await sequelize.query(
        `INSERT INTO comments (idea_id, user_id, content, likes_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            comment.idea_id, comment.user_id, comment.content, comment.likes_count, comment.created_at, comment.updated_at
          ],
          type: Sequelize.QueryTypes.INSERT
        }
      );
    }
    console.log(`   Created ${comments.length} comments`);

    // Create likes
    console.log('\n👍 Creating likes...');
    const likes = [
      { idea_id: ideaIds[0].id, user_id: collegeAdminIds[0].id, like_type: 'like', created_at: currentDate, updated_at: currentDate },
      { idea_id: ideaIds[0].id, user_id: incubatorManagerIds[0].id, like_type: 'love', created_at: currentDate, updated_at: currentDate },
      { idea_id: ideaIds[1].id, user_id: collegeAdminIds[1].id, like_type: 'like', created_at: currentDate, updated_at: currentDate },
      { idea_id: ideaIds[2].id, user_id: incubatorManagerIds[0].id, like_type: 'love', created_at: currentDate, updated_at: currentDate },
    ];

    for (const like of likes) {
      await sequelize.query(
        `INSERT INTO likes (idea_id, user_id, like_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
        {
          replacements: [
            like.idea_id, like.user_id, like.like_type, like.created_at, like.updated_at
          ],
          type: Sequelize.QueryTypes.INSERT
        }
      );
    }
    console.log(`   Created ${likes.length} likes`);

    // Verify the data
    console.log('\n🔍 Verifying data...');
    const studentCount = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE role = "student"', { type: Sequelize.QueryTypes.SELECT });
    const ideaCount = await sequelize.query('SELECT COUNT(*) as count FROM ideas', { type: Sequelize.QueryTypes.SELECT });
    const commentCount = await sequelize.query('SELECT COUNT(*) as count FROM comments', { type: Sequelize.QueryTypes.SELECT });
    const teamMemberCount = await sequelize.query('SELECT COUNT(*) as count FROM team_members', { type: Sequelize.QueryTypes.SELECT });

    console.log(`   ✅ Students: ${studentCount[0].count}`);
    console.log(`   ✅ Ideas: ${ideaCount[0].count}`);
    console.log(`   ✅ Comments: ${commentCount[0].count}`);
    console.log(`   ✅ Team Members: ${teamMemberCount[0].count}`);

    // Check relationships
    const studentsWithCollege = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE role = "student" AND college_id IS NOT NULL', { type: Sequelize.QueryTypes.SELECT });
    const ideasWithStudent = await sequelize.query('SELECT COUNT(*) as count FROM ideas WHERE student_id IS NOT NULL', { type: Sequelize.QueryTypes.SELECT });
    const ideasWithCollege = await sequelize.query('SELECT COUNT(*) as count FROM ideas WHERE college_id IS NOT NULL', { type: Sequelize.QueryTypes.SELECT });

    console.log(`   ✅ Students with college: ${studentsWithCollege[0].count}`);
    console.log(`   ✅ Ideas with student: ${ideasWithStudent[0].count}`);
    console.log(`   ✅ Ideas with college: ${ideasWithCollege[0].count}`);

    console.log('\n🎉 Database completely fixed and populated!');
    console.log('\n📋 Test Accounts:');
    console.log('   Super Admin: admin@innovationhub.com / password123');
    console.log('   College Admin 1: admin1@college1.edu / password123');
    console.log('   College Admin 2: admin2@college2.edu / password123');
    console.log('   Student 1: student1@college1.edu / password123');
    console.log('   Student 2: student2@college2.edu / password123');

  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

fixDatabaseCompletely();
