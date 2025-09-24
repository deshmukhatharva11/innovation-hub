// Universal Database Configuration - Works with PostgreSQL and MySQL
const { Sequelize } = require('sequelize');

// Detect database type from environment
const getDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    // Parse DATABASE_URL (Railway/Render style)
    if (databaseUrl.includes('postgres://') || databaseUrl.includes('postgresql://')) {
      return {
        dialect: 'postgres',
        url: databaseUrl,
        dialectOptions: {
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        }
      };
    } else if (databaseUrl.includes('mysql://')) {
      return {
        dialect: 'mysql',
        url: databaseUrl,
        dialectOptions: {
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        }
      };
    }
  }
  
  // Fallback to individual environment variables
  const config = {
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
    }
  };
  
  // Determine dialect
  if (process.env.DB_TYPE === 'postgres' || process.env.DB_HOST?.includes('postgres')) {
    config.dialect = 'postgres';
    config.port = process.env.DB_PORT || 5432;
  } else {
    config.dialect = 'mysql';
    config.port = process.env.DB_PORT || 3306;
  }
  
  return config;
};

// Create Sequelize instance
const config = getDatabaseConfig();
const sequelize = new Sequelize(config.url || config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  dialectOptions: config.dialectOptions,
  logging: config.logging,
  pool: config.pool,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
});

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connection established successfully with ${config.dialect}`);
    return true;
  } catch (error) {
    console.error(`❌ Database connection failed with ${config.dialect}:`, error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  config
};
