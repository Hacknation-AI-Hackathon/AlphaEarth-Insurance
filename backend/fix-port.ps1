# Fix Port Conflict Script

Write-Host "Checking port usage..." -ForegroundColor Cyan

# Check port 5001
$port5001 = netstat -ano | findstr :5001
if ($port5001) {
    Write-Host "⚠️  Port 5001 is in use" -ForegroundColor Yellow
    $processId = ($port5001 -split '\s+')[-1]
    Write-Host "   Process ID: $processId" -ForegroundColor Gray
    
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "   Process Name: $($process.ProcessName)" -ForegroundColor Gray
        Write-Host "   Path: $($process.Path)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Options:" -ForegroundColor Yellow
        Write-Host "1. Kill the process (recommended if it's an old backend instance)" -ForegroundColor White
        Write-Host "2. Change backend to use port 5000 (default)" -ForegroundColor White
        Write-Host ""
        
        $choice = Read-Host "Kill process $processId? (Y/N)"
        if ($choice -eq 'Y' -or $choice -eq 'y') {
            Stop-Process -Id $processId -Force
            Write-Host "✅ Process killed" -ForegroundColor Green
        }
    }
}

# Check port 5000
$port5000 = netstat -ano | findstr :5000
if ($port5000) {
    Write-Host "⚠️  Port 5000 is also in use" -ForegroundColor Yellow
    $processId = ($port5000 -split '\s+')[-1]
    Write-Host "   Process ID: $processId" -ForegroundColor Gray
} else {
    Write-Host "✅ Port 5000 is available" -ForegroundColor Green
}

Write-Host ""
Write-Host "Checking .env file for PORT setting..." -ForegroundColor Cyan
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "PORT\s*=\s*5001") {
        Write-Host "⚠️  .env file has PORT=5001" -ForegroundColor Yellow
        Write-Host "   Recommendation: Change to PORT=5000 or remove PORT line" -ForegroundColor White
    } else {
        Write-Host "✅ .env file doesn't set PORT=5001" -ForegroundColor Green
    }
} else {
    Write-Host "ℹ️  No .env file found (using default PORT=5000)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. If you killed a process, restart the backend: npm run dev" -ForegroundColor White
Write-Host "2. If .env has PORT=5001, change it to PORT=5000 or remove it" -ForegroundColor White
Write-Host "3. Make sure no other backend instance is running" -ForegroundColor White

