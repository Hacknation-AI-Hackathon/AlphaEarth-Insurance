import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DisasterMapProps {
  disaster: {
    type: string;
    coordinates: { lat: number; lon: number };
  };
  disasterData?: any;
  riskAssessments?: any[];
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 8);
  }, [center, map]);

  return null;
}

export function DisasterMap({ disaster, disasterData, riskAssessments }: DisasterMapProps) {
  const [center, setCenter] = useState<[number, number]>([
    disaster.coordinates.lat,
    disaster.coordinates.lon
  ]);

  useEffect(() => {
    setCenter([disaster.coordinates.lat, disaster.coordinates.lon]);
  }, [disaster.coordinates]);

  const renderHurricaneZones = () => {
    if (!disasterData) return null;

    return (
      <>
        {/* Storm center */}
        <Marker position={[disasterData.center.lat, disasterData.center.lon]}>
          <Popup>
            <strong>Hurricane Center</strong><br />
            Max Wind: {disasterData.maxWindSpeed} mph
          </Popup>
        </Marker>

        {/* Cone of Uncertainty */}
        {disasterData.coneOfUncertainty && (
          <Polygon
            positions={disasterData.coneOfUncertainty.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]])}
            pathOptions={{
              color: '#ff6b6b',
              fillColor: '#ff6b6b',
              fillOpacity: 0.2,
              weight: 2
            }}
          >
            <Popup>Cone of Uncertainty</Popup>
          </Polygon>
        )}

        {/* Wind radii circles */}
        {disasterData.windRadii && (
          <>
            <Circle
              center={[disasterData.center.lat, disasterData.center.lon]}
              radius={disasterData.windRadii.cat_5 * 1609.34}
              pathOptions={{ color: '#e74c3c', fillColor: '#e74c3c', fillOpacity: 0.3, weight: 2 }}
            >
              <Popup>Category 5 winds</Popup>
            </Circle>
            <Circle
              center={[disasterData.center.lat, disasterData.center.lon]}
              radius={disasterData.windRadii.cat_3 * 1609.34}
              pathOptions={{ color: '#f39c12', fillColor: '#f39c12', fillOpacity: 0.2, weight: 2 }}
            >
              <Popup>Category 3 winds</Popup>
            </Circle>
            <Circle
              center={[disasterData.center.lat, disasterData.center.lon]}
              radius={disasterData.windRadii.tropical_storm * 1609.34}
              pathOptions={{ color: '#3498db', fillColor: '#3498db', fillOpacity: 0.1, weight: 2 }}
            >
              <Popup>Tropical Storm winds</Popup>
            </Circle>
          </>
        )}
      </>
    );
  };

  const renderWildfireZone = () => {
    if (!disasterData) return null;

    const radiusMeters = Math.sqrt(disasterData.acres * 4046.86) / 2;

    return (
      <>
        <Marker position={[disasterData.center.lat, disasterData.center.lon]}>
          <Popup>
            <strong>Wildfire Center</strong><br />
            Acres: {disasterData.acres}<br />
            Containment: {disasterData.containment}%
          </Popup>
        </Marker>

        {/* Fire perimeter */}
        {disasterData.perimeter ? (
          <Polygon
            positions={disasterData.perimeter.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]])}
            pathOptions={{
              color: '#ff6347',
              fillColor: '#ff6347',
              fillOpacity: 0.4,
              weight: 2
            }}
          >
            <Popup>Active Fire Perimeter</Popup>
          </Polygon>
        ) : (
          <Circle
            center={[disasterData.center.lat, disasterData.center.lon]}
            radius={radiusMeters}
            pathOptions={{ color: '#ff6347', fillColor: '#ff6347', fillOpacity: 0.4, weight: 2 }}
          >
            <Popup>Estimated Fire Area</Popup>
          </Circle>
        )}
      </>
    );
  };

  const renderEarthquakeZone = () => {
    if (!disasterData) return null;

    const impactRadii = {
      severe: (disasterData.radiusMiles || 30) * 0.2,
      strong: (disasterData.radiusMiles || 30) * 0.4,
      moderate: (disasterData.radiusMiles || 30) * 0.6,
      light: (disasterData.radiusMiles || 30) * 1.0
    };

    return (
      <>
        <Marker position={[disasterData.center.lat, disasterData.center.lon]}>
          <Popup>
            <strong>Earthquake Epicenter</strong><br />
            Magnitude: {disasterData.magnitude || 'N/A'}<br />
            Depth: {disasterData.depth || 'N/A'} km
          </Popup>
        </Marker>

        <Circle
          center={[disasterData.center.lat, disasterData.center.lon]}
          radius={impactRadii.severe * 1609.34}
          pathOptions={{ color: '#e74c3c', fillColor: '#e74c3c', fillOpacity: 0.3, weight: 2 }}
        >
          <Popup>Severe Shaking Zone</Popup>
        </Circle>
        <Circle
          center={[disasterData.center.lat, disasterData.center.lon]}
          radius={impactRadii.strong * 1609.34}
          pathOptions={{ color: '#f39c12', fillColor: '#f39c12', fillOpacity: 0.2, weight: 2 }}
        >
          <Popup>Strong Shaking Zone</Popup>
        </Circle>
        <Circle
          center={[disasterData.center.lat, disasterData.center.lon]}
          radius={impactRadii.moderate * 1609.34}
          pathOptions={{ color: '#f1c40f', fillColor: '#f1c40f', fillOpacity: 0.15, weight: 2 }}
        >
          <Popup>Moderate Shaking Zone</Popup>
        </Circle>
        <Circle
          center={[disasterData.center.lat, disasterData.center.lon]}
          radius={impactRadii.light * 1609.34}
          pathOptions={{ color: '#3498db', fillColor: '#3498db', fillOpacity: 0.1, weight: 2 }}
        >
          <Popup>Light Shaking Zone</Popup>
        </Circle>
      </>
    );
  };

  const renderSevereWeatherZone = () => {
    if (!disasterData) return null;

    return (
      <>
        <Marker position={[disaster.coordinates.lat, disaster.coordinates.lon]}>
          <Popup>
            <strong>{disasterData.event || 'Severe Weather'}</strong><br />
            Severity: {disasterData.severity || 'N/A'}
          </Popup>
        </Marker>

        {/* Alert polygon if available */}
        {disasterData.geometry?.type === 'Polygon' && (
          <Polygon
            positions={disasterData.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]])}
            pathOptions={{
              color: '#9b59b6',
              fillColor: '#9b59b6',
              fillOpacity: 0.3,
              weight: 2
            }}
          >
            <Popup>Alert Area</Popup>
          </Polygon>
        )}

        {/* Fallback circle if no polygon */}
        {!disasterData.geometry && (
          <Circle
            center={[disaster.coordinates.lat, disaster.coordinates.lon]}
            radius={75 * 1609.34}
            pathOptions={{ color: '#9b59b6', fillColor: '#9b59b6', fillOpacity: 0.3, weight: 2 }}
          >
            <Popup>Affected Area</Popup>
          </Circle>
        )}
      </>
    );
  };

  const renderRiskProperties = () => {
    if (!riskAssessments || riskAssessments.length === 0) return null;

    // Only show top 100 high-risk properties to avoid cluttering the map
    const topRiskProperties = riskAssessments
      .filter(p => p.riskTier === 'critical' || p.riskTier === 'high')
      .slice(0, 100);

    return topRiskProperties.map((property, index) => {
      const color = property.riskTier === 'critical' ? '#e74c3c' :
                    property.riskTier === 'high' ? '#f39c12' : '#3498db';

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 8px; height: 8px; border-radius: 50%; border: 1px solid white;"></div>`,
        iconSize: [8, 8],
        iconAnchor: [4, 4]
      });

      return (
        <Marker
          key={property.propertyId || index}
          position={[property.coordinates?.lat || property.latitude, property.coordinates?.lon || property.longitude]}
          icon={icon}
        >
          <Popup>
            <strong>{property.propertyId}</strong><br />
            Value: ${(property.propertyValue || 0).toLocaleString()}<br />
            Risk: {property.riskTier}<br />
            Expected Loss: ${(property.expectedLoss || 0).toLocaleString()}
          </Popup>
        </Marker>
      );
    });
  };

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border-2 border-border">
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <MapUpdater center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {disaster.type === 'hurricane' && renderHurricaneZones()}
        {disaster.type === 'wildfire' && renderWildfireZone()}
        {disaster.type === 'earthquake' && renderEarthquakeZone()}
        {(disaster.type === 'severe_thunderstorm' || disaster.type === 'severe_weather' || disaster.type === 'flood' || disaster.type === 'flash_flood') && renderSevereWeatherZone()}

        {renderRiskProperties()}
      </MapContainer>
    </div>
  );
}
