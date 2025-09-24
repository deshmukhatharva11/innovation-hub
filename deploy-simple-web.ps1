# Innovation Hub - Simple Web Deployment
Write-Host "Deploying Innovation Hub to the Web..." -ForegroundColor Green

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..

Write-Host "Web deployment preparation completed!" -ForegroundColor Green
Write-Host "Your app is ready for cloud deployment!" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "Choose your platform:" -ForegroundColor Yellow
Write-Host "1. Railway (Free): railway up" -ForegroundColor Cyan
Write-Host "2. Render (Free): Connect GitHub repo" -ForegroundColor Cyan
Write-Host "3. Heroku (Paid): git push heroku main" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "See WEB_HOSTING_GUIDE.md for detailed instructions" -ForegroundColor Yellow
