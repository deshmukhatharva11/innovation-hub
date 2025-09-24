# Railway Deployment Script for Innovation Hub
Write-Host "🚂 Deploying Innovation Hub to Railway..." -ForegroundColor Cyan

# Check if Railway CLI is installed
try {
    railway --version | Out-Null
    Write-Host "✅ Railway CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
}

# Login to Railway (this will open browser)
Write-Host "🔐 Logging into Railway..." -ForegroundColor Yellow
railway login

# Initialize Railway project if not already initialized
if (-not (Test-Path ".railway")) {
    Write-Host "📁 Initializing Railway project..." -ForegroundColor Yellow
    railway init
}

# Add PostgreSQL database
Write-Host "🗄️ Adding PostgreSQL database..." -ForegroundColor Yellow
railway add postgresql

# Deploy the project
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
railway up

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Your Innovation Hub is now live on Railway!" -ForegroundColor Green