Write-Host "Creating public URL for client demo..." -ForegroundColor Green

# Start ngrok
Start-Process -FilePath "ngrok" -ArgumentList "http", "3001" -WindowStyle Hidden

Write-Host "Waiting for ngrok to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

try {
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method GET
    $publicUrl = $response.tunnels[0].public_url
    
    Write-Host ""
    Write-Host "SUCCESS! Your Innovation Hub is now live!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Give this URL to your client:" -ForegroundColor Yellow
    Write-Host $publicUrl -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Client can test all features with database!" -ForegroundColor Green
} catch {
    Write-Host "Please run manually: ngrok http 3001" -ForegroundColor Red
}
