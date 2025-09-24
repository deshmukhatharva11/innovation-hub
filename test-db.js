const { sequelize } = require('./config/database');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    console.log('Testing database sync...');
    await sequelize.sync({ alter: false });
    console.log('✅ Database sync successful!');
    
    console.log('Database is ready!');
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

testDatabase().then(() => {
  process.exit(0);
}).catch(() => {
  process.exit(1);
});
