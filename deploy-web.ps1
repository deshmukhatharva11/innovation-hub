# Innovation Hub - Web Deployment Script
Write-Host "🌐 Deploying Innovation Hub to the Web..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "backend" -PathType Container) -or -not (Test-Path "frontend" -PathType Container)) {
    Write-Host "❌ Backend or Frontend directory not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Install all dependencies
Write-Host "📦 Installing all dependencies..." -ForegroundColor Yellow
npm install
Set-Location backend
npm install --production
Set-Location ../frontend
npm install
Set-Location ..

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..

# Test production build
Write-Host "🧪 Testing production build..." -ForegroundColor Yellow
Set-Location backend
Start-Process -FilePath "node" -ArgumentList "server-production.js" -WindowStyle Hidden
$process = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq "" }

# Wait for server to start
Start-Sleep -Seconds 15

# Test deployment
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 10
    if ($response.status -eq "OK") {
        Write-Host "✅ Production build successful!" -ForegroundColor Green
        Write-Host "🌐 Your app is ready for web deployment!" -ForegroundColor Cyan
        Write-Host "📊 Environment: Production" -ForegroundColor Cyan
        Write-Host "🔗 Health Check: http://localhost:3001/health" -ForegroundColor Cyan
        Write-Host "🌍 Web Access: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "" -ForegroundColor White
        Write-Host "🚀 Ready for cloud deployment!" -ForegroundColor Green
        Write-Host "Choose your platform:" -ForegroundColor Yellow
        Write-Host "1. Railway (Free): railway up" -ForegroundColor Cyan
        Write-Host "2. Render (Free): Connect GitHub repo" -ForegroundColor Cyan
        Write-Host "3. Heroku (Paid): git push heroku main" -ForegroundColor Cyan
        Write-Host "" -ForegroundColor White
        Write-Host "📖 See WEB_HOSTING_GUIDE.md for detailed instructions" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Production build test failed" -ForegroundColor Red
}

# Stop test server
if ($process) {
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
}

Set-Location ..
Write-Host "✅ Web deployment preparation completed!" -ForegroundColor Green
