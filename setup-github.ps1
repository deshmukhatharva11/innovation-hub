# GitHub Repository Setup Script
Write-Host "🚀 Setting up GitHub repository for Innovation Hub..." -ForegroundColor Green

Write-Host ""
Write-Host "📋 MANUAL STEPS REQUIRED:" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com" -ForegroundColor Cyan
Write-Host "2. Click 'New repository'" -ForegroundColor Cyan
Write-Host "3. Repository name: innovation-hub" -ForegroundColor Cyan
Write-Host "4. Description: Pre-Incubation Centre Management System" -ForegroundColor Cyan
Write-Host "5. Make it PUBLIC" -ForegroundColor Cyan
Write-Host "6. DON'T initialize with README" -ForegroundColor Cyan
Write-Host "7. Click 'Create repository'" -ForegroundColor Cyan

Write-Host ""
Write-Host "📝 After creating the repository, GitHub will show you commands." -ForegroundColor Yellow
Write-Host "Copy the repository URL and run these commands:" -ForegroundColor Yellow

Write-Host ""
Write-Host "git remote add origin https://github.com/YOUR_USERNAME/innovation-hub.git" -ForegroundColor White
Write-Host "git branch -M main" -ForegroundColor White
Write-Host "git push -u origin main" -ForegroundColor White

Write-Host ""
Write-Host "🌐 Then go to Railway and deploy from your GitHub repository!" -ForegroundColor Green
