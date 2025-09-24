// Production configuration
module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    env: 'production',
    cors: {
      origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
      credentials: true
    }
  },

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'innovation_hub_prod',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    dialect: 'postgres', // Use PostgreSQL for production
    logging: false, // Disable SQL logging in production
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // File upload configuration
  upload: {
    path: process.env.UPLOAD_PATH || '/var/www/innovation-hub/uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  },

  // Email configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    from: process.env.EMAIL_FROM
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    enableAuth: true, // Always enable auth in production
    enableCORS: true,
    enableRateLimit: true
  },

  // Logging
  logging: {
    level: 'info',
    format: 'combined',
    file: {
      enabled: true,
      path: '/var/log/innovation-hub/app.log',
      maxSize: '10m',
      maxFiles: 5
    }
  },

  // Monitoring
  monitoring: {
    enableHealthCheck: true,
    enableMetrics: true,
    healthCheckPath: '/health'
  }
};
