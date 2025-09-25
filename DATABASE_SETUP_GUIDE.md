# 🗄️ Database Setup Guide for Innovation Hub

## 🎯 **Step 1: Create Free PostgreSQL Database on Neon**

1. **Go to Neon**: https://neon.tech
2. **Sign up** with your GitHub account (free)
3. **Create a new project**:
   - Project name: `innovation-hub-db`
   - Database name: `innovation_hub`
   - Region: Choose closest to you
4. **Copy the connection string** (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/innovation_hub?sslmode=require
   ```

## 🔧 **Step 2: Add Database URL to Vercel**

1. **Go to your Vercel dashboard**: https://vercel.com/dashboard
2. **Select your backend project**
3. **Go to Settings → Environment Variables**
4. **Add new variable**:
   - Name: `DATABASE_URL`
   - Value: `[paste your Neon connection string here]`
   - Environment: `Production`
5. **Save** and **Redeploy** your backend

## 🚀 **Step 3: Deploy with Real Database**

After setting up the database URL, your backend will:
- ✅ Connect to real PostgreSQL database
- ✅ Create all tables automatically
- ✅ Load sample data (8 colleges, 10 users, 5 ideas, etc.)
- ✅ Work with your frontend properly

## 📊 **What You'll Get**

Your Innovation Hub will have:
- **8 Colleges** from Amravati Division
- **10 Users** (Super Admin, College Admins, Incubators, Students)
- **5 Innovative Ideas** in different stages
- **4 Events & Announcements**
- **3 Mentor Assignments**
- **Real database** that persists data

## 🔑 **Test Credentials**

Once deployed with real database:
- **Super Admin**: `admin@innovationhub.com` / `password123`
- **College Admin**: `admin@sgbau.ac.in` / `password123`
- **Student**: `rahul.kumar@student.sgbau.ac.in` / `password123`

## ⚡ **Quick Setup Commands**

After getting your database URL:

```bash
# 1. Set environment variable in Vercel dashboard
# 2. Redeploy backend
cd backend
vercel --prod

# 3. Update frontend with new backend URL
cd ../frontend
vercel --prod
```

## 🆘 **Need Help?**

If you encounter any issues:
1. Check Vercel logs: `vercel logs [your-backend-url]`
2. Verify DATABASE_URL is set correctly
3. Make sure Neon database is active
4. Check that all environment variables are deployed

---

**Your Innovation Hub will be fully functional with real data once you complete these steps!** 🎉
