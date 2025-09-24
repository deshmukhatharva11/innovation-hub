# Get Public URL for Client Demo
Write-Host "Creating public tunnel for your Innovation Hub..." -ForegroundColor Green

# Start ngrok in background
Start-Process -FilePath "ngrok" -ArgumentList "http", "3001" -WindowStyle Hidden

# Wait for ngrok to start
Start-Sleep -Seconds 5

# Get the public URL
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method GET
    $publicUrl = $response.tunnels[0].public_url
    
    Write-Host ""
    Write-Host "🎉 SUCCESS! Your Innovation Hub is now live!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Give this URL to your client:" -ForegroundColor Yellow
    Write-Host "   $publicUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Client can now test:" -ForegroundColor Green
    Write-Host "   • Homepage: $publicUrl" -ForegroundColor White
    Write-Host "   • Admin Panel: $publicUrl/admin" -ForegroundColor White
    Write-Host "   • Circulars: $publicUrl/circulars" -ForegroundColor White
    Write-Host "   • Login/Register functionality" -ForegroundColor White
    Write-Host "   • CMS with database" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Note: This URL will work as long as this script is running" -ForegroundColor Yellow
    Write-Host "   To stop: Press Ctrl+C or close this window" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error getting public URL. Please try manually:" -ForegroundColor Red
    Write-Host "1. Open new terminal" -ForegroundColor White
    Write-Host "2. Run: ngrok http 3001" -ForegroundColor White
    Write-Host "3. Copy the https:// URL from the output" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
