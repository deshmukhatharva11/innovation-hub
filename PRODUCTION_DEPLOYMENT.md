# 🚀 Production Deployment Guide

## Overview
This guide covers the essential changes needed to deploy the Innovation Hub CMS system to production.

## 🔧 Critical Production Changes

### 1. Environment Configuration

#### Backend Environment Variables
Create a `.env` file in the backend directory with production values:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration (Use PostgreSQL for production)
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=innovation_hub_prod
DB_USER=your_db_user
DB_PASSWORD=your_secure_db_password

# JWT Configuration (Generate strong secrets)
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_for_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_very_long_and_secure_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=30d

# File Upload Configuration
UPLOAD_PATH=/var/www/innovation-hub/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_production_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_production_email@gmail.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration (Update with your production domain)
CORS_ORIGIN=https://yourdomain.com

# Security
BCRYPT_ROUNDS=12

# Production Database URL (if using connection string)
DATABASE_URL=postgresql://user:password@host:port/database
```

#### Frontend Environment Variables
Create a `.env.production` file in the frontend directory:

```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
```

### 2. Database Migration

#### Switch from SQLite to PostgreSQL
1. Install PostgreSQL on your production server
2. Create a production database
3. Update database configuration in `backend/config/database.js`

### 3. File Storage Configuration

#### Production File Storage Options

**Option A: Local File System (Simple)**
- Ensure upload directory exists: `/var/www/innovation-hub/uploads`
- Set proper permissions: `chmod 755 /var/www/innovation-hub/uploads`
- Configure web server to serve static files

**Option B: Cloud Storage (Recommended)**
- AWS S3, Google Cloud Storage, or Azure Blob Storage
- Update file upload logic to use cloud storage
- Update download endpoints to serve from cloud URLs

### 4. Security Hardening

#### Authentication & Authorization
- Re-enable authentication middleware in production
- Use strong JWT secrets (32+ characters)
- Implement proper session management
- Add rate limiting

#### File Upload Security
- Validate file types and sizes
- Scan uploaded files for malware
- Implement virus scanning
- Use secure file naming

### 5. Performance Optimization

#### Database Optimization
- Add proper indexes
- Implement connection pooling
- Use read replicas for heavy queries
- Enable query caching

#### File Serving
- Use CDN for static files
- Implement file compression
- Add caching headers
- Use efficient file streaming

### 6. Monitoring & Logging

#### Application Monitoring
- Implement health checks
- Add performance monitoring
- Set up error tracking (Sentry, etc.)
- Monitor file upload/download metrics

#### Logging
- Structured logging with Winston
- Log rotation
- Centralized logging (ELK stack)
- Security event logging

### 7. Backup & Recovery

#### Database Backups
- Automated daily backups
- Point-in-time recovery
- Test restore procedures
- Off-site backup storage

#### File Backups
- Regular file system backups
- Cloud storage versioning
- Disaster recovery plan

## 🐳 Docker Deployment (Recommended)

### Dockerfile for Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads/circulars
RUN chmod 755 uploads/circulars

EXPOSE 3001

CMD ["node", "server.js"]
```

### Dockerfile for Frontend
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: innovation_hub_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=innovation_hub_prod
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    volumes:
      - ./uploads:/app/uploads
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## 🔒 Security Checklist

- [ ] Strong JWT secrets
- [ ] HTTPS enabled
- [ ] Authentication middleware enabled
- [ ] Rate limiting configured
- [ ] File upload validation
- [ ] CORS properly configured
- [ ] Database credentials secured
- [ ] Error messages sanitized
- [ ] Logging configured
- [ ] Backup strategy implemented

## 📊 Performance Checklist

- [ ] Database indexes optimized
- [ ] Connection pooling enabled
- [ ] File serving optimized
- [ ] Caching implemented
- [ ] CDN configured
- [ ] Compression enabled
- [ ] Monitoring setup

## 🚀 Deployment Steps

1. **Prepare Environment**
   - Set up production server
   - Install dependencies (Node.js, PostgreSQL, Nginx)
   - Configure environment variables

2. **Database Setup**
   - Create production database
   - Run migrations
   - Set up backups

3. **Application Deployment**
   - Build frontend for production
   - Deploy backend application
   - Configure reverse proxy (Nginx)

4. **File Storage Setup**
   - Configure upload directories
   - Set proper permissions
   - Test file upload/download

5. **Security Configuration**
   - Enable HTTPS
   - Configure firewall
   - Set up monitoring

6. **Testing**
   - Test all functionality
   - Performance testing
   - Security testing

7. **Go Live**
   - DNS configuration
   - SSL certificate setup
   - Final testing

## 🔧 Production-Specific Code Changes

### Update API URLs in Frontend
The frontend currently uses hardcoded localhost URLs. These need to be updated for production.

### Enable Authentication
Currently disabled for development. Must be enabled in production.

### File Path Configuration
Update file paths to work with production directory structure.

### Error Handling
Implement proper error handling and logging for production.

## 📞 Support & Maintenance

- Regular security updates
- Performance monitoring
- Backup verification
- User training
- Documentation updates
