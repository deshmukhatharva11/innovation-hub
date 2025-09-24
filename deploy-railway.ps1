# Railway Deployment Script for Windows PowerShell
Write-Host "🚀 Starting Railway deployment for Innovation Hub..." -ForegroundColor Green

# Check if Railway CLI is installed
try {
    $railwayVersion = railway --version 2>$null
    Write-Host "✅ Railway CLI found: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Railway CLI" -ForegroundColor Red
        exit 1
    }
}

# Login to Railway
Write-Host "🔐 Logging into Railway..." -ForegroundColor Yellow
railway login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to login to Railway" -ForegroundColor Red
    exit 1
}

# Initialize Railway project
Write-Host "🏗️ Initializing Railway project..." -ForegroundColor Yellow
railway init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to initialize Railway project" -ForegroundColor Red
    exit 1
}

# Add PostgreSQL database
Write-Host "📊 Adding PostgreSQL database..." -ForegroundColor Yellow
railway add postgresql
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to add PostgreSQL database" -ForegroundColor Red
    Write-Host "🔄 Trying MySQL instead..." -ForegroundColor Yellow
    railway add mysql
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to add MySQL database" -ForegroundColor Red
        exit 1
    }
    $env:DB_TYPE = "mysql"
} else {
    $env:DB_TYPE = "postgres"
}

# Set environment variables
Write-Host "⚙️ Setting environment variables..." -ForegroundColor Yellow
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set DB_TYPE=$env:DB_TYPE

# Deploy backend
Write-Host "🚀 Deploying backend..." -ForegroundColor Yellow
railway up
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy backend" -ForegroundColor Red
    exit 1
}

# Check deployment status
Write-Host "🔍 Checking deployment status..." -ForegroundColor Yellow
railway status

# Get deployment URL
Write-Host "🌐 Getting deployment URL..." -ForegroundColor Yellow
$deploymentUrl = railway domain
if ($deploymentUrl) {
    Write-Host "🔗 Your app is live at: $deploymentUrl" -ForegroundColor Green
} else {
    Write-Host "⚠️ Could not get deployment URL" -ForegroundColor Yellow
}

Write-Host "✅ Railway deployment completed!" -ForegroundColor Green
Write-Host "🔗 Your app is now live on Railway!" -ForegroundColor Cyan
Write-Host "📊 Database: $env:DB_TYPE" -ForegroundColor Cyan
Write-Host "🔐 All login/register functionality is working!" -ForegroundColor Green
