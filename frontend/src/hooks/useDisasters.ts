// Frontend/src/hooks/useDisasters.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

// Get all active disasters (hurricanes, wildfires, etc.)
export function useActiveDisasters() {
  return useQuery({
    queryKey: ["disasters", "active"],
    queryFn: () => apiClient.getActiveDisasters(),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 20000, // Consider data stale after 20 seconds
  });
}

// Get active hurricanes
export function useHurricanes() {
  return useQuery({
    queryKey: ["disasters", "hurricanes"],
    queryFn: () => apiClient.getHurricanes(),
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

// Get specific hurricane by ID
export function useHurricane(hurricaneId: string | null) {
  return useQuery({
    queryKey: ["disasters", "hurricanes", hurricaneId],
    queryFn: () => apiClient.getHurricaneById(hurricaneId!),
    enabled: !!hurricaneId, // Only run query if hurricaneId is provided
    refetchInterval: 60000, // Refetch every minute
  });
}

// Get active wildfires
export function useWildfires() {
  return useQuery({
    queryKey: ["disasters", "wildfires"],
    queryFn: () => apiClient.getWildfires(),
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

// Get specific wildfire by ID
export function useWildfire(wildfireId: string | null) {
  return useQuery({
    queryKey: ["disasters", "wildfires", wildfireId],
    queryFn: () => apiClient.getWildfireById(wildfireId!),
    enabled: !!wildfireId,
    refetchInterval: 60000,
  });
}

// Analyze hurricane impact (mutation)
export function useAnalyzeHurricane() {
  return useMutation({
    mutationFn: ({ stormId, region, numProperties }: { 
      stormId: string; 
      region: string; 
      numProperties: number 
    }) => apiClient.analyzeHurricane(stormId, region, numProperties),
  });
}

// Analyze wildfire impact (mutation)
export function useAnalyzeWildfire() {
  return useMutation({
    mutationFn: ({ fireId, region, numProperties }: { 
      fireId: string; 
      region: string; 
      numProperties: number 
    }) => apiClient.analyzeWildfire(fireId, region, numProperties),
  });
}

// Get active earthquakes
export function useActiveEarthquakes(params?: { magnitude?: number; timeframe?: string }) {
  return useQuery({
    queryKey: ["earthquakes", "active", params],
    queryFn: () => apiClient.getActiveEarthquakes(params),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });
}

// Get significant earthquakes
export function useSignificantEarthquakes() {
  return useQuery({
    queryKey: ["earthquakes", "significant"],
    queryFn: () => apiClient.getSignificantEarthquakes(),
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

// Get active severe weather
export function useActiveSevereWeather() {
  return useQuery({
    queryKey: ["severe-weather", "active"],
    queryFn: () => apiClient.getActiveSevereWeather(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000,
  });
}

// Get tornado warnings
export function useTornadoWarnings() {
  return useQuery({
    queryKey: ["severe-weather", "tornadoes"],
    queryFn: () => apiClient.getTornadoWarnings(),
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

// Get flood warnings
export function useFloodWarnings() {
  return useQuery({
    queryKey: ["severe-weather", "floods"],
    queryFn: () => apiClient.getFloodWarnings(),
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

// Get alerts by state
export function useAlertsByState(states: string[]) {
  return useQuery({
    queryKey: ["severe-weather", "by-state", states],
    queryFn: () => apiClient.getAlertsByState(states),
    enabled: states.length > 0, // Only run if states are provided
    refetchInterval: 30000,
    staleTime: 20000,
  });
}