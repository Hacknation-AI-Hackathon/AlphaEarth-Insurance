// Frontend/src/hooks/useFlight.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

// Get all airport delays
export function useAirportDelays() {
  return useQuery({
    queryKey: ["flight", "delays"],
    queryFn: () => apiClient.getAirportDelays(),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });
}

// Get specific airport delay by code
export function useAirportDelay(airportCode: string | null) {
  return useQuery({
    queryKey: ["flight", "delays", airportCode],
    queryFn: () => apiClient.getAirportDelayByCode(airportCode!),
    enabled: !!airportCode, // Only run if airportCode is provided
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

// Get all flight policies
export function useFlightPolicies() {
  return useQuery({
    queryKey: ["flight", "policies"],
    queryFn: () => apiClient.getFlightPolicies(),
    staleTime: 30000,
  });
}

// Get specific flight policy by ID
export function useFlightPolicy(policyId: string | null) {
  return useQuery({
    queryKey: ["flight", "policies", policyId],
    queryFn: () => apiClient.getFlightPolicyById(policyId!),
    enabled: !!policyId,
    staleTime: 30000,
  });
}

// Create flight policy (mutation)
export function useCreateFlightPolicy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      holder: { name: string; email: string; confirmationNumber: string };
      flight: {
        number: string;
        airline: string;
        from: string;
        to: string;
        departureTime: string;
      };
      coverage: { amount: number; currency: string; type: string };
      triggers: Array<{
        type: string;
        threshold: number;
        payout: number;
        description: string;
      }>;
    }) => apiClient.createFlightPolicy(data),
    onSuccess: () => {
      // Invalidate policies cache
      queryClient.invalidateQueries({ queryKey: ["flight", "policies"] });
    },
  });
}

// Evaluate all flight policies (mutation)
export function useEvaluateAllFlightPolicies() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.evaluateAllFlightPolicies(),
    onSuccess: () => {
      // Invalidate payouts cache
      queryClient.invalidateQueries({ queryKey: ["flight", "payouts"] });
    },
  });
}

// Evaluate single flight policy (mutation)
export function useEvaluateFlightPolicy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (policyId: string) => apiClient.evaluateFlightPolicy(policyId),
    onSuccess: () => {
      // Invalidate payouts cache
      queryClient.invalidateQueries({ queryKey: ["flight", "payouts"] });
    },
  });
}

// Get pending flight payouts
export function usePendingFlightPayouts() {
  return useQuery({
    queryKey: ["flight", "payouts", "pending"],
    queryFn: () => apiClient.getPendingFlightPayouts(),
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000,
  });
}

// Get processed flight payouts
export function useProcessedFlightPayouts() {
  return useQuery({
    queryKey: ["flight", "payouts", "processed"],
    queryFn: () => apiClient.getProcessedFlightPayouts(),
    staleTime: 30000,
  });
}

// Get specific flight payout by ID
export function useFlightPayout(payoutId: string | null) {
  return useQuery({
    queryKey: ["flight", "payouts", payoutId],
    queryFn: () => apiClient.getFlightPayoutById(payoutId!),
    enabled: !!payoutId,
    staleTime: 10000,
  });
}

// Approve flight payout (mutation)
export function useApproveFlightPayout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      payoutId, 
      adminEmail, 
      adminPassword 
    }: { 
      payoutId: string; 
      adminEmail: string; 
      adminPassword: string 
    }) => apiClient.approveFlightPayout(payoutId, adminEmail, adminPassword),
    onSuccess: () => {
      // Invalidate payouts cache
      queryClient.invalidateQueries({ queryKey: ["flight", "payouts"] });
    },
  });
}

// Reject flight payout (mutation)
export function useRejectFlightPayout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      payoutId, 
      adminEmail, 
      adminPassword, 
      reason 
    }: { 
      payoutId: string; 
      adminEmail: string; 
      adminPassword: string;
      reason: string;
    }) => apiClient.rejectFlightPayout(payoutId, adminEmail, adminPassword, reason),
    onSuccess: () => {
      // Invalidate payouts cache
      queryClient.invalidateQueries({ queryKey: ["flight", "payouts"] });
    },
  });
}

// Get flight insurance statistics
export function useFlightStatistics() {
  return useQuery({
    queryKey: ["flight", "statistics"],
    queryFn: () => apiClient.getFlightStatistics(),
    staleTime: 30000,
  });
}