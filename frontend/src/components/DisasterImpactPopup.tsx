import { Dialog, DialogPortal, DialogOverlay, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useCallback } from "react";

interface DisasterImpactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: any;
  selectedDisaster: any;
  onRefresh?: () => void;
}

export const DisasterImpactPopup = ({ isOpen, onClose, analysisData, selectedDisaster, onRefresh }: DisasterImpactPopupProps) => {
  if (!analysisData) return null;

  // State for selected risk levels (all active by default)
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<Set<string>>(new Set(['critical', 'high', 'moderate', 'low']));

  // Calculate summary metrics from analysis data
  const riskDistribution = analysisData?.riskDistribution || {};
  const aiSummary = analysisData?.aiSummary || null;
  const portfolioMetrics = analysisData?.portfolioMetrics || {};
  
  const totalProperties = portfolioMetrics.totalProperties || 5000;
  const expectedLoss = portfolioMetrics.expectedLoss || 36300000;
  
  const criticalCount = riskDistribution.critical?.count || 0;
  const highCount = riskDistribution.high?.count || 0;
  const moderateCount = riskDistribution.moderate?.count || 0;
  const lowCount = riskDistribution.low?.count || totalProperties;

  // Get properties data for map visualization - use ALL properties, not just top risk
  const riskAssessments = analysisData?.riskAssessments || [];
  const allProperties = analysisData?.properties || [];
  // Use riskAssessments if available (includes all properties with risk data), otherwise use allProperties
  const properties = riskAssessments.length > 0 ? riskAssessments : allProperties;
  
  // Get disaster coordinates if available
  const disasterCoordinates = analysisData?.disaster?.coordinates || selectedDisaster?.coordinates;
  
  // Format currency function
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Toggle risk level selection
  const toggleRiskLevel = (level: string) => {
    setSelectedRiskLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  // Map component for property visualization
  const ImpactMap = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const leafletRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    // Function to update markers on the map - memoized with useCallback
    const updateMarkers = useCallback(() => {
      if (!mapInstanceRef.current) return;
      
      const map = mapInstanceRef.current;
      const L = leafletRef.current;
      if (!L) return;

      // Remove all existing markers
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current = [];

      // Filter properties based on selected risk levels
      const filteredProperties = properties.filter((property: any) => {
        const riskLevel = (property.riskLevel || property.risk_category || property.riskCategory || 'low').toLowerCase();
        return selectedRiskLevels.has(riskLevel);
      });

      // Process ALL properties (no limit)
      const validProperties: Array<{ lat: number; lon: number; property: any }> = [];
      
      filteredProperties.forEach((property: any) => {
        // Try different coordinate formats
        let lat: number | null = null;
        let lon: number | null = null;
        
        if (property.latitude && property.longitude) {
          lat = property.latitude;
          lon = property.longitude;
        } else if (property.lat && property.lon) {
          lat = property.lat;
          lon = property.lon;
        } else if (property.coordinates) {
          lat = property.coordinates.lat;
          lon = property.coordinates.lon;
        } else if (property.location && property.location.latitude && property.location.longitude) {
          lat = property.location.latitude;
          lon = property.location.longitude;
        }
        
        if (!lat || !lon) return;
        validProperties.push({ lat, lon, property });
      });
      
      // Create markers for filtered properties
      validProperties.forEach(({ lat, lon, property }) => {
        const riskLevel = (property.riskLevel || property.risk_category || property.riskCategory || 'low').toLowerCase();
        let markerColor = '#22C55E'; // Low - green
        
        switch (riskLevel) {
          case 'critical':
            markerColor = '#EF4444'; // Red
            break;
          case 'high':
            markerColor = '#F97316'; // Orange
            break;
          case 'moderate':
            markerColor = '#EAB308'; // Yellow
            break;
          default:
            markerColor = '#22C55E'; // Green
        }

        // Create custom icon with risk color
        const customIcon = L.divIcon({
          className: 'risk-marker',
          html: `<div style="
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: ${markerColor};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([lat, lon], { icon: customIcon });
        
        // Add popup with property info
        const address = property.address || property.propertyAddress || property.name || 'Property';
        const displayRiskLevel = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
        const popupContent = `
          <div style="color: #1A1F37; font-family: 'Plus Jakarta Display', sans-serif; font-size: 12px;">
            <strong>${address}</strong><br/>
            Risk: <strong style="color: ${markerColor}; text-transform: capitalize;">${displayRiskLevel}</strong><br/>
            ${property.expectedLoss ? `Expected Loss: ${formatCurrency(property.expectedLoss)}<br/>` : ''}
            ${property.insuredValue ? `Insured Value: ${formatCurrency(property.insuredValue)}` : ''}
          </div>
        `;
        marker.bindPopup(popupContent);
        marker.addTo(map);
        markersRef.current.push(marker);
      });

      // Fit bounds to show all visible markers
      if (validProperties.length > 0) {
        const bounds = validProperties.map(({ lat, lon }) => [lat, lon] as [number, number]);
        if (bounds.length > 0) {
          try {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
          } catch (e) {
            console.warn('Failed to fit bounds:', e);
          }
        }
      } else if (disasterCoordinates && disasterCoordinates.lat && disasterCoordinates.lon) {
        // If no properties visible but we have disaster coordinates, center on disaster
        map.setView([disasterCoordinates.lat, disasterCoordinates.lon], 10);
      }
    }, [properties, selectedRiskLevels, formatCurrency, disasterCoordinates]);

    // Initialize map
    useEffect(() => {
      const initMap = async () => {
        if (!mapRef.current || !isOpen) return;

        try {
          const L = (await import("leaflet")).default;
          await import("leaflet/dist/leaflet.css");
          leafletRef.current = L;

          // Fix marker icon
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          });

          // Clear existing map
          if (mapInstanceRef.current) {
            markersRef.current.forEach(marker => {
              mapInstanceRef.current.removeLayer(marker);
            });
            markersRef.current = [];
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }

          // Determine map center from disaster location or properties
          let mapCenter: [number, number] = [39.8283, -98.5795]; // Default: US center
          
          if (disasterCoordinates && disasterCoordinates.lat && disasterCoordinates.lon) {
            mapCenter = [disasterCoordinates.lat, disasterCoordinates.lon];
          } else if (properties.length > 0) {
            // Try to get center from first property
            const firstProp = properties[0];
            if (firstProp.latitude && firstProp.longitude) {
              mapCenter = [firstProp.latitude, firstProp.longitude];
            } else if (firstProp.lat && firstProp.lon) {
              mapCenter = [firstProp.lat, firstProp.lon];
            } else if (firstProp.coordinates) {
              mapCenter = [firstProp.coordinates.lat, firstProp.coordinates.lon];
            }
          } else if (selectedDisaster?.location) {
            // Try to get coordinates from location string (basic fallback)
            const location = selectedDisaster.location.toLowerCase();
            if (location.includes('florida') || location.includes('gulf coast')) {
              mapCenter = [27.7663, -82.6404];
            } else if (location.includes('california') || location.includes('northern california')) {
              mapCenter = [36.7783, -119.4179];
            } else if (location.includes('atlantic')) {
              mapCenter = [35.2271, -80.8431];
            }
          }

          // Create map
          const map = L.map(mapRef.current, {
            zoomControl: true,
            attributionControl: true,
          }).setView(mapCenter, 8);

          // Add OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);

          mapInstanceRef.current = map;
          
          // Wait for map to initialize, then add markers
          setTimeout(() => {
            updateMarkers();
          }, 100);
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      };

      if (isOpen) {
        initMap();
      }

      return () => {
        if (mapInstanceRef.current) {
          markersRef.current.forEach(marker => {
            mapInstanceRef.current.removeLayer(marker);
          });
          markersRef.current = [];
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        leafletRef.current = null;
      };
    }, [isOpen, properties, selectedDisaster, disasterCoordinates, updateMarkers]);

    // Update markers when risk level selection changes
    useEffect(() => {
      if (mapInstanceRef.current && isOpen && leafletRef.current) {
        updateMarkers();
      }
    }, [selectedRiskLevels, isOpen, updateMarkers]);

    return (
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{
          minHeight: '400px',
          background: 'rgba(26, 31, 55, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />
    );
  };

  return (
    <>
      <style>{`
        /* Custom scrollbar styling for the popup to match dark theme */
        .disaster-impact-popup::-webkit-scrollbar {
          width: 10px;
        }
        .disaster-impact-popup::-webkit-scrollbar-track {
          background: rgba(6, 11, 38, 0.8);
          border-radius: 5px;
          margin: 5px 0;
        }
        .disaster-impact-popup::-webkit-scrollbar-thumb {
          background: rgba(160, 174, 192, 0.4);
          border-radius: 5px;
          border: 2px solid rgba(6, 11, 38, 0.8);
        }
        .disaster-impact-popup::-webkit-scrollbar-thumb:hover {
          background: rgba(160, 174, 192, 0.6);
        }
        /* Firefox scrollbar */
        .disaster-impact-popup {
          scrollbar-width: thin;
          scrollbar-color: rgba(160, 174, 192, 0.4) rgba(6, 11, 38, 0.8);
        }
        /* Glassmorphic overlay */
        [data-radix-dialog-overlay] {
          background: rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(10px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(10px) saturate(180%) !important;
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-50 w-full max-w-6xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] disaster-impact-popup overflow-y-auto"
            )}
            style={{
              background: 'linear-gradient(93deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.04) 100%)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              backdropFilter: 'blur(21px) saturate(180%)',
              WebkitBackdropFilter: 'blur(21px) saturate(180%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              color: 'white'
            }}
          >
            <DialogHeader className="flex flex-row items-center justify-between mb-6 pr-0">
              <DialogTitle 
                className="text-2xl font-bold m-0"
                style={{ color: 'white', fontFamily: 'Plus Jakarta Display, sans-serif' }}
              >
                Disaster Impact Analysis
              </DialogTitle>
              <button
                onClick={onClose}
                className="rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 disabled:pointer-events-none flex-shrink-0 ml-4"
                style={{
                  color: 'white',
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </DialogHeader>

            <div className="space-y-6" style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}>
              {/* AI Executive Summary */}
              {aiSummary && (
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
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#0075FF', fontFamily: 'Plus Jakarta Display, sans-serif' }}>
                      AI Executive Summary
                    </h3>
                    <h4 className="text-base font-semibold mb-4" style={{ color: 'white', fontFamily: 'Plus Jakarta Display, sans-serif' }}>
                      # {selectedDisaster?.type?.toUpperCase() || 'EARTHQUAKE'} INCIDENT - EXECUTIVE SUMMARY
                    </h4>
                    <div className="space-y-4 text-sm" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Display, sans-serif' }}>
                      <div>
                        <h5 className="font-bold mb-2" style={{ color: 'white' }}>## Situation Overview</h5>
                        <p>{aiSummary.situationOverview || 'A disaster has been detected affecting our regional portfolio.'}</p>
                      </div>
                      <div>
                        <h5 className="font-bold mb-2" style={{ color: 'white' }}>## Financial Exposure</h5>
                        <p>{aiSummary.financialExposure || 'Financial exposure analysis details will be displayed here.'}</p>
                      </div>
                      <div>
                        <h5 className="font-bold mb-2" style={{ color: 'white' }}>## Immediate Actions Required</h5>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li><strong>Deploy field assessment team</strong> within 24 hours for ground-truth validation</li>
                          <li><strong>Activate emergency claims hotline</strong> for policyholders in affected areas</li>
                          <li><strong>Review and validate loss models</strong> - discrepancy analysis required</li>
                        </ol>
                      </div>
                      <div>
                        <h5 className="font-bold mb-2" style={{ color: 'white' }}>## Claims Team Preparation</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Expect 50-100 initial claims within 72 hours</li>
                          <li>Prioritize inspections for high-value properties</li>
                          <li>Coordinate with local contractors for rapid damage assessment</li>
                        </ul>
                      </div>
                      <div>
                        <p><strong style={{ color: 'white' }}>Status:</strong> YELLOW - Monitor closely, prepared for escalation</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Impact Zone Map and Risk Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Impact Zone Map */}
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
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div 
                          style={{
                            width: '45px',
                            height: '45px',
                            background: '#0075FF',
                            boxShadow: '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold" style={{ color: 'white', fontFamily: 'Plus Jakarta Display, sans-serif' }}>Impact Zone Map</h3>
                      </div>
                      {onRefresh && (
                        <Button
                          size="sm"
                          onClick={onRefresh}
                          style={{
                            background: '#0075FF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontFamily: 'Plus Jakarta Display, sans-serif'
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Refresh
                        </Button>
                      )}
                    </div>
                    <p className="text-sm mb-4" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Display, sans-serif' }}>
                      {selectedDisaster?.type === 'earthquake' 
                        ? `${selectedDisaster?.magnitude || 'M 4.8'} - ${selectedDisaster?.location || 'Location'} - Properties color-coded by risk level`
                        : `${selectedDisaster?.name || 'Disaster'} - Properties color-coded by risk level`}
                    </p>
                    
                    {/* Leaflet Map */}
                    <div className="mb-4">
                      <ImpactMap />
                    </div>
                    <p className="text-xs mb-4" style={{ color: '#718096', fontFamily: 'Plus Jakarta Display, sans-serif' }}>
                      Click on risk level buttons to filter properties on the map. All levels are visible by default.
                    </p>
                    
                    {/* Risk Level Legend - Interactive Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleRiskLevel('critical')}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border-2"
                        style={{ 
                          background: selectedRiskLevels.has('critical') ? '#EF4444' : 'rgba(239, 68, 68, 0.3)',
                          color: 'white',
                          borderColor: selectedRiskLevels.has('critical') ? '#EF4444' : 'rgba(239, 68, 68, 0.5)',
                          fontFamily: 'Plus Jakarta Display, sans-serif',
                          opacity: selectedRiskLevels.has('critical') ? 1 : 0.6
                        }}
                      >
                        Critical: {criticalCount}
                      </button>
                      <button
                        onClick={() => toggleRiskLevel('high')}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border-2"
                        style={{ 
                          background: selectedRiskLevels.has('high') ? '#F97316' : 'rgba(249, 115, 22, 0.3)',
                          color: 'white',
                          borderColor: selectedRiskLevels.has('high') ? '#F97316' : 'rgba(249, 115, 22, 0.5)',
                          fontFamily: 'Plus Jakarta Display, sans-serif',
                          opacity: selectedRiskLevels.has('high') ? 1 : 0.6
                        }}
                      >
                        High: {highCount}
                      </button>
                      <button
                        onClick={() => toggleRiskLevel('moderate')}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border-2"
                        style={{ 
                          background: selectedRiskLevels.has('moderate') ? '#EAB308' : 'rgba(234, 179, 8, 0.3)',
                          color: 'white',
                          borderColor: selectedRiskLevels.has('moderate') ? '#EAB308' : 'rgba(234, 179, 8, 0.5)',
                          fontFamily: 'Plus Jakarta Display, sans-serif',
                          opacity: selectedRiskLevels.has('moderate') ? 1 : 0.6
                        }}
                      >
                        Moderate: {moderateCount}
                      </button>
                      <button
                        onClick={() => toggleRiskLevel('low')}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border-2"
                        style={{ 
                          background: selectedRiskLevels.has('low') ? '#22C55E' : 'rgba(34, 197, 94, 0.3)',
                          color: 'white',
                          borderColor: selectedRiskLevels.has('low') ? '#22C55E' : 'rgba(34, 197, 94, 0.5)',
                          fontFamily: 'Plus Jakarta Display, sans-serif',
                          opacity: selectedRiskLevels.has('low') ? 1 : 0.6
                        }}
                      >
                        Low: {lowCount}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Risk Distribution */}
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
                    <h3 className="text-lg font-bold mb-1" style={{ color: 'white', fontFamily: 'Plus Jakarta Display, sans-serif' }}>Risk Distribution</h3>
                    <p className="text-sm mb-6" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Display, sans-serif' }}>Properties by risk tier</p>
                    
                    <div className="space-y-4">
                      {/* Critical */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium" style={{ color: 'white', fontFamily: 'Plus Jakarta Display, sans-serif' }}>Critical</span>
                          <span className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Display, sans-serif' }}>
                            {criticalCount} properties • {formatCurrency(riskDistribution.critical?.loss || 0)}
                          </span>
                        </div>
                        <div 
                          className="h-2 rounded-full"
                          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                        >
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${totalProperties > 0 ? (criticalCount / totalProperties) * 100 : 0}%`,
                              background: '#EF4444'
                            }}
                          />
                        </div>
                      </div>

                      {/* High */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium" style={{ color: 'white', fontFamily: 'Plus Jakarta Display, sans-serif' }}>High</span>
                          <span className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Display, sans-serif' }}>
                            {highCount} properties • {formatCurrency(riskDistribution.high?.loss || 0)}
                          </span>
                        </div>
                        <div 
                          className="h-2 rounded-full"
                          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                        >
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${totalProperties > 0 ? (highCount / totalProperties) * 100 : 0}%`,
                              background: '#F97316'
                            }}
                          />
                        </div>
                      </div>

                      {/* Moderate */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium" style={{ color: 'white', fontFamily: 'Plus Jakarta Display, sans-serif' }}>Moderate</span>
                          <span className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Display, sans-serif' }}>
                            {moderateCount} properties • {formatCurrency(riskDistribution.moderate?.loss || 0)}
                          </span>
                        </div>
                        <div 
                          className="h-2 rounded-full"
                          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                        >
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${totalProperties > 0 ? (moderateCount / totalProperties) * 100 : 0}%`,
                              background: '#EAB308'
                            }}
                          />
                        </div>
                      </div>

                      {/* Low */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium" style={{ color: 'white', fontFamily: 'Plus Jakarta Display, sans-serif' }}>Low</span>
                          <span className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Display, sans-serif' }}>
                            {lowCount} properties • {formatCurrency(riskDistribution.low?.loss || expectedLoss)}
                          </span>
                        </div>
                        <div 
                          className="h-2 rounded-full"
                          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                        >
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${totalProperties > 0 ? (lowCount / totalProperties) * 100 : 100}%`,
                              background: '#22C55E'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
};

