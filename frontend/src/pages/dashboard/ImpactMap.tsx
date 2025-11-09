import { Button } from "@/components/ui/button";
import { RefreshCw, FileText, Bell, Mail } from "lucide-react";
import { useActiveDisasters, useHurricanes, useWildfires, useActiveEarthquakes, useActiveSevereWeather } from "@/hooks/useDisasters";
import { usePropertiesInRegion } from "@/hooks/useProperties";
import { useState } from "react";

export default function ImpactMap() {
  // Fetch real disaster data
  const { data: disastersData, isLoading: disastersLoading, refetch: refetchDisasters } = useActiveDisasters();
  const { data: hurricanesData, isLoading: hurricanesLoading } = useHurricanes();
  const { data: wildfiresData, isLoading: wildfiresLoading } = useWildfires();
  const { data: earthquakesData, isLoading: earthquakesLoading } = useActiveEarthquakes();
  const { data: severeWeatherData, isLoading: severeWeatherLoading } = useActiveSevereWeather();

  // Default center on USA or first disaster location
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -95.0]);
  
  // Fetch properties near disasters
  const { data: propertiesData } = usePropertiesInRegion(mapCenter[0], mapCenter[1], 100);

  // Log all disaster data to console
  console.log("Impact Map Data:", {
    allDisasters: disastersData?.data || [],
    hurricanes: hurricanesData?.data || [],
    wildfires: wildfiresData?.data || [],
    earthquakes: earthquakesData?.data || [],
    severeWeather: severeWeatherData?.data || [],
    properties: propertiesData?.data || []
  });

  // Calculate real counts from backend data
  const criticalCount = hurricanesData?.count || 0;
  const highRiskCount = wildfiresData?.count || 0;
  const moderateCount = earthquakesData?.count || 0;
  const lowRiskCount = severeWeatherData?.count || 0;
  const totalAffectedProperties = propertiesData?.count || 0;

  // Handle refresh
  const handleRefresh = () => {
    refetchDisasters();
  };
  return (
    <div className="space-y-6" style={{ background: 'transparent', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ 
              color: 'white',
              fontFamily: 'Plus Jakarta Display, sans-serif',
              fontWeight: '700'
            }}
          >
            Disaster Impact Mapping
          </h1>
          <p 
            className="text-sm"
            style={{ 
              color: '#A0AEC0',
              fontSize: '14px',
              fontFamily: 'Plus Jakarta Display, sans-serif'
            }}
          >
            Real-time property exposure tracking
          </p>
        </div>
      </div>

      {/* Event Selector */}
      <div 
        className="relative"
        style={{ 
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      >
        {/* Background Layer 1 - Backdrop blur */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
            borderRadius: '20px',
            backdropFilter: 'blur(60px)',
            zIndex: 1
          }}
        />
        
        {/* Background Layer 2 - Gradient overlay */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
            borderRadius: '20px',
            zIndex: 2
          }}
        />
        
        {/* Content */}
        <div 
          className="relative z-10 p-4"
          style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[300px]">
              <select 
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option style={{ background: '#1A1F37' }}>Hurricane Elena | Category 4 | Oct 15, 2024</option>
                <option style={{ background: '#1A1F37' }}>Hurricane Delta | Category 3 | Sep 28, 2024</option>
                <option style={{ background: '#1A1F37' }}>Tropical Storm Charlie | Jul 12, 2024</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="text-sm"
                style={{ color: '#A0AEC0' }}
              >
                Last updated: 2 minutes ago
              </span>
              <Button 
                size="sm" 
                variant="outline"
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Large Map Placeholder */}
      <div 
        className="relative"
        style={{ 
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      >
        {/* Background Layer 1 - Backdrop blur */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
            borderRadius: '20px',
            backdropFilter: 'blur(60px)',
            zIndex: 1
          }}
        />
        
        {/* Background Layer 2 - Gradient overlay */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
            borderRadius: '20px',
            zIndex: 2
          }}
        />
        
        {/* Content */}
        <div 
          className="relative z-10 p-6"
          style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
        >
          <div 
            className="h-[500px] rounded-lg relative"
            style={{ 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(249, 115, 22, 0.1) 50%, rgba(239, 68, 68, 0.1) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p 
                  className="text-lg font-medium mb-1"
                  style={{ color: 'white' }}
                >
                  Interactive Disaster Map
                </p>
                <p 
                  className="text-sm"
                  style={{ color: '#A0AEC0' }}
                >
                  Hurricane path, storm cone, and property risk zones
                </p>
              </div>
            </div>

            {/* Map Legend Overlay */}
            <div 
              className="absolute top-4 right-4 rounded-lg p-4 space-y-2 min-w-[200px]"
              style={{
                background: 'rgba(26, 31, 55, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <p 
                className="font-bold text-sm mb-2"
                style={{ color: 'white' }}
              >
                Risk Zones
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ background: '#EF4444' }}
                  />
                  <span style={{ color: '#A0AEC0' }}>Critical</span>
                </div>
                {/* Critical - Hurricanes */}
                <span className="font-bold" style={{ color: 'white' }}>{criticalCount}</span>

                {/* High Risk - Wildfires */}  
                <span className="font-bold" style={{ color: 'white' }}>{highRiskCount}</span>

                {/* Moderate - Earthquakes */}
                <span className="font-bold" style={{ color: 'white' }}>{moderateCount}</span>

                {/* Low Risk - Severe Weather */}
                <span className="font-bold" style={{ color: 'white' }}>{lowRiskCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ background: '#F97316' }}
                  />
                  <span style={{ color: '#A0AEC0' }}>High Risk</span>
                </div>
                <span className="font-bold" style={{ color: 'white' }}>67</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ background: '#EAB308' }}
                  />
                  <span style={{ color: '#A0AEC0' }}>Moderate</span>
                </div>
                <span className="font-bold" style={{ color: 'white' }}>89</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ background: '#22C55E' }}
                  />
                  <span style={{ color: '#A0AEC0' }}>Low Risk</span>
                </div>
                <span className="font-bold" style={{ color: 'white' }}>156</span>
              </div>
            </div>

            {/* Sample Hurricane Path */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full">
                <path
                  d="M 100 400 Q 200 300, 300 250 Q 400 200, 500 150"
                  stroke="#EF4444"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="10,5"
                />
                <circle cx="500" cy="150" r="8" fill="#EF4444" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Impact Card */}
      <div 
        className="relative"
        style={{ 
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      >
        {/* Background Layer 1 - Backdrop blur */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
            borderRadius: '20px',
            backdropFilter: 'blur(60px)',
            zIndex: 1
          }}
        />
        
        {/* Background Layer 2 - Gradient overlay */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
            borderRadius: '20px',
            zIndex: 2
          }}
        />
        
        {/* Content */}
        <div 
          className="relative z-10 p-6"
          style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
        >
          <h3 
            className="text-lg font-bold mb-4"
            style={{ color: 'white' }}
          >
            Financial Impact Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              className="p-4 rounded-lg"
              style={{ 
                background: 'rgba(26, 31, 55, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <p 
                className="text-sm mb-1"
                style={{ color: '#A0AEC0' }}
              >
                Total Insured Value
              </p>
              <p 
                className="text-3xl font-bold"
                style={{ color: '#0075FF' }}
              >
                $47.2M
              </p>
            </div>
            <div 
              className="p-4 rounded-lg"
              style={{ 
                background: 'rgba(26, 31, 55, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <p 
                className="text-sm mb-1"
                style={{ color: '#A0AEC0' }}
              >
                Estimated Total Damage
              </p>
              <p 
                className="text-3xl font-bold"
                style={{ color: '#EF4444' }}
              >
                $12.8M
              </p>
            </div>
            <div 
              className="p-4 rounded-lg"
              style={{ 
                background: 'rgba(26, 31, 55, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <p 
                className="text-sm mb-1"
                style={{ color: '#A0AEC0' }}
              >
                Auto-Approved Claims
              </p>
              <p 
                className="text-3xl font-bold"
                style={{ color: '#22C55E' }}
              >
                $4.2M
              </p>
              <p 
                className="text-xs mt-1"
                style={{ color: '#A0AEC0' }}
              >
                89 properties
              </p>
            </div>
            <div 
              className="p-4 rounded-lg"
              style={{ 
                background: 'rgba(26, 31, 55, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <p 
                className="text-sm mb-1"
                style={{ color: '#A0AEC0' }}
              >
                Pending Review
              </p>
              <p 
                className="text-3xl font-bold"
                style={{ color: '#F97316' }}
              >
                $8.6M
              </p>
              <p 
                className="text-xs mt-1"
                style={{ color: '#A0AEC0' }}
              >
                112 properties
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Worst-Case Scenario Card */}
      <div 
        className="relative"
        style={{ 
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}
      >
        {/* Background Layer 1 - Backdrop blur */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
            borderRadius: '20px',
            backdropFilter: 'blur(60px)',
            zIndex: 1
          }}
        />
        
        {/* Background Layer 2 - Gradient overlay with orange tint */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            background: 'linear-gradient(85deg, rgba(245, 158, 11, 0.1) 0%, #1A1F37 100%, #1A1F37 100%)',
            borderRadius: '20px',
            zIndex: 2
          }}
        />
        
        {/* Content */}
        <div 
          className="relative z-10 p-6"
          style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
        >
          <h3 
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{ color: 'white' }}
          >
            🎯 Worst-Case Scenario Simulation
          </h3>
          <div className="space-y-3">
            <p 
              className="font-medium"
              style={{ color: '#A0AEC0' }}
            >
              If storm shifts 20 miles east:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ color: '#A0AEC0' }}
                >
                  Additional Exposure
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: '#F97316' }}
                >
                  $23.1M
                </p>
              </div>
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ color: '#A0AEC0' }}
                >
                  Additional Properties at Risk
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: '#F97316' }}
                >
                  156
                </p>
              </div>
            </div>
            <Button 
              className="w-full md:w-auto mt-2"
              style={{
                background: '#0075FF',
                color: 'white',
                border: 'none'
              }}
            >
              Run Simulation
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          style={{
            background: '#0075FF',
            color: 'white',
            border: 'none'
          }}
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate Impact Report
        </Button>
        <Button 
          variant="outline"
          style={{
            background: 'rgba(26, 31, 55, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white'
          }}
        >
          <Bell className="h-4 w-4 mr-2" />
          Alert All Field Agents
        </Button>
        <Button 
          variant="outline"
          style={{
            background: 'rgba(26, 31, 55, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white'
          }}
        >
          <Mail className="h-4 w-4 mr-2" />
          Email Stakeholders
        </Button>
        <Button 
          variant="outline"
          onClick={handleRefresh}
          style={{
            background: 'rgba(26, 31, 55, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white'
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
}
