@echo off
echo 🌐 Getting your shareable Innovation Hub link...
echo.

echo Step 1: Starting backend server...
start "Backend" cmd /k "cd backend && node server.js"

echo Step 2: Starting ngrok tunnel...
start "ngrok" cmd /k "ngrok http 3001"

echo.
echo ⏳ Please wait 10 seconds for both services to start...
timeout /t 10 /nobreak > nul

echo.
echo 🔍 Checking for your ngrok URL...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:4040/api/tunnels'; $httpsTunnel = $response.tunnels | Where-Object { $_.proto -eq 'https' }; if ($httpsTunnel) { Write-Host '🌐 Your shareable ngrok URL:'; Write-Host '================================'; Write-Host ('Backend API: ' + $httpsTunnel.public_url + '/api'); Write-Host ('Health Check: ' + $httpsTunnel.public_url + '/health'); Write-Host '================================'; Write-Host '📱 Use this URL in your mobile browser!'; } else { Write-Host '❌ No HTTPS tunnel found' } } catch { Write-Host '❌ ngrok not ready yet. Please check the ngrok window for your URL.' }"

echo.
echo 📱 Mobile Testing Instructions:
echo 1. Copy the ngrok URL from above
echo 2. Update frontend/src/services/api.js with the ngrok URL
echo 3. Start your React app: cd frontend && npm start
echo 4. Access from mobile using the ngrok URL
echo.
pause
