// Frontend/src/hooks/useParametric.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

// Get all parametric policies
export function useParametricPolicies() {
  return useQuery({
    queryKey: ["parametric", "policies"],
    queryFn: () => apiClient.getParametricPolicies(),
    staleTime: 30000, // Cache for 30 seconds
  });
}

// Get specific policy by ID
export function useParametricPolicy(policyId: string | null) {
  return useQuery({
    queryKey: ["parametric", "policies", policyId],
    queryFn: () => apiClient.getParametricPolicyById(policyId!),
    enabled: !!policyId, // Only run if policyId is provided
    staleTime: 30000,
  });
}

// Create parametric policy (mutation)
export function useCreateParametricPolicy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      propertyId: string;
      holder: { name: string; email: string };
      location: { lat: number; lon: number; address: string };
      coverage: { amount: number; currency: string; type: string };
      triggers: Array<{
        type: string;
        threshold: number;
        payout: number;
        description: string;
      }>;
    }) => apiClient.createParametricPolicy(data),
    onSuccess: () => {
      // Invalidate policies cache to refetch
      queryClient.invalidateQueries({ queryKey: ["parametric", "policies"] });
    },
  });
}

// Evaluate policy triggers (mutation)
export function useEvaluatePolicy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (policyId: string) => apiClient.evaluatePolicy(policyId),
    onSuccess: () => {
      // Invalidate payouts cache to show new payouts and statistics
      queryClient.invalidateQueries({ queryKey: ["parametric", "payouts"] });
      queryClient.invalidateQueries({ queryKey: ["parametric", "statistics"] });
    },
  });
}

// Get pending payouts
export function usePendingParametricPayouts() {
  return useQuery({
    queryKey: ["parametric", "payouts", "pending"],
    queryFn: () => apiClient.getPendingParametricPayouts(),
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000,
  });
}

// Get processed payouts
export function useProcessedParametricPayouts() {
  return useQuery({
    queryKey: ["parametric", "payouts", "processed"],
    queryFn: () => apiClient.getProcessedParametricPayouts(),
    staleTime: 30000,
  });
}

// Get specific payout by ID
export function useParametricPayout(payoutId: string | null) {
  return useQuery({
    queryKey: ["parametric", "payouts", payoutId],
    queryFn: () => apiClient.getParametricPayoutById(payoutId!),
    enabled: !!payoutId,
    staleTime: 10000,
  });
}

// Approve payout (mutation)
export function useApproveParametricPayout() {
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
    }) => apiClient.approveParametricPayout(payoutId, adminEmail, adminPassword),
    onSuccess: () => {
      // Invalidate payouts cache and statistics
      queryClient.invalidateQueries({ queryKey: ["parametric", "payouts"] });
      queryClient.invalidateQueries({ queryKey: ["parametric", "statistics"] });
    },
  });
}

// Reject payout (mutation)
export function useRejectParametricPayout() {
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
    }) => apiClient.rejectParametricPayout(payoutId, adminEmail, adminPassword, reason),
    onSuccess: () => {
      // Invalidate payouts cache and statistics
      queryClient.invalidateQueries({ queryKey: ["parametric", "payouts"] });
      queryClient.invalidateQueries({ queryKey: ["parametric", "statistics"] });
    },
  });
}

// Get parametric statistics
export function useParametricStatistics() {
  return useQuery({
    queryKey: ["parametric", "statistics"],
    queryFn: () => apiClient.getParametricStatistics(),
    staleTime: 30000,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Create test policy (mutation)
export function useCreateTestPolicy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.createTestPolicy(),
    onSuccess: () => {
      // Invalidate policies cache
      queryClient.invalidateQueries({ queryKey: ["parametric", "policies"] });
    },
  });
}