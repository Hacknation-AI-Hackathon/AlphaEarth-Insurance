import { useState, useEffect, useRef } from "react";

// Airport Delay Map Component
const AirportDelayMap = ({ airportDelays, isLoading }: { airportDelays: any[], isLoading: boolean }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || isLoading) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current).setView([39.8283, -98.5795], 4);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Add markers for each airport
      airportDelays.forEach((airport: any) => {
        if (!airport.airport || !airport.airport.lat || !airport.airport.lon) return;

        const delayMinutes = airport.delayMinutes || 0;
        let color = "#22C55E"; // Green - On-time
        let category = "On-time";
        
        if (delayMinutes >= 120) {
          color = "#7F1D1D"; // Dark Red - Critical
          category = "Critical (2+ hrs)";
        } else if (delayMinutes >= 60) {
          color = "#DC2626"; // Red - Severe
          category = "Severe (1-2 hrs)";
        } else if (delayMinutes >= 30) {
          color = "#EA580C"; // Orange - Moderate
          category = "Moderate (30-60 min)";
        } else if (delayMinutes >= 5) {
          color = "#EAB308"; // Yellow - Minor
          category = "Minor (<30 min)";
        }

        const marker = L.circleMarker([airport.airport.lat, airport.airport.lon], {
          radius: 8,
          fillColor: color,
          color: color,
          weight: delayMinutes >= 30 ? 3 : 1,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map);

        marker.bindPopup(`
          <strong>${airport.airport.code} - ${airport.airport.name}</strong><br/>
          Delay: ${delayMinutes} minutes<br/>
          Category: ${category}<br/>
          Reason: ${airport.delayReason || "N/A"}
        `);
      });

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [airportDelays, isLoading]);

  return (
    <div 
      className="relative"
      style={{ 
        borderRadius: '20px',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
          borderRadius: '20px',
          backdropFilter: 'blur(60px)',
          zIndex: 1
        }}
      />
      <div 
        className="relative z-10 p-6"
        style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold" style={{ color: 'white' }}>
            Live Airport Delay Map
          </h3>
        </div>
        <p className="text-sm mb-4" style={{ color: '#A0AEC0' }}>
          Real-time flight delays across major US airports
        </p>
        <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '12px', zIndex: 10 }} />
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22C55E' }} />
            <span className="text-xs" style={{ color: '#A0AEC0' }}>On-time</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EAB308' }} />
            <span className="text-xs" style={{ color: '#A0AEC0' }}>Minor (&lt;30 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EA580C' }} />
            <span className="text-xs" style={{ color: '#A0AEC0' }}>Moderate (30-60 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#DC2626' }} />
            <span className="text-xs" style={{ color: '#A0AEC0' }}>Severe (1-2 hrs)</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#7F1D1D' }} />
            <span className="text-xs" style={{ color: '#A0AEC0' }}>Critical (2+ hrs)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogPortal, DialogOverlay, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, Cloud, Wind, AlertTriangle, CheckCircle, DollarSign, MapPin, X, Play, ArrowLeft, Droplets, Activity, Plane, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlightDelayAnalysis } from "@/hooks/useFlightDelay";
import { FlightDelayResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import { airports, getAirportByCode, type Airport } from "@/data/airports";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  useAirportDelays, 
  useFlightPolicies, 
  useCreateFlightPolicy,
  usePendingFlightPayouts,
  useApproveFlightPayout,
  useRejectFlightPayout,
  useEvaluateAllFlightPolicies
} from "@/hooks/useFlight";

export default function FlightDelays() {
  // Fetch real flight data from backend
  const { data: delaysData, isLoading: delaysLoading, refetch: refetchDelays } = useAirportDelays();
  const { data: policiesData, isLoading: policiesLoading } = useFlightPolicies();
  const { data: payoutsData, isLoading: payoutsLoading } = usePendingFlightPayouts();
  const createPolicy = useCreateFlightPolicy();
  const approvePayout = useApproveFlightPayout();
  const { toast } = useToast();

  // Log data to console
  console.log("Flight Delays Data:", {
    delays: delaysData?.data || [],
    policies: policiesData?.policies || [],
    payouts: payoutsData?.payouts || []
  });

  // Handle create policy (example - you can customize the form)
  const handleCreatePolicy = async (policyData: any) => {
    try {
      await createPolicy.mutateAsync(policyData);
      toast({
        title: "Policy Created",
        description: "Flight insurance policy created successfully!",
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create policy",
        variant: "destructive",
      });
    }
  };

  // Handle approve payout
  const handleApprovePayout = async (payoutId: string) => {
    try {
      await approvePayout.mutateAsync({
        payoutId,
        adminEmail: "admin@alphaearth.com",
        adminPassword: "admin123"
      });
      toast({
        title: "Payout Approved",
        description: "Flight delay payout approved successfully!",
      });
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Failed to approve payout",
        variant: "destructive",
      });
    }
  };

  // Get real airport delays (mock data fallback)
  const airportDelays = delaysData?.data?.airports || [];
  const [formData, setFormData] = useState({
    originCode: "JFK",
    departureDate: new Date().toISOString().split("T")[0],
  });
  const [delayData, setDelayData] = useState<FlightDelayResponse | null>(null);
  const [analyzedFlights, setAnalyzedFlights] = useState<Array<FlightDelayResponse & { route: string; departureTime: string }>>([]);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const { mutate: analyzeDelay, isPending } = useFlightDelayAnalysis();
  const { addNotification, startProcessing, stopProcessing, processingState } = useNotifications();
  const rejectPayout = useRejectFlightPayout();
  const evaluateAll = useEvaluateAllFlightPolicies();
  const [adminCredentials, setAdminCredentials] = useState({ email: "admin@alphaearth.com", password: "" });
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [severityFilter, setSeverityFilter] = useState<string>("all"); // "all", "minor", "moderate", "severe", "critical"

  const originAirport = getAirportByCode(formData.originCode);

  // Get data
  const policies = policiesData?.policies || [];
  const payouts = payoutsData?.payouts || [];

  const handleRejectPayout = async (payoutId: string) => {
    const reason = rejectionReasons[payoutId] || "No reason provided";
    try {
      await rejectPayout.mutateAsync({
        payoutId,
        adminEmail: adminCredentials.email,
        adminPassword: adminCredentials.password,
        reason
      });
      toast({
        title: "Payout Rejected",
        description: "Flight delay payout rejected successfully!",
      });
      setRejectionReasons({ ...rejectionReasons, [payoutId]: "" });
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : "Failed to reject payout",
        variant: "destructive",
      });
    }
  };

  const handleEvaluateAll = async () => {
    try {
      await evaluateAll.mutateAsync();
      toast({
        title: "Evaluation Started",
        description: "Evaluating all policies...",
      });
    } catch (error) {
      toast({
        title: "Evaluation Failed",
        description: error instanceof Error ? error.message : "Failed to evaluate policies",
        variant: "destructive",
      });
    }
  };

  // Sync processing state with React Query mutation state
  useEffect(() => {
    if (isPending) {
      // Mutation is pending, ensure processing state is set
      if (!processingState.isProcessing) {
        startProcessing();
      }
    } else {
      // When mutation completes (success or error), ensure processing is stopped
      // This is a fallback in case the callbacks don't fire
      if (processingState.isProcessing) {
        // Only stop if we haven't already stopped (to avoid overriding error state)
        if (!processingState.error) {
          stopProcessing(null);
        }
      }
    }
  }, [isPending, processingState.isProcessing, processingState.error, startProcessing, stopProcessing]);

  const handleAnalyze = () => {
    if (!originAirport) {
      toast({
        title: "Error",
        description: "Please select a valid origin airport",
        variant: "destructive",
      });
      return;
    }

    if (!formData.departureDate) {
      toast({
        title: "Error",
        description: "Please select a departure date",
        variant: "destructive",
      });
      return;
    }

    const request = {
      origin_code: formData.originCode,
      origin_coords: originAirport.coords as [number, number],
      departure_date: formData.departureDate,
    };

    console.log('🚀 Analyzing flight delay with request:', request);

    // Start processing notification
    startProcessing();

    analyzeDelay(request, {
      onSuccess: (data) => {
        console.log('✅ Flight delay analysis successful:', data);
        setDelayData(data);
        setShowAnalysisModal(true); // Show modal popup
        
        // Stop processing immediately when backend responds
        stopProcessing(null);
        
        // Add to analyzed flights list
        setAnalyzedFlights(prev => [
          {
            ...data,
            route: formData.originCode,
            departureTime: formData.departureDate,
          },
          ...prev.slice(0, 9) // Keep last 10 flights
        ]);

        // Show notification
        if (data.should_payout) {
          addNotification({
            title: "Delay Detected - Payout Triggered",
            description: `Delay probability: ${data.delay_probability}%. Payout: $${data.payout_amount}`,
            type: "success",
          });
        } else {
          addNotification({
            title: "Flight Analysis Complete",
            description: `Delay probability: ${data.delay_probability}%`,
            type: "info",
          });
        }
      },
      onError: (error) => {
        console.error('❌ Flight delay analysis error:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to analyze flight delay";
        console.error('Error message:', errorMessage);
        
        // Stop processing immediately with error when backend responds
        stopProcessing(errorMessage);
        
        toast({
          title: "Analysis Failed",
          description: errorMessage,
          variant: "destructive",
        });
        addNotification({
          title: "Analysis Failed",
          description: errorMessage,
          type: "error",
        });
      },
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return { bg: "rgba(239, 68, 68, 0.2)", color: "#EF4444", border: "rgba(239, 68, 68, 0.3)" };
      case "medium":
        return { bg: "rgba(245, 158, 11, 0.2)", color: "#F59E0B", border: "rgba(245, 158, 11, 0.3)" };
      case "low":
        return { bg: "rgba(234, 179, 8, 0.2)", color: "#EAB308", border: "rgba(234, 179, 8, 0.3)" };
      default:
        return { bg: "rgba(156, 163, 175, 0.2)", color: "#9CA3AF", border: "rgba(156, 163, 175, 0.3)" };
    }
  };

  // Calculate severity based on delay minutes
  const getSeverityFromDelay = (delayMinutes: number): string => {
    if (delayMinutes < 5) return "on-time";
    if (delayMinutes < 30) return "minor";
    if (delayMinutes < 60) return "moderate";
    if (delayMinutes < 120) return "severe";
    return "critical";
  };

  // Get severity color for delay-based severity (different colors for different severity levels)
  const getDelaySeverityColor = (severity: string) => {
    switch (severity) {
      case "on-time":
        return { bg: "rgba(156, 163, 175, 0.2)", color: "#9CA3AF", border: "rgba(156, 163, 175, 0.3)" };
      case "minor":
        return { bg: "rgba(59, 130, 246, 0.2)", color: "#3B82F6", border: "rgba(59, 130, 246, 0.3)" }; // Blue
      case "moderate":
        return { bg: "rgba(234, 179, 8, 0.2)", color: "#EAB308", border: "rgba(234, 179, 8, 0.3)" }; // Yellow
      case "severe":
        return { bg: "rgba(245, 158, 11, 0.2)", color: "#F59E0B", border: "rgba(245, 158, 11, 0.3)" }; // Orange
      case "critical":
        return { bg: "rgba(239, 68, 68, 0.2)", color: "#EF4444", border: "rgba(239, 68, 68, 0.3)" }; // Red
      default:
        return { bg: "rgba(156, 163, 175, 0.2)", color: "#9CA3AF", border: "rgba(156, 163, 175, 0.3)" };
    }
  };

  // Get delay for a policy's departure airport
  const getPolicyDelay = (policy: any): number => {
    if (!policy.flight?.from || !airportDelays.length) return 0;
    const airportDelay = airportDelays.find((ad: any) => ad.airport?.code === policy.flight.from);
    return airportDelay?.delayMinutes || 0;
  };

  // Filter policies based on severity (exclude on-time policies from filtering)
  const filteredPolicies = policies.filter((policy: any) => {
    if (severityFilter === "all") {
      // Show all policies except on-time ones
      const delayMinutes = getPolicyDelay(policy);
      const severity = getSeverityFromDelay(delayMinutes);
      return severity !== "on-time";
    }
    const delayMinutes = getPolicyDelay(policy);
    const severity = getSeverityFromDelay(delayMinutes);
    return severity === severityFilter;
  });

  return (
    <>
      <style>{`
        /* Custom scrollbar styling for the popup to match dark theme */
        .flight-delay-popup::-webkit-scrollbar {
          width: 10px;
        }
        .flight-delay-popup::-webkit-scrollbar-track {
          background: rgba(6, 11, 38, 0.8);
          border-radius: 5px;
          margin: 5px 0;
        }
        .flight-delay-popup::-webkit-scrollbar-thumb {
          background: rgba(160, 174, 192, 0.4);
          border-radius: 5px;
          border: 2px solid rgba(6, 11, 38, 0.8);
        }
        .flight-delay-popup::-webkit-scrollbar-thumb:hover {
          background: rgba(160, 174, 192, 0.6);
        }
        /* Firefox scrollbar */
        .flight-delay-popup {
          scrollbar-width: thin;
          scrollbar-color: rgba(160, 174, 192, 0.4) rgba(6, 11, 38, 0.8);
        }
        /* Glassmorphic overlay */
        [data-radix-dialog-overlay] {
          background: rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(10px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(10px) saturate(180%) !important;
        }
      `}</style>
      <div className="space-y-6" style={{ background: 'transparent', minHeight: '100vh' }}>
        {/* Analysis Results Modal */}
        <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
          <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
              className={cn(
                "fixed left-[50%] top-[50%] z-50 w-full max-w-4xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-4 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] flight-delay-popup overflow-y-auto"
              )}
              style={{
                background: 'linear-gradient(93deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.04) 100%)',
                border: 'none',
                borderRadius: '20px',
                backdropFilter: 'blur(21px) saturate(180%)',
                WebkitBackdropFilter: 'blur(21px) saturate(180%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                color: 'white'
              }}
            >
              {delayData && (
                <>
                  <DialogHeader className="flex flex-row items-center justify-between mb-6 pr-0">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ background: 'rgba(0, 117, 255, 0.2)' }}
                      >
                        <Plane className="h-5 w-5" style={{ color: '#0075FF' }} />
                      </div>
                      <div>
                        <DialogTitle 
                          className="text-2xl font-bold m-0"
                          style={{ color: 'white', fontFamily: 'Plus Jakarta Display, sans-serif' }}
                        >
                          Flight Delay Risk Analysis
                        </DialogTitle>
                        <p className="text-sm mt-1" style={{ color: '#A0AEC0' }}>
                          {formData.originCode} • {formData.departureDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {delayData.should_payout && (
                      <div 
                        className="px-4 py-2 rounded-lg"
                        style={{ 
                          background: 'rgba(1, 181, 116, 0.2)',
                          border: '1px solid rgba(1, 181, 116, 0.3)'
                        }}
                      >
                        <span style={{ color: '#01B574', fontSize: '14px', fontWeight: 'bold' }}>
                          POLICY TRIGGERED
                        </span>
                      </div>
                      )}
                      <button
                        onClick={() => setShowAnalysisModal(false)}
                        className="rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 disabled:pointer-events-none flex-shrink-0"
                        style={{
                          color: 'white',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          minWidth: '24px',
                          minHeight: '24px'
                        }}
                        aria-label="Close dialog"
                      >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                      </button>
                    </div>
                  </DialogHeader>

                  <div className="space-y-6" style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}>
                    {/* Main Metrics Grid - Delay Probability, Severity, and Payout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Delay Probability Card */}
                      <div 
                        className="relative"
                        style={{ 
                          borderRadius: '20px',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Background Layer 1 - Backdrop blur */}
                        <div 
                          style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                            borderRadius: '20px',
                            backdropFilter: 'blur(60px)',
                            zIndex: 1
                          }}
                        />
                        
                        {/* Background Layer 2 - Gradient overlay */}
                        <div 
                          style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
                            borderRadius: '20px',
                            zIndex: 2
                          }}
                        />
                        
                        {/* Content */}
                        <div 
                          className="relative z-10 p-6"
                          style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div 
                                className="p-2 rounded-lg"
                                style={{ background: 'rgba(245, 158, 11, 0.2)' }}
                              >
                                <Clock className="h-4 w-4" style={{ color: getSeverityColor(delayData.severity).color }} />
                              </div>
                              <span 
                                className="text-sm font-medium"
                                style={{ color: '#A0AEC0' }}
                              >
                                Delay Probability
                              </span>
                            </div>
                          </div>
                          <div className="mb-4">
                            <p 
                              className="text-3xl font-bold mb-1"
                              style={{ color: getSeverityColor(delayData.severity).color }}
                            >
                              {delayData.delay_probability.toFixed(1)}%
                            </p>
                            <p className="text-xs" style={{ color: '#A0AEC0' }}>
                              Risk of delay
                            </p>
                          </div>
                          <div 
                            className="w-full h-2 rounded-full overflow-hidden"
                            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                          >
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${Math.min(delayData.delay_probability, 100)}%`, 
                                background: getSeverityColor(delayData.severity).color 
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Severity Card */}
                      <div 
                        className="relative"
                        style={{ 
                          borderRadius: '20px',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Background Layer 1 - Backdrop blur */}
                        <div 
                          style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                            borderRadius: '20px',
                            backdropFilter: 'blur(60px)',
                            zIndex: 1
                          }}
                        />
                        
                        {/* Background Layer 2 - Gradient overlay */}
                        <div 
                          style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
                            borderRadius: '20px',
                            zIndex: 2
                          }}
                        />
                        
                        {/* Content */}
                        <div 
                          className="relative z-10 p-6"
                          style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div 
                                className="p-2 rounded-lg"
                                style={{ background: getSeverityColor(delayData.severity).bg }}
                              >
                                <AlertTriangle className="h-4 w-4" style={{ color: getSeverityColor(delayData.severity).color }} />
                              </div>
                              <span 
                                className="text-sm font-medium"
                                style={{ color: '#A0AEC0' }}
                              >
                                Severity
                              </span>
                            </div>
                          </div>
                          <div className="mb-4">
                            <div 
                              className="inline-block px-4 py-2 rounded-lg"
                              style={{
                                background: getSeverityColor(delayData.severity).bg,
                                border: `1px solid ${getSeverityColor(delayData.severity).border}`,
                                color: getSeverityColor(delayData.severity).color
                              }}
                            >
                              <span className="font-bold text-lg uppercase">{delayData.severity}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payout Amount Card */}
                      <div 
                        className="relative"
                        style={{ 
                          borderRadius: '20px',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Background Layer 1 - Backdrop blur */}
                        <div 
                          style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                            borderRadius: '20px',
                            backdropFilter: 'blur(60px)',
                            zIndex: 1
                          }}
                        />
                        
                        {/* Background Layer 2 - Gradient overlay */}
                        <div 
                          style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
                            borderRadius: '20px',
                            zIndex: 2
                          }}
                        />
                        
                        {/* Content */}
                        <div 
                          className="relative z-10 p-6"
                          style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div 
                                className="p-2 rounded-lg"
                                style={{ background: 'rgba(1, 181, 116, 0.2)' }}
                              >
                                <DollarSign className="h-4 w-4" style={{ color: '#01B574' }} />
                              </div>
                              <span 
                                className="text-sm font-medium"
                                style={{ color: '#A0AEC0' }}
                              >
                                Payout Amount
                              </span>
                            </div>
                          </div>
                          <div className="mb-4">
                            <p 
                              className="text-3xl font-bold mb-1 flex items-center gap-2"
                              style={{ color: '#01B574' }}
                            >
                              ${delayData.payout_amount.toFixed(0)}
                            </p>
                            <p className="text-xs" style={{ color: '#A0AEC0' }}>
                              {delayData.should_payout ? 'Payout eligible' : 'No payout'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weather Analysis Section - Card Style */}
                    <div 
                      className="relative"
                      style={{ 
                        borderRadius: '20px',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Background Layer 1 - Backdrop blur */}
                      <div 
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                          borderRadius: '20px',
                          backdropFilter: 'blur(60px)',
                          zIndex: 1
                        }}
                      />
                      
                      {/* Background Layer 2 - Gradient overlay */}
                      <div 
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
                          borderRadius: '20px',
                          zIndex: 2
                        }}
                      />
                      
                      {/* Content */}
                      <div 
                        className="relative z-10 p-6"
                        style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ background: 'rgba(0, 117, 255, 0.2)' }}
                          >
                            <Cloud className="h-4 w-4" style={{ color: '#0075FF' }} />
                          </div>
                          <h3 
                            className="text-lg font-bold"
                            style={{ color: 'white' }}
                          >
                            Weather Analysis
                          </h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm mb-3 flex items-center gap-2 font-medium" style={{ color: '#A0AEC0' }}>
                              <MapPin className="h-4 w-4" />
                              Origin ({formData.originCode})
                            </p>
                            <div 
                              className="p-4 rounded-lg"
                              style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Droplets className="h-4 w-4" style={{ color: '#0075FF' }} />
                                    <span className="text-xs" style={{ color: '#A0AEC0' }}>Precipitation</span>
                                  </div>
                                  <p className="text-xl font-bold" style={{ color: 'white' }}>
                                    {delayData.weather.origin.precipitation_mm.toFixed(1)}mm
                                  </p>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Wind className="h-4 w-4" style={{ color: '#0075FF' }} />
                                    <span className="text-xs" style={{ color: '#A0AEC0' }}>Wind Speed</span>
                                  </div>
                                  <p className="text-xl font-bold" style={{ color: 'white' }}>
                                    {delayData.weather.origin.wind_speed_mph.toFixed(1)} mph
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Storm Detection Section - Card Style */}
                    <div 
                      className="relative"
                      style={{ 
                        borderRadius: '20px',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Background Layer 1 - Backdrop blur */}
                      <div 
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                          borderRadius: '20px',
                          backdropFilter: 'blur(60px)',
                          zIndex: 1
                        }}
                      />
                      
                      {/* Background Layer 2 - Gradient overlay */}
                      <div 
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
                          borderRadius: '20px',
                          zIndex: 2
                        }}
                      />
                      
                      {/* Content */}
                      <div 
                        className="relative z-10 p-6"
                        style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ background: 'rgba(239, 68, 68, 0.2)' }}
                          >
                            <AlertTriangle className="h-4 w-4" style={{ color: '#EF4444' }} />
                          </div>
                          <h3 
                            className="text-lg font-bold"
                            style={{ color: 'white' }}
                          >
                            Storm Detection
                          </h3>
                        </div>
                        
                        <div>
                          <p className="text-sm mb-3 font-medium" style={{ color: '#A0AEC0' }}>
                            Origin ({formData.originCode})
                          </p>
                          {delayData.weather.origin.has_storm ? (
                            <div 
                              className="flex items-center gap-3 px-4 py-3 rounded-lg" 
                              style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                            >
                              <AlertTriangle className="h-5 w-5" style={{ color: '#EF4444' }} />
                              <span className="text-base font-bold" style={{ color: '#EF4444' }}>Storm Detected</span>
                            </div>
                          ) : (
                            <div 
                              className="flex items-center gap-3 px-4 py-3 rounded-lg" 
                              style={{ background: 'rgba(1, 181, 116, 0.2)', border: '1px solid rgba(1, 181, 116, 0.3)' }}
                            >
                              <CheckCircle className="h-5 w-5" style={{ color: '#01B574' }} />
                              <span className="text-base font-bold" style={{ color: '#01B574' }}>No Storm Detected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Congestion Section - Card Style */}
                    <div 
                      className="relative"
                      style={{ 
                        borderRadius: '20px',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Background Layer 1 - Backdrop blur */}
                      <div 
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                          borderRadius: '20px',
                          backdropFilter: 'blur(60px)',
                          zIndex: 1
                        }}
                      />
                      
                      {/* Background Layer 2 - Gradient overlay */}
                      <div 
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
                          borderRadius: '20px',
                          zIndex: 2
                        }}
                      />
                      
                      {/* Content */}
                      <div 
                        className="relative z-10 p-6"
                        style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ background: 'rgba(245, 158, 11, 0.2)' }}
                          >
                            <Activity className="h-4 w-4" style={{ color: '#F59E0B' }} />
                          </div>
                          <h3 
                            className="text-lg font-bold"
                            style={{ color: 'white' }}
                          >
                            Airport Congestion
                          </h3>
                        </div>
                        
                        <div>
                          <p className="text-sm mb-3 font-medium" style={{ color: '#A0AEC0' }}>
                            Origin Airport ({formData.originCode})
                          </p>
                          <div className="flex items-center gap-4">
                            <div 
                              className="flex-1 h-4 rounded-full"
                              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                            >
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${delayData.congestion.origin}%`, 
                                  background: delayData.congestion.origin > 60 ? '#EF4444' : delayData.congestion.origin > 40 ? '#F59E0B' : '#01B574'
                                }}
                              />
                            </div>
                            <span className="text-2xl font-bold min-w-[80px] text-right" style={{ color: 'white' }}>
                              {delayData.congestion.origin.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delay Reason Section - Card Style */}
                    <div 
                      className="relative"
                      style={{ 
                        borderRadius: '20px',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Background Layer 1 - Backdrop blur */}
                      <div 
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                          borderRadius: '20px',
                          backdropFilter: 'blur(60px)',
                          zIndex: 1
                        }}
                      />
                      
                      {/* Background Layer 2 - Gradient overlay */}
                      <div 
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
                          borderRadius: '20px',
                          zIndex: 2
                        }}
                      />
                      
                      {/* Content */}
                      <div 
                        className="relative z-10 p-6"
                        style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ background: 'rgba(0, 117, 255, 0.2)' }}
                          >
                            <AlertTriangle className="h-4 w-4" style={{ color: '#0075FF' }} />
                          </div>
                          <h3 
                            className="text-lg font-bold"
                            style={{ color: 'white' }}
                          >
                            Delay Reason
                          </h3>
                        </div>
                        <p 
                          className="text-sm leading-relaxed"
                          style={{ color: '#A0AEC0' }}
                        >
                          {delayData.delay_reason}
                        </p>
                      </div>
                    </div>

                    {/* Policy Status Section - Card Style */}
                    {delayData.should_payout && (
                      <div 
                        className="relative"
                        style={{ 
                          borderRadius: '20px',
                          overflow: 'hidden',
                          border: '1px solid rgba(1, 181, 116, 0.3)'
                        }}
                      >
                        {/* Background Layer 1 - Backdrop blur with green tint */}
                        <div 
                          style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                            borderRadius: '20px',
                            backdropFilter: 'blur(60px)',
                            zIndex: 1
                          }}
                        />
                        
                        {/* Background Layer 2 - Gradient overlay with green */}
                        <div 
                          style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            background: 'linear-gradient(85deg, rgba(1, 181, 116, 0.1) 0%, #1A1F37 100%, #1A1F37 100%)',
                            borderRadius: '20px',
                            zIndex: 2
                          }}
                        />
                        
                        {/* Content */}
                        <div 
                          className="relative z-10 p-6"
                          style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ background: 'rgba(1, 181, 116, 0.2)' }}
                            >
                              <CheckCircle className="h-5 w-5" style={{ color: '#01B574' }} />
                            </div>
                            <div>
                              <p 
                                className="text-lg font-bold"
                                style={{ color: '#01B574' }}
                              >
                                POLICY TRIGGERED
                              </p>
                              <p 
                                className="text-sm"
                                style={{ color: '#A0AEC0' }}
                              >
                                Payout eligible based on delay analysis
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2 flex-wrap">
                      <Button
                        onClick={() => {
                          // Generate report functionality
                          console.log('Generate flight delay report');
                        }}
                        style={{
                          background: '#0075FF',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        Generate Report
                      </Button>
                      <Button 
                        onClick={() => {
                          // Export data functionality
                          const dataStr = JSON.stringify(delayData, null, 2);
                          const dataBlob = new Blob([dataStr], { type: 'application/json' });
                          const url = URL.createObjectURL(dataBlob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = 'flight-delay-analysis.json';
                          link.click();
                          URL.revokeObjectURL(url);
                        }}
                        variant="outline"
                        style={{
                          background: 'rgba(26, 31, 55, 0.4)',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          color: 'white'
                        }}
                      >
                        Export Data
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogPrimitive.Content>
          </DialogPortal>
        </Dialog>

      {/* Header */}
      <div style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}>
        <h1 
          className="text-3xl font-bold mb-2"
          style={{ 
            color: 'white',
            fontFamily: 'Plus Jakarta Display, sans-serif',
            fontWeight: '700'
          }}
        >
          Flight Delay Insurance
        </h1>
        <p 
          className="text-sm"
          style={{ 
            color: '#A0AEC0',
            fontSize: '14px',
            fontFamily: 'Plus Jakarta Display, sans-serif'
          }}
        >
          Automatic micro-insurance payouts based on real-time atmospheric data and flight delays.
        </p>
      </div>

      {/* Live Airport Delay Map */}
      <AirportDelayMap airportDelays={airportDelays} isLoading={delaysLoading} />

      {/* Flight Analysis Form */}
      <div 
        className="relative"
        style={{ 
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      >
        {/* Background Layer 1 - Backdrop blur */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
            borderRadius: '20px',
            backdropFilter: 'blur(60px)',
            zIndex: 1
          }}
        />
        
        {/* Background Layer 2 - Gradient overlay */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
            borderRadius: '20px',
            zIndex: 2
          }}
        />
        
        {/* Content */}
        <div 
          className="relative z-10 p-6"
          style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
        >
          <h3 
            className="text-lg font-bold mb-4"
            style={{ color: 'white' }}
          >
            Flight Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Origin Airport</Label>
              <Select 
                value={formData.originCode} 
                onValueChange={(value) => setFormData({ ...formData, originCode: value })}
              >
                <SelectTrigger style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}>
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent>
                  {airports.map((airport) => (
                    <SelectItem key={airport.code} value={airport.code}>
                      {airport.code} - {airport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Departure Date</Label>
              <DatePicker
                value={formData.departureDate}
                onChange={(value) => setFormData({ ...formData, departureDate: value })}
                placeholder="MM/DD/YYYY"
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              />
            </div>
          </div>
          
          <Button
            onClick={handleAnalyze}
            disabled={isPending || !originAirport}
            className="w-full"
            style={{
              background: isPending ? 'rgba(0, 117, 255, 0.5)' : '#0075FF',
              color: 'white',
              border: 'none',
              cursor: isPending ? 'not-allowed' : 'pointer'
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Flight Delay Risk
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Analyzed Flights Table */}
      {analyzedFlights.length > 0 && (
        <div 
          className="relative"
          style={{ 
            borderRadius: '20px',
            overflow: 'hidden'
          }}
        >
          {/* Background Layer 1 - Backdrop blur */}
          <div 
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
              background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
              borderRadius: '20px',
              backdropFilter: 'blur(60px)',
              zIndex: 1
            }}
          />
          
          {/* Background Layer 2 - Gradient overlay */}
          <div 
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
              background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
              borderRadius: '20px',
              zIndex: 2
            }}
          />
          
          {/* Content */}
          <div 
            className="relative z-10 p-6"
            style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
          >
            <h3 
              className="text-lg font-bold mb-4"
              style={{ color: 'white' }}
            >
              Recent Flight Analyses
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <th className="text-left py-2 px-4" style={{ color: '#A0AEC0', fontSize: '12px' }}>Route</th>
                    <th className="text-left py-2 px-4" style={{ color: '#A0AEC0', fontSize: '12px' }}>Departure</th>
                    <th className="text-left py-2 px-4" style={{ color: '#A0AEC0', fontSize: '12px' }}>Delay Risk</th>
                    <th className="text-left py-2 px-4" style={{ color: '#A0AEC0', fontSize: '12px' }}>Severity</th>
                    <th className="text-left py-2 px-4" style={{ color: '#A0AEC0', fontSize: '12px' }}>Payout</th>
                    <th className="text-left py-2 px-4" style={{ color: '#A0AEC0', fontSize: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analyzedFlights.map((flight, idx) => {
                    const severityColor = getSeverityColor(flight.severity);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td className="py-2 px-4" style={{ color: 'white', fontSize: '14px' }}>{flight.route}</td>
                        <td className="py-2 px-4" style={{ color: '#A0AEC0', fontSize: '14px' }}>{flight.departureTime}</td>
                        <td className="py-2 px-4" style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                          {flight.delay_probability.toFixed(1)}%
                        </td>
                        <td className="py-2 px-4">
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              background: severityColor.bg,
                              color: severityColor.color,
                              border: `1px solid ${severityColor.border}`
                            }}
                          >
                            {flight.severity}
                          </span>
                        </td>
                        <td className="py-2 px-4" style={{ color: '#0075FF', fontSize: '14px', fontWeight: 'bold' }}>
                          ${flight.payout_amount.toFixed(0)}
                        </td>
                        <td className="py-2 px-4">
                          {flight.should_payout ? (
                            <span className="text-xs flex items-center gap-1" style={{ color: '#01B574' }}>
                              <CheckCircle className="h-3 w-3" />
                              Paid
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: '#A0AEC0' }}>No payout</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Active Flight Insurance Policies */}
      {policies.length > 0 && (
        <div 
          className="relative"
          style={{ 
            borderRadius: '20px',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
              borderRadius: '20px',
              backdropFilter: 'blur(60px)',
              zIndex: 1
            }}
          />
          <div 
            className="relative z-10 p-6"
            style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'white' }}>
                  Active Flight Insurance Policies
                </h3>
                <p className="text-sm" style={{ color: '#A0AEC0' }}>
                  Micro-insurance policies with automatic delay-based payouts
                </p>
              </div>
              <Button
                onClick={handleEvaluateAll}
                disabled={evaluateAll.isPending}
                style={{
                  background: '#0075FF',
                  color: 'white',
                  border: 'none'
                }}
              >
                {evaluateAll.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Evaluate All Policies
              </Button>
            </div>

            {/* Severity Filter */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3" style={{ color: '#A0AEC0' }}>
                Filter by Severity:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSeverityFilter("all")}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: severityFilter === "all" ? '#0075FF' : 'rgba(26, 31, 55, 0.4)',
                    color: severityFilter === "all" ? 'white' : '#A0AEC0',
                    border: severityFilter === "all" ? '1px solid #0075FF' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  All Delays
                </button>
                <button
                  onClick={() => setSeverityFilter("minor")}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                  style={{
                    background: severityFilter === "minor" ? 'rgba(59, 130, 246, 0.2)' : 'rgba(26, 31, 55, 0.4)',
                    color: severityFilter === "minor" ? '#3B82F6' : '#A0AEC0',
                    border: severityFilter === "minor" ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
                  Minor (&lt;30 min)
                </button>
                <button
                  onClick={() => setSeverityFilter("moderate")}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                  style={{
                    background: severityFilter === "moderate" ? 'rgba(234, 179, 8, 0.2)' : 'rgba(26, 31, 55, 0.4)',
                    color: severityFilter === "moderate" ? '#EAB308' : '#A0AEC0',
                    border: severityFilter === "moderate" ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EAB308' }} />
                  Moderate (30-60 min)
                </button>
                <button
                  onClick={() => setSeverityFilter("severe")}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                  style={{
                    background: severityFilter === "severe" ? 'rgba(245, 158, 11, 0.2)' : 'rgba(26, 31, 55, 0.4)',
                    color: severityFilter === "severe" ? '#F59E0B' : '#A0AEC0',
                    border: severityFilter === "severe" ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                  Severe (1-2 hrs)
                </button>
                <button
                  onClick={() => setSeverityFilter("critical")}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                  style={{
                    background: severityFilter === "critical" ? 'rgba(239, 68, 68, 0.2)' : 'rgba(26, 31, 55, 0.4)',
                    color: severityFilter === "critical" ? '#EF4444' : '#A0AEC0',
                    border: severityFilter === "critical" ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                  Critical (2+ hrs)
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredPolicies.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: '#A0AEC0' }}>
                    No policies found for the selected severity filter.
                  </p>
                </div>
              ) : (
                filteredPolicies.map((policy: any) => {
                  const delayMinutes = getPolicyDelay(policy);
                  const severity = getSeverityFromDelay(delayMinutes);
                  const severityColors = getDelaySeverityColor(severity);
                const totalValue = policy.triggers?.reduce((sum: number, t: any) => Math.max(sum, t.payout || 0), 0) || 0;
                return (
                  <div 
                    key={policy.id}
                    className="p-4 rounded-lg"
                    style={{ 
                      background: 'rgba(26, 31, 55, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-lg" style={{ color: 'white' }}>
                            {policy.holder?.name || 'Unknown'}'s Policy
                          </p>
                          {/* Severity Badge */}
                          <div 
                            className="px-2 py-1 rounded text-xs font-bold"
                            style={{
                              background: severityColors.bg,
                              color: severityColors.color,
                              border: `1px solid ${severityColors.border}`
                            }}
                          >
                            {severity.toUpperCase().replace('-', ' ')}
                          </div>
                          {delayMinutes > 0 && (
                            <span className="text-xs" style={{ color: '#A0AEC0' }}>
                              ({delayMinutes} min delay)
                            </span>
                          )}
                        </div>
                        <p className="text-sm" style={{ color: '#A0AEC0' }}>
                          Flight {policy.flight?.number}: {policy.flight?.from} → {policy.flight?.to}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#A0AEC0' }}>
                          Confirmation: {policy.holder?.confirmationNumber || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div 
                          className="px-3 py-1 rounded-lg inline-block mb-2"
                          style={{ background: 'rgba(0, 117, 255, 0.2)', border: '1px solid rgba(0, 117, 255, 0.3)' }}
                        >
                          <span className="text-xs font-bold" style={{ color: '#0075FF' }}>
                            {policy.id}
                          </span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#01B574' }}>
                          ${totalValue}
                        </p>
                        <p className="text-xs" style={{ color: '#A0AEC0' }}>Total Policy Value</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2" style={{ color: '#A0AEC0' }}>Coverage Tiers:</p>
                      <div className="space-y-2">
                        {policy.triggers?.map((trigger: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span style={{ color: '#A0AEC0' }}>
                              {trigger.type || 'Delay'} ({trigger.threshold}+ min): Delay ≥ {trigger.threshold} minutes
                            </span>
                            <span className="font-bold" style={{ color: '#01B574' }}>
                              Payout: ${trigger.payout}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending Payouts */}
      {payouts.filter((p: any) => p.status === 'pending').length > 0 && (
        <div 
          className="relative"
          style={{ 
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(234, 179, 8, 0.3)'
          }}
        >
          <div 
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
              borderRadius: '20px',
              backdropFilter: 'blur(60px)',
              zIndex: 1
            }}
          />
          <div 
            className="relative z-10 p-6"
            style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5" style={{ color: '#EAB308' }} />
              <h3 className="text-lg font-bold" style={{ color: '#EAB308' }}>
                Pending Payouts - Admin Approval Required
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: '#A0AEC0' }}>
              Review delay evidence and approve or reject payouts
            </p>

            {/* Admin Credentials */}
            <div 
              className="p-4 rounded-lg mb-6"
              style={{ 
                background: 'rgba(26, 31, 55, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <p className="text-sm font-medium mb-3" style={{ color: 'white' }}>Admin Credentials</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Email</Label>
                  <Input
                    type="email"
                    value={adminCredentials.email}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                    style={{
                      background: 'rgba(26, 31, 55, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }}
                  />
                </div>
                <div>
                  <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Password</Label>
                  <Input
                    type="password"
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                    style={{
                      background: 'rgba(26, 31, 55, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Payout Requests */}
            <div className="space-y-4">
              {payouts
                .filter((p: any) => p.status === 'pending')
                .map((payout: any) => (
                  <div 
                    key={payout.id}
                    className="p-4 rounded-lg"
                    style={{ 
                      background: 'rgba(26, 31, 55, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-lg" style={{ color: 'white' }}>
                          {payout.holder?.name || 'Unknown'}
                        </p>
                        <p className="text-sm" style={{ color: '#A0AEC0' }}>
                          Flight {payout.flight?.number}: {payout.flight?.from} → {payout.flight?.to}
                        </p>
                        <div 
                          className="px-3 py-1 rounded-lg inline-block mt-2"
                          style={{ background: 'rgba(234, 179, 8, 0.2)', border: '1px solid rgba(234, 179, 8, 0.3)' }}
                        >
                          <span className="text-xs font-bold" style={{ color: '#EAB308' }}>
                            {payout.id}
                          </span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold" style={{ color: '#01B574' }}>
                        ${payout.amount || 0}
                      </p>
                    </div>

                    {/* Delay Evidence */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2" style={{ color: '#A0AEC0' }}>Delay Evidence:</p>
                      <div className="p-3 rounded-lg" style={{ background: 'rgba(26, 31, 55, 0.6)' }}>
                        <p className="text-sm mb-1" style={{ color: 'white' }}>
                          <strong>Airport:</strong> {payout.airport?.code || 'N/A'} - {payout.airport?.name || 'N/A'}
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              background: payout.delayCategory === 'on-time' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                              color: payout.delayCategory === 'on-time' ? '#22C55E' : '#EAB308'
                            }}
                          >
                            {payout.delayCategory?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                        <p className="text-sm mb-1" style={{ color: '#A0AEC0' }}>
                          <strong>Reason:</strong> {payout.delayReason || 'N/A'}
                        </p>
                        <p className="text-sm mb-1" style={{ color: '#A0AEC0' }}>
                          <strong>Delay:</strong> {payout.delayMinutes || 0} minutes
                        </p>
                        <p className="text-sm" style={{ color: '#A0AEC0' }}>
                          <strong>Trigger Threshold:</strong> {payout.triggerThreshold || 'N/A'} min
                        </p>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    <div className="mb-4">
                      <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Rejection Reason (optional)</Label>
                      <Textarea
                        value={rejectionReasons[payout.id] || ''}
                        onChange={(e) => setRejectionReasons({ ...rejectionReasons, [payout.id]: e.target.value })}
                        placeholder="Enter reason if rejecting this payout..."
                        style={{
                          background: 'rgba(26, 31, 55, 0.4)',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          color: 'white'
                        }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprovePayout(payout.id)}
                        disabled={approvePayout.isPending}
                        className="flex-1"
                        style={{
                          background: '#01B574',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Payout
                      </Button>
                      <Button
                        onClick={() => handleRejectPayout(payout.id)}
                        disabled={rejectPayout.isPending}
                        className="flex-1"
                        style={{
                          background: '#EF4444',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject Payout
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
