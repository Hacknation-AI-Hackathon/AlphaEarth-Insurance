import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, FlightDelayRequest, FlightDelayResponse } from "@/lib/api";

export function useFlightDelayAnalysis() {
  const mutation = useMutation({
    mutationFn: (request: FlightDelayRequest) => apiClient.analyzeFlightDelay(request),
  });

  return mutation;
}

