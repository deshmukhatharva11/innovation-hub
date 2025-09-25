// Fallback database configuration for when no real database is available
const { Sequelize } = require('sequelize');

// Create a simple in-memory SQLite database as fallback
const createFallbackDatabase = () => {
  console.log('⚠️  Using fallback in-memory database for testing');
  
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });

  return sequelize;
};

module.exports = {
  createFallbackDatabase
};
