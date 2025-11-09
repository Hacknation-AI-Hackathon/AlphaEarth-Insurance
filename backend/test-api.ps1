# AlphaEarth Backend API Test Script - EXTENDED VERSION
# Tests all endpoints including detailed resource endpoints

$baseUrl = "http://localhost:5000"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "test-results-extended-$timestamp.csv"
$detailsFile = "test-details-extended-$timestamp.txt"

# Color codes
$successColor = "Green"
$failColor = "Red"
$infoColor = "Cyan"
$warningColor = "Yellow"

# Test results collection - Use ArrayList instead of array
$results = [System.Collections.ArrayList]@()
$totalTests = 0
$passedTests = 0
$failedTests = 0

# Store created resource IDs for testing
$createdPolicyId = $null
$createdFlightPolicyId = $null
$createdPayoutId = $null
$createdFlightPayoutId = $null

# Function to log test result
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [object]$Body = $null,
        [int]$ExpectedStatus = 200,
        [bool]$SkipTest = $false
    )
    
    $script:totalTests++
    $testNum = $script:totalTests
    
    Write-Host "`n[$testNum] Testing: $Description" -ForegroundColor $infoColor
    Write-Host "    $Method $Endpoint" -ForegroundColor Gray
    
    if ($SkipTest) {
        Write-Host "    [!] SKIPPED" -ForegroundColor $warningColor
        $null = $script:results.Add([PSCustomObject]@{
            Test = $testNum
            Method = $Method
            Endpoint = $Endpoint
            Description = $Description
            Status = "SKIPPED"
            StatusCode = "N/A"
            ResponseTime = "N/A"
            Error = "Test skipped"
        })
        return $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $uri = "$baseUrl$Endpoint"
        $params = @{
            Uri = $uri
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
            TimeoutSec = 30
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            Write-Host "    Body: $($params.Body)" -ForegroundColor Gray
        }
        
        $response = Invoke-WebRequest @params
        $stopwatch.Stop()
        $responseTime = $stopwatch.ElapsedMilliseconds
        
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "    [PASS] Status: $statusCode, Time: ${responseTime}ms" -ForegroundColor $successColor
            $script:passedTests++
            
            # Try to parse and display response
            $content = $null
            try {
                $content = $response.Content | ConvertFrom-Json
                if ($content.count -or $content.data) {
                    $count = if ($content.count) { $content.count } else { $content.data.count }
                    Write-Host "    [INFO] Response: $count items returned" -ForegroundColor Gray
                }
            } catch {
                # Non-JSON response or parsing error
            }
            
            $null = $script:results.Add([PSCustomObject]@{
                Test = $testNum
                Method = $Method
                Endpoint = $Endpoint
                Description = $Description
                Status = "PASS"
                StatusCode = $statusCode
                ResponseTime = "${responseTime}ms"
                Error = ""
            })
            
            return $content
        } else {
            Write-Host "    [FAIL] Expected: $ExpectedStatus, Got: $statusCode" -ForegroundColor $failColor
            $script:failedTests++
            $null = $script:results.Add([PSCustomObject]@{
                Test = $testNum
                Method = $Method
                Endpoint = $Endpoint
                Description = $Description
                Status = "FAIL"
                StatusCode = $statusCode
                ResponseTime = "${responseTime}ms"
                Error = "Status code mismatch"
            })
            return $null
        }
        
    } catch {
        $stopwatch.Stop()
        $responseTime = $stopwatch.ElapsedMilliseconds
        $errorMsg = $_.Exception.Message
        
        Write-Host "    [FAIL] Error: $errorMsg" -ForegroundColor $failColor
        $script:failedTests++
        
        # Try to get status code from error
        $statusCode = "Error"
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        
        $null = $script:results.Add([PSCustomObject]@{
            Test = $testNum
            Method = $Method
            Endpoint = $Endpoint
            Description = $Description
            Status = "FAIL"
            StatusCode = $statusCode
            ResponseTime = "${responseTime}ms"
            Error = $errorMsg
        })
        
        return $null
    }
}

# Start testing
Write-Host "=====================================" -ForegroundColor $infoColor
Write-Host "AlphaEarth Backend API Test Suite" -ForegroundColor $infoColor
Write-Host "EXTENDED VERSION - All Endpoints" -ForegroundColor $infoColor
Write-Host "=====================================" -ForegroundColor $infoColor
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host "Started: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Check if backend is running
Write-Host "Checking if backend is running..." -ForegroundColor $infoColor
try {
    $healthCheck = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -TimeoutSec 5
    Write-Host "[OK] Backend is running!" -ForegroundColor $successColor
    Write-Host ""
} catch {
    Write-Host "[ERROR] Backend is not running on $baseUrl" -ForegroundColor $failColor
    Write-Host "Please start the backend with: cd backend && npm run dev" -ForegroundColor $warningColor
    exit 1
}

# ============================================
# 1. HEALTH CHECK
# ============================================
Write-Host "`n=== HEALTH CHECK ===" -ForegroundColor $infoColor
Test-Endpoint -Method "GET" -Endpoint "/health" -Description "Backend health check"

# ============================================
# 2. DISASTER ROUTES - EXTENDED
# ============================================
Write-Host "`n=== DISASTER TRACKING (EXTENDED) ===" -ForegroundColor $infoColor
Test-Endpoint -Method "GET" -Endpoint "/api/disasters/active" -Description "Get all active disasters"
Test-Endpoint -Method "GET" -Endpoint "/api/disasters/hurricanes" -Description "Get active hurricanes"
Test-Endpoint -Method "GET" -Endpoint "/api/disasters/hurricanes/al092024" -Description "Get specific hurricane forecast"
Test-Endpoint -Method "GET" -Endpoint "/api/disasters/wildfires" -Description "Get active wildfires"
Test-Endpoint -Method "GET" -Endpoint "/api/disasters/wildfires/ca-park-2024" -Description "Get wildfire perimeter"

# ============================================
# 3. EARTHQUAKE ROUTES - EXTENDED
# ============================================
Write-Host "`n=== EARTHQUAKE DATA (EXTENDED) ===" -ForegroundColor $infoColor
Test-Endpoint -Method "GET" -Endpoint "/api/earthquakes/active" -Description "Get active earthquakes"
Test-Endpoint -Method "GET" -Endpoint "/api/earthquakes/active?magnitude=4.5&timeframe=week" -Description "Get active earthquakes (filtered)"
Test-Endpoint -Method "GET" -Endpoint "/api/earthquakes/significant" -Description "Get significant earthquakes"
Test-Endpoint -Method "GET" -Endpoint "/api/earthquakes/mock-eq-1/impact?magnitude=4.5&timeframe=week" -Description "Get earthquake impact zone"

# ============================================
# 4. SEVERE WEATHER ROUTES
# ============================================
Write-Host "`n=== SEVERE WEATHER ===" -ForegroundColor $infoColor
Test-Endpoint -Method "GET" -Endpoint "/api/severe-weather/active" -Description "Get active severe weather"
Test-Endpoint -Method "GET" -Endpoint "/api/severe-weather/tornadoes" -Description "Get tornado warnings"
Test-Endpoint -Method "GET" -Endpoint "/api/severe-weather/floods" -Description "Get flood warnings"
Test-Endpoint -Method "GET" -Endpoint "/api/severe-weather/by-state/FL,GA" -Description "Get alerts by state (FL, GA)"
Test-Endpoint -Method "GET" -Endpoint "/api/severe-weather/by-state/TX,FL,CA" -Description "Get alerts by state (TX, FL, CA)"

# ============================================
# 5. ANALYSIS ROUTES (POST) - WITH CORRECT FORMATS
# ============================================
Write-Host "`n=== DISASTER ANALYSIS (CORRECTED) ===" -ForegroundColor $infoColor

Test-Endpoint -Method "POST" -Endpoint "/api/analysis/hurricane" -Description "Hurricane impact analysis" -Body @{
    stormId = "al092024"
    region = "florida"
    numProperties = 5000
}

Test-Endpoint -Method "POST" -Endpoint "/api/analysis/wildfire" -Description "Wildfire impact analysis" -Body @{
    fireId = "ca-park-2024"
    region = "california"
    numProperties = 5000
}

Test-Endpoint -Method "POST" -Endpoint "/api/analysis/earthquake" -Description "Earthquake impact analysis" -Body @{
    earthquakeId = "mock-eq-1"
    region = "california"
    radius = 100
}

Test-Endpoint -Method "POST" -Endpoint "/api/analysis/severe-weather" -Description "Severe weather analysis" -Body @{
    alertId = "mock-weather-1"
    region = "southeast"
    radius = 75
}

Test-Endpoint -Method "POST" -Endpoint "/api/analysis/scenario" -Description "Scenario analysis" -Body @{
    disasterType = "hurricane"
    disasterId = "al092024"
    scenarioModifier = "cat_5"
    region = "florida"
}

Test-Endpoint -Method "POST" -Endpoint "/api/analysis/property-risk" -Description "Property risk explanation" -Body @{
    propertyId = "PROP-001"
    riskAssessment = @{
        propertyId = "PROP-001"
        address = "123 Main St"
        coordinates = @{
            lat = 27.9506
            lon = -82.4572
        }
        propertyValue = 500000
        propertyType = "residential"
        distanceMiles = 5.2
        damageProbability = 0.65
        expectedLoss = 325000
        riskTier = "critical"
    }
}

# ============================================
# 6. PROPERTY ROUTES
# ============================================
Write-Host "`n=== PROPERTY MANAGEMENT ===" -ForegroundColor $infoColor
Test-Endpoint -Method "GET" -Endpoint "/api/properties/portfolio" -Description "Get property portfolio"
Test-Endpoint -Method "GET" -Endpoint "/api/properties/portfolio?region=florida&count=100" -Description "Get property portfolio (filtered)"
Test-Endpoint -Method "GET" -Endpoint "/api/properties/region?lat=25.7617&lon=-80.1918&radius=50" -Description "Get properties in region"
Test-Endpoint -Method "GET" -Endpoint "/api/properties/region?lat=27.9506&lon=-82.4572&radius=100" -Description "Get properties in region (Tampa)"
Test-Endpoint -Method "GET" -Endpoint "/api/properties/high-value?minValue=500000" -Description "Get high-value properties"
Test-Endpoint -Method "GET" -Endpoint "/api/properties/high-value?threshold=1000000&region=florida" -Description "Get high-value properties (filtered)"
Test-Endpoint -Method "GET" -Endpoint "/api/properties/coastal?maxDistance=5" -Description "Get coastal properties"
Test-Endpoint -Method "GET" -Endpoint "/api/properties/coastal?maxDistance=10&region=florida" -Description "Get coastal properties (filtered)"

# ============================================
# 7. RISK ASSESSMENT ROUTES - WITH CORRECT FORMATS
# ============================================
Write-Host "`n=== RISK ASSESSMENT (CORRECTED) ===" -ForegroundColor $infoColor

Test-Endpoint -Method "POST" -Endpoint "/api/risk/monte-carlo" -Description "Monte Carlo simulation" -Body @{
    riskAssessments = @(
        @{
            propertyId = "PROP-001"
            coverageAmount = 500000
            damageProbability = 0.65
        },
        @{
            propertyId = "PROP-002"
            coverageAmount = 750000
            damageProbability = 0.45
        }
    )
    numSimulations = 1000
}

Test-Endpoint -Method "POST" -Endpoint "/api/risk/portfolio-metrics" -Description "Portfolio risk metrics" -Body @{
    riskAssessments = @(
        @{
            propertyId = "PROP-001"
            coverageAmount = 500000
            damageProbability = 0.65
            expectedLoss = 325000
            riskTier = "critical"
        },
        @{
            propertyId = "PROP-002"
            coverageAmount = 750000
            damageProbability = 0.45
            expectedLoss = 337500
            riskTier = "high"
        }
    )
}

# ============================================
# 8. SATELLITE IMAGERY ROUTES - EXTENDED
# ============================================
Write-Host "`n=== SATELLITE IMAGERY (EXTENDED) ===" -ForegroundColor $infoColor

Test-Endpoint -Method "POST" -Endpoint "/api/imagery/get" -Description "Get satellite imagery" -Body @{
    aoi = @(-81.0, 32.0, -80.8, 32.2)
    date = "2024-10-01"
    source = "sentinel2_cloudless"
}

Test-Endpoint -Method "POST" -Endpoint "/api/imagery/get" -Description "Get satellite imagery (NASA MODIS)" -Body @{
    aoi = @(-82.6, 27.8, -82.3, 28.1)
    date = "2024-10-09"
    source = "nasa_modis"
}

Test-Endpoint -Method "POST" -Endpoint "/api/imagery/pre-post" -Description "Pre/post disaster imagery" -Body @{
    aoi = @(-82.6, 27.8, -82.3, 28.1)
    disasterDate = "2024-10-09"
    preDays = 7
    postDays = 7
    source = "nasa_modis"
}

Test-Endpoint -Method "POST" -Endpoint "/api/imagery/disaster-impact" -Description "Get disaster impact imagery" -Body @{
    disasterType = "hurricane"
    coordinates = @{
        lat = 27.9506
        lon = -82.4572
    }
    disasterDate = "2024-10-09"
    source = "nasa_modis"
}

Test-Endpoint -Method "POST" -Endpoint "/api/imagery/multi-source" -Description "Multi-source imagery comparison" -Body @{
    aoi = @(-82.6, 27.8, -82.3, 28.1)
    date = "2024-10-09"
}

Test-Endpoint -Method "POST" -Endpoint "/api/imagery/fire-detection" -Description "Fire detection layer" -Body @{
    aoi = @(-121.9, 39.6, -121.7, 39.9)
    date = "2024-07-24"
}

Test-Endpoint -Method "GET" -Endpoint "/api/imagery/available-dates?days=30" -Description "Get available imagery dates"
Test-Endpoint -Method "GET" -Endpoint "/api/imagery/sources" -Description "Get available imagery sources"
Test-Endpoint -Method "GET" -Endpoint "/api/imagery/health" -Description "Imagery service health check"

# ============================================
# 9. PARAMETRIC INSURANCE ROUTES - EXTENDED
# ============================================
Write-Host "`n=== PARAMETRIC INSURANCE (EXTENDED) ===" -ForegroundColor $infoColor

Test-Endpoint -Method "GET" -Endpoint "/api/parametric/policies" -Description "Get all parametric policies"

# Create a new policy and capture the ID
$newPolicy = Test-Endpoint -Method "POST" -Endpoint "/api/parametric/policies" -Description "Create parametric policy" -ExpectedStatus 201 -Body @{
    propertyId = "PROP-FL-002"
    holder = @{
        name = "Test Property Owner"
        email = "owner@example.com"
    }
    location = @{
        lat = 25.7907
        lon = -80.1300
        address = "Miami Beach, FL"
    }
    coverage = @{
        amount = 500000
        currency = "USD"
        type = "Hurricane Wind Damage"
    }
    triggers = @(
        @{
            type = "wind_speed"
            threshold = 119
            payout = 100000
            description = "Category 1 Hurricane winds"
        }
    )
}

# Try to get the policy ID from the response
if ($newPolicy -and $newPolicy.policy -and $newPolicy.policy.policyId) {
    $script:createdPolicyId = $newPolicy.policy.policyId
    Write-Host "[INFO] Created policy ID: $script:createdPolicyId" -ForegroundColor Gray
}

# Test getting specific policy (try demo policy first)
Test-Endpoint -Method "GET" -Endpoint "/api/parametric/policies/POLICY-DEMO-001" -Description "Get specific policy by ID (demo)"

# If we created a policy, test getting it
if ($script:createdPolicyId) {
    Test-Endpoint -Method "GET" -Endpoint "/api/parametric/policies/$script:createdPolicyId" -Description "Get created policy by ID"
    
    # Test evaluating triggers
    Test-Endpoint -Method "POST" -Endpoint "/api/parametric/evaluate/$script:createdPolicyId" -Description "Evaluate policy triggers" -Body @{
        eventContext = @{
            eventName = "Manual Trigger Evaluation"
            timestamp = "2025-11-08T12:00:00Z"
        }
    }
}

# Test demo policy evaluation
Test-Endpoint -Method "POST" -Endpoint "/api/parametric/evaluate/POLICY-DEMO-001" -Description "Evaluate demo policy triggers" -Body @{
    eventContext = @{
        eventName = "Manual Trigger Evaluation"
        timestamp = "2025-11-08T12:00:00Z"
    }
}

# Create a test policy with low thresholds to trigger payout
Test-Endpoint -Method "POST" -Endpoint "/api/parametric/create-test-policy" -Description "Create test policy (low thresholds)"

Test-Endpoint -Method "GET" -Endpoint "/api/parametric/payouts/pending" -Description "Get pending payouts"
Test-Endpoint -Method "GET" -Endpoint "/api/parametric/payouts/processed" -Description "Get processed payouts"

# Try to get a specific payout
Test-Endpoint -Method "GET" -Endpoint "/api/parametric/payouts/PAYOUT-1" -Description "Get specific payout by ID"

# Try to approve a payout
Test-Endpoint -Method "POST" -Endpoint "/api/parametric/payouts/PAYOUT-1/approve" -Description "Approve payout" -Body @{
    adminEmail = "admin@alphaearth.com"
    adminPassword = "admin123"
}

# Try to reject a payout (will fail if already approved)
Test-Endpoint -Method "POST" -Endpoint "/api/parametric/payouts/PAYOUT-2/reject" -Description "Reject payout" -Body @{
    adminEmail = "admin@alphaearth.com"
    adminPassword = "admin123"
    reason = "Insufficient evidence"
}

Test-Endpoint -Method "GET" -Endpoint "/api/parametric/statistics" -Description "Get parametric statistics"

# ============================================
# 10. FLIGHT INSURANCE ROUTES - EXTENDED
# ============================================
Write-Host "`n=== FLIGHT INSURANCE (EXTENDED) ===" -ForegroundColor $infoColor

Test-Endpoint -Method "GET" -Endpoint "/api/flight/delays" -Description "Get all airport delays"
Test-Endpoint -Method "GET" -Endpoint "/api/flight/delays/JFK" -Description "Get specific airport delay (JFK)"
Test-Endpoint -Method "GET" -Endpoint "/api/flight/delays/LAX" -Description "Get specific airport delay (LAX)"

Test-Endpoint -Method "GET" -Endpoint "/api/flight/policies" -Description "Get all flight policies"

# Create a new flight policy and capture the ID
$newFlightPolicy = Test-Endpoint -Method "POST" -Endpoint "/api/flight/policies" -Description "Create flight policy" -ExpectedStatus 201 -Body @{
    holder = @{
        name = "Test Traveler"
        email = "traveler@example.com"
        confirmationNumber = "TEST123"
    }
    flight = @{
        number = "AA1234"
        airline = "American Airlines"
        from = "JFK"
        to = "LAX"
        departureTime = "2025-11-09T10:00:00Z"
    }
    coverage = @{
        amount = 300
        currency = "USD"
        type = "Flight Delay Micro-Insurance"
    }
    triggers = @(
        @{
            type = "delay"
            threshold = 30
            payout = 150
            description = "Moderate delay (30+ min)"
        },
        @{
            type = "delay"
            threshold = 60
            payout = 300
            description = "Major delay (1+ hour)"
        }
    )
}

# Try to get the flight policy ID from the response
if ($newFlightPolicy -and $newFlightPolicy.policy -and $newFlightPolicy.policy.policyId) {
    $script:createdFlightPolicyId = $newFlightPolicy.policy.policyId
    Write-Host "[INFO] Created flight policy ID: $script:createdFlightPolicyId" -ForegroundColor Gray
}

# Test getting specific policy
Test-Endpoint -Method "GET" -Endpoint "/api/flight/policies/FLIGHT-POLICY-001" -Description "Get specific flight policy by ID"

# If we created a policy, test getting it
if ($script:createdFlightPolicyId) {
    Test-Endpoint -Method "GET" -Endpoint "/api/flight/policies/$script:createdFlightPolicyId" -Description "Get created flight policy by ID"
    
    # Test evaluating single policy
    Test-Endpoint -Method "POST" -Endpoint "/api/flight/evaluate/$script:createdFlightPolicyId" -Description "Evaluate single flight policy"
}

# Test evaluating all policies
Test-Endpoint -Method "POST" -Endpoint "/api/flight/evaluate" -Description "Evaluate all flight policies"

Test-Endpoint -Method "GET" -Endpoint "/api/flight/payouts/pending" -Description "Get pending flight payouts"
Test-Endpoint -Method "GET" -Endpoint "/api/flight/payouts/processed" -Description "Get processed flight payouts"

# Try to get a specific payout
Test-Endpoint -Method "GET" -Endpoint "/api/flight/payouts/FLIGHT-PAYOUT-1" -Description "Get specific flight payout by ID"

# Try to approve a flight payout
Test-Endpoint -Method "POST" -Endpoint "/api/flight/payouts/FLIGHT-PAYOUT-1/approve" -Description "Approve flight payout" -Body @{
    adminEmail = "admin@alphaearth.com"
    adminPassword = "admin123"
}

# Try to reject a flight payout
Test-Endpoint -Method "POST" -Endpoint "/api/flight/payouts/FLIGHT-PAYOUT-2/reject" -Description "Reject flight payout" -Body @{
    adminEmail = "admin@alphaearth.com"
    adminPassword = "admin123"
    reason = "Weather conditions not verified"
}

Test-Endpoint -Method "GET" -Endpoint "/api/flight/statistics" -Description "Get flight insurance statistics"

# ============================================
# 11. CLAIM PROCESSING (SKIP - TOO SLOW)
# ============================================
Write-Host "`n=== CLAIM PROCESSING ===" -ForegroundColor $infoColor
Write-Host "Note: Claim processing tests are skipped as they take 5-30 minutes" -ForegroundColor $warningColor

Test-Endpoint -Method "POST" -Endpoint "/api/claim_processing/basic" -Description "Process damage claim (SKIPPED)" -SkipTest $true

# ============================================
# GENERATE REPORT
# ============================================
Write-Host "`n=====================================" -ForegroundColor $infoColor
Write-Host "TEST SUMMARY" -ForegroundColor $infoColor
Write-Host "=====================================" -ForegroundColor $infoColor
Write-Host "Total Tests:  $totalTests" -ForegroundColor Gray
Write-Host "Passed:       $passedTests" -ForegroundColor $successColor
Write-Host "Failed:       $failedTests" -ForegroundColor $failColor

if ($totalTests -gt 0) {
    $successRate = [math]::Round(($passedTests/$totalTests)*100, 2)
    Write-Host "Success Rate: $successRate%" -ForegroundColor Gray
} else {
    Write-Host "Success Rate: N/A" -ForegroundColor Gray
}
Write-Host ""

# Export to CSV
$results | Export-Csv -Path $logFile -NoTypeInformation
Write-Host "[OK] Results exported to: $logFile" -ForegroundColor $successColor

# Generate detailed text report
$failedTestsList = $results | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
    "[$($_.Test)] $($_.Description)`n   $($_.Method) $($_.Endpoint)`n   Error: $($_.Error)`n"
}

$allResultsList = $results | ForEach-Object {
    "[$($_.Test)] $($_.Status) - $($_.Description)`n   $($_.Method) $($_.Endpoint)`n   Status Code: $($_.StatusCode), Time: $($_.ResponseTime)`n"
}

$detailsReport = @"
AlphaEarth Backend API Test Report - EXTENDED
Generated: $(Get-Date)
Base URL: $baseUrl

SUMMARY
=======
Total Tests: $totalTests
Passed: $passedTests
Failed: $failedTests
Success Rate: $(if ($totalTests -gt 0) { [math]::Round(($passedTests/$totalTests)*100, 2) } else { 'N/A' })%

FAILED TESTS
============
$($failedTestsList -join "`n")

ALL RESULTS
===========
$($allResultsList -join "`n")
"@

$detailsReport | Out-File -FilePath $detailsFile
Write-Host "[OK] Detailed report exported to: $detailsFile" -ForegroundColor $successColor
Write-Host ""

# Final status
if ($failedTests -eq 0) {
    Write-Host "[SUCCESS] All tests passed!" -ForegroundColor $successColor
} else {
    Write-Host "[WARNING] Some tests failed. Check the report for details." -ForegroundColor $warningColor
    Write-Host "Failed tests: $failedTests / $totalTests" -ForegroundColor $warningColor
}

Write-Host "`nCompleted: $(Get-Date)" -ForegroundColor Gray