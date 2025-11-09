import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, Flame, Wind, Cloud, Zap, Loader2, ChevronDown, Filter } from "lucide-react";
import { useActiveDisasters, useHurricanes, useWildfires, useActiveEarthquakes, useActiveSevereWeather } from "@/hooks/useDisasters";
import { useState, useMemo } from "react";
import { apiClient } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DisasterImpactPopup } from "@/components/DisasterImpactPopup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ImpactMap() {
  // Fetch real disaster data
  const { refetch: refetchDisasters } = useActiveDisasters();
  const { data: hurricanesData, isLoading: hurricanesLoading, refetch: refetchHurricanes } = useHurricanes();
  const { data: wildfiresData, isLoading: wildfiresLoading, refetch: refetchWildfires } = useWildfires();
  const { data: earthquakesData, isLoading: earthquakesLoading, refetch: refetchEarthquakes } = useActiveEarthquakes();
  const { data: severeWeatherData, isLoading: severeWeatherLoading, refetch: refetchSevereWeather } = useActiveSevereWeather();
  const { toast } = useToast();

  // State for selected disaster and analysis results
  const [selectedDisaster, setSelectedDisaster] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Filter and sort state
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("most-recent");

  // Check if any data is loading
  const isLoading = hurricanesLoading || wildfiresLoading || earthquakesLoading || severeWeatherLoading;

  // Combine all disasters
  const allDisasters = useMemo(() => {
    const disasters: any[] = [];
    
    // Add hurricanes
    if (hurricanesData?.data && Array.isArray(hurricanesData.data)) {
      hurricanesData.data.forEach((h: any) => {
        const isMock = h.isMock === true || h.name?.includes('Milton') || h.name?.includes('Helene');
        const riskLevel = h.intensity?.includes('Category 4') || h.intensity?.includes('Category 5') 
          ? 'CRITICAL' 
          : h.status === 'warning' 
          ? 'ACTIVE' 
          : 'MONITORING';
        
        disasters.push({
          ...h,
          type: 'hurricane',
          icon: Wind,
          displayType: 'Hurricane',
          displayName: h.name?.replace('Hurricane ', '') || h.name || `Hurricane ${h.id}`,
          location: h.location || h.region || 'Unknown',
          isRealTime: !isMock,
          isMock: isMock,
          riskLevel: riskLevel,
          source: isMock ? 'MOCK' : 'LIVE'
        });
      });
    }
    
    // Add wildfires
    if (wildfiresData?.data && Array.isArray(wildfiresData.data)) {
      wildfiresData.data.forEach((w: any, idx: number) => {
        const isMock = w.isMock === true;
        disasters.push({
          ...w,
          type: 'wildfire',
          icon: Flame,
          displayType: 'Wildfire',
          displayName: w.name || `Active Fire ${idx + 1}`,
          location: w.location || w.region || 'United States',
          isRealTime: !isMock,
          isMock: isMock,
          riskLevel: w.status === 'active' ? 'ACTIVE' : 'MONITORING',
          source: isMock ? 'MOCK' : 'LIVE'
        });
      });
    }
    
    // Add earthquakes
    if (earthquakesData?.data && Array.isArray(earthquakesData.data)) {
      earthquakesData.data.forEach((e: any) => {
        const isMock = e.isMock === true;
        let earthquakeTitle = 'Earthquake';
        if (e.mag) {
          earthquakeTitle = `M ${e.mag}`;
        }
        
        const riskLevel = e.mag >= 5.0 ? 'CRITICAL' : e.mag >= 4.5 ? 'ACTIVE' : 'MONITORING';
        
        disasters.push({
          ...e,
          type: 'earthquake',
          icon: AlertTriangle,
          displayType: 'Earthquake',
          displayName: earthquakeTitle,
          location: e.place || 'Unknown',
          isRealTime: !isMock,
          isMock: isMock,
          riskLevel: riskLevel,
          source: isMock ? 'MOCK' : 'LIVE'
        });
      });
    }
    
    // Add severe weather
    if (severeWeatherData?.data && Array.isArray(severeWeatherData.data)) {
      severeWeatherData.data.forEach((s: any) => {
        const isMock = s.isMock === true;
        let weatherTitle = 'Severe Weather';
        let weatherType = 'Severe Weather';
        
        if (s.headline) {
          let cleanHeadline = s.headline.trim();
          if (cleanHeadline.toLowerCase().includes('issued')) {
            const parts = cleanHeadline.split(/issued/i);
            cleanHeadline = parts[0].trim();
          }
          if (cleanHeadline.toLowerCase().includes(' by ')) {
            const parts = cleanHeadline.split(/\s+by\s+/i);
            cleanHeadline = parts[0].trim();
          }
          if (cleanHeadline && cleanHeadline.length > 0) {
            weatherTitle = cleanHeadline;
            // Extract type (e.g., "Flood Warning" -> "Flood")
            const typeMatch = cleanHeadline.match(/^(\w+)/);
            if (typeMatch) {
              weatherType = typeMatch[1];
            }
            if (weatherTitle.length > 30) {
              weatherTitle = weatherTitle.substring(0, 27).trim() + '...';
            }
          }
        }
        
        disasters.push({
          ...s,
          type: 'severe-weather',
          icon: Cloud,
          displayType: weatherType,
          displayName: weatherTitle,
          location: s.areaDesc || 'Unknown',
          isRealTime: !isMock,
          isMock: isMock,
          riskLevel: 'ACTIVE',
          source: isMock ? 'MOCK' : 'LIVE'
        });
      });
    }
    
    return disasters;
  }, [hurricanesData, wildfiresData, earthquakesData, severeWeatherData]);

  // Filter and sort disasters
  const filteredAndSortedDisasters = useMemo(() => {
    let filtered = [...allDisasters];

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(d => d.type === filterType);
    }

    // Filter by source
    if (filterSource !== "all") {
      filtered = filtered.filter(d => {
        if (filterSource === "mock") return d.isMock === true;
        if (filterSource === "live") return d.isMock === false;
        return true;
      });
    }

    // Sort
    if (sortBy === "most-recent") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.lastUpdated || a.timestamp || a.time || 0);
        const dateB = new Date(b.lastUpdated || b.timestamp || b.time || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } else if (sortBy === "highest-risk") {
      const riskOrder = { 'CRITICAL': 3, 'ACTIVE': 2, 'MONITORING': 1 };
      filtered.sort((a, b) => {
        const aRisk = riskOrder[a.riskLevel as keyof typeof riskOrder] || 0;
        const bRisk = riskOrder[b.riskLevel as keyof typeof riskOrder] || 0;
        if (bRisk !== aRisk) return bRisk - aRisk;
        // If same risk, sort by date
        const dateA = new Date(a.lastUpdated || a.timestamp || a.time || 0);
        const dateB = new Date(b.lastUpdated || b.timestamp || b.time || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } else if (sortBy === "by-type") {
      filtered.sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        const dateA = new Date(a.lastUpdated || a.timestamp || a.time || 0);
        const dateB = new Date(b.lastUpdated || b.timestamp || b.time || 0);
        return dateB.getTime() - dateA.getTime();
      });
    }

    return filtered;
  }, [allDisasters, filterType, filterSource, sortBy]);

  // Handle analyze impact
  const analyzeImpact = useMutation({
    mutationFn: async (disaster: any) => {
      if (disaster.type === 'hurricane') {
        return await apiClient.analyzeHurricane(disaster.id, disaster.location || 'gulf-coast', 5000);
      } else if (disaster.type === 'wildfire') {
        return await apiClient.analyzeWildfire(disaster.id, disaster.location || 'california', 5000);
      } else if (disaster.type === 'earthquake') {
        return await apiClient.analyzeEarthquake(disaster.id, 'california', 100);
      } else if (disaster.type === 'severe-weather') {
        // Extract region from location or use default
        const region = disaster.location && disaster.location !== 'Unknown' 
          ? disaster.location.toLowerCase().replace(/\s+/g, '-')
          : 'southeast';
        return await apiClient.analyzeSevereWeather(disaster.id, region, 75);
      } else {
        throw new Error('Analysis not available for this disaster type');
      }
    },
    onSuccess: (data) => {
      setAnalysisData(data?.data);
      setIsPopupOpen(true);
      toast({
        title: "Analysis Complete",
        description: "Impact analysis completed successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze disaster impact",
        variant: "destructive",
      });
    }
  });

  const handleAnalyzeImpact = (disaster: any) => {
    setSelectedDisaster(disaster);
    analyzeImpact.mutate(disaster);
  };


  // Format date
  const formatDate = (dateString: string | number | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Get disaster icon component
  const getDisasterIcon = (disaster: any) => {
    if (disaster.icon) return disaster.icon;
    if (disaster.type === 'hurricane') return Wind;
    if (disaster.type === 'wildfire') return Flame;
    if (disaster.type === 'earthquake') return AlertTriangle;
    if (disaster.type === 'severe-weather') return Cloud;
    return AlertTriangle;
  };

  // Get risk level color
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel?.toUpperCase()) {
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', color: '#EF4444' };
      case 'ACTIVE':
        return { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', color: '#EAB308' };
      case 'MONITORING':
        return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', color: '#22C55E' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.4)', color: '#94A3B8' };
    }
  };

  // Get source color
  const getSourceColor = (source: string) => {
    switch (source?.toUpperCase()) {
      case 'MOCK':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', color: '#EF4444' };
      case 'LIVE':
        return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', color: '#22C55E' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.4)', color: '#94A3B8' };
    }
  };


  // Handle refresh
  const handleRefresh = () => {
    refetchDisasters();
    refetchHurricanes();
    refetchWildfires();
    refetchEarthquakes();
    refetchSevereWeather();
    toast({
      title: "Refreshing Data",
      description: "Fetching latest disaster information...",
    });
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
            Real-time risk assessment and financial exposure analysis for active disasters using satellite intelligence and AI.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          style={{
            background: '#0075FF',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontFamily: 'Plus Jakarta Display, sans-serif'
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filter and Sort Controls */}
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
        
        <div 
          className="relative z-10 p-6"
          style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <Filter className="h-4 w-4" style={{ color: '#A0AEC0' }} />
                <span className="text-sm font-medium" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Display, sans-serif' }}>Filter:</span>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger 
                    className="w-[150px] h-9"
                    style={{
                      background: 'rgba(26, 31, 55, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: 'white',
                      fontFamily: 'Plus Jakarta Display, sans-serif',
                      fontSize: '14px',
                      fontWeight: '400'
                    }}
                  >
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-50"
                    style={{ 
                      background: 'rgba(26, 31, 55, 0.95)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                      padding: '4px'
                    }}
                  >
                    <SelectItem 
                      value="all" 
                      style={{ 
                        color: 'white',
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        fontSize: '14px',
                        borderRadius: '6px',
                        margin: '2px 0'
                      }}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      All Types
                    </SelectItem>
                    <SelectItem 
                      value="hurricane" 
                      style={{ 
                        color: 'white',
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        fontSize: '14px',
                        borderRadius: '6px',
                        margin: '2px 0'
                      }}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      Hurricanes
                    </SelectItem>
                    <SelectItem 
                      value="wildfire" 
                      style={{ 
                        color: 'white',
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        fontSize: '14px',
                        borderRadius: '6px',
                        margin: '2px 0'
                      }}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      Wildfires
                    </SelectItem>
                    <SelectItem 
                      value="earthquake" 
                      style={{ 
                        color: 'white',
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        fontSize: '14px',
                        borderRadius: '6px',
                        margin: '2px 0'
                      }}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      Earthquakes
                    </SelectItem>
                    <SelectItem 
                      value="severe-weather" 
                      style={{ 
                        color: 'white',
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        fontSize: '14px',
                        borderRadius: '6px',
                        margin: '2px 0'
                      }}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      Severe Weather
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSource} onValueChange={setFilterSource}>
                  <SelectTrigger 
                    className="w-[150px] h-9"
                    style={{
                      background: 'rgba(26, 31, 55, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: 'white',
                      fontFamily: 'Plus Jakarta Display, sans-serif',
                      fontSize: '14px',
                      fontWeight: '400'
                    }}
                  >
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-50"
                    style={{ 
                      background: 'rgba(26, 31, 55, 0.95)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                      padding: '4px'
                    }}
                  >
                    <SelectItem 
                      value="all" 
                      style={{ 
                        color: 'white',
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        fontSize: '14px',
                        borderRadius: '6px',
                        margin: '2px 0'
                      }}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      All Sources
                    </SelectItem>
                    <SelectItem 
                      value="live" 
                      style={{ 
                        color: 'white',
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        fontSize: '14px',
                        borderRadius: '6px',
                        margin: '2px 0'
                      }}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      Live
                    </SelectItem>
                    <SelectItem 
                      value="mock" 
                      style={{ 
                        color: 'white',
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        fontSize: '14px',
                        borderRadius: '6px',
                        margin: '2px 0'
                      }}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      Mock
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort Section */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: '#A0AEC0' }}>Sort by:</span>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "most-recent" ? "default" : "outline"}
                  onClick={() => setSortBy("most-recent")}
                  size="sm"
                  style={{
                    background: sortBy === "most-recent" ? '#0075FF' : 'rgba(26, 31, 55, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderRadius: '8px'
                  }}
                >
                  Most Recent
                </Button>
                <Button
                  variant={sortBy === "highest-risk" ? "default" : "outline"}
                  onClick={() => setSortBy("highest-risk")}
                  size="sm"
                  style={{
                    background: sortBy === "highest-risk" ? '#0075FF' : 'rgba(26, 31, 55, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderRadius: '8px'
                  }}
                >
                  Highest Risk
                </Button>
                <Button
                  variant={sortBy === "by-type" ? "default" : "outline"}
                  onClick={() => setSortBy("by-type")}
                  size="sm"
                  style={{
                    background: sortBy === "by-type" ? '#0075FF' : 'rgba(26, 31, 55, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderRadius: '8px'
                  }}
                >
                  By Type
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Disasters Grid */}
      <div>
        <div className="mb-4" style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}>
          <h2 className="text-xl font-bold" style={{ color: 'white', fontFamily: 'Plus Jakarta Display, sans-serif' }}>
            Active Disasters ({filteredAndSortedDisasters.length})
          </h2>
        </div>
        
        {isLoading ? (
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
            
            <div 
              className="relative z-10 p-12 text-center"
              style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
            >
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#A0AEC0' }} />
              <p style={{ color: '#A0AEC0' }}>Loading disaster data...</p>
            </div>
          </div>
        ) : filteredAndSortedDisasters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedDisasters.map((disaster: any, idx: number) => {
              const IconComponent = getDisasterIcon(disaster);
              const lastUpdated = formatDate(disaster.lastUpdated || disaster.timestamp || disaster.time);
              const riskColor = getRiskLevelColor(disaster.riskLevel || 'MONITORING');
              const sourceColor = getSourceColor(disaster.source || 'LIVE');
              
              return (
                <div
                  key={disaster.id || idx}
                  className="relative cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                  onClick={() => handleAnalyzeImpact(disaster)}
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
                    style={{ 
                      fontFamily: 'Plus Jakarta Display, sans-serif',
                    }}
                  >
                    {/* Type and Status Tags */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(0, 117, 255, 0.2)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <IconComponent className="h-5 w-5" style={{ color: '#0075FF' }} />
                        </div>
                        <div>
                          <p 
                            className="text-xs font-medium uppercase tracking-wide" 
                            style={{ 
                              color: '#A0AEC0',
                              fontSize: '11px',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {disaster.displayType || disaster.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end">
                        <span
                          className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide"
                          style={{
                            background: sourceColor.bg,
                            border: `1px solid ${sourceColor.border}`,
                            color: sourceColor.color,
                            fontFamily: 'monospace',
                            letterSpacing: '0.5px'
                          }}
                        >
                          [{disaster.source || 'LIVE'}]
                        </span>
                        <span
                          className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide"
                          style={{
                            background: riskColor.bg,
                            border: `1px solid ${riskColor.border}`,
                            color: riskColor.color,
                            fontFamily: 'monospace',
                            letterSpacing: '0.5px'
                          }}
                        >
                          [{disaster.riskLevel || 'MONITORING'}]
                        </span>
                      </div>
                    </div>
                    
                    {/* Disaster Name */}
                    <h3 
                      className="font-bold text-xl mb-3 break-words" 
                      style={{ 
                        color: 'white', 
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        lineHeight: '1.3',
                        fontSize: '20px'
                      }}
                    >
                      {disaster.displayName || disaster.name}
                    </h3>
                    
                    {/* Location */}
                    <p 
                      className="text-sm mb-4 break-words" 
                      style={{ 
                        color: '#A0AEC0', 
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        lineHeight: '1.5'
                      }}
                    >
                      {disaster.location}
                    </p>
                    
                    {/* Analyze Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyzeImpact(disaster);
                      }}
                      disabled={analyzeImpact.isPending}
                      className="w-full"
                      style={{
                        background: '#0075FF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        marginTop: 'auto'
                      }}
                    >
                      {analyzeImpact.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Analyze Impact
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
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
            
            <div 
              className="relative z-10 p-12 text-center"
              style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
            >
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" style={{ color: '#94A3B8' }} />
              <p className="text-lg font-medium mb-2" style={{ color: 'white', fontFamily: 'Plus Jakarta Display, sans-serif' }}>
                No Active Disasters
              </p>
              <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Display, sans-serif' }}>
                There are currently no active disasters to display. The system will automatically update when new disasters are detected.
              </p>
              <Button
                onClick={handleRefresh}
                className="mt-4"
                style={{
                  background: '#0075FF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontFamily: 'Plus Jakarta Display, sans-serif'
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Disaster Impact Popup */}
      <DisasterImpactPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        analysisData={analysisData}
        selectedDisaster={selectedDisaster}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
