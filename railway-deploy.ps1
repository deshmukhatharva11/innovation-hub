# Railway Deployment Script
Write-Host "🚀 Deploying Innovation Hub to Railway..." -ForegroundColor Green

# Create .railway directory and config
if (-not (Test-Path ".railway")) {
    New-Item -ItemType Directory -Path ".railway" -Force
}

# Create railway.json config
$railwayConfig = @{
    deploy = @{
        startCommand = "cd backend && npm install --production && node server-production.js"
        healthcheckPath = "/health"
        healthcheckTimeout = 100
        restartPolicyType = "ON_FAILURE"
        restartPolicyMaxRetries = 10
    }
    build = @{
        builder = "NIXPACKS"
        buildCommand = "cd backend && npm install --production"
    }
    environments = @{
        production = @{
            variables = @{
                NODE_ENV = "production"
                PORT = "3001"
                DB_TYPE = "postgres"
            }
        }
    }
} | ConvertTo-Json -Depth 10

$railwayConfig | Out-File -FilePath "railway.json" -Encoding UTF8

Write-Host "✅ Railway configuration created!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "🌐 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://railway.app" -ForegroundColor Cyan
Write-Host "2. Sign up/Login with GitHub" -ForegroundColor Cyan
Write-Host "3. Click 'New Project'" -ForegroundColor Cyan
Write-Host "4. Select 'Deploy from GitHub repo'" -ForegroundColor Cyan
Write-Host "5. Connect your GitHub repository" -ForegroundColor Cyan
Write-Host "6. Add PostgreSQL database" -ForegroundColor Cyan
Write-Host "7. Deploy!" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "📁 Your project is ready for Railway deployment!" -ForegroundColor Green
