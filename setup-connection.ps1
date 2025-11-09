# AlphaEarth Frontend-Backend Connection Setup & Test Script

$frontendPath = "Frontend"
$backendPath = "backend"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "AlphaEarth Connection Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if we're in the right directory
Write-Host "[Step 1] Checking directory structure..." -ForegroundColor Yellow
if (!(Test-Path $frontendPath) -or !(Test-Path $backendPath)) {
    Write-Host "ERROR: Please run this script from the AlphaEarth-Insurance root directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Found frontend and backend directories" -ForegroundColor Green

# Step 2: Fix Frontend .env file
Write-Host "`n[Step 2] Fixing Frontend configuration..." -ForegroundColor Yellow
$envPath = "$frontendPath\.env"

if (Test-Path $envPath) {
    $currentEnv = Get-Content $envPath -Raw
    Write-Host "Current .env content:" -ForegroundColor Gray
    Write-Host $currentEnv -ForegroundColor Gray
    
    if ($currentEnv -match "VITE_API_URL=http://localhost:3000/api") {
        Write-Host "[FIXING] Updating incorrect API URL..." -ForegroundColor Yellow
        Set-Content $envPath "VITE_API_URL=/api"
        Write-Host "[OK] Fixed .env file!" -ForegroundColor Green
    } elseif ($currentEnv -match "VITE_API_URL=/api") {
        Write-Host "[OK] .env file already correct!" -ForegroundColor Green
    } else {
        Write-Host "[FIXING] Setting correct API URL..." -ForegroundColor Yellow
        Set-Content $envPath "VITE_API_URL=/api"
        Write-Host "[OK] Fixed .env file!" -ForegroundColor Green
    }
} else {
    Write-Host "[CREATING] Creating .env file..." -ForegroundColor Yellow
    Set-Content $envPath "VITE_API_URL=/api"
    Write-Host "[OK] Created .env file!" -ForegroundColor Green
}

# Step 3: Verify Backend configuration
Write-Host "`n[Step 3] Verifying Backend configuration..." -ForegroundColor Yellow
$backendEnvPath = "$backendPath\.env"

if (Test-Path $backendEnvPath) {
    $backendEnv = Get-Content $backendEnvPath -Raw
    
    if ($backendEnv -match "PORT=5000") {
        Write-Host "[OK] Backend port is correct (5000)" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Backend PORT not set to 5000. Please check $backendEnvPath" -ForegroundColor Yellow
    }
    
    if ($backendEnv -match "CORS_ORIGIN=http://localhost:8080") {
        Write-Host "[OK] CORS origin is correct (http://localhost:8080)" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] CORS_ORIGIN not set to http://localhost:8080. Please check $backendEnvPath" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] Backend .env file not found!" -ForegroundColor Red
    Write-Host "Please create $backendEnvPath with required configuration" -ForegroundColor Red
}

# Step 4: Check if backend is running
Write-Host "`n[Step 4] Checking if backend is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "[OK] Backend is running!" -ForegroundColor Green
    Write-Host "    Status: $($healthCheck.status)" -ForegroundColor Gray
    Write-Host "    Service: $($healthCheck.service)" -ForegroundColor Gray
    $backendRunning = $true
} catch {
    Write-Host "[WARNING] Backend is not running on port 5000" -ForegroundColor Yellow
    Write-Host "    Please start it with: cd backend && npm run dev" -ForegroundColor Yellow
    $backendRunning = $false
}

# Step 5: Check if frontend is running
Write-Host "`n[Step 5] Checking if frontend is running..." -ForegroundColor Yellow
try {
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:8080" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "[OK] Frontend is running!" -ForegroundColor Green
    $frontendRunning = $true
} catch {
    Write-Host "[WARNING] Frontend is not running on port 8080" -ForegroundColor Yellow
    Write-Host "    Please start it with: cd Frontend && npm run dev" -ForegroundColor Yellow
    $frontendRunning = $false
}

# Step 6: Test connection if both are running
if ($backendRunning -and $frontendRunning) {
    Write-Host "`n[Step 6] Testing API endpoints through proxy..." -ForegroundColor Yellow
    
    $endpoints = @(
        @{ Name = "Health Check"; Url = "http://localhost:8080/api/health" },
        @{ Name = "Disasters"; Url = "http://localhost:8080/api/disasters/active" },
        @{ Name = "Properties"; Url = "http://localhost:8080/api/properties/portfolio" },
        @{ Name = "Earthquakes"; Url = "http://localhost:8080/api/earthquakes/active" }
    )
    
    $passedTests = 0
    $totalTests = $endpoints.Count
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-RestMethod -Uri $endpoint.Url -Method GET -TimeoutSec 5 -ErrorAction Stop
            Write-Host "  [OK] $($endpoint.Name)" -ForegroundColor Green
            $passedTests++
        } catch {
            Write-Host "  [FAIL] $($endpoint.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n  Tests passed: $passedTests / $totalTests" -ForegroundColor Gray
    
    if ($passedTests -eq $totalTests) {
        Write-Host "`n[SUCCESS] All tests passed! Frontend and Backend are connected!" -ForegroundColor Green
    } else {
        Write-Host "`n[WARNING] Some tests failed. Check the errors above." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n[Step 6] Skipping connection tests (servers not running)" -ForegroundColor Yellow
}

# Final Summary
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "SETUP SUMMARY" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`nConfiguration Status:" -ForegroundColor White
Write-Host "  Frontend .env: " -NoNewline
if (Test-Path $envPath) {
    $env = Get-Content $envPath -Raw
    if ($env -match "VITE_API_URL=/api") {
        Write-Host "[OK]" -ForegroundColor Green
    } else {
        Write-Host "[NEEDS FIX]" -ForegroundColor Yellow
    }
} else {
    Write-Host "[MISSING]" -ForegroundColor Red
}

Write-Host "  Backend .env: " -NoNewline
if (Test-Path $backendEnvPath) {
    Write-Host "[OK]" -ForegroundColor Green
} else {
    Write-Host "[MISSING]" -ForegroundColor Red
}

Write-Host "`nServer Status:" -ForegroundColor White
Write-Host "  Backend (port 5000): " -NoNewline
if ($backendRunning) {
    Write-Host "[RUNNING]" -ForegroundColor Green
} else {
    Write-Host "[NOT RUNNING]" -ForegroundColor Red
}

Write-Host "  Frontend (port 8080): " -NoNewline
if ($frontendRunning) {
    Write-Host "[RUNNING]" -ForegroundColor Green
} else {
    Write-Host "[NOT RUNNING]" -ForegroundColor Red
}

# Next Steps
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

if (!$backendRunning) {
    Write-Host "`n1. Start the backend:" -ForegroundColor Yellow
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
}

if (!$frontendRunning) {
    Write-Host "`n2. Start the frontend:" -ForegroundColor Yellow
    Write-Host "   cd Frontend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
}

if ($backendRunning -and $frontendRunning) {
    Write-Host "`n[SUCCESS] Everything is set up and running!" -ForegroundColor Green
    Write-Host "`nOpen your browser to: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "`nTry these pages:" -ForegroundColor White
    Write-Host "  - Dashboard: http://localhost:8080/dashboard" -ForegroundColor Gray
    Write-Host "  - Damage Claims: http://localhost:8080/dashboard/damage-claims" -ForegroundColor Gray
    Write-Host "  - Risk Scoring: http://localhost:8080/dashboard/risk-scoring" -ForegroundColor Gray
    Write-Host "  - Flight Delays: http://localhost:8080/dashboard/flight-delays" -ForegroundColor Gray
    Write-Host "  - Parametric: http://localhost:8080/dashboard/parametric" -ForegroundColor Gray
} else {
    Write-Host "`n3. After starting both servers, run this script again to test connection" -ForegroundColor Yellow
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Script completed at $(Get-Date)" -ForegroundColor Gray
Write-Host "=====================================" -ForegroundColor Cyan