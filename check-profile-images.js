const { User } = require('./backend/models');

async function checkProfileImages() {
  try {
    console.log('🔍 Checking profile images in database...');
    
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'profile_image_url', 'college_id'],
      include: [
        {
          model: require('./backend/models').College,
          as: 'college',
          attributes: ['id', 'name']
        }
      ]
    });
    
    console.log(`\n📊 Found ${users.length} users:`);
    
    users.forEach(user => {
      console.log(`\n👤 User: ${user.name} (ID: ${user.id})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Profile Image: ${user.profile_image_url || 'None'}`);
      console.log(`   College ID: ${user.college_id}`);
      console.log(`   College Name: ${user.college?.name || 'Not found'}`);
    });
    
    // Check for users with profile images
    const usersWithImages = users.filter(user => user.profile_image_url);
    console.log(`\n🖼️  Users with profile images: ${usersWithImages.length}`);
    
    usersWithImages.forEach(user => {
      console.log(`   - ${user.name}: ${user.profile_image_url}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking profile images:', error);
  } finally {
    process.exit(0);
  }
}

checkProfileImages();
