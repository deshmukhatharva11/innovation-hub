const { Sequelize } = require('sequelize');

// Test database connection
const testConnection = async () => {
  try {
    console.log('🔍 Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');
    
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL not found');
      return false;
    }

    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      },
      logging: console.log
    });

    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await sequelize.query('SELECT NOW() as current_time');
    console.log('✅ Database query successful:', result[0][0]);
    
    await sequelize.close();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
