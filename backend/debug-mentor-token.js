const jwt = require('jsonwebtoken');
const { Mentor } = require('./models');

async function debugMentorToken() {
  try {
    console.log('🔍 Debugging Mentor Token...\n');
    
    // Get the test mentor
    const mentor = await Mentor.findOne({
      where: { email: 'test.mentor@example.com' },
      include: [
        {
          model: require('./models/College'),
          as: 'college',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!mentor) {
      console.log('❌ Test mentor not found');
      return;
    }
    
    console.log('✅ Test mentor found:');
    console.log(`   ID: ${mentor.id}`);
    console.log(`   Name: ${mentor.name}`);
    console.log(`   Email: ${mentor.email}`);
    console.log(`   College ID: ${mentor.college_id}`);
    console.log(`   Active: ${mentor.is_active}`);
    
    // Create a token like the login does
    const token = jwt.sign(
      {
        mentorId: mentor.id,
        role: 'mentor',
        college_id: mentor.college_id,
        incubator_id: mentor.incubator_id,
        email: mentor.email
      },
      process.env.JWT_SECRET || 'innovation_hub_jwt_secret_key_2024_default',
      { expiresIn: '24h' }
    );
    
    console.log('\n🔑 Generated token:', token.substring(0, 50) + '...');
    
    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'innovation_hub_jwt_secret_key_2024_default');
    console.log('\n📋 Decoded token:');
    console.log(`   mentorId: ${decoded.mentorId}`);
    console.log(`   role: ${decoded.role}`);
    console.log(`   college_id: ${decoded.college_id}`);
    console.log(`   incubator_id: ${decoded.incubator_id}`);
    console.log(`   email: ${decoded.email}`);
    
    // Test the authentication middleware logic
    console.log('\n🧪 Testing authentication logic...');
    if (decoded.role === 'mentor' && decoded.mentorId) {
      console.log('✅ Token has mentor role and mentorId');
      
      const foundMentor = await Mentor.findByPk(decoded.mentorId, {
        include: [
          {
            model: require('./models/College'),
            as: 'college',
            attributes: ['id', 'name']
          }
        ]
      });
      
      if (foundMentor && foundMentor.is_active) {
        console.log('✅ Mentor found and active');
        foundMentor.role = 'mentor';
        console.log(`   Final user object: { id: ${foundMentor.id}, role: ${foundMentor.role}, college_id: ${foundMentor.college_id} }`);
      } else {
        console.log('❌ Mentor not found or inactive');
      }
    } else {
      console.log('❌ Token missing mentor role or mentorId');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugMentorToken();
