# 📱 Simple Mobile Testing Guide

## 🚀 Quick Setup (No localhost changes needed!)

### Step 1: Get Your Shareable Link
1. **Look for the ngrok window** that should be open on your screen
2. **Copy the HTTPS URL** (looks like `https://abc123.ngrok.io`)
3. **Your shareable links are:**
   - Backend API: `https://your-ngrok-url.ngrok.io/api`
   - Health Check: `https://your-ngrok-url.ngrok.io/health`

### Step 2: Test on Mobile (Temporary)
1. **Open your phone's browser**
2. **Go to**: `https://your-ngrok-url.ngrok.io/health`
3. **You should see**: `{"status":"OK","message":"Innovation Hub API is running"}`

### Step 3: Update Frontend (Temporary)
1. **Edit** `frontend/src/services/api.js`
2. **Change line 19** from:
   ```javascript
   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
   ```
   **To:**
   ```javascript
   baseURL: process.env.REACT_APP_API_URL || 'https://your-ngrok-url.ngrok.io/api',
   ```

### Step 4: Start React App
```bash
cd frontend
npm start
```

### Step 5: Test on Mobile
- **Open your phone's browser**
- **Go to**: `http://localhost:3000` (if on same WiFi) or use ngrok for frontend too

## 🔄 Restore Localhost (When Done Testing)
1. **Change back** `frontend/src/services/api.js` line 19 to:
   ```javascript
   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
   ```

## 📱 What You Can Test
- ✅ Registration (all 3 roles)
- ✅ Login
- ✅ Dashboard
- ✅ Profile management
- ✅ Ideas submission
- ✅ Analytics
- ✅ Mobile responsiveness

## 🆘 If You Can't Find ngrok URL
1. **Look for ngrok window** on your taskbar
2. **Or run**: `ngrok http 3001` in a new terminal
3. **Copy the URL** from the ngrok output

## 💡 Pro Tip
Your localhost will continue working normally! The ngrok URL is just a public tunnel to your local server.
