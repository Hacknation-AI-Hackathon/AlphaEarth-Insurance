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
  const leafletRef = useRef<any>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Memoize center to avoid unnecessary updates
  const mapCenter = useMemo(() => center || [29.7, -95.35], [center]);

  useEffect(() => {
    // Reset loading state when component mounts
    setIsLoading(true);
    setMapError(null);
    
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    
    if (!mapRef.current) {
      setIsLoading(false);
      setMapError("Map container not available");
      return;
    }
    
    if (!urlTemplate) {
      setIsLoading(false);
      setMapError("No imagery URL provided");
      console.warn(`[SatelliteImageryMap] Missing urlTemplate for ${title}`);
      return;
    }
    
    // Validate urlTemplate is a non-empty string
    if (typeof urlTemplate !== 'string' || urlTemplate.trim() === '') {
      setIsLoading(false);
      setMapError("Invalid imagery URL");
      console.warn(`[SatelliteImageryMap] Invalid urlTemplate for ${title}:`, urlTemplate);
      return;
    }
    
    // Log URL template for debugging (first 100 chars to avoid logging tokens)
    console.log(`[SatelliteImageryMap] Initializing map for ${title}`, {
      urlTemplatePreview: urlTemplate.substring(0, 100) + (urlTemplate.length > 100 ? '...' : ''),
      center: mapCenter,
      zoom: zoom
    });

    let isMounted = true;

    const initMap = async () => {
      try {
        // Wait a bit for the container to be visible (important for dialogs)
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!isMounted || !mapRef.current) return;

        // Check if container has dimensions
        const rect = mapRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          // Wait a bit more and try again
          await new Promise(resolve => setTimeout(resolve, 200));
          if (!isMounted || !mapRef.current) return;
        }

        // Dynamically import Leaflet - only load when needed
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");
        leafletRef.current = L;

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
          errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // Transparent 1x1 pixel for missing tiles
        });

        tileLayer.addTo(map);
        tileLayerRef.current = tileLayer;
        
        // Handle tile errors gracefully
        let tileErrorCount = 0;
        tileLayer.on('tileerror', (error: any) => {
          tileErrorCount++;
          // If too many errors, show message
          if (tileErrorCount > 10 && isMounted) {
            console.warn('Multiple tile loading errors detected for', title);
          }
        });

        mapInstanceRef.current = map;

        // Add attribution
        L.control.attribution({
          position: 'bottomright',
          prefix: false
        }).addTo(map);

        // Invalidate map size after delays to ensure container is fully rendered
        // This is crucial when the map is inside a dialog that was just opened
        // Multiple delays to handle different dialog animation timings
        const invalidateSize = () => {
          if (mapInstanceRef.current && isMounted) {
            try {
              mapInstanceRef.current.invalidateSize();
            } catch (e) {
              console.warn('Error invalidating map size:', e);
            }
          }
        };
        
        // Invalidate immediately after map creation
        setTimeout(invalidateSize, 100);
        
        // Invalidate after dialog animation completes (typical dialog animations are 200-300ms)
        setTimeout(invalidateSize, 400);
        
        // Final invalidation as fallback
        setTimeout(invalidateSize, 800);

        // Also invalidate on window resize
        const handleResize = () => {
          if (mapInstanceRef.current && isMounted) {
            try {
              mapInstanceRef.current.invalidateSize();
            } catch (e) {
              // Ignore resize errors
            }
          }
        };
        window.addEventListener('resize', handleResize);
        resizeHandlerRef.current = handleResize;

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing Leaflet map:', error);
        if (isMounted) {
          setIsLoading(false);
          setMapError(error instanceof Error ? error.message : 'Failed to load map');
        }
      }
    };

    initMap();

    // Cleanup function
    return () => {
      isMounted = false;
      
      // Remove resize listener if it exists
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
      
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
  }, [urlTemplate, mapCenter, zoom, title]); // Use memoized mapCenter

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
          position: 'relative',
          minHeight: '256px' // Ensure minimum height for map
        }}
      >
        {isLoading && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-[1000]"
            style={{ 
              background: 'rgba(26, 31, 55, 0.9)',
            }}
          >
            <div className="text-sm" style={{ color: '#A0AEC0' }}>Loading map...</div>
          </div>
        )}
        {mapError && !isLoading && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-[1000]"
            style={{ 
              background: 'rgba(26, 31, 55, 0.9)',
            }}
          >
            <div className="text-sm text-center px-4" style={{ color: '#EF4444' }}>
              {mapError}
              <br />
              <span className="text-xs" style={{ color: '#A0AEC0' }}>
                Please check if imagery URL is valid
              </span>
            </div>
          </div>
        )}
        {!urlTemplate && !isLoading && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-[1000]"
            style={{ 
              background: 'rgba(26, 31, 55, 0.9)',
            }}
          >
            <div className="text-sm text-center px-4" style={{ color: '#A0AEC0' }}>
              No imagery available
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

SatelliteImageryMap.displayName = 'SatelliteImageryMap';
