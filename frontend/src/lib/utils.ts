import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Geocode a zip code or area code to coordinates using OpenStreetMap Nominatim API
 * Returns a bounding box [minLon, minLat, maxLon, maxLat]
 */
export async function geocodeZipCode(
  zipCode: string,
  radiusKm: number = 5
): Promise<{ bbox: [number, number, number, number]; center: [number, number]; displayName: string }> {
  // Clean the zip code
  const cleanZip = zipCode.trim();
  
  // Check if it's a 5-digit US zip code (numeric)
  const isUSZipCode = /^\d{5}$/.test(cleanZip);
  
  // Build query parameters
  const baseParams = new URLSearchParams({
    format: 'json',
    limit: '10', // Get more results to filter
    addressdetails: '1',
  });
  
  // For US zip codes, restrict to US and try multiple query formats
  if (isUSZipCode) {
    baseParams.set('countrycodes', 'us');
  }
  
  // Try different query formats, prioritizing US-specific formats for 5-digit codes
  const queries = isUSZipCode
    ? [
        `${cleanZip} United States`, // Try with United States
        `${cleanZip}, USA`, // Try with USA
        `postalcode:${cleanZip} country:US`, // Try with postalcode prefix
        `${cleanZip}`, // Fallback to just the zip (but filtered by countrycodes)
      ]
    : [
        `${cleanZip}, USA`, // Try with USA
        cleanZip, // Try as-is
        `postal code ${cleanZip}`, // Try with postal code prefix
      ];

  let lastError: Error | null = null;

  // For US zip codes, first try using postalcode parameter (more accurate)
  if (isUSZipCode) {
    try {
      const postalParams = new URLSearchParams({
        format: 'json',
        postalcode: cleanZip,
        countrycodes: 'us',
        limit: '5',
        addressdetails: '1',
      });
      
      const url = `https://nominatim.openstreetmap.org/search?${postalParams.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AlphaEarth-Insurance/1.0',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          // Filter and prioritize US results
          const usResults = data.filter((item: any) => {
            const country = item.address?.country_code?.toLowerCase() || '';
            if (country !== 'us') return false;
            
            // Verify coordinates are in US bounds
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            return !isNaN(lat) && !isNaN(lon) && lat >= 24 && lat <= 50 && lon >= -125 && lon <= -66;
          });
          
          if (usResults.length > 0) {
            // Sort by importance (higher is better) or use first result
            usResults.sort((a: any, b: any) => (b.importance || 0) - (a.importance || 0));
            
            // Prefer results where postcode matches exactly
            const exactMatch = usResults.find((item: any) => 
              item.address?.postcode === cleanZip || item.address?.postal_code === cleanZip
            );
            
            const result = exactMatch || usResults[0];
            const lat = parseFloat(result.lat);
            const lon = parseFloat(result.lon);
            
            const latOffset = radiusKm / 111;
            const lonOffset = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
            
            const expandedBbox: [number, number, number, number] = [
              lon - lonOffset,
              lat - latOffset,
              lon + lonOffset,
              lat + latOffset,
            ];

            return {
              bbox: expandedBbox,
              center: [lon, lat],
              displayName: result.display_name || cleanZip,
            };
          }
        }
      }
    } catch (error) {
      // Continue to fallback queries
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  // Fallback to regular search queries
  for (const query of queries) {
    try {
      baseParams.set('q', query);
      const url = `https://nominatim.openstreetmap.org/search?${baseParams.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AlphaEarth-Insurance/1.0', // Required by Nominatim
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        // For US zip codes, prioritize results that are actually in the US
        let result = data[0];
        
        if (isUSZipCode) {
          // Find the best US result (check country code)
          const usResult = data.find((item: any) => {
            const country = item.address?.country_code?.toLowerCase() || 
                           item.address?.country?.toLowerCase() || '';
            return country === 'us' || country === 'united states';
          });
          
          if (usResult) {
            result = usResult;
          } else if (data.length > 0) {
            // If no explicit US match, check if coordinates are in US bounds
            // US bounds: approximately lat 24-50, lon -125 to -66
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            if (lat >= 24 && lat <= 50 && lon >= -125 && lon <= -66) {
              result = data[0];
            } else {
              // Skip non-US results and try next query
              continue;
            }
          }
        }
        
        // Get center point from lat/lon
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          // Verify US location for US zip codes
          if (isUSZipCode) {
            // Double-check coordinates are in US bounds
            if (!(lat >= 24 && lat <= 50 && lon >= -125 && lon <= -66)) {
              // This doesn't look like a US location, try next query
              continue;
            }
          }
          
          // Calculate bounding box based on center point and radius
          // Approximate: 1 degree latitude ≈ 111 km, 1 degree longitude ≈ 111 km * cos(latitude)
          const latOffset = radiusKm / 111; // degrees
          const lonOffset = radiusKm / (111 * Math.cos(lat * Math.PI / 180)); // degrees
          
          const expandedBbox: [number, number, number, number] = [
            lon - lonOffset, // minLon
            lat - latOffset, // minLat
            lon + lonOffset, // maxLon
            lat + latOffset, // maxLat
          ];

          return {
            bbox: expandedBbox,
            center: [lon, lat],
            displayName: result.display_name || cleanZip,
          };
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue to next query
    }
  }

  // If all queries failed, throw the last error or a generic one
  throw lastError || new Error(`Could not geocode zip code: ${cleanZip}`);
}

/**
 * Geocode an address to coordinates using OpenStreetMap Nominatim API
 * Returns a bounding box [minLon, minLat, maxLon, maxLat] and center coordinates
 * Addresses are more specific and reliable than zip codes
 */
export async function geocodeAddress(
  address: string,
  radiusKm: number = 5
): Promise<{ bbox: [number, number, number, number]; center: [number, number]; displayName: string }> {
  // Clean the address
  const cleanAddress = address.trim();
  
  if (!cleanAddress) {
    throw new Error("Address cannot be empty");
  }
  
  // Build query parameters for address geocoding
  const params = new URLSearchParams({
    format: 'json',
    q: cleanAddress,
    limit: '5', // Get top 5 results to find the best match
    addressdetails: '1',
    extratags: '1',
  });
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AlphaEarth-Insurance/1.0', // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error(`Could not find location for address: ${cleanAddress}`);
    }

    // Sort results by importance (higher is better) and relevance
    const sortedResults = [...data].sort((a: any, b: any) => {
      // First sort by importance
      const importanceDiff = (b.importance || 0) - (a.importance || 0);
      if (Math.abs(importanceDiff) > 0.1) {
        return importanceDiff;
      }
      // Then by relevance if importance is similar
      return (b.importance || 0) - (a.importance || 0);
    });

    // Use the best result (first in sorted array)
    const result = sortedResults[0];
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    if (isNaN(lat) || isNaN(lon)) {
      throw new Error(`Invalid coordinates returned for address: ${cleanAddress}`);
    }
    
    // Calculate bounding box based on center point and radius
    // Approximate: 1 degree latitude ≈ 111 km, 1 degree longitude ≈ 111 km * cos(latitude)
    const latOffset = radiusKm / 111; // degrees
    const lonOffset = radiusKm / (111 * Math.cos(lat * Math.PI / 180)); // degrees
    
    const expandedBbox: [number, number, number, number] = [
      lon - lonOffset, // minLon
      lat - latOffset, // minLat
      lon + lonOffset, // maxLon
      lat + latOffset, // maxLat
    ];

    return {
      bbox: expandedBbox,
      center: [lon, lat],
      displayName: result.display_name || cleanAddress,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Could not geocode address: ${cleanAddress}`);
  }
}