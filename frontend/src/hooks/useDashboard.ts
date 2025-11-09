// Frontend/src/hooks/useDashboard.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

// Get dashboard statistics
export function useDashboardStatistics() {
  return useQuery({
    queryKey: ["dashboard", "statistics"],
    queryFn: () => apiClient.getDashboardStatistics(),
    staleTime: 30000, // Cache for 30 seconds (dashboard data updates frequently)
    refetchInterval: 60000, // Refetch every minute to keep data fresh
  });
}

