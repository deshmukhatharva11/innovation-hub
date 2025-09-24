# Backend Deployment Script
Write-Host "🚀 Deploying Innovation Hub Backend..." -ForegroundColor Green

# Option 1: Railway
Write-Host ""
Write-Host "=== OPTION 1: RAILWAY (Recommended) ===" -ForegroundColor Yellow
Write-Host "1. Go to: https://railway.app" -ForegroundColor White
Write-Host "2. Sign up/Login with GitHub" -ForegroundColor White
Write-Host "3. Click 'New Project' → 'Deploy from GitHub repo'" -ForegroundColor White
Write-Host "4. Select your 'innovation-hub' repository" -ForegroundColor White
Write-Host "5. Add PostgreSQL database" -ForegroundColor White
Write-Host "6. Set environment variables:" -ForegroundColor White
Write-Host "   - NODE_ENV=production" -ForegroundColor Cyan
Write-Host "   - PORT=3001" -ForegroundColor Cyan
Write-Host "   - DB_TYPE=postgresql" -ForegroundColor Cyan
Write-Host "   - DB_HOST=[Railway will provide]" -ForegroundColor Cyan
Write-Host "   - DB_PORT=[Railway will provide]" -ForegroundColor Cyan
Write-Host "   - DB_NAME=[Railway will provide]" -ForegroundColor Cyan
Write-Host "   - DB_USER=[Railway will provide]" -ForegroundColor Cyan
Write-Host "   - DB_PASSWORD=[Railway will provide]" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== OPTION 2: RENDER (Alternative) ===" -ForegroundColor Yellow
Write-Host "1. Go to: https://render.com" -ForegroundColor White
Write-Host "2. Sign up/Login with GitHub" -ForegroundColor White
Write-Host "3. Click 'New' → 'Web Service'" -ForegroundColor White
Write-Host "4. Connect your GitHub repository" -ForegroundColor White
Write-Host "5. Use these settings:" -ForegroundColor White
Write-Host "   - Build Command: cd backend && npm install" -ForegroundColor Cyan
Write-Host "   - Start Command: cd backend && node server-production.js" -ForegroundColor Cyan
Write-Host "   - Environment: Node" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== OPTION 3: HEROKU (Paid) ===" -ForegroundColor Yellow
Write-Host "1. Go to: https://heroku.com" -ForegroundColor White
Write-Host "2. Create new app" -ForegroundColor White
Write-Host "3. Connect GitHub repository" -ForegroundColor White
Write-Host "4. Add PostgreSQL addon" -ForegroundColor White

Write-Host ""
Write-Host "🎯 After deploying backend:" -ForegroundColor Green
Write-Host "1. Get your backend URL (e.g., https://your-backend.railway.app)" -ForegroundColor White
Write-Host "2. Update frontend API URL" -ForegroundColor White
Write-Host "3. Redeploy frontend" -ForegroundColor White

Write-Host ""
Write-Host "📋 Quick Commands:" -ForegroundColor Yellow
Write-Host "git add . && git commit -m 'Add backend deployment config' && git push" -ForegroundColor Cyan
