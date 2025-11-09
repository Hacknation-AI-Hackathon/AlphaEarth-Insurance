import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, Flame, Wind, Cloud, Zap, Loader2 } from "lucide-react";
import { useActiveDisasters, useHurricanes, useWildfires, useActiveEarthquakes, useActiveSevereWeather } from "@/hooks/useDisasters";
import { useState, useMemo } from "react";
import { apiClient } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DisasterImpactPopup } from "@/components/DisasterImpactPopup";

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

  // Check if any data is loading
  const isLoading = hurricanesLoading || wildfiresLoading || earthquakesLoading || severeWeatherLoading;

  // Combine all disasters
  const allDisasters = useMemo(() => {
    const disasters: any[] = [];
    
    // Debug logging
    console.log("Impact Map - Disaster Data:", {
      hurricanes: hurricanesData,
      wildfires: wildfiresData,
      earthquakes: earthquakesData,
      severeWeather: severeWeatherData
    });
    
    // Add hurricanes
    if (hurricanesData?.data && Array.isArray(hurricanesData.data)) {
      hurricanesData.data.forEach((h: any) => {
        disasters.push({
          ...h,
          type: 'hurricane',
          icon: Wind,
          statusTags: ['mock'],
          name: h.name || `Hurricane ${h.id}`,
          location: h.location || h.region || 'Unknown',
          isRealTime: false
        });
      });
    }
    
    // Add wildfires
    if (wildfiresData?.data && Array.isArray(wildfiresData.data)) {
      wildfiresData.data.forEach((w: any, idx: number) => {
        disasters.push({
          ...w,
          type: 'wildfire',
          icon: Flame,
          statusTags: ['mock'],
          name: w.name || `Active Fire ${idx + 1}`,
          location: w.location || w.region || 'United States',
          isRealTime: false
        });
      });
    }
    
    // Add earthquakes - only keep one (the oldest one to remove the duplicate)
    if (earthquakesData?.data && Array.isArray(earthquakesData.data) && earthquakesData.data.length > 0) {
      // Sort earthquakes by date (oldest first) and take only the first one (oldest)
      const sortedEarthquakes = [...earthquakesData.data].sort((a, b) => {
        const dateA = new Date(a.time || a.timestamp || 0);
        const dateB = new Date(b.time || b.timestamp || 0);
        return dateA.getTime() - dateB.getTime(); // Oldest first
      });
      
      // Take only the oldest earthquake (first in sorted array)
      const e = sortedEarthquakes[0];
      
      // Format earthquake title - simple format with magnitude only
      let earthquakeTitle = 'Earthquake';
      
      // Use magnitude if available, otherwise just "Earthquake"
      if (e.mag) {
        earthquakeTitle = `M ${e.mag} Earthquake`;
      }
      
      disasters.push({
        ...e,
        type: 'earthquake',
        icon: AlertTriangle,
        statusTags: ['active'],
        name: earthquakeTitle,
        location: e.place || 'Unknown',
        isRealTime: true
      });
    }
    
    // Add severe weather
    if (severeWeatherData?.data && Array.isArray(severeWeatherData.data)) {
      severeWeatherData.data.forEach((s: any) => {
        // Format flood/severe weather title - extract just the warning type
        let weatherTitle = 'Severe Weather Warning';
        
        if (s.headline) {
          // Extract warning type by splitting on "issued" or "by"
          // Example: "Flood Warning issued November 8 at 8:01PM EST by NWS Melbourne FL"
          // Result: "Flood Warning"
          
          let cleanHeadline = s.headline.trim();
          
          // Split on "issued" - take the part before it
          if (cleanHeadline.toLowerCase().includes('issued')) {
            const parts = cleanHeadline.split(/issued/i);
            cleanHeadline = parts[0].trim();
          }
          
          // Split on "by" - take the part before it
          if (cleanHeadline.toLowerCase().includes(' by ')) {
            const parts = cleanHeadline.split(/\s+by\s+/i);
            cleanHeadline = parts[0].trim();
          }
          
          // Use the cleaned headline as the title
          if (cleanHeadline && cleanHeadline.length > 0) {
            weatherTitle = cleanHeadline;
            
            // If still too long, truncate
            if (weatherTitle.length > 50) {
              weatherTitle = weatherTitle.substring(0, 47).trim() + '...';
            }
          }
        }
        
        disasters.push({
          ...s,
          type: 'severe-weather',
          icon: Cloud,
          statusTags: ['active'],
          name: weatherTitle,
          location: s.areaDesc || 'Unknown',
          isRealTime: true
        });
      });
    }
    
    console.log("Impact Map - Combined Disasters:", disasters.length);
    
    // Sort: real-time disasters (earthquakes and severe-weather) first, then by date
    return disasters.sort((a, b) => {
      // Prioritize real-time disasters
      const aIsRealTime = a.isRealTime || a.type === 'earthquake' || a.type === 'severe-weather';
      const bIsRealTime = b.isRealTime || b.type === 'earthquake' || b.type === 'severe-weather';
      
      if (aIsRealTime && !bIsRealTime) return -1;
      if (!aIsRealTime && bIsRealTime) return 1;
      
      // Within same category, sort by date
      const dateA = new Date(a.lastUpdated || a.timestamp || a.time || 0);
      const dateB = new Date(b.lastUpdated || b.timestamp || b.time || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [hurricanesData, wildfiresData, earthquakesData, severeWeatherData]);

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

  // Get status tag color
  const getStatusTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'active':
        return { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.3)', color: '#22C55E' };
      case 'critical':
        return { bg: 'rgba(156, 163, 175, 0.2)', border: 'rgba(156, 163, 175, 0.3)', color: '#9CA3AF' };
      case 'mock':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.3)', color: '#EF4444' };
      case 'warning':
        return { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.3)', color: '#22C55E' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', border: 'rgba(148, 163, 184, 0.3)', color: '#94A3B8' };
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

      {/* Active Disasters Grid */}
      <div>
        <div className="mb-4" style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}>
          <h2 className="text-xl font-bold" style={{ color: 'white', fontFamily: 'Plus Jakarta Display, sans-serif' }}>
            Active Disasters
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
        ) : allDisasters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allDisasters.map((disaster: any, idx: number) => {
              const IconComponent = getDisasterIcon(disaster);
              const lastUpdated = formatDate(disaster.lastUpdated || disaster.timestamp || disaster.time);
              
              return (
                <div
                  key={disaster.id || idx}
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
                    style={{ 
                      fontFamily: 'Plus Jakarta Display, sans-serif',
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        style={{
                          width: '45px',
                          height: '45px',
                          background: '#0075FF',
                          boxShadow: '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex flex-col gap-1 items-end flex-shrink-0 ml-2">
                        {disaster.statusTags?.map((tag: string, tagIdx: number) => {
                          const tagColor = getStatusTagColor(tag);
                          return (
                            <span
                              key={tagIdx}
                              className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                              style={{
                                background: tagColor.bg,
                                border: `1px solid ${tagColor.border}`,
                                color: tagColor.color
                              }}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    
                    <h3 
                      className="font-bold text-lg mb-2 break-words" 
                      style={{ 
                        color: 'white', 
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        lineHeight: '1.4'
                      }}
                    >
                      {disaster.name}
                    </h3>
                    <p 
                      className="text-sm mb-2 break-words" 
                      style={{ 
                        color: '#A0AEC0', 
                        fontFamily: 'Plus Jakarta Display, sans-serif' 
                      }}
                    >
                      {disaster.location}
                    </p>
                    <p 
                      className="text-xs mb-4" 
                      style={{ 
                        color: '#718096', 
                        fontFamily: 'Plus Jakarta Display, sans-serif' 
                      }}
                    >
                      Updated {lastUpdated}
                    </p>
                    
                    <Button
                      onClick={() => handleAnalyzeImpact(disaster)}
                      disabled={analyzeImpact.isPending}
                      className="w-full"
                      style={{
                        background: '#0075FF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontFamily: 'Plus Jakarta Display, sans-serif'
                      }}
                    >
                      {analyzeImpact.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Analyze Impact &gt;
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
