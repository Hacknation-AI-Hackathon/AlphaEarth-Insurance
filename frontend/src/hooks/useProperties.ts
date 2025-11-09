// Frontend/src/hooks/useProperties.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

// Get property portfolio
export function usePropertyPortfolio(params?: { region?: string; count?: number }) {
  return useQuery({
    queryKey: ["properties", "portfolio", params],
    queryFn: () => apiClient.getPropertyPortfolio(params),
    staleTime: 60000, // Cache for 1 minute (property data doesn't change often)
  });
}

// Get properties in a specific region
export function usePropertiesInRegion(lat: number, lon: number, radius: number) {
  return useQuery({
    queryKey: ["properties", "region", lat, lon, radius],
    queryFn: () => apiClient.getPropertiesInRegion(lat, lon, radius),
    enabled: !!(lat && lon && radius), // Only run if all params are provided
    staleTime: 60000,
  });
}

// Get high-value properties
export function useHighValueProperties(params?: { minValue?: number; threshold?: number; region?: string }) {
  return useQuery({
    queryKey: ["properties", "high-value", params],
    queryFn: () => apiClient.getHighValueProperties(params),
    staleTime: 60000,
  });
}

// Get coastal properties
export function useCoastalProperties(params?: { maxDistance?: number; region?: string }) {
  return useQuery({
    queryKey: ["properties", "coastal", params],
    queryFn: () => apiClient.getCoastalProperties(params),
    staleTime: 60000,
  });
}

// Calculate property risk (mutation)
export function useCalculatePropertyRisk() {
  return useMutation({
    mutationFn: (data: {
      propertyId: string;
      riskAssessment: any;
    }) => apiClient.calculatePropertyRisk(data),
  });
}

// Run Monte Carlo simulation (mutation)
export function useMonteCarloSimulation() {
  return useMutation({
    mutationFn: (data: {
      riskAssessments: Array<{
        propertyId: string;
        coverageAmount: number;
        damageProbability: number;
      }>;
      numSimulations: number;
    }) => apiClient.runMonteCarloSimulation(data),
  });
}

// Get portfolio metrics (mutation)
export function usePortfolioMetrics() {
  return useMutation({
    mutationFn: (data: {
      riskAssessments: Array<{
        propertyId: string;
        coverageAmount: number;
        damageProbability: number;
        expectedLoss: number;
        riskTier: string;
      }>;
    }) => apiClient.getPortfolioMetrics(data),
  });
}