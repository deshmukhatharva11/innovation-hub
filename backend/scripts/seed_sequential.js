const { sequelize } = require('../config/database');
const { 
  User, 
  College, 
  Incubator, 
  Idea, 
  TeamMember, 
  IdeaFile, 
  Comment, 
  Like 
} = require('../models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Clear existing data
    await clearExistingData();
    console.log('Existing data cleared.');

    // Seed data sequentially
    await seedCollegesSequential();
    await seedIncubatorsSequential();
    await seedUsersSequential();

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    // Print full error stack
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function clearExistingData() {
  try {
    // Delete in reverse order of dependencies
    await Like.destroy({ where: {} });
    await Comment.destroy({ where: {} });
    await IdeaFile.destroy({ where: {} });
    await TeamMember.destroy({ where: {} });
    await Idea.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Incubator.destroy({ where: {} });
    await College.destroy({ where: {} });
  } catch (error) {
    console.error('Error clearing existing data:', error);
    throw error;
  }
}

async function seedCollegesSequential() {
  try {
    const collegeData = [
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
      }
    ];

    const createdColleges = [];
    for (const college of collegeData) {
      const createdCollege = await College.create(college);
      createdColleges.push(createdCollege);
      console.log(`Created college with ID ${createdCollege.id}: ${createdCollege.name}`);
    }

    return createdColleges;
  } catch (error) {
    console.error('Error seeding colleges:', error);
    throw error;
  }
}

async function seedIncubatorsSequential() {
  try {
    const incubatorData = [
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
      }
    ];

    const createdIncubators = [];
    for (const incubator of incubatorData) {
      const createdIncubator = await Incubator.create(incubator);
      createdIncubators.push(createdIncubator);
      console.log(`Created incubator with ID ${createdIncubator.id}: ${createdIncubator.name}`);
    }

    return createdIncubators;
  } catch (error) {
    console.error('Error seeding incubators:', error);
    throw error;
  }
}

async function seedUsersSequential() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 12);

    const userData = [
      {
        name: 'Admin User',
        email: 'admin@innovationhub.com',
        password_hash: hashedPassword,
        role: 'admin',
        department: 'Administration',
        phone: '+91-9876543210',
        bio: 'System administrator',
        skills: ['Management', 'System Administration'],
        social_links: { linkedin: 'https://linkedin.com/in/admin' },
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@gcoea.ac.in',
        password_hash: hashedPassword,
        role: 'college_admin',
        college_id: 24, // Government College of Engineering, Amravati
        department: 'Computer Science',
        phone: '+91-9876543211',
        bio: 'Professor and College Administrator at GCOEA',
        skills: ['Computer Science', 'Management'],
        social_links: { linkedin: 'https://linkedin.com/in/rajesh-kumar' },
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@gcoea.ac.in',
        password_hash: hashedPassword,
        role: 'incubator_manager',
        incubator_id: 8, // Amravati Innovation Hub
        department: 'Innovation Hub',
        phone: '+91-9876543214',
        bio: 'Incubator Manager at Amravati Innovation Hub',
        skills: ['Startup Mentoring', 'Business Development'],
        social_links: { linkedin: 'https://linkedin.com/in/sneha-reddy' },
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Arjun Singh',
        email: 'arjun.singh@gcoea.ac.in',
        password_hash: hashedPassword,
        role: 'student',
        college_id: 24, // Government College of Engineering, Amravati
        department: 'Computer Science',
        phone: '+91-9876543217',
        bio: 'Final year CS student passionate about AI/ML',
        skills: ['Python', 'Machine Learning', 'Web Development'],
        social_links: { 
          linkedin: 'https://linkedin.com/in/arjun-singh',
          github: 'https://github.com/arjunsingh'
        },
        is_active: true,
        email_verified: true,
      }
    ];

    const createdUsers = [];
    for (const user of userData) {
      const createdUser = await User.create(user);
      createdUsers.push(createdUser);
      console.log(`Created user with ID ${createdUser.id}: ${createdUser.name} (${createdUser.role})`);
    }

    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

seed();
