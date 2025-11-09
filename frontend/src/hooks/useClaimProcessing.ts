import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, ClaimProcessingRequest, ClaimProcessingResponse } from "@/lib/api";

export function useClaimProcessing() {
  const mutation = useMutation({
    mutationFn: (request: ClaimProcessingRequest) => apiClient.processClaim(request),
    // Don't show toasts here - let the component handle them
    // This allows for custom handling in each component
  });

  return mutation;
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient.healthCheck(),
    refetchInterval: 10000, // Check every 10 seconds (more frequent for better detection)
    retry: 1, // Only retry once on failure
    retryDelay: 2000, // Wait 2 seconds before retry
    staleTime: 5000, // Consider data stale after 5 seconds
    gcTime: 10000, // Cache for 10 seconds (prevents stale cache when backend goes down)
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
  });
}
