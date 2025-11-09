import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, Droplets, Flame, Wind, Check, ArrowRight } from "lucide-react";

const mockLocations = [
  { 
    name: "San Francisco, CA", 
    lat: 37.7749, 
    lon: -122.4194, 
    flood: 15, 
    wildfire: 45, 
    storm: 25,
    description: "Coastal city with moderate climate risks",
    population: "873,965"
  },
  { 
    name: "Miami, FL", 
    lat: 25.7617, 
    lon: -80.1918, 
    flood: 75, 
    wildfire: 10, 
    storm: 65,
    description: "High flood and storm risk coastal area",
    population: "442,241"
  },
  { 
    name: "Houston, TX", 
    lat: 29.7604, 
    lon: -95.3698, 
    flood: 60, 
    wildfire: 20, 
    storm: 55,
    description: "Urban area with significant flood risk",
    population: "2,304,580"
  },
];

// Custom Map Component for Large Display
const LargeMapView = ({ lat, lon, name, riskScore }: { lat: number; lon: number; name: string; riskScore: number }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current).setView([lat, lon], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lon]).addTo(map);
      
      if (riskScore > 0) {
        const circleColor = riskScore < 40 ? "#22c55e" : riskScore < 70 ? "#eab308" : "#ef4444";
        const circleRadius = (riskScore / 100) * 5000;
        
        L.circle([lat, lon], {
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.2,
          radius: circleRadius,
        }).addTo(map);
      }
      
      marker.bindPopup(`<strong>${name}</strong><br/>Risk Score: ${riskScore}/100`);

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon, name, riskScore]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />;
};

const Demo = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(mockLocations[0]);
  const [searchQuery, setSearchQuery] = useState("");

  // Prevent body scrolling and set font
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalHtmlStyle = window.getComputedStyle(document.documentElement).overflow;
    const originalBodyFont = document.body.style.fontFamily;
    
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.body.style.fontFamily = 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif';
    
    return () => {
      document.body.style.overflow = originalStyle;
      document.documentElement.style.overflow = originalHtmlStyle;
      document.body.style.fontFamily = originalBodyFont;
    };
  }, []);

  const getRiskLevel = (score: number): { label: string; color: string; bgColor: string } => {
    if (score < 30) return { label: "Low Risk", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.1)" };
    if (score < 60) return { label: "Medium Risk", color: "#eab308", bgColor: "rgba(234, 179, 8, 0.1)" };
    if (score < 80) return { label: "High Risk", color: "#f97316", bgColor: "rgba(249, 115, 22, 0.1)" };
    return { label: "Critical Risk", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.1)" };
  };

  const overallRisk = Math.round((selectedLocation.flood + selectedLocation.wildfire + selectedLocation.storm) / 3);
  const riskLevel = getRiskLevel(overallRisk);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        @media (max-width: 1023px) {
          .demo-main-grid {
            grid-template-columns: 1fr !important;
          }
          .demo-map-panel {
            position: relative !important;
            top: auto !important;
            order: 2;
          }
          .demo-options-panel {
            order: 1;
          }
        }
      `}</style>
      <div className="min-h-screen" style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)',
        fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
      {/* Top Navigation Bar - Apple Style */}
      <div style={{
        position: 'fixed',
        top: 'clamp(1.5rem, 3vh, 2rem)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(95%, 987.5px)',
        height: '70px',
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        border: '1px solid rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(21px) saturate(180%)',
        WebkitBackdropFilter: 'blur(21px) saturate(180%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(1rem, 2vw, 1.5rem)',
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        {/* ALPHA EARTH Logo */}
        <div 
          onClick={() => navigate('/')}
          style={{
            color: '#1d1d1f',
            fontSize: 'clamp(12px, 1.2vw, 16px)',
            fontWeight: 400,
            letterSpacing: '2.52px',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          ALPHA EARTH
        </div>
        
        {/* Navigation Items */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(0.5rem, 1vw, 1rem)',
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}>
          {/* HOME */}
          <div 
            onClick={() => navigate('/')}
            style={{
              padding: '4px 8px',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ 
              color: '#1d1d1f', 
              fontSize: 'clamp(9px, 0.8vw, 12px)', 
              fontWeight: 400,
              letterSpacing: '2.52px',
              whiteSpace: 'nowrap'
            }}>HOME</div>
          </div>
          
          {/* FEATURES */}
          <div 
            onClick={() => navigate('/')}
            style={{
              padding: '4px 8px',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ 
              color: '#1d1d1f', 
              fontSize: 'clamp(9px, 0.8vw, 12px)', 
              fontWeight: 400,
              letterSpacing: '2.52px',
              whiteSpace: 'nowrap'
            }}>FEATURES</div>
          </div>
          
          {/* DEMO */}
          <div style={{
            padding: '4px 8px',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            opacity: 0.7
          }}>
            <div style={{ 
              color: '#1d1d1f', 
              fontSize: 'clamp(9px, 0.8vw, 12px)', 
              fontWeight: 400,
              letterSpacing: '2.52px',
              whiteSpace: 'nowrap'
            }}>DEMO</div>
          </div>
          
          {/* SIGN IN */}
          <div 
            onClick={() => navigate('/signin')}
            style={{
              padding: '4px 8px',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ 
              color: '#1d1d1f', 
              fontSize: 'clamp(9px, 0.8vw, 12px)', 
              fontWeight: 400,
              letterSpacing: '2.52px',
              whiteSpace: 'nowrap'
            }}>SIGN IN</div>
          </div>
          
          {/* SIGN UP Button */}
          <button 
            onClick={() => navigate('/signup')}
            style={{
              padding: '8px clamp(12px, 1.5vw, 16px)',
              background: '#0071e3',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              fontSize: 'clamp(9px, 0.8vw, 12px)',
              fontWeight: 400,
              letterSpacing: '2.52px',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0077ed';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0071e3';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            SIGN UP
          </button>
        </div>
      </div>

      {/* Hero Section - Apple Style */}
      <section style={{
        paddingTop: 'clamp(120px, 15vh, 140px)',
        paddingBottom: 'clamp(40px, 6vh, 60px)',
        textAlign: 'center',
        maxWidth: '980px',
        margin: '0 auto',
        paddingLeft: 'clamp(16px, 4vw, 22px)',
        paddingRight: 'clamp(16px, 4vw, 22px)'
      }}>
        <div style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          lineHeight: '1.07143',
          fontWeight: 600,
          letterSpacing: '-0.005em',
          color: '#1d1d1f',
          marginBottom: '6px'
        }}>
          Real-Time Risk Assessment
        </div>
        <div style={{
          fontSize: 'clamp(17px, 2.5vw, 28px)',
          lineHeight: '1.14286',
          fontWeight: 400,
          letterSpacing: '0.007em',
          color: '#86868b',
          marginBottom: '32px',
          maxWidth: '680px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Enter any address or coordinates to get instant climate risk analysis powered by satellite data
        </div>

        {/* Search Bar - Top */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #d2d2d7',
            background: 'white',
            transition: 'border-color 0.2s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#0071e3';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 113, 227, 0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#d2d2d7';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
          }}
          >
            <Search size={20} color="#86868b" />
            <Input
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '17px',
                flex: 1,
                background: 'transparent',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      </section>

      {/* Main Content - Apple Style: Big Map Left, Options Right */}
      <section style={{
        maxWidth: '1400px',
        margin: '0 auto',
        paddingLeft: 'clamp(16px, 4vw, 44px)',
        paddingRight: 'clamp(16px, 4vw, 44px)',
        marginBottom: 'clamp(40px, 6vh, 60px)',
        paddingTop: '40px'
      }}>
        <div className="demo-main-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: 'clamp(20px, 4vw, 60px)',
          alignItems: 'start'
        }}>
          {/* Left Panel - Large Satellite View */}
          <div className="demo-map-panel" style={{
            position: 'sticky',
            top: '120px',
            alignSelf: 'start'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '18px',
              overflow: 'hidden',
              border: '1px solid #d2d2d7',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ padding: '24px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    fontSize: '17px',
                    fontWeight: 600,
                    color: '#1d1d1f'
                  }}>
                    Satellite View
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#86868b',
                    padding: '4px 8px',
                    background: '#f5f5f7',
                    borderRadius: '6px'
                  }}>
                    Live Data
                  </div>
                </div>
                <div style={{
                  width: '100%',
                  height: 'clamp(500px, 75vh, 900px)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e5e5e7',
                  background: '#f5f5f7'
                }}>
                  <LargeMapView 
                    lat={selectedLocation.lat}
                    lon={selectedLocation.lon}
                    name={selectedLocation.name}
                    riskScore={overallRisk}
                  />
                </div>
                {(selectedLocation.lat || selectedLocation.lon) && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '12px',
                    fontSize: '12px',
                    color: '#86868b'
                  }}>
                    <span>Lat: {selectedLocation.lat.toFixed(4)}°</span>
                    <span>Lon: {selectedLocation.lon.toFixed(4)}°</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Location Selection & Risk Details */}
          <div className="demo-options-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '40px'
          }}>
            {/* Location Selection */}
            <div>
              <div style={{
                fontSize: '24px',
                lineHeight: '1.16667',
                fontWeight: 600,
                letterSpacing: '-0.009em',
                color: '#1d1d1f',
                marginBottom: '8px'
              }}>
                Location. Which area do you want to assess?
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: '20px'
              }}>
                {mockLocations.map((loc) => {
                  const locRisk = Math.round((loc.flood + loc.wildfire + loc.storm) / 3);
                  const isSelected = selectedLocation.name === loc.name;
                  
                  return (
                    <div
                      key={loc.name}
                      onClick={() => setSelectedLocation(loc)}
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #0071e3' : '1px solid #d2d2d7',
                        background: isSelected ? 'rgba(0, 113, 227, 0.05)' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#86868b';
                          e.currentTarget.style.background = '#f5f5f7';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#d2d2d7';
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#0071e3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Check size={16} color="white" />
                        </div>
                      )}
                      <div style={{
                        fontSize: '19px',
                        lineHeight: '1.21053',
                        fontWeight: 600,
                        letterSpacing: '-0.009em',
                        color: '#1d1d1f',
                        marginBottom: '4px',
                        paddingRight: '32px'
                      }}>
                        {loc.name}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        lineHeight: '1.42859',
                        fontWeight: 400,
                        letterSpacing: '-0.016em',
                        color: '#86868b'
                      }}>
                        {loc.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk Assessment Details */}
            <div>
              <div style={{
                fontSize: '24px',
                lineHeight: '1.16667',
                fontWeight: 600,
                letterSpacing: '-0.009em',
                color: '#1d1d1f',
                marginBottom: '20px'
              }}>
                Risk Assessment
              </div>

              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #d2d2d7'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  paddingBottom: '20px',
                  borderBottom: '1px solid #d2d2d7'
                }}>
                  <div>
                    <div style={{
                      fontSize: '19px',
                      lineHeight: '1.21053',
                      fontWeight: 600,
                      letterSpacing: '-0.009em',
                      color: '#1d1d1f',
                      marginBottom: '4px'
                    }}>
                      {selectedLocation.name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      lineHeight: '1.42859',
                      fontWeight: 400,
                      color: '#86868b'
                    }}>
                      Population: {selectedLocation.population}
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    background: riskLevel.bgColor,
                    border: `1px solid ${riskLevel.color}`
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: riskLevel.color
                    }}>
                      {riskLevel.label}
                    </div>
                  </div>
                </div>

                {/* Overall Risk Score */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '17px',
                      fontWeight: 400,
                      color: '#1d1d1f'
                    }}>
                      Overall Risk
                    </span>
                    <span style={{
                      fontSize: '17px',
                      fontWeight: 600,
                      color: '#1d1d1f'
                    }}>
                      {overallRisk}/100
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    borderRadius: '4px',
                    background: '#f5f5f7',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${overallRisk}%`,
                      background: riskLevel.color,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Individual Risk Scores */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Flood Risk */}
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Droplets size={18} color="#0071e3" />
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 400,
                          color: '#1d1d1f'
                        }}>
                          Flood Risk
                        </span>
                      </div>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#1d1d1f'
                      }}>
                        {selectedLocation.flood}%
                      </span>
                    </div>
                    <div style={{
                      height: '5px',
                      borderRadius: '3px',
                      background: '#f5f5f7',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${selectedLocation.flood}%`,
                        background: '#0071e3',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  {/* Wildfire Risk */}
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Flame size={18} color="#f97316" />
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 400,
                          color: '#1d1d1f'
                        }}>
                          Wildfire Risk
                        </span>
                      </div>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#1d1d1f'
                      }}>
                        {selectedLocation.wildfire}%
                      </span>
                    </div>
                    <div style={{
                      height: '5px',
                      borderRadius: '3px',
                      background: '#f5f5f7',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${selectedLocation.wildfire}%`,
                        background: '#f97316',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  {/* Storm Risk */}
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Wind size={18} color="#6366f1" />
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 400,
                          color: '#1d1d1f'
                        }}>
                          Storm Risk
                        </span>
                      </div>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#1d1d1f'
                      }}>
                        {selectedLocation.storm}%
                      </span>
                    </div>
                    <div style={{
                      height: '5px',
                      borderRadius: '3px',
                      background: '#f5f5f7',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${selectedLocation.storm}%`,
                        background: '#6366f1',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Info Note */}
                <div style={{
                  marginTop: '24px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#f5f5f7',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}>
                  <AlertTriangle size={16} color="#86868b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{
                    fontSize: '12px',
                    lineHeight: '1.42859',
                    fontWeight: 400,
                    color: '#86868b',
                    margin: 0
                  }}>
                    Risk scores calculated using satellite imagery, historical climate data, terrain analysis, and real-time weather patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Apple Style */}
      <section style={{
        maxWidth: '980px',
        margin: '0 auto',
        paddingLeft: 'clamp(16px, 4vw, 22px)',
        paddingRight: 'clamp(16px, 4vw, 22px)',
        paddingBottom: 'clamp(60px, 8vh, 80px)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          lineHeight: '1.1',
          fontWeight: 600,
          letterSpacing: '-0.003em',
          color: '#1d1d1f',
          marginBottom: '12px'
        }}>
          Ready to Get Started?
        </div>
        <div style={{
          fontSize: 'clamp(17px, 2.2vw, 21px)',
          lineHeight: '1.381',
          fontWeight: 400,
          letterSpacing: '0.011em',
          color: '#86868b',
          marginBottom: '32px',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Sign up to access advanced risk assessment tools and detailed analytics
        </div>
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/signup')}
            style={{
              padding: '12px 22px',
              borderRadius: '22px',
              background: '#0071e3',
              color: 'white',
              fontSize: '17px',
              fontWeight: 400,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0077ed';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0071e3';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Get Started
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/signin')}
            style={{
              padding: '12px 22px',
              borderRadius: '22px',
              background: 'transparent',
              color: '#0071e3',
              fontSize: '17px',
              fontWeight: 400,
              border: '1px solid #0071e3',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 113, 227, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Sign In
          </button>
        </div>
      </section>
      </div>
    </>
  );
};

export default Demo;
