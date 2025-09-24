const { sequelize } = require('./config/database');
const { User, College, Idea, Incubator, PreIncubatee, Mentor } = require('./models');
const bcrypt = require('bcryptjs');

const districts = [
  { name: 'Amravati', colleges: 10 },
  { name: 'Akola', colleges: 10 },
  { name: 'Washim', colleges: 10 },
  { name: 'Yavatmal', colleges: 10 },
  { name: 'Buldhana', colleges: 10 }
];

const collegeNames = [
  'Government College of Engineering',
  'Shri Sant Gajanan Maharaj College of Engineering',
  'Prof. Ram Meghe Institute of Technology and Research',
  'Dr. Panjabrao Deshmukh Institute of Technology',
  'Shri Shivaji Science College',
  'Mahatma Gandhi Arts, Science & Commerce College',
  'Shri Shivaji College of Engineering',
  'Dr. Ambedkar College of Engineering',
  'Shri Ramdeobaba College of Engineering',
  'G.H. Raisoni College of Engineering'
];

const studentNames = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Singh', 'Vikram Joshi',
  'Anjali Gupta', 'Rohit Verma', 'Kavya Reddy', 'Arjun Mehta', 'Pooja Agarwal',
  'Suresh Kumar', 'Deepika Jain', 'Manoj Tiwari', 'Ritu Sharma', 'Ajay Singh',
  'Neha Gupta', 'Ravi Kumar', 'Shilpa Patel', 'Vishal Sharma', 'Meera Singh'
];

const ideaTitles = [
  'Smart Agriculture Monitoring System',
  'AI-Powered Healthcare Assistant',
  'Eco-Friendly Waste Management',
  'Digital Learning Platform',
  'Smart City Traffic Management',
  'Renewable Energy Solutions',
  'Mobile Health Monitoring',
  'Automated Irrigation System',
  'E-Commerce for Local Artisans',
  'Virtual Reality Education',
  'IoT-based Home Security',
  'Blockchain Voting System',
  'Drone Delivery Service',
  'AI Chatbot for Customer Service',
  'Smart Parking Management',
  'Water Quality Monitoring',
  'Digital Library Management',
  'Online Tutoring Platform',
  'Smart Grid Technology',
  'Sustainable Transportation'
];

const categories = ['Technology', 'Healthcare', 'Education', 'Environment', 'Agriculture', 'Finance', 'Transportation', 'Entertainment', 'Social Impact', 'Other'];

async function createComprehensiveDemoData() {
  try {
    console.log('🚀 Creating comprehensive demo data...');
    
    // Create or get the incubator
    let incubator = await Incubator.findOne({ where: { name: 'Amravati Innovation Hub' } });
    if (!incubator) {
      incubator = await Incubator.create({
        name: 'Amravati Innovation Hub',
        description: 'Technology innovation and startup incubation center for Amravati region',
        city: 'Amravati',
        state: 'Maharashtra',
        country: 'India',
        contact_email: 'info@amravatiinnovationhub.com',
        phone: '+91-721-1234567',
        address: 'Amravati University Campus, Amravati, Maharashtra',
        established_year: 2020,
        is_active: true
      });
    }
    
    const createdColleges = [];
    const createdStudents = [];
    const createdIdeas = [];
    
    // Create colleges for each district
    for (const district of districts) {
      console.log(`📚 Creating colleges for ${district.name} district...`);
      
      for (let i = 0; i < district.colleges; i++) {
        const collegeName = `${collegeNames[i]} - ${district.name}`;
        const college = await College.create({
          name: collegeName,
          city: district.name,
          state: 'Maharashtra',
          country: 'India',
          district: district.name,
          address: `${district.name} University Campus, ${district.name}, Maharashtra`,
          contact_email: `info@${district.name.toLowerCase()}college${i+1}.edu`,
          phone: `+91-721-${String(i+1).padStart(3, '0')}4567`,
          established_year: 1990 + Math.floor(Math.random() * 30),
          is_active: true
        });
        createdColleges.push(college);
        
        // Create 20 students for each college
        console.log(`👥 Creating students for ${collegeName}...`);
        for (let j = 0; j < 20; j++) {
          const studentName = studentNames[j];
          const studentEmail = `student${j+1}@${district.name.toLowerCase()}college${i+1}.edu`;
          const hashedPassword = await bcrypt.hash('password123', 10);
          
          const student = await User.create({
            name: studentName,
            email: studentEmail,
            password_hash: hashedPassword,
            role: 'student',
            college_id: college.id,
            incubator_id: incubator.id,
            department: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical'][Math.floor(Math.random() * 5)],
            phone: `+91-98765${String(j).padStart(5, '0')}`,
            year_of_study: [1, 2, 3, 4][Math.floor(Math.random() * 4)],
            roll_number: `20${String(i+1).padStart(2, '0')}${String(j+1).padStart(3, '0')}`,
            gpa: (3.0 + Math.random() * 2.0).toFixed(2),
            is_active: true,
            email_verified: true
          });
          createdStudents.push(student);
          
          // Create 1-3 ideas for each student
          const numIdeas = Math.floor(Math.random() * 3) + 1;
          for (let k = 0; k < numIdeas; k++) {
            const ideaTitle = ideaTitles[Math.floor(Math.random() * ideaTitles.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];
            const status = Math.random() > 0.3 ? 'endorsed' : 'submitted';
            
            const idea = await Idea.create({
              title: `${ideaTitle} - ${studentName}`,
              description: `A comprehensive solution for ${ideaTitle.toLowerCase()} developed by ${studentName} from ${collegeName}. This innovative approach addresses real-world challenges in the ${category.toLowerCase()} sector.`,
              category: category,
              status: status,
              student_id: student.id,
              college_id: college.id,
              incubator_id: incubator.id,
              team_size: Math.floor(Math.random() * 4) + 1,
              funding_required: Math.floor(Math.random() * 500000) + 50000,
              timeline: `${Math.floor(Math.random() * 12) + 6} months`,
              problem_statement: `Current solutions for ${ideaTitle.toLowerCase()} are inefficient and costly.`,
              solution_approach: `Our innovative approach uses cutting-edge technology to solve this problem.`,
              market_potential: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
              tech_stack: ['React', 'Node.js', 'Python', 'AI/ML', 'IoT', 'Blockchain'].slice(0, Math.floor(Math.random() * 4) + 2),
              implementation_plan: 'Phase 1: Research and Development, Phase 2: Prototype Development, Phase 3: Testing and Deployment',
              technical_feasibility: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
              business_model: 'Freemium with premium features',
              competitive_analysis: 'Our solution offers unique advantages over existing competitors.',
              risk_assessment: 'Low to medium risk with proper planning and execution.',
              success_metrics: 'User adoption rate, revenue growth, market penetration',
              tags: [category.toLowerCase(), 'innovation', 'technology', 'startup'],
              submission_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
              is_public: true,
              views_count: Math.floor(Math.random() * 100),
              likes_count: Math.floor(Math.random() * 50)
            });
            
            if (status === 'endorsed') {
              idea.endorsement_date = new Date(idea.submission_date.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
              await idea.save();
            }
            
            createdIdeas.push(idea);
          }
        }
      }
    }
    
    // Create some pre-incubatees for endorsed ideas
    console.log('🏗️ Creating pre-incubatees...');
    const endorsedIdeas = createdIdeas.filter(idea => idea.status === 'endorsed');
    const selectedIdeas = endorsedIdeas.slice(0, Math.min(50, endorsedIdeas.length));
    
    for (const idea of selectedIdeas) {
      const student = createdStudents.find(s => s.id === idea.student_id);
      const college = createdColleges.find(c => c.id === idea.college_id);
      
      if (student && college) {
        await PreIncubatee.create({
          idea_id: idea.id,
          student_id: student.id,
          college_id: college.id,
          incubator_id: incubator.id,
          current_phase: ['research', 'development', 'testing', 'market_validation', 'scaling'][Math.floor(Math.random() * 5)],
          progress_percentage: Math.floor(Math.random() * 100),
          phase_description: 'Currently working on core development and testing',
          milestones: ['Research Complete', 'Prototype Ready', 'Testing Phase', 'Market Validation'],
          funding_received: Math.floor(Math.random() * 100000),
          funding_required: idea.funding_required,
          start_date: idea.endorsement_date,
          expected_completion_date: new Date(idea.endorsement_date.getTime() + 180 * 24 * 60 * 60 * 1000),
          status: ['active', 'paused', 'completed'][Math.floor(Math.random() * 3)],
          notes: 'Promising project with good market potential',
          last_review_date: new Date(),
          next_review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
      }
    }
    
    // Create some mentors
    console.log('👨‍🏫 Creating mentors...');
    for (let i = 0; i < 20; i++) {
      const mentorName = `Dr. ${studentNames[i]} Mentor`;
      const mentorEmail = `mentor${i+1}@amravatiinnovationhub.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await Mentor.create({
        name: mentorName,
        email: mentorEmail,
        password_hash: hashedPassword,
        phone: `+91-98765${String(i).padStart(5, '0')}`,
        specialization: ['Technology', 'Business', 'Marketing', 'Finance', 'Operations'][Math.floor(Math.random() * 5)],
        experience_years: Math.floor(Math.random() * 20) + 5,
        availability: 'available',
        max_students: Math.floor(Math.random() * 10) + 5,
        bio: `Experienced mentor with ${Math.floor(Math.random() * 20) + 5} years in the industry`,
        college_id: createdColleges[Math.floor(Math.random() * createdColleges.length)].id,
        incubator_id: incubator.id,
        is_active: true
      });
    }
    
    // Create admin users
    console.log('👤 Creating admin users...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    // Super Admin
    await User.findOrCreate({
      where: { email: 'admin@innovationhub.com' },
      defaults: {
        name: 'Super Admin',
        email: 'admin@innovationhub.com',
        password_hash: adminPassword,
        role: 'admin',
        is_active: true,
        email_verified: true
      }
    });
    
    // Incubator Manager
    await User.findOrCreate({
      where: { email: 'manager@amravatiinnovationhub.com' },
      defaults: {
        name: 'Incubator Manager',
        email: 'manager@amravatiinnovationhub.com',
        password_hash: adminPassword,
        role: 'incubator_manager',
        incubator_id: incubator.id,
        is_active: true,
        email_verified: true
      }
    });
    
    // College Admins (one for each district)
    for (let i = 0; i < 5; i++) {
      const district = districts[i];
      const college = createdColleges[i * 10]; // First college of each district
      
      await User.findOrCreate({
        where: { email: `admin@${district.name.toLowerCase()}college1.edu` },
        defaults: {
          name: `${district.name} College Admin`,
          email: `admin@${district.name.toLowerCase()}college1.edu`,
          password_hash: adminPassword,
          role: 'college_admin',
          college_id: college.id,
          incubator_id: incubator.id,
          is_active: true,
          email_verified: true
        }
      });
    }
    
    console.log('✅ Comprehensive demo data created successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Districts: ${districts.length}`);
    console.log(`   - Colleges: ${createdColleges.length}`);
    console.log(`   - Students: ${createdStudents.length}`);
    console.log(`   - Ideas: ${createdIdeas.length}`);
    console.log(`   - Endorsed Ideas: ${endorsedIdeas.length}`);
    console.log(`   - Pre-incubatees: ${selectedIdeas.length}`);
    console.log(`   - Mentors: 20`);
    console.log(`   - Admin Users: 7`);
    
  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  }
}

createComprehensiveDemoData().then(() => process.exit(0));
