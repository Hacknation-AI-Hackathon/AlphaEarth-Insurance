#!/bin/bash

# Parametric Insurance Testing Script
echo "=================================="
echo "PARAMETRIC INSURANCE TEST SUITE"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:5001/api/parametric"

# Test 1: Get all policies
echo -e "${BLUE}1. Getting all policies...${NC}"
curl -s "$API_URL/policies" | python3 -m json.tool
echo ""
echo "=================================="
echo ""

# Test 2: Evaluate triggers for Miami Beach (demo policy)
echo -e "${BLUE}2. Evaluating triggers for Miami Beach Resort...${NC}"
echo "   Location: Miami Beach, FL (25.79°N, 80.13°W)"
echo "   This will check current wind conditions from multiple sources"
echo ""
curl -s -X POST "$API_URL/evaluate/POLICY-DEMO-001" \
  -H "Content-Type: application/json" \
  -d '{
    "eventContext": {
      "eventName": "Current Weather Check",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
    }
  }' | python3 -m json.tool
echo ""
echo "=================================="
echo ""

# Test 3: Get pending payouts
echo -e "${BLUE}3. Checking for pending payouts...${NC}"
PENDING=$(curl -s "$API_URL/payouts/pending")
echo "$PENDING" | python3 -m json.tool
PENDING_COUNT=$(echo "$PENDING" | python3 -c "import sys, json; print(json.load(sys.stdin)['count'])")
echo ""
echo -e "${YELLOW}Pending payouts: $PENDING_COUNT${NC}"
echo "=================================="
echo ""

# Test 4: Get statistics
echo -e "${BLUE}4. Getting system statistics...${NC}"
curl -s "$API_URL/statistics" | python3 -m json.tool
echo ""
echo "=================================="
echo ""

# If there are pending payouts, show approval/rejection examples
if [ "$PENDING_COUNT" -gt 0 ]; then
    echo -e "${GREEN}Found pending payouts! Here's how to approve/reject them:${NC}"
    echo ""
    echo "To APPROVE a payout:"
    echo "  curl -X POST $API_URL/payouts/PAYOUT-1/approve \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"adminEmail\": \"admin@alphaearth.com\", \"adminPassword\": \"admin123\"}'"
    echo ""
    echo "To REJECT a payout:"
    echo "  curl -X POST $API_URL/payouts/PAYOUT-1/reject \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"adminEmail\": \"admin@alphaearth.com\", \"adminPassword\": \"admin123\", \"reason\": \"Insufficient evidence\"}'"
    echo ""
else
    echo -e "${YELLOW}No pending payouts found.${NC}"
    echo "Current wind speeds are below the trigger thresholds."
    echo ""
    echo "To test the approval workflow, you would need:"
    echo "  1. A location experiencing hurricane-force winds (119+ km/h), OR"
    echo "  2. Create a policy with lower thresholds for testing"
    echo ""
fi

echo "=================================="
echo -e "${GREEN}Test suite complete!${NC}"
