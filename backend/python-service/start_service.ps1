# PowerShell script to start Earth Engine Python Service

Write-Host "🚀 Starting Earth Engine Python Service..." -ForegroundColor Green

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "   Please install Python 3.8+ from https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Check if Earth Engine is authenticated
Write-Host "🔐 Checking Earth Engine authentication..." -ForegroundColor Yellow
try {
    python -c "import ee; ee.Initialize()" 2>$null
    Write-Host "✅ Earth Engine is authenticated" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Earth Engine is not authenticated" -ForegroundColor Yellow
    Write-Host "   Please run: earthengine authenticate" -ForegroundColor Yellow
    Write-Host "   Then restart this script" -ForegroundColor Yellow
    $authenticate = Read-Host "Do you want to authenticate now? (y/n)"
    if ($authenticate -eq "y" -or $authenticate -eq "Y") {
        earthengine authenticate
    }
}

# Start the service
Write-Host "🚀 Starting Earth Engine Python Service on port 5001..." -ForegroundColor Green
python earth_engine_service.py

