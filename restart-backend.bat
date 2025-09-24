@echo off
echo Restarting backend server...

echo Stopping any existing Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1

echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo Starting backend server...
cd backend
start "Backend Server" cmd /k "node server.js"

echo Backend server starting up!
echo URL: http://localhost:3001
echo Health: http://localhost:3001/health

pause
