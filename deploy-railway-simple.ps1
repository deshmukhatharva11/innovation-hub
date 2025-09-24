# Railway Deployment Script
Write-Host "Deploying Innovation Hub to Railway..." -ForegroundColor Green

# Create railway.json config
$config = @"
{
  "deploy": {
    "startCommand": "cd backend && npm install --production && node server-production.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install --production"
  },
  "environments": {
    "production": {
      "variables": {
        "NODE_ENV": "production",
        "PORT": "3001",
        "DB_TYPE": "postgres"
      }
    }
  }
}
"@

$config | Out-File -FilePath "railway.json" -Encoding UTF8

Write-Host "Railway configuration created!" -ForegroundColor Green
Write-Host "Your project is ready for Railway deployment!" -ForegroundColor Green
