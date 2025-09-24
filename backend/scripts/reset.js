const { sequelize } = require('../config/database');
const { migrate } = require('./migrate');
const { seed } = require('./seed');

async function reset() {
  try {
    console.log('Starting database reset...');

    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Drop all tables and recreate them
    console.log('Dropping all tables...');
    await sequelize.drop();
    console.log('All tables dropped successfully.');

    // Run migration to recreate tables
    console.log('Running migration...');
    await migrate();

    // Run seeding to populate with sample data
    console.log('Running seeding...');
    await seed();

    console.log('Database reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  }
}

// Run reset if this file is executed directly
if (require.main === module) {
  reset();
}

module.exports = { reset };
