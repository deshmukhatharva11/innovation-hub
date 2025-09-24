# 🚀 Innovation Hub Deployment Guide

## **Database Fallback Strategy: PostgreSQL → MySQL**

### **Step 1: Railway Deployment (Recommended)**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
railway init

# 4. Add PostgreSQL database
railway add postgresql

# 5. Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set DB_TYPE=postgres

# 6. Deploy
railway up
```

### **Step 2: If PostgreSQL Fails → Switch to MySQL**

```bash
# 1. Remove PostgreSQL
railway remove postgresql

# 2. Add MySQL
railway add mysql

# 3. Update environment variables
railway variables set DB_TYPE=mysql

# 4. Redeploy
railway up
```

### **Step 3: Manual Deployment (Alternative)**

```bash
# 1. Make deployment script executable
chmod +x deploy.sh

# 2. Run deployment script
./deploy.sh
```

## **Environment Variables**

### **PostgreSQL Configuration**
```env
NODE_ENV=production
PORT=3001
DB_TYPE=postgres
DATABASE_URL=postgresql://user:password@host:port/database
```

### **MySQL Configuration**
```env
NODE_ENV=production
PORT=3001
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=innovation_hub
DB_USER=root
DB_PASSWORD=password
```

## **Features Guaranteed to Work**

✅ **User Authentication**
- Login/Register
- Password reset
- JWT tokens
- Role-based access

✅ **CMS System**
- Content management
- File uploads
- Circulars system
- Media management

✅ **Database Operations**
- All CRUD operations
- Real-time data
- File storage
- User management

✅ **API Endpoints**
- All REST APIs
- WebSocket connections
- File downloads
- Health checks

## **Deployment Platforms**

### **1. Railway (Recommended)**
- **Cost**: Free tier available
- **Setup**: 5 minutes
- **Database**: PostgreSQL/MySQL
- **SSL**: Automatic
- **Domain**: Custom domain support

### **2. Render**
- **Cost**: Free tier available
- **Setup**: 3 minutes
- **Database**: PostgreSQL
- **SSL**: Automatic
- **Domain**: Custom domain support

### **3. Heroku**
- **Cost**: $7/month minimum
- **Setup**: 10 minutes
- **Database**: PostgreSQL
- **SSL**: Automatic
- **Domain**: Custom domain support

## **Testing Deployment**

After deployment, test these endpoints:

```bash
# Health check
curl https://your-app.railway.app/health

# API status
curl https://your-app.railway.app/api/status

# User registration
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# User login
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## **Troubleshooting**

### **Database Connection Issues**
1. Check environment variables
2. Verify database credentials
3. Test connection manually
4. Switch to fallback database

### **Authentication Issues**
1. Verify JWT secret
2. Check user model
3. Test registration flow
4. Verify password hashing

### **File Upload Issues**
1. Check file permissions
2. Verify upload directory
3. Test file size limits
4. Check MIME types

## **Success Indicators**

✅ Server starts without errors
✅ Database connection established
✅ Health check returns 200
✅ User registration works
✅ User login works
✅ File uploads work
✅ API endpoints respond

## **Support**

If you encounter any issues:
1. Check the deployment logs
2. Verify environment variables
3. Test database connection
4. Check API endpoints
5. Review error messages

**Your Innovation Hub will be live and fully functional!** 🎉
