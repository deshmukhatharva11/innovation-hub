const { User, Mentor, College } = require('./backend/models');
const bcrypt = require('bcrypt');

async function createMentorUsers() {
  try {
    console.log('🔄 Creating user accounts for mentors...');

    // Get all active mentors
    const mentors = await Mentor.findAll({
      where: { is_active: true },
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log(`📊 Found ${mentors.length} mentors to process`);

    let created = 0;
    let skipped = 0;

    for (const mentor of mentors) {
      try {
        // Check if user already exists with this email
        const existingUser = await User.findOne({
          where: { email: mentor.email }
        });

        if (existingUser) {
          console.log(`⏭️  User already exists for mentor: ${mentor.name} (${mentor.email})`);
          skipped++;
          continue;
        }

        // Create user account for mentor
        const hashedPassword = await bcrypt.hash('mentor123', 10); // Default password

        const user = await User.create({
          name: mentor.name,
          email: mentor.email,
          password_hash: hashedPassword,
          role: 'mentor',
          college_id: mentor.college_id,
          incubator_id: mentor.incubator_id,
          phone: mentor.phone,
          bio: mentor.bio,
          linkedin_url: mentor.linkedin_url,
          github_url: mentor.website_url,
          is_active: true,
          email_verified: true
        });

        console.log(`✅ Created user account for mentor: ${mentor.name} (${mentor.email})`);
        created++;

      } catch (error) {
        console.error(`❌ Error creating user for mentor ${mentor.name}:`, error.message);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`✅ Created: ${created} user accounts`);
    console.log(`⏭️  Skipped: ${skipped} (already existed)`);
    console.log(`📊 Total processed: ${mentors.length}`);

    console.log('\n🔑 Default password for all mentor accounts: mentor123');
    console.log('📧 Mentors can login with their email and this password');

  } catch (error) {
    console.error('❌ Error creating mentor users:', error);
  }
}

// Run the script
createMentorUsers()
  .then(() => {
    console.log('\n🎉 Mentor user creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
