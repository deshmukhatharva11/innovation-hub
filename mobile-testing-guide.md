# 📱 Mobile Testing Guide for Innovation Hub

## 🚀 Quick Start (Recommended)

### Method 1: Using the Batch File
1. Double-click `start-mobile-testing.bat`
2. Wait for both backend and ngrok to start
3. Copy the ngrok URL from the ngrok window
4. Update your frontend API URL
5. Start your React app

### Method 2: Manual Setup

#### Step 1: Start Backend
```bash
cd backend
node server.js
```

#### Step 2: Create ngrok Tunnel
```bash
ngrok http 3001
```

#### Step 3: Get Your Public URL
- Look at the ngrok terminal window
- Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

#### Step 4: Update Frontend API
Edit `frontend/src/services/api.js`:
```javascript
baseURL: 'https://your-ngrok-url.ngrok.io/api'
```

#### Step 5: Start Frontend
```bash
cd frontend
npm start
```

## 🌐 Alternative Live Server Options

### Option 1: Cloudflare Tunnel (Free & Fast)
```bash
npm install -g cloudflared
cloudflared tunnel --url http://localhost:3001
```

### Option 2: LocalTunnel (Simple)
```bash
npm install -g localtunnel
lt --port 3001
```

### Option 3: Serveo (No Installation)
```bash
ssh -R 80:localhost:3001 serveo.net
```

## 📱 Mobile Access

Once you have your public URL:
1. **Backend API**: `https://your-url.ngrok.io/api`
2. **Frontend**: `https://your-url.ngrok.io` (if serving frontend)
3. **Health Check**: `https://your-url.ngrok.io/health`

## 🔧 Testing All Features

### Registration Testing
- ✅ Student registration with college selection
- ✅ College admin registration
- ✅ Incubator manager registration

### Dashboard Testing
- ✅ Analytics dashboard
- ✅ Ideas management
- ✅ User profiles
- ✅ Notifications

### Mobile-Specific Testing
- ✅ Touch interactions
- ✅ Responsive design
- ✅ Mobile navigation
- ✅ Image uploads
- ✅ Form submissions

## 🛠️ Troubleshooting

### Common Issues:
1. **CORS Errors**: Backend already configured to allow all origins
2. **Connection Refused**: Make sure backend is running on port 3001
3. **ngrok Not Working**: Try a different tunnel service
4. **Mobile Can't Connect**: Check if both devices are on same network

### Network Requirements:
- Both computer and mobile must be on the same WiFi network
- Or use a live tunnel service (ngrok, etc.)
- Firewall should allow connections on port 3001

## 🎯 Testing Checklist

- [ ] Backend server running
- [ ] ngrok tunnel active
- [ ] Frontend API URL updated
- [ ] Mobile can access the app
- [ ] Registration works for all roles
- [ ] Dashboard loads correctly
- [ ] All features functional on mobile
