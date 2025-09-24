const { User, College, Idea } = require('./models');
const bcrypt = require('bcryptjs');

async function createFakeStudents() {
  try {
    console.log('Creating fake students...');
    
    // Get existing colleges
    const colleges = await College.findAll();
    if (colleges.length === 0) {
      console.log('No colleges found. Please create colleges first.');
      return;
    }
    
    const fakeStudents = [
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@student.edu',
        password: 'password123',
        department: 'Computer Science',
        year_of_study: '3',
        phone: '9876543210',
        roll_number: 'CS2021001',
        gpa: '8.5',
        bio: 'Passionate about AI and machine learning',
        skills: ['Python', 'Machine Learning', 'Data Science'],
        college_id: colleges[0].id
      },
      {
        name: 'Bob Smith',
        email: 'bob.smith@student.edu',
        password: 'password123',
        department: 'Electrical Engineering',
        year_of_study: '2',
        phone: '9876543211',
        roll_number: 'EE2021002',
        gpa: '7.8',
        bio: 'Interested in renewable energy solutions',
        skills: ['Arduino', 'IoT', 'Embedded Systems'],
        college_id: colleges[0].id
      },
      {
        name: 'Carol Davis',
        email: 'carol.davis@student.edu',
        password: 'password123',
        department: 'Mechanical Engineering',
        year_of_study: '4',
        phone: '9876543212',
        roll_number: 'ME2021003',
        gpa: '9.2',
        bio: 'Focused on sustainable engineering practices',
        skills: ['CAD', 'Manufacturing', 'Design'],
        college_id: colleges[0].id
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@student.edu',
        password: 'password123',
        department: 'Information Technology',
        year_of_study: '3',
        phone: '9876543213',
        roll_number: 'IT2021004',
        gpa: '8.1',
        bio: 'Web development enthusiast',
        skills: ['JavaScript', 'React', 'Node.js'],
        college_id: colleges[0].id
      },
      {
        name: 'Eva Brown',
        email: 'eva.brown@student.edu',
        password: 'password123',
        department: 'Biotechnology',
        year_of_study: '2',
        phone: '9876543214',
        roll_number: 'BT2021005',
        gpa: '8.7',
        bio: 'Researching bioinformatics applications',
        skills: ['Bioinformatics', 'Python', 'Research'],
        college_id: colleges[0].id
      },
      {
        name: 'Frank Miller',
        email: 'frank.miller@student.edu',
        password: 'password123',
        department: 'Civil Engineering',
        year_of_study: '4',
        phone: '9876543215',
        roll_number: 'CE2021006',
        gpa: '7.9',
        bio: 'Infrastructure development specialist',
        skills: ['Structural Design', 'Project Management', 'CAD'],
        college_id: colleges[0].id
      },
      {
        name: 'Grace Taylor',
        email: 'grace.taylor@student.edu',
        password: 'password123',
        department: 'Computer Science',
        year_of_study: '1',
        phone: '9876543216',
        roll_number: 'CS2021007',
        gpa: '8.3',
        bio: 'New to programming but eager to learn',
        skills: ['C++', 'Java', 'Problem Solving'],
        college_id: colleges[0].id
      },
      {
        name: 'Henry Anderson',
        email: 'henry.anderson@student.edu',
        password: 'password123',
        department: 'Electronics Engineering',
        year_of_study: '3',
        phone: '9876543217',
        roll_number: 'ECE2021008',
        gpa: '8.0',
        bio: 'Digital signal processing expert',
        skills: ['MATLAB', 'Signal Processing', 'Circuit Design'],
        college_id: colleges[0].id
      },
      {
        name: 'Ivy Garcia',
        email: 'ivy.garcia@student.edu',
        password: 'password123',
        department: 'Chemical Engineering',
        year_of_study: '2',
        phone: '9876543218',
        roll_number: 'CHE2021009',
        gpa: '8.4',
        bio: 'Process optimization specialist',
        skills: ['Process Design', 'Simulation', 'Chemistry'],
        college_id: colleges[0].id
      },
      {
        name: 'Jack Martinez',
        email: 'jack.martinez@student.edu',
        password: 'password123',
        department: 'Aerospace Engineering',
        year_of_study: '4',
        phone: '9876543219',
        roll_number: 'AE2021010',
        gpa: '9.0',
        bio: 'Aircraft design and aerodynamics',
        skills: ['Aerodynamics', 'CAD', 'Simulation'],
        college_id: colleges[0].id
      }
    ];
    
    let createdCount = 0;
    
    for (const studentData of fakeStudents) {
      try {
        // Check if student already exists
        const existingStudent = await User.findOne({
          where: { email: studentData.email }
        });
        
        if (existingStudent) {
          console.log(`Student ${studentData.name} already exists, skipping...`);
          continue;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(studentData.password, 12);
        
        // Create student
        const student = await User.create({
          ...studentData,
          password_hash: hashedPassword,
          role: 'student',
          is_active: true,
          email_verified: true
        });
        
        console.log(`Created student: ${student.name} (${student.email})`);
        createdCount++;
        
        // Create some ideas for some students
        if (Math.random() > 0.3) { // 70% chance to have ideas
          const ideaCount = Math.floor(Math.random() * 3) + 1; // 1-3 ideas
          
          for (let i = 0; i < ideaCount; i++) {
            const ideaTitles = [
              'Smart Campus Management System',
              'AI-Powered Study Assistant',
              'Sustainable Energy Solution',
              'Mobile App for Student Services',
              'IoT-Based Environmental Monitoring',
              'Blockchain for Academic Records',
              'VR Learning Platform',
              'Automated Attendance System',
              'Smart Waste Management',
              'Digital Library Assistant'
            ];
            
            const categories = ['Technology', 'Healthcare', 'Education', 'Environment', 'Business'];
            const statuses = ['submitted', 'under_review', 'endorsed', 'draft'];
            
            const idea = await Idea.create({
              title: ideaTitles[Math.floor(Math.random() * ideaTitles.length)],
              description: `This is a detailed description for ${student.name}'s innovative idea that addresses real-world problems and provides practical solutions.`,
              category: categories[Math.floor(Math.random() * categories.length)],
              status: statuses[Math.floor(Math.random() * statuses.length)],
              student_id: student.id,
              college_id: student.college_id,
              problem_statement: 'Detailed problem statement...',
              solution_approach: 'Comprehensive solution approach...',
              technical_feasibility: 'High technical feasibility...',
              business_model: 'Sustainable business model...',
              competitive_analysis: 'Competitive analysis...',
              risk_assessment: 'Risk assessment...',
              success_metrics: 'Success metrics...',
              tags: ['innovation', 'technology', 'student'],
              is_public: true,
              views_count: Math.floor(Math.random() * 100),
              likes_count: Math.floor(Math.random() * 50),
              comments_count: Math.floor(Math.random() * 20)
            });
            
            console.log(`  Created idea: ${idea.title} (${idea.status})`);
          }
        }
        
      } catch (error) {
        console.error(`Error creating student ${studentData.name}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully created ${createdCount} fake students`);
    
    // Show final counts
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalIdeas = await Idea.count();
    const activeStudents = await User.count({ where: { role: 'student', is_active: true } });
    
    console.log(`\n📊 Final Statistics:`);
    console.log(`Total Students: ${totalStudents}`);
    console.log(`Active Students: ${activeStudents}`);
    console.log(`Total Ideas: ${totalIdeas}`);
    
  } catch (error) {
    console.error('Error creating fake students:', error);
  }
}

createFakeStudents();
