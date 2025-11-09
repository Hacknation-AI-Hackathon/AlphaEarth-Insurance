import { useEffect, useRef, memo, useMemo, useState } from "react";

interface SatelliteImageryMapProps {
  urlTemplate: string;
  center?: [number, number];
  zoom?: number;
  title: string;
}

export const SatelliteImageryMap = memo(({ urlTemplate, center, zoom = 11, title }: SatelliteImageryMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize center to avoid unnecessary updates
  const mapCenter = useMemo(() => center || [29.7, -95.35], [center]);

  useEffect(() => {
    // Reset loading state when component mounts
    setIsLoading(true);
    
    if (!mapRef.current || !urlTemplate || typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    
    // Validate urlTemplate is a non-empty string
    if (typeof urlTemplate !== 'string' || urlTemplate.trim() === '') {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      try {
        // Dynamically import Leaflet - only load when needed
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        if (!isMounted || !mapRef.current) return;

        // Fix marker icon paths - only need to do this once per load
        try {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          });
        } catch (e) {
          // Ignore icon errors
        }

        // Clear existing map and tile layer
        if (tileLayerRef.current && mapInstanceRef.current) {
          try {
            tileLayerRef.current.remove();
          } catch (e) {
            // Ignore cleanup errors
          }
          tileLayerRef.current = null;
        }
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            // Ignore cleanup errors
          }
          mapInstanceRef.current = null;
        }

        if (!isMounted || !mapRef.current) return;

        // Create map with optimized settings for performance
        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: false,
          preferCanvas: false, // Use DOM rendering for better performance with satellite tiles
          fadeAnimation: false, // Disable fade for faster rendering
          zoomAnimation: true,
          zoomAnimationThreshold: 4,
        }).setView(mapCenter, zoom);

        // Create tile layer from Earth Engine URL template with performance optimizations
        // Earth Engine URLs use format: https://earthengine.googleapis.com/map/{mapid}/{z}/{x}/{y}?token={token}
        const tileLayer = L.tileLayer(urlTemplate, {
          maxZoom: 18,
          minZoom: 1,
          attribution: 'Google Earth Engine',
          tileSize: 256,
          crossOrigin: true,
          updateWhenZooming: false, // Don't update tiles while zooming for better performance
          updateWhenIdle: true, // Only update when pan/zoom is complete
          keepBuffer: 2, // Keep fewer tiles in buffer for better memory usage
        });

        tileLayer.addTo(map);
        tileLayerRef.current = tileLayer;
        
        // Handle tile errors gracefully (silently ignore to avoid console spam)
        tileLayer.on('tileerror', () => {
          // Silently handle tile errors for better performance
        });

        mapInstanceRef.current = map;

        // Add attribution
        L.control.attribution({
          position: 'bottomright',
          prefix: false
        }).addTo(map);

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing Leaflet map:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initMap();

    // Cleanup function
    return () => {
      isMounted = false;
      if (tileLayerRef.current && mapInstanceRef.current) {
        try {
          tileLayerRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        tileLayerRef.current = null;
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null;
      }
    };
  }, [urlTemplate, mapCenter, zoom]); // Use memoized mapCenter

  return (
    <div className="w-full h-full">
      <p className="text-sm mb-2 font-medium" style={{ color: '#A0AEC0' }}>
        {title}
      </p>
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg overflow-hidden"
        style={{
          background: 'rgba(26, 31, 55, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative'
        }}
      >
        {isLoading && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ 
              background: 'rgba(26, 31, 55, 0.8)',
              zIndex: 1000
            }}
          >
            <div className="text-sm" style={{ color: '#A0AEC0' }}>Loading map...</div>
          </div>
        )}
      </div>
    </div>
  );
});

SatelliteImageryMap.displayName = 'SatelliteImageryMap';
