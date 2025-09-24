const { Mentor, College, Incubator } = require('./models');
const bcrypt = require('bcryptjs');

async function createTestMentor() {
  try {
    console.log('🔧 Creating Test Mentor...\n');
    
    // Get first college
    const college = await College.findOne();
    if (!college) {
      console.log('❌ No colleges found. Please create a college first.');
      return;
    }
    
    // Check if test mentor already exists
    const existingMentor = await Mentor.findOne({
      where: { email: 'test.mentor@example.com' }
    });
    
    if (existingMentor) {
      console.log('✅ Test mentor already exists!');
      console.log('📧 Email: test.mentor@example.com');
      console.log('🔑 Password: mentor123');
      console.log('🏫 College: ' + (existingMentor.college_id ? 'Assigned to college' : 'Not assigned'));
      console.log('');
      console.log('🔐 Login Instructions:');
      console.log('1. Go to: http://localhost:3000/login');
      console.log('2. Select "Mentor" from login options');
      console.log('3. Email: test.mentor@example.com');
      console.log('4. Password: mentor123');
      console.log('5. Click "Sign In"');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('mentor123', 12);
    
    // Create test mentor
    const mentor = await Mentor.create({
      name: 'Test Mentor',
      email: 'test.mentor@example.com',
      password_hash: hashedPassword,
      phone: '9876543210',
      specialization: 'Web Development',
      experience_years: 5,
      availability: 'available',
      max_students: 10,
      bio: 'Experienced mentor specializing in web development and student guidance.',
      linkedin_url: 'https://linkedin.com/in/testmentor',
      website_url: 'https://testmentor.com',
      college_id: college.id,
      is_active: true
    });
    
    console.log('✅ Test mentor created successfully!');
    console.log('📧 Email: test.mentor@example.com');
    console.log('🔑 Password: mentor123');
    console.log('🏫 College: ' + college.name);
    console.log('');
    console.log('🔐 Login Instructions:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Select "Mentor" from the "Login As" options');
    console.log('3. Email: test.mentor@example.com');
    console.log('4. Password: mentor123');
    console.log('5. Click "Sign In"');
    console.log('');
    console.log('🎯 After login, you will have access to:');
    console.log('- Mentor Dashboard');
    console.log('- View students from your college');
    console.log('- View students from other colleges');
    console.log('- Chat with assigned students');
    console.log('- Manage your profile');
    
  } catch (error) {
    console.error('❌ Error creating test mentor:', error);
  }
}

createTestMentor();