const { sequelize } = require('../config/database');
const User = require('../models/User');

async function syncDatabase() {
  try {
    console.log('Syncing database with updated models...');
    
    // This will alter the existing table to match your model
    await User.sync({ alter: true });
    
    console.log('Database sync completed successfully!');
    console.log('New columns added to users table');
    process.exit(0);
    
  } catch (error) {
    console.error('Database sync failed:', error);
    process.exit(1);
  }
}

syncDatabase();
