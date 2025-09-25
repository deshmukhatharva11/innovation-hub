const { Sequelize } = require('sequelize');

console.log('🔍 Debugging database connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');

if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL value:', process.env.DATABASE_URL);
  
  // Test connection
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: { rejectUnauthorized: false }
    },
    logging: console.log
  });

  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection successful!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error.message);
      console.error('Full error:', error);
      process.exit(1);
    });
} else {
  console.log('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}
