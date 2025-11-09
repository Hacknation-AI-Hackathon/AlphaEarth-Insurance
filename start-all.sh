#!/bin/bash

# ===================================================================
# AlphaEarth Insurance Platform - Unified Start Script (Mac/Linux)
# ===================================================================
# This script starts all required services:
# 1. Python Backend (Earth Engine Service) - Port 5001
# 2. Node.js Backend (Risk Assessment) - Port 5000
# 3. API Gateway (Unified Endpoint) - Port 3000
# 4. Frontend (React App) - Port 8080
# ===================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================"
echo -e "   ðŸŒ AlphaEarth Insurance Platform   "
echo -e "========================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# ===================================================================
# 1. VERIFY PREREQUISITES
# ===================================================================
echo -e "${YELLOW}ðŸ" Verifying prerequisites...${NC}"
echo ""

# Check Python
if ! command_exists python3; then
    echo -e "${RED}âŒ Python 3 not found!${NC}"
    echo -e "${YELLOW}   Please install Python 3.9+ from https://www.python.org/${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}âœ… Python: $PYTHON_VERSION${NC}"

# Check Node.js
if ! command_exists node; then
    echo -e "${RED}âŒ Node.js not found!${NC}"
    echo -e "${YELLOW}   Please install Node.js 18+ from https://nodejs.org/${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}âœ… Node.js: $NODE_VERSION${NC}"

# Check npm
if ! command_exists npm; then
    echo -e "${RED}âŒ npm not found!${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}âœ… npm: v$NPM_VERSION${NC}"

echo ""

# ===================================================================
# 2. EARTH ENGINE AUTHENTICATION CHECK
# ===================================================================
echo -e "${YELLOW}ðŸ" Checking Earth Engine authentication...${NC}"

if python3 -c "import ee; ee.Initialize()" 2>/dev/null; then
    echo -e "${GREEN}âœ… Earth Engine authenticated${NC}"
else
    echo -e "${YELLOW}âš ï¸  Earth Engine not authenticated${NC}"
    echo ""
    read -p "Authenticate Earth Engine now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}Opening browser for authentication...${NC}"
        earthengine authenticate
        echo -e "${GREEN}âœ… Authentication complete!${NC}"
    else
        echo -e "${YELLOW}âš ï¸  Skipping authentication. Python backend may fail.${NC}"
    fi
fi

echo ""

# ===================================================================
# 3. INSTALL DEPENDENCIES
# ===================================================================
echo -e "${YELLOW}ðŸ"¦ Installing dependencies...${NC}"
echo ""

# Python Backend Dependencies
echo -e "${CYAN}[1/4] Python Backend...${NC}"
cd backend/python-service

if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi

echo "   Activating virtual environment..."
source venv/bin/activate

echo "   Installing Python packages..."
pip install -q -r requirements.txt

cd ../..

# Node.js Backend Dependencies
echo -e "${CYAN}[2/4] Node.js Backend...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo "   Installing Node packages..."
    npm install --silent
else
    echo -e "${GREEN}   âœ… Dependencies already installed${NC}"
fi

cd ..

# API Gateway Dependencies
echo -e "${CYAN}[3/4] API Gateway...${NC}"
if [ ! -d "api-gateway" ]; then
    echo -e "${YELLOW}   âš ï¸  API Gateway directory not found - skipping${NC}"
else
    cd api-gateway

    if [ ! -d "node_modules" ]; then
        echo "   Installing Node packages..."
        npm install --silent
    else
        echo -e "${GREEN}   âœ… Dependencies already installed${NC}"
    fi

    cd ..
fi

# Frontend Dependencies
echo -e "${CYAN}[4/4] Frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "   Installing Node packages..."
    npm install --silent
else
    echo -e "${GREEN}   âœ… Dependencies already installed${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}âœ… All dependencies installed!${NC}"
echo ""

# ===================================================================
# 4. CHECK FOR PORT CONFLICTS
# ===================================================================
echo -e "${YELLOW}ðŸ"Œ Checking ports...${NC}"

PORTS=("5001:Python Backend" "5000:Node.js Backend" "3000:API Gateway" "8080:Frontend")
CONFLICTS=()

for PORT_INFO in "${PORTS[@]}"; do
    PORT="${PORT_INFO%%:*}"
    SERVICE="${PORT_INFO#*:}"
    
    if port_in_use $PORT; then
        CONFLICTS+=("$PORT ($SERVICE)")
        echo -e "${YELLOW}   âš ï¸  Port $PORT ($SERVICE) is in use${NC}"
    fi
done

if [ ${#CONFLICTS[@]} -gt 0 ]; then
    echo ""
    read -p "Some ports are in use. Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Exiting...${NC}"
        exit 1
    fi
fi

echo ""

# ===================================================================
# 5. CREATE LOG DIRECTORY
# ===================================================================
mkdir -p logs

# ===================================================================
# 6. START ALL SERVICES
# ===================================================================
echo -e "${GREEN}ðŸš€ Starting all services...${NC}"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${RED}ðŸ›' Shutting down all services...${NC}"
    
    if [ ! -z "$PYTHON_PID" ]; then
        kill $PYTHON_PID 2>/dev/null || true
    fi
    if [ ! -z "$NODE_BACKEND_PID" ]; then
        kill $NODE_BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$GATEWAY_PID" ]; then
        kill $GATEWAY_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    echo -e "${GREEN}âœ… All services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Python Backend
echo -e "${CYAN}[1/4] Starting Python Backend (Port 5001)...${NC}"
cd backend/python-service
source venv/bin/activate
python3 earth_engine_service.py > ../../logs/python-backend.log 2>&1 &
PYTHON_PID=$!
cd ../..
echo -e "${GREEN}   âœ… Python Backend started (PID: $PYTHON_PID)${NC}"
sleep 3

# Start Node.js Backend
echo -e "${CYAN}[2/4] Starting Node.js Backend (Port 5000)...${NC}"
cd backend
npm start > ../logs/node-backend.log 2>&1 &
NODE_BACKEND_PID=$!
cd ..
echo -e "${GREEN}   âœ… Node.js Backend started (PID: $NODE_BACKEND_PID)${NC}"
sleep 3

# Start API Gateway (if exists)
if [ -d "api-gateway" ]; then
    echo -e "${CYAN}[3/4] Starting API Gateway (Port 3000)...${NC}"
    cd api-gateway
    npm start > ../logs/api-gateway.log 2>&1 &
    GATEWAY_PID=$!
    cd ..
    echo -e "${GREEN}   âœ… API Gateway started (PID: $GATEWAY_PID)${NC}"
    sleep 2
else
    echo -e "${YELLOW}[3/4] API Gateway not found - skipping${NC}"
fi

# Start Frontend
echo -e "${CYAN}[4/4] Starting Frontend (Port 8080)...${NC}"
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}   âœ… Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}========================================"
echo -e "   âœ… All Services Running!          "
echo -e "========================================${NC}"
echo ""
echo -e "${CYAN}ðŸ"— Service URLs:${NC}"
echo -e "${WHITE}   Frontend:       http://localhost:8080${NC}"
echo -e "${WHITE}   API Gateway:    http://localhost:3000${NC}"
echo -e "${WHITE}   Node Backend:   http://localhost:5000${NC}"
echo -e "${WHITE}   Python Backend: http://localhost:5001${NC}"
echo ""
echo -e "${CYAN}ðŸ"§ Process IDs:${NC}"
echo -e "${WHITE}   Python:   $PYTHON_PID${NC}"
echo -e "${WHITE}   Node:     $NODE_BACKEND_PID${NC}"
if [ ! -z "$GATEWAY_PID" ]; then
    echo -e "${WHITE}   Gateway:  $GATEWAY_PID${NC}"
fi
echo -e "${WHITE}   Frontend: $FRONTEND_PID${NC}"
echo ""
echo -e "${CYAN}ðŸ" Logs:${NC}"
echo -e "${WHITE}   logs/python-backend.log${NC}"
echo -e "${WHITE}   logs/node-backend.log${NC}"
if [ -d "api-gateway" ]; then
    echo -e "${WHITE}   logs/api-gateway.log${NC}"
fi
echo -e "${WHITE}   logs/frontend.log${NC}"
echo ""
echo -e "${YELLOW}ðŸ›' Press Ctrl+C to stop all services${NC}"
echo ""
echo -e "${CYAN}ðŸ"Š Monitoring services...${NC}"
echo ""

# Monitor processes
while true; do
    sleep 5
    
    # Check if any process has stopped
    if ! kill -0 $PYTHON_PID 2>/dev/null; then
        echo -e "${RED}âŒ Python Backend stopped${NC}"
        cleanup
    fi
    if ! kill -0 $NODE_BACKEND_PID 2>/dev/null; then
        echo -e "${RED}âŒ Node.js Backend stopped${NC}"
        cleanup
    fi
    if [ ! -z "$GATEWAY_PID" ] && ! kill -0 $GATEWAY_PID 2>/dev/null; then
        echo -e "${RED}âŒ API Gateway stopped${NC}"
        cleanup
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}âŒ Frontend stopped${NC}"
        cleanup
    fi
done