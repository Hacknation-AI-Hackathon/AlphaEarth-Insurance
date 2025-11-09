import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plane, Cloud, Wind, AlertTriangle, CheckCircle, DollarSign, MapPin } from "lucide-react";
import { useFlightDelayAnalysis } from "@/hooks/useFlightDelay";
import { FlightDelayResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import { airports, getAirportByCode, type Airport } from "@/data/airports";
import { 
  useAirportDelays, 
  useFlightPolicies, 
  useCreateFlightPolicy,
  usePendingFlightPayouts,
  useApproveFlightPayout,
  useFlightStatistics
} from "@/hooks/useFlight";

export default function FlightDelays() {
  // Fetch real flight data from backend
  const { data: delaysData, isLoading: delaysLoading, refetch: refetchDelays } = useAirportDelays();
  const { data: policiesData, isLoading: policiesLoading } = useFlightPolicies();
  const { data: payoutsData, isLoading: payoutsLoading } = usePendingFlightPayouts();
  const { data: statsData, isLoading: statsLoading } = useFlightStatistics();
  const createPolicy = useCreateFlightPolicy();
  const approvePayout = useApproveFlightPayout();
  const { toast } = useToast();

  // Log data to console
  console.log("Flight Delays Data:", {
    delays: delaysData?.data || [],
    policies: policiesData?.policies || [],
    payouts: payoutsData?.payouts || [],
    stats: statsData?.statistics || {}
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
    destCode: "LAX",
    departureDate: new Date().toISOString().split("T")[0],
    departureTime: "12:00",
    flightDurationHours: "5.5",
  });
  const [delayData, setDelayData] = useState<FlightDelayResponse | null>(null);
  const [analyzedFlights, setAnalyzedFlights] = useState<Array<FlightDelayResponse & { route: string; departureTime: string }>>([]);
  const { mutate: analyzeDelay, isPending } = useFlightDelayAnalysis();
  const { addNotification } = useNotifications();

  const originAirport = getAirportByCode(formData.originCode);
  const destAirport = getAirportByCode(formData.destCode);

  const handleAnalyze = () => {
    if (!originAirport || !destAirport) {
      toast({
        title: "Error",
        description: "Please select valid origin and destination airports",
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
      dest_code: formData.destCode,
      dest_coords: destAirport.coords as [number, number],
      departure_date: formData.departureDate,
      departure_time: formData.departureTime,
      flight_duration_hours: parseFloat(formData.flightDurationHours) || 3.0,
    };

    analyzeDelay(request, {
      onSuccess: (data) => {
        setDelayData(data);
        
        // Add to analyzed flights list
        setAnalyzedFlights(prev => [
          {
            ...data,
            route: `${formData.originCode} → ${formData.destCode}`,
            departureTime: formData.departureTime,
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
        const errorMessage = error instanceof Error ? error.message : "Failed to analyze flight delay";
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

  return (
    <div className="space-y-6" style={{ background: 'transparent', minHeight: '100vh' }}>
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
          Flight or Airport Disruption Claim Automation
        </h1>
        <p 
          className="text-sm"
          style={{ 
            color: '#A0AEC0',
            fontSize: '14px',
            fontFamily: 'Plus Jakarta Display, sans-serif'
          }}
        >
          Predict flight delays using atmospheric data, storms and congestion — and automatically trigger micro-insurance payouts.
        </p>
      </div>

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
              <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Destination Airport</Label>
              <Select 
                value={formData.destCode} 
                onValueChange={(value) => setFormData({ ...formData, destCode: value })}
              >
                <SelectTrigger style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}>
                  <SelectValue placeholder="Select destination" />
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
              <Input
                type="date"
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              />
            </div>
            
            <div>
              <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Departure Time</Label>
              <Input
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              />
            </div>
            
            <div>
              <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Flight Duration (hours)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.flightDurationHours}
                onChange={(e) => setFormData({ ...formData, flightDurationHours: e.target.value })}
                placeholder="5.5"
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
            disabled={isPending || !originAirport || !destAirport}
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
                <Plane className="h-4 w-4 mr-2" />
                Analyze Flight Delay Risk
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Section */}
      {delayData && (
        <>
          {/* Delay Analysis Result */}
          <div 
            className="relative"
            style={{ 
              borderRadius: '20px',
              overflow: 'hidden',
              border: `1px solid ${getSeverityColor(delayData.severity).border}`
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
                <h3 
                  className="text-lg font-bold"
                  style={{ color: 'white' }}
                >
                  ✈️ Delay Analysis Result
                </h3>
                {delayData.should_payout && (
                  <div 
                    className="px-3 py-1 rounded-lg"
                    style={{ 
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    <span style={{ color: '#22C55E', fontSize: '12px', fontWeight: 'bold' }}>
                      💰 AUTO-PAYOUT TRIGGERED
                    </span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#A0AEC0' }}>Delay Probability</p>
                  <p 
                    className="text-3xl font-bold"
                    style={{ color: getSeverityColor(delayData.severity).color }}
                  >
                    {delayData.delay_probability.toFixed(1)}%
                  </p>
                  <div 
                    className="w-full h-2 rounded-full mt-2"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${delayData.delay_probability}%`, 
                        background: getSeverityColor(delayData.severity).color 
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm mb-1" style={{ color: '#A0AEC0' }}>Severity</p>
                  <div 
                    className="inline-block px-3 py-2 rounded-lg mt-2"
                    style={{
                      background: getSeverityColor(delayData.severity).bg,
                      border: `1px solid ${getSeverityColor(delayData.severity).border}`,
                      color: getSeverityColor(delayData.severity).color
                    }}
                  >
                    <span className="font-bold text-sm uppercase">{delayData.severity}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm mb-1" style={{ color: '#A0AEC0' }}>Payout Amount</p>
                  <p 
                    className="text-3xl font-bold flex items-center gap-2"
                    style={{ color: '#0075FF' }}
                  >
                    <DollarSign className="h-6 w-6" />
                    {delayData.payout_amount.toFixed(0)}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: '#A0AEC0' }}>Delay Reason</p>
                <p className="text-sm" style={{ color: 'white' }}>
                  {delayData.delay_reason}
                </p>
              </div>
              
              {/* Weather Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-sm mb-2 flex items-center gap-2" style={{ color: '#A0AEC0' }}>
                    <MapPin className="h-4 w-4" />
                    Origin ({formData.originCode})
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs" style={{ color: '#A0AEC0' }}>
                      Precip: {delayData.weather.origin.precipitation_mm.toFixed(1)}mm
                    </p>
                    <p className="text-xs" style={{ color: '#A0AEC0' }}>
                      Wind: {delayData.weather.origin.wind_speed_mph.toFixed(1)} mph
                    </p>
                    {delayData.weather.origin.has_storm && (
                      <p className="text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                        <AlertTriangle className="h-3 w-3" />
                        Storm detected
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm mb-2 flex items-center gap-2" style={{ color: '#A0AEC0' }}>
                    <Plane className="h-4 w-4" />
                    Route
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs" style={{ color: '#A0AEC0' }}>
                      Precip: {delayData.weather.route.route_precipitation_mm.toFixed(1)}mm
                    </p>
                    {delayData.weather.route.has_storm_along_route && (
                      <p className="text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                        <AlertTriangle className="h-3 w-3" />
                        Storm along route
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm mb-2 flex items-center gap-2" style={{ color: '#A0AEC0' }}>
                    <MapPin className="h-4 w-4" />
                    Destination ({formData.destCode})
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs" style={{ color: '#A0AEC0' }}>
                      Precip: {delayData.weather.destination.precipitation_mm.toFixed(1)}mm
                    </p>
                    <p className="text-xs" style={{ color: '#A0AEC0' }}>
                      Wind: {delayData.weather.destination.wind_speed_mph.toFixed(1)} mph
                    </p>
                    {delayData.weather.destination.has_storm && (
                      <p className="text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                        <AlertTriangle className="h-3 w-3" />
                        Storm detected
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Congestion Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div>
                  <p className="text-sm mb-2" style={{ color: '#A0AEC0' }}>Origin Congestion</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="flex-1 h-2 rounded-full"
                      style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${delayData.congestion.origin}%`, 
                          background: delayData.congestion.origin > 60 ? '#EF4444' : delayData.congestion.origin > 40 ? '#F59E0B' : '#22C55E'
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'white' }}>
                      {delayData.congestion.origin.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm mb-2" style={{ color: '#A0AEC0' }}>Destination Congestion</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="flex-1 h-2 rounded-full"
                      style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${delayData.congestion.destination}%`, 
                          background: delayData.congestion.destination > 60 ? '#EF4444' : delayData.congestion.destination > 40 ? '#F59E0B' : '#22C55E'
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'white' }}>
                      {delayData.congestion.destination.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
              📊 Recent Flight Analyses
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
                            <span className="text-xs flex items-center gap-1" style={{ color: '#22C55E' }}>
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
    </div>
  );
}
