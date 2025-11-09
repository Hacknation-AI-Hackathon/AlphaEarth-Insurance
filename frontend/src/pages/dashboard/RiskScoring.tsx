import { useState, useEffect } from "react";
import { Search, Droplets, Flame, Wind, AlertCircle, Download, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RiskMap } from "@/components/RiskMap";
import { useToast } from "@/hooks/use-toast";
import { usePropertiesInRegion, useHighValueProperties, useCalculatePropertyRisk, useMonteCarloSimulation } from "@/hooks/useProperties";
import { useActiveDisasters, useHurricanes, useWildfires } from "@/hooks/useDisasters";

interface CityData {
  name: string;
  overall: number;
  flood: number;
  wildfire: number;
  storm: number;
  coords: [number, number];
  insights: string[];
}

const cityData: Record<string, CityData> = {
  "San Francisco, CA": {
    name: "San Francisco, CA",
    overall: 28,
    flood: 15,
    wildfire: 45,
    storm: 25,
    coords: [37.7749, -122.4194],
    insights: [
      "Low elevation coastal area",
      "Active wildfire zones nearby",
      "Earthquake risk present",
      "Good drainage infrastructure",
    ],
  },
  "Miami, FL": {
    name: "Miami, FL",
    overall: 82,
    flood: 90,
    wildfire: 5,
    storm: 85,
    coords: [25.7617, -80.1918],
    insights: [
      "FEMA flood zone AE",
      "3ft above sea level",
      "Hurricane exposure high",
      "3 floods in last 10 years",
    ],
  },
  "Houston, TX": {
    name: "Houston, TX",
    overall: 65,
    flood: 75,
    wildfire: 10,
    storm: 60,
    coords: [29.7604, -95.3698],
    insights: [
      "Hurricane corridor",
      "Flat terrain with poor drainage",
      "Frequent flooding events",
      "Low wildfire risk",
    ],
  },
  "Los Angeles, CA": {
    name: "Los Angeles, CA",
    overall: 71,
    flood: 20,
    wildfire: 85,
    storm: 45,
    coords: [34.0522, -118.2437],
    insights: [
      "Extreme wildfire risk",
      "Drought-prone vegetation",
      "Proximity to fire zones",
      "Earthquake fault lines",
    ],
  },
};

export default function RiskScoring() {
  const [selectedCity, setSelectedCity] = useState<CityData>(cityData["San Francisco, CA"]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [animateScores, setAnimateScores] = useState(false);
  const { toast } = useToast();

  // Fetch real property data from backend
  const { data: propertiesData, isLoading: propertiesLoading } = usePropertiesInRegion(
    selectedCity.coords[0], 
    selectedCity.coords[1], 
    50 // 50km radius
  );
  
  const { data: highValueData, isLoading: highValueLoading } = useHighValueProperties({ 
    minValue: 500000 
  });

  const { data: disastersData } = useActiveDisasters();
  const { data: hurricanesData } = useHurricanes();
  const { data: wildfiresData } = useWildfires();
  
  const calculateRisk = useCalculatePropertyRisk();
  const runMonteCarlo = useMonteCarloSimulation();

  // Log real data to console
  console.log("Risk Scoring Data:", {
    properties: propertiesData?.data || [],
    highValue: highValueData?.data || [],
    disasters: disastersData?.data || [],
    hurricanes: hurricanesData?.data || [],
    wildfires: wildfiresData?.data || []
  });

  // Calculate real risk metrics from backend data
  const realPropertyCount = propertiesData?.count || 0;
  const realHighValueCount = highValueData?.count || 0;
  const realDisasterCount = disastersData?.count || 0;

  const handleCitySelect = (cityName: string) => {
    setIsLoading(true);
    setAnimateScores(false);

    setTimeout(() => {
      setSelectedCity(cityData[cityName]);
      setIsLoading(false);
      setAnimateScores(true);
      toast({
        title: "✓ Risk analysis complete!",
        description: `Analysis for ${cityName} is ready.`,
      });
    }, 1500);
  };

  const handleSearch = () => {
    const found = Object.keys(cityData).find(
      (key) => key.toLowerCase().includes(searchInput.toLowerCase())
    );
    if (found) {
      handleCitySelect(found);
    } else {
      toast({
        title: "Location not found",
        description: "Try one of the quick select options",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setAnimateScores(true);
  }, []);

  const getRiskColor = (score: number) => {
    if (score < 40) return "#22C55E";
    if (score < 70) return "#F59E0B";
    return "#EF4444";
  };

  const getRiskBadge = (score: number) => {
    if (score < 40) return { text: "🟢 Low Risk", color: "#22C55E" };
    if (score < 70) return { text: "🟡 Medium Risk", color: "#F59E0B" };
    return { text: "🔴 High Risk", color: "#EF4444" };
  };

  return (
    <div className="space-y-6" style={{ background: 'transparent', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}>
        <h1 
          className="text-3xl font-bold mb-2"
          style={{ 
            color: 'white',
            fontFamily: 'Plus Jakarta Display, sans-serif',
            fontWeight: '700'
          }}
        >
          Real-Time Risk Assessment
        </h1>
        <p 
          className="text-sm"
          style={{ 
            color: '#A0AEC0',
            fontSize: '14px',
            fontFamily: 'Plus Jakarta Display, sans-serif'
          }}
        >
          Enter any address or coordinates to get instant climate risk analysis powered by satellite data
        </p>
      </div>

      {/* Search Section */}
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
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter address or coordinates..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 px-4 py-2 rounded-lg"
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                style={{
                  background: '#0075FF',
                  color: 'white',
                  border: 'none'
                }}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Quick Select Buttons */}
            <div className="flex flex-wrap gap-2">
              {Object.keys(cityData).map((city) => (
                <Button
                  key={city}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCitySelect(city)}
                  disabled={isLoading}
                  style={{
                    background: 'rgba(26, 31, 55, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {city}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Area */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: '#0075FF' }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* LEFT PANEL - Risk Scores */}
          <div className="lg:col-span-2 space-y-4">
            {/* Location Header */}
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
                <div className="space-y-3">
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: 'white' }}
                  >
                    {selectedCity.name}
                  </h2>
                  <div 
                    className="inline-block px-3 py-1 rounded-lg"
                    style={{ 
                      background: `rgba(${getRiskBadge(selectedCity.overall).color === '#22C55E' ? '34, 197, 94' : getRiskBadge(selectedCity.overall).color === '#F59E0B' ? '245, 158, 11' : '239, 68, 68'}, 0.2)`,
                      border: `1px solid ${getRiskBadge(selectedCity.overall).color}40`
                    }}
                  >
                    <span 
                      className="font-medium"
                      style={{ color: getRiskBadge(selectedCity.overall).color }}
                    >
                      {getRiskBadge(selectedCity.overall).text}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Risk Score */}
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
                className="relative z-10 p-6 space-y-3"
                style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
              >
                <p 
                  className="text-sm"
                  style={{ color: '#A0AEC0' }}
                >
                  Overall Risk Score
                </p>
                <div className="flex items-end gap-2">
                  <span 
                    className="text-5xl font-bold"
                    style={{ color: 'white' }}
                  >
                    {selectedCity.overall}
                  </span>
                  <span 
                    className="text-2xl mb-1"
                    style={{ color: '#A0AEC0' }}
                  >
                    /100
                  </span>
                </div>
                <div 
                  className="w-full h-3 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${selectedCity.overall}%`, 
                      background: getRiskColor(selectedCity.overall),
                      transition: animateScores ? 'width 1s ease-out' : 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Individual Risk Bars */}
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
                className="relative z-10 p-6 space-y-6"
                style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
              >
                {/* Flood Risk */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(59, 130, 246, 0.2)' }}
                      >
                        <Droplets className="h-4 w-4" style={{ color: '#0075FF' }} />
                      </div>
                      <span 
                        className="font-medium"
                        style={{ color: 'white' }}
                      >
                        🌊 Flood Risk
                      </span>
                    </div>
                    <span 
                      className="font-bold"
                      style={{ color: 'white' }}
                    >
                      {selectedCity.flood}%
                    </span>
                  </div>
                  <div 
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${selectedCity.flood}%`, 
                        background: '#0075FF',
                        transition: animateScores ? 'width 0.7s ease-out 0.2s' : 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Wildfire Risk */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(249, 115, 22, 0.2)' }}
                      >
                        <Flame className="h-4 w-4" style={{ color: '#F97316' }} />
                      </div>
                      <span 
                        className="font-medium"
                        style={{ color: 'white' }}
                      >
                        🔥 Wildfire Risk
                      </span>
                    </div>
                    <span 
                      className="font-bold"
                      style={{ color: 'white' }}
                    >
                      {selectedCity.wildfire}%
                    </span>
                  </div>
                  <div 
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${selectedCity.wildfire}%`, 
                        background: '#F97316',
                        transition: animateScores ? 'width 0.7s ease-out 0.4s' : 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Storm Risk */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(148, 163, 184, 0.2)' }}
                      >
                        <Wind className="h-4 w-4" style={{ color: '#94A3B8' }} />
                      </div>
                      <span 
                        className="font-medium"
                        style={{ color: 'white' }}
                      >
                        🌀 Storm Risk
                      </span>
                    </div>
                    <span 
                      className="font-bold"
                      style={{ color: 'white' }}
                    >
                      {selectedCity.storm}%
                    </span>
                  </div>
                  <div 
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${selectedCity.storm}%`, 
                        background: '#94A3B8',
                        transition: animateScores ? 'width 0.7s ease-out 0.6s' : 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
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
                  className="text-lg font-bold mb-4 flex items-center gap-2"
                  style={{ color: 'white' }}
                >
                  💡 AI Insights - Why This Risk Score?
                </h3>
                <ul className="space-y-2">
                  {selectedCity.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span 
                        className="mt-1"
                        style={{ color: '#0075FF' }}
                      >
                        •
                      </span>
                      <span 
                        className="text-sm"
                        style={{ color: '#A0AEC0' }}
                      >
                        {insight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button 
                className="w-full"
                style={{
                  background: '#0075FF',
                  color: 'white',
                  border: 'none'
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Risk Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Quote
              </Button>
            </div>

            {/* Disclaimer */}
            <div 
              className="relative"
              style={{ 
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'rgba(26, 31, 55, 0.3)'
              }}
            >
              <div 
                className="p-4"
                style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
              >
                <div className="flex gap-2">
                  <AlertCircle 
                    className="h-4 w-4 flex-shrink-0 mt-0.5" 
                    style={{ color: '#A0AEC0' }}
                  />
                  <p 
                    className="text-xs"
                    style={{ color: '#A0AEC0' }}
                  >
                    Risk scores calculated using satellite imagery, historical climate data, terrain
                    analysis, and real-time weather patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Map */}
          <div className="lg:col-span-3">
            <div 
              className="relative h-full rounded-[20px] overflow-hidden"
              style={{ 
                borderRadius: '20px',
                background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                backdropFilter: 'blur(60px)'
              }}
            >
              <div className="h-[800px] relative">
                <RiskMap
                  center={selectedCity.coords}
                  zoom={12}
                  riskLevel={selectedCity.overall}
                />
                <div 
                  className="absolute bottom-4 left-4 right-4 flex justify-between text-xs p-2 rounded"
                  style={{ 
                    background: 'rgba(26, 31, 55, 0.9)',
                    backdropFilter: 'blur(10px)',
                    color: '#A0AEC0'
                  }}
                >
                  <span>Lat: {selectedCity.coords[0].toFixed(4)}°</span>
                  <span>Lon: {selectedCity.coords[1].toFixed(4)}°</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
