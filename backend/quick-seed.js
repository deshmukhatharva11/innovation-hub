const { User, College, Incubator, Idea } = require('./models');
const bcrypt = require('bcryptjs');

async function quickSeed() {
  try {
    console.log('🌱 Starting quick database seed...');

    // Create colleges
    const college1 = await College.create({
      name: 'P.R. Pote Patil College of Engineering and Management',
      location: 'Amravati, Maharashtra',
      website: 'https://prpceam.ac.in',
      is_active: true
    });

    const college2 = await College.create({
      name: 'Government College of Engineering, Amravati',
      location: 'Amravati, Maharashtra',
      website: 'https://gcoea.ac.in',
      is_active: true
    });

    // Create incubators
    const incubator1 = await Incubator.create({
      name: 'TechStartup Incubator',
      location: 'Amravati, Maharashtra',
      website: 'https://techstartup.in',
      is_active: true
    });

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Student
    const student = await User.create({
      name: 'Rahul Kumar',
      email: 'rahul.kumar@prpceam.ac.in',
      password: hashedPassword,
      role: 'student',
      college_id: college1.id,
      phone: '+91-9876543210',
      bio: 'Passionate about innovation and technology',
      is_active: true
    });

    // College Admin
    const collegeAdmin = await User.create({
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@prpceam.ac.in',
      password: hashedPassword,
      role: 'college_admin',
      college_id: college1.id,
      phone: '+91-9876543211',
      bio: 'College Administrator',
      is_active: true
    });

    // Incubator Manager
    const incubatorManager = await User.create({
      name: 'Amit Patel',
      email: 'amit.patel@techstartup.in',
      password: hashedPassword,
      role: 'incubator_manager',
      incubator_id: incubator1.id,
      phone: '+91-9876543212',
      bio: 'Incubator Manager',
      is_active: true
    });

    // System Admin
    const systemAdmin = await User.create({
      name: 'System Administrator',
      email: 'admin@innovationhub.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      phone: '+91-9876543213',
      bio: 'System Administrator',
      is_active: true
    });

    // Create a test idea
    const idea = await Idea.create({
      title: 'Eco-Friendly Electric Vehicle Charging Network',
      description: 'A comprehensive network of solar-powered EV charging stations across Amravati city',
      category: 'sustainability',
      problem_statement: 'Limited EV charging infrastructure in Amravati',
      solution: 'Solar-powered charging stations with smart grid integration',
      target_market: 'EV owners, commercial fleets, and government institutions',
      business_model: 'B2B and B2C subscription model',
      student_id: student.id,
      college_id: college1.id,
      status: 'submitted',
      is_public: true,
      is_featured: false
    });

    console.log('✅ Quick seed completed successfully!');
    console.log('\n📋 Created:');
    console.log(`- Colleges: ${college1.name}, ${college2.name}`);
    console.log(`- Incubator: ${incubator1.name}`);
    console.log(`- Users: ${student.name} (student), ${collegeAdmin.name} (college admin), ${incubatorManager.name} (incubator manager), ${systemAdmin.name} (admin)`);
    console.log(`- Idea: ${idea.title}`);
    console.log('\n🔑 Login Credentials:');
    console.log('Student: rahul.kumar@prpceam.ac.in / password123');
    console.log('College Admin: priya.sharma@prpceam.ac.in / password123');
    console.log('Incubator Manager: amit.patel@techstartup.in / password123');
    console.log('System Admin: admin@innovationhub.com / admin123');

  } catch (error) {
    console.error('❌ Quick seed failed:', error);
  }
}

quickSeed();
