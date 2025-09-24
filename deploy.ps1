# Innovation Hub Deployment Script for Windows PowerShell
Write-Host "🚀 Starting Innovation Hub Deployment..." -ForegroundColor Green

# Function to deploy with PostgreSQL
function Deploy-With-PostgreSQL {
    Write-Host "📊 Attempting deployment with PostgreSQL..." -ForegroundColor Yellow
    
    # Set PostgreSQL environment variables
    $env:DB_TYPE = "postgres"
    $env:DB_PORT = "5432"
    
    # Deploy backend
    Write-Host "🔧 Deploying backend with PostgreSQL..." -ForegroundColor Yellow
    Set-Location backend
    npm install --production
    if (Test-Path "package.json" -PathType Leaf) {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts.build) {
            npm run build
        }
    }
    
    # Start server
    Write-Host "🌐 Starting server with PostgreSQL..." -ForegroundColor Yellow
    Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden
    $backendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq "" }
    
    # Wait and test
    Start-Sleep -Seconds 10
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
        if ($response.status -eq "healthy") {
            Write-Host "✅ PostgreSQL deployment successful!" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ PostgreSQL deployment failed" -ForegroundColor Red
        if ($backendProcess) {
            Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        }
        return $false
    }
}

# Function to deploy with MySQL
function Deploy-With-MySQL {
    Write-Host "📊 Attempting deployment with MySQL..." -ForegroundColor Yellow
    
    # Set MySQL environment variables
    $env:DB_TYPE = "mysql"
    $env:DB_PORT = "3306"
    
    # Deploy backend
    Write-Host "🔧 Deploying backend with MySQL..." -ForegroundColor Yellow
    Set-Location backend
    npm install --production
    if (Test-Path "package.json" -PathType Leaf) {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts.build) {
            npm run build
        }
    }
    
    # Start server
    Write-Host "🌐 Starting server with MySQL..." -ForegroundColor Yellow
    Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden
    $backendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq "" }
    
    # Wait and test
    Start-Sleep -Seconds 10
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
        if ($response.status -eq "healthy") {
            Write-Host "✅ MySQL deployment successful!" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ MySQL deployment failed" -ForegroundColor Red
        if ($backendProcess) {
            Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        }
        return $false
    }
}

# Main deployment logic
Write-Host "🎯 Starting deployment process..." -ForegroundColor Cyan

# Try PostgreSQL first
if (Deploy-With-PostgreSQL) {
    Write-Host "🎉 Deployment completed successfully with PostgreSQL!" -ForegroundColor Green
    Write-Host "🌐 Application is running at: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "📊 Database: PostgreSQL" -ForegroundColor Cyan
} else {
    Write-Host "🔄 PostgreSQL failed, trying MySQL..." -ForegroundColor Yellow
    
    # Try MySQL as fallback
    if (Deploy-With-MySQL) {
        Write-Host "🎉 Deployment completed successfully with MySQL!" -ForegroundColor Green
        Write-Host "🌐 Application is running at: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "📊 Database: MySQL" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Both PostgreSQL and MySQL deployments failed" -ForegroundColor Red
        Write-Host "🔍 Please check your database configuration" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Deployment process completed!" -ForegroundColor Green
Write-Host "🔗 Health check: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host "📱 API endpoints: http://localhost:3001/api" -ForegroundColor Cyan
