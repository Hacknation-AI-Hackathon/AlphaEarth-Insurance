import { useEffect, useRef } from "react";

interface RiskMapProps {
  lat?: number;
  lon?: number;
  name?: string;
  riskScore?: number;
  center?: [number, number];
  zoom?: number;
  riskLevel?: number;
  className?: string;
}

export const RiskMap = ({ lat, lon, name, riskScore, center, zoom = 11, riskLevel, className = "" }: RiskMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Use either center prop or lat/lon props
  const mapCenter = center || (lat && lon ? [lat, lon] : [37.7749, -122.4194]);
  const displayName = name || "Location";
  const displayRisk = riskLevel || riskScore || 0;

  useEffect(() => {
    // Dynamically import leaflet to avoid SSR issues
    const initMap = async () => {
      if (!mapRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Fix marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // Clear existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Create map
      const map = L.map(mapRef.current).setView(mapCenter as [number, number], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const marker = L.marker(mapCenter as [number, number]).addTo(map);
      
      // Add risk circle overlay
      if (displayRisk > 0) {
        const circleColor = displayRisk < 40 ? "#22c55e" : displayRisk < 70 ? "#eab308" : "#ef4444";
        const circleRadius = (displayRisk / 100) * 5000; // Scale radius based on risk
        
        L.circle(mapCenter as [number, number], {
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.2,
          radius: circleRadius,
        }).addTo(map);
      }
      
      marker.bindPopup(`<strong>${displayName}</strong><br/>Risk Score: ${displayRisk}/100`);

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapCenter, zoom, displayName, displayRisk]);

  return (
    <div ref={mapRef} className={`w-full h-full rounded-lg overflow-hidden ${className}`} />
  );
};
