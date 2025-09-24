// MySQL Fallback Configuration
const { Sequelize } = require('sequelize');

const mysqlConfig = {
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'innovation_hub',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  },
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
};

// Create MySQL Sequelize instance
const mysqlSequelize = new Sequelize(
  mysqlConfig.database,
  mysqlConfig.username,
  mysqlConfig.password,
  mysqlConfig
);

// Test MySQL connection
const testMySQLConnection = async () => {
  try {
    await mysqlSequelize.authenticate();
    console.log('✅ MySQL connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return false;
  }
};

module.exports = {
  mysqlSequelize,
  testMySQLConnection,
  mysqlConfig
};
