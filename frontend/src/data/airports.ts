// Common airports with IATA codes and coordinates
export interface Airport {
  code: string;
  name: string;
  city: string;
  coords: [number, number]; // [longitude, latitude]
}

export const airports: Airport[] = [
  { code: "JFK", name: "John F. Kennedy International", city: "New York", coords: [-73.7781, 40.6413] },
  { code: "LAX", name: "Los Angeles International", city: "Los Angeles", coords: [-118.4085, 33.9425] },
  { code: "ORD", name: "O'Hare International", city: "Chicago", coords: [-87.9048, 41.9786] },
  { code: "ATL", name: "Hartsfield-Jackson Atlanta International", city: "Atlanta", coords: [-84.4281, 33.6407] },
  { code: "DFW", name: "Dallas/Fort Worth International", city: "Dallas", coords: [-97.038, 32.8998] },
  { code: "DEN", name: "Denver International", city: "Denver", coords: [-104.6737, 39.8561] },
  { code: "SFO", name: "San Francisco International", city: "San Francisco", coords: [-122.3748, 37.6213] },
  { code: "SEA", name: "Seattle-Tacoma International", city: "Seattle", coords: [-122.3088, 47.4502] },
  { code: "MIA", name: "Miami International", city: "Miami", coords: [-80.2906, 25.7959] },
  { code: "LAS", name: "McCarran International", city: "Las Vegas", coords: [-115.1522, 36.084] },
  { code: "PHX", name: "Phoenix Sky Harbor International", city: "Phoenix", coords: [-112.0116, 33.4342] },
  { code: "IAH", name: "George Bush Intercontinental", city: "Houston", coords: [-95.3414, 29.9844] },
  { code: "CLT", name: "Charlotte Douglas International", city: "Charlotte", coords: [-80.9461, 35.2144] },
  { code: "MCO", name: "Orlando International", city: "Orlando", coords: [-81.3081, 28.4312] },
  { code: "EWR", name: "Newark Liberty International", city: "Newark", coords: [-74.1745, 40.6925] },
  { code: "BOS", name: "Logan International", city: "Boston", coords: [-71.0202, 42.3656] },
  { code: "DTW", name: "Detroit Metropolitan", city: "Detroit", coords: [-83.3534, 42.2162] },
  { code: "PHL", name: "Philadelphia International", city: "Philadelphia", coords: [-75.2411, 39.8719] },
  { code: "LGA", name: "LaGuardia", city: "New York", coords: [-73.874, 40.7769] },
  { code: "BWI", name: "Baltimore/Washington International", city: "Baltimore", coords: [-76.6682, 39.1774] },
];

export function getAirportByCode(code: string): Airport | undefined {
  return airports.find(airport => airport.code.toUpperCase() === code.toUpperCase());
}

export function searchAirports(query: string): Airport[] {
  const lowerQuery = query.toLowerCase();
  return airports.filter(airport => 
    airport.code.toLowerCase().includes(lowerQuery) ||
    airport.name.toLowerCase().includes(lowerQuery) ||
    airport.city.toLowerCase().includes(lowerQuery)
  );
}

