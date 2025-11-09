# ===================================================================
# AlphaEarth Insurance Platform - Unified Start Script (Windows)
# ===================================================================
# This script starts all required services:
# 1. Python Backend (Earth Engine Service) - Port 5001
# 2. Node.js Backend (Risk Assessment) - Port 5000
# 3. API Gateway (Unified Endpoint) - Port 3000
# 4. Frontend (React App) - Port 8080
# ===================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ðŸŒ AlphaEarth Insurance Platform   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    } catch {
        return $false
    }
}

# Function to check if port is in use
function Test-Port {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# ===================================================================
# 1. VERIFY PREREQUISITES
# ===================================================================
Write-Host "ðŸ" Verifying prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Python
if (-not (Test-Command python)) {
    Write-Host "âŒ Python not found!" -ForegroundColor Red
    Write-Host "   Please install Python 3.9+ from https://www.python.org/" -ForegroundColor Yellow
    exit 1
}
$pythonVersion = python --version
Write-Host "âœ… Python: $pythonVersion" -ForegroundColor Green

# Check Node.js
if (-not (Test-Command node)) {
    Write-Host "âŒ Node.js not found!" -ForegroundColor Red
    Write-Host "   Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
$nodeVersion = node --version
Write-Host "âœ… Node.js: $nodeVersion" -ForegroundColor Green

# Check npm
if (-not (Test-Command npm)) {
    Write-Host "âŒ npm not found!" -ForegroundColor Red
    exit 1
}
$npmVersion = npm --version
Write-Host "âœ… npm: $npmVersion" -ForegroundColor Green

Write-Host ""

# ===================================================================
# 2. EARTH ENGINE AUTHENTICATION CHECK
# ===================================================================
Write-Host "ðŸ" Checking Earth Engine authentication..." -ForegroundColor Yellow

try {
    python -c "import ee; ee.Initialize()" 2>$null
    Write-Host "âœ… Earth Engine authenticated" -ForegroundColor Green
} catch {
    Write-Host "âš ï¸  Earth Engine not authenticated" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Authenticate Earth Engine now? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Opening browser for authentication..." -ForegroundColor Cyan
        earthengine authenticate
        Write-Host "âœ… Authentication complete!" -ForegroundColor Green
    } else {
        Write-Host "âš ï¸  Skipping authentication. Python backend may fail." -ForegroundColor Yellow
    }
}

Write-Host ""

# ===================================================================
# 3. INSTALL DEPENDENCIES
# ===================================================================
Write-Host "ðŸ"¦ Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Python Backend Dependencies
Write-Host "[1/4] Python Backend..." -ForegroundColor Cyan
Set-Location backend/python-service

if (-not (Test-Path "venv")) {
    Write-Host "   Creating virtual environment..." -ForegroundColor Gray
    python -m venv venv
}

Write-Host "   Activating virtual environment..." -ForegroundColor Gray
& "venv\Scripts\Activate.ps1"

Write-Host "   Installing Python packages..." -ForegroundColor Gray
pip install -q -r requirements.txt

Set-Location ../..

# Node.js Backend Dependencies
Write-Host "[2/4] Node.js Backend..." -ForegroundColor Cyan
Set-Location backend

if (-not (Test-Path "node_modules")) {
    Write-Host "   Installing Node packages..." -ForegroundColor Gray
    npm install --silent
} else {
    Write-Host "   âœ… Dependencies already installed" -ForegroundColor Green
}

Set-Location ..

# API Gateway Dependencies
Write-Host "[3/4] API Gateway..." -ForegroundColor Cyan
if (-not (Test-Path "api-gateway")) {
    Write-Host "   âš ï¸  API Gateway directory not found - skipping" -ForegroundColor Yellow
} else {
    Set-Location api-gateway

    if (-not (Test-Path "node_modules")) {
        Write-Host "   Installing Node packages..." -ForegroundColor Gray
        npm install --silent
    } else {
        Write-Host "   âœ… Dependencies already installed" -ForegroundColor Green
    }

    Set-Location ..
}

# Frontend Dependencies
Write-Host "[4/4] Frontend..." -ForegroundColor Cyan
Set-Location frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "   Installing Node packages..." -ForegroundColor Gray
    npm install --silent
} else {
    Write-Host "   âœ… Dependencies already installed" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "âœ… All dependencies installed!" -ForegroundColor Green
Write-Host ""

# ===================================================================
# 4. CHECK FOR PORT CONFLICTS
# ===================================================================
Write-Host "ðŸ"Œ Checking ports..." -ForegroundColor Yellow

$ports = @{
    "5001" = "Python Backend"
    "5000" = "Node.js Backend"
    "3000" = "API Gateway"
    "8080" = "Frontend"
}

$conflicts = @()
foreach ($port in $ports.Keys) {
    if (Test-Port $port) {
        $conflicts += $port
        Write-Host "   âš ï¸  Port $port ($($ports[$port])) is in use" -ForegroundColor Yellow
    }
}

if ($conflicts.Count -gt 0) {
    Write-Host ""
    $response = Read-Host "Some ports are in use. Continue anyway? (y/n)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Exiting..." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# ===================================================================
# 5. START ALL SERVICES
# ===================================================================
Write-Host "ðŸš€ Starting all services..." -ForegroundColor Green
Write-Host ""

# Start Python Backend
Write-Host "[1/4] Starting Python Backend (Port 5001)..." -ForegroundColor Cyan
$pythonJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend/python-service
    & "venv\Scripts\Activate.ps1"
    python earth_engine_service.py
}
Write-Host "   âœ… Python Backend started (Job ID: $($pythonJob.Id))" -ForegroundColor Green
Start-Sleep -Seconds 3

# Start Node.js Backend
Write-Host "[2/4] Starting Node.js Backend (Port 5000)..." -ForegroundColor Cyan
$nodeBackendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend
    npm start
}
Write-Host "   âœ… Node.js Backend started (Job ID: $($nodeBackendJob.Id))" -ForegroundColor Green
Start-Sleep -Seconds 3

# Start API Gateway (if exists)
if (Test-Path "api-gateway") {
    Write-Host "[3/4] Starting API Gateway (Port 3000)..." -ForegroundColor Cyan
    $gatewayJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        Set-Location api-gateway
        npm start
    }
    Write-Host "   âœ… API Gateway started (Job ID: $($gatewayJob.Id))" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "[3/4] API Gateway not found - skipping" -ForegroundColor Yellow
}

# Start Frontend
Write-Host "[4/4] Starting Frontend (Port 8080)..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location frontend
    npm run dev
}
Write-Host "   âœ… Frontend started (Job ID: $($frontendJob.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   âœ… All Services Running!          " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "ðŸ"— Service URLs:" -ForegroundColor Cyan
Write-Host "   Frontend:       http://localhost:8080" -ForegroundColor White
Write-Host "   API Gateway:    http://localhost:3000" -ForegroundColor White
Write-Host "   Node Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "   Python Backend: http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "ðŸ"§ Job IDs:" -ForegroundColor Cyan
Write-Host "   Python:  $($pythonJob.Id)" -ForegroundColor White
Write-Host "   Node:    $($nodeBackendJob.Id)" -ForegroundColor White
if (Test-Path "api-gateway") {
    Write-Host "   Gateway: $($gatewayJob.Id)" -ForegroundColor White
}
Write-Host "   Frontend: $($frontendJob.Id)" -ForegroundColor White
Write-Host ""
Write-Host "ðŸ›' To stop all services, run:" -ForegroundColor Yellow
Write-Host "   Get-Job | Stop-Job" -ForegroundColor White
Write-Host "   Get-Job | Remove-Job" -ForegroundColor White
Write-Host ""
Write-Host "ðŸ" To view logs:" -ForegroundColor Yellow
Write-Host "   Receive-Job -Id <JOB_ID> -Keep" -ForegroundColor White
Write-Host ""

# Keep script running and monitor jobs
Write-Host "ðŸ"Š Monitoring services (Press Ctrl+C to stop all)..." -ForegroundColor Cyan
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        $jobs = Get-Job
        $runningCount = ($jobs | Where-Object { $_.State -eq 'Running' }).Count
        
        if ($runningCount -eq 0) {
            Write-Host "âš ï¸  All services have stopped" -ForegroundColor Yellow
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "ðŸ›' Shutting down all services..." -ForegroundColor Red
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Write-Host "âœ… All services stopped" -ForegroundColor Green
}