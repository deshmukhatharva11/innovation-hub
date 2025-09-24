const bcrypt = require('bcryptjs');

async function testBcrypt() {
  try {
    console.log('🔧 Testing bcrypt...');

    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    
    console.log('📋 Password:', password);
    console.log('📋 Hash:', hash);
    
    const isValid = await bcrypt.compare(password, hash);
    console.log('✅ Password verification:', isValid);
    
    // Test with different salt rounds
    const hash12 = await bcrypt.hash(password, 12);
    console.log('📋 Hash (12 rounds):', hash12);
    
    const isValid12 = await bcrypt.compare(password, hash12);
    console.log('✅ Password verification (12 rounds):', isValid12);

  } catch (error) {
    console.error('❌ Error testing bcrypt:', error);
  }
}

testBcrypt()
  .then(() => {
    console.log('\n✅ Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
