const { Sequelize } = require('sequelize');

// Database configuration - Using PostgreSQL for Vercel compatibility
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

console.log('Database URL:', databaseUrl ? 'Set' : 'Not set');

if (!databaseUrl) {
  console.error('❌ No database URL found! Please set DATABASE_URL or POSTGRES_URL environment variable');
  console.log('💡 To fix this:');
  console.log('1. Go to https://neon.tech and create a free PostgreSQL database');
  console.log('2. Copy the connection string');
  console.log('3. Add it as DATABASE_URL in your Vercel environment variables');
  process.exit(1);
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
    name: 'query',
    backoffBase: 100,
    backoffExponent: 1.1,
    timeout: 60000,
    max: 3
  }
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
};
