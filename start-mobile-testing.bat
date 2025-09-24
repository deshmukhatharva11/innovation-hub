@echo off
echo 🚀 Starting Innovation Hub for Mobile Testing...
echo.

echo 📱 Step 1: Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node server.js"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 🌐 Step 2: Starting ngrok tunnel...
start "ngrok Tunnel" cmd /k "ngrok http 3001"

echo.
echo ✅ Setup Complete!
echo.
echo 📱 Mobile Testing Instructions:
echo 1. Check the ngrok window for your public URL (e.g., https://abc123.ngrok.io)
echo 2. Update frontend/src/services/api.js with the ngrok URL
echo 3. Start your React app: cd frontend && npm start
echo 4. Access from mobile: http://your-ngrok-url.ngrok.io
echo.
echo 🔗 Example API URL: https://abc123.ngrok.io/api
echo.
pause
