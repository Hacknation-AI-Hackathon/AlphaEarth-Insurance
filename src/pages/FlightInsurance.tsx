import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plane, Clock, AlertTriangle, CheckCircle, XCircle, CloudRain, Wind } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = "http://localhost:5001/api/flight";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Airport {
  code: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
}

interface AirportDelay {
  airport: Airport;
  delayMinutes: number;
  delayCategory: string;
  delayReason: string;
  weather?: {
    condition: string;
    temperature: number;
    windSpeed: number;
    visibility: number;
    precipitation: number;
  };
}

interface Policy {
  id: string;
  holder: {
    name: string;
    email: string;
    confirmationNumber: string;
  };
  flight: {
    number: string;
    airline: string;
    from: string;
    to: string;
    departureTime: string;
  };
  coverage: {
    amount: number;
    currency: string;
  };
  triggers: Array<{
    threshold: number;
    payout: number;
    description: string;
  }>;
  active: boolean;
}

interface Payout {
  id: string;
  policyId: string;
  status: string;
  amount: number;
  currency: string;
  trigger: {
    threshold: number;
    description: string;
  };
  evidence: {
    delayData: {
      delayMinutes: number;
      delayReason: string;
      delayCategory: string;
      airport: Airport;
    };
  };
  holder: {
    name: string;
    email: string;
  };
  flight: {
    number: string;
    from: string;
    to: string;
  };
  createdAt: string;
}

export default function FlightInsurance() {
  const queryClient = useQueryClient();
  const [adminEmail, setAdminEmail] = useState("admin@alphaearth.com");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch airport delays
  const { data: delaysData } = useQuery({
    queryKey: ["airport-delays"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/delays`);
      return res.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch policies
  const { data: policiesData } = useQuery({
    queryKey: ["flight-policies"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/policies`);
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Fetch pending payouts
  const { data: pendingPayoutsData } = useQuery({
    queryKey: ["flight-pending-payouts"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/payouts/pending`);
      return res.json();
    },
    refetchInterval: 10000,
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ["flight-stats"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/statistics`);
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Evaluate all policies
  const evaluateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["flight-pending-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["flight-stats"] });
      toast.success(`Evaluated ${data.results.policiesEvaluated} policies. ${data.results.payoutsCreated} payouts created.`);
    },
    onError: () => {
      toast.error("Failed to evaluate policies");
    },
  });

  // Approve payout
  const approveMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      const res = await fetch(`${API_URL}/payouts/${payoutId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, adminPassword }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flight-pending-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["flight-stats"] });
      toast.success("Payout approved!");
    },
    onError: (error: any) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  // Reject payout
  const rejectMutation = useMutation({
    mutationFn: async ({ payoutId, reason }: { payoutId: string; reason: string }) => {
      const res = await fetch(`${API_URL}/payouts/${payoutId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, adminPassword, reason }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flight-pending-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["flight-stats"] });
      setRejectionReason("");
      toast.success("Payout rejected");
    },
    onError: (error: any) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });

  const airports: AirportDelay[] = delaysData?.data?.airports || [];
  const policies: Policy[] = policiesData?.policies || [];
  const pendingPayouts: Payout[] = pendingPayoutsData?.payouts || [];
  const stats = statsData?.statistics;

  const getDelayCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "on-time": "rgb(34, 197, 94)",
      minor: "rgb(234, 179, 8)",
      moderate: "rgb(249, 115, 22)",
      severe: "rgb(239, 68, 68)",
      critical: "rgb(185, 28, 28)",
    };
    return colors[category] || colors["on-time"];
  };

  const getDelayCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      "on-time": "bg-green-500",
      minor: "bg-yellow-500",
      moderate: "bg-orange-500",
      severe: "bg-red-500",
      critical: "bg-red-700",
    };
    return <Badge className={colors[category] || "bg-gray-500"}>{category.toUpperCase()}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Plane className="h-10 w-10" />
            Flight Delay Insurance
          </h1>
          <p className="text-purple-200">
            Automatic micro-insurance payouts based on real-time atmospheric data and flight delays
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Active Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.policies.active}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Pending Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">{stats.payouts.pending.count}</div>
                <p className="text-xs text-slate-400">${stats.payouts.pending.totalAmount}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.payouts.approved.count}</div>
                <p className="text-xs text-slate-400">${stats.payouts.approved.totalAmount}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Avg Delay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {delaysData?.data?.summary?.avgDelay?.toFixed(0) || 0} min
                </div>
                <p className="text-xs text-slate-400">
                  {delaysData?.data?.summary?.delayed || 0}/{delaysData?.data?.summary?.total || 0} delayed
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Map */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CloudRain className="h-5 w-5" />
              Live Airport Delay Map
            </CardTitle>
            <CardDescription className="text-slate-400">
              Real-time flight delays across major US airports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] rounded-lg overflow-hidden">
              <MapContainer
                center={[39.8283, -98.5795]} // Center of US
                zoom={4}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {airports.map((airportDelay) => {
                  const color = getDelayCategoryColor(airportDelay.delayCategory);
                  const radius = Math.max(20000, airportDelay.delayMinutes * 1000); // Larger circle for more delay

                  return (
                    <div key={airportDelay.airport.code}>
                      <Circle
                        center={[airportDelay.airport.lat, airportDelay.airport.lon]}
                        radius={radius}
                        pathOptions={{
                          color,
                          fillColor: color,
                          fillOpacity: 0.3,
                          weight: 2,
                        }}
                      />
                      <Marker position={[airportDelay.airport.lat, airportDelay.airport.lon]}>
                        <Popup className="custom-popup">
                          <div className="p-2 min-w-[250px]">
                            <h3 className="font-bold text-lg">{airportDelay.airport.code}</h3>
                            <p className="text-sm text-gray-600 mb-2">{airportDelay.airport.name}</p>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="font-semibold">
                                  Delay: {airportDelay.delayMinutes} minutes
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {getDelayCategoryBadge(airportDelay.delayCategory)}
                              </div>
                              <div className="text-sm text-gray-700 mt-2">
                                <strong>Reason:</strong> {airportDelay.delayReason}
                              </div>

                              {airportDelay.weather && (
                                <div className="mt-2 pt-2 border-t text-xs space-y-1">
                                  <div>🌡️ {airportDelay.weather.temperature}°F</div>
                                  <div>💨 Wind: {airportDelay.weather.windSpeed} mph</div>
                                  <div>👁️ Visibility: {airportDelay.weather.visibility} km</div>
                                  <div>☁️ {airportDelay.weather.condition}</div>
                                  {airportDelay.weather.precipitation > 0 && (
                                    <div>🌧️ Precip: {airportDelay.weather.precipitation} mm</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    </div>
                  );
                })}
              </MapContainer>
            </div>

            {/* Map Legend */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm text-slate-300">On-time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-slate-300">Minor (&lt;30 min)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span className="text-sm text-slate-300">Moderate (30-60 min)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm text-slate-300">Severe (1-2 hrs)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-700"></div>
                <span className="text-sm text-slate-300">Critical (2+ hrs)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policies */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Active Flight Insurance Policies
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Micro-insurance policies with automatic delay-based payouts
                </CardDescription>
              </div>
              <Button
                onClick={() => evaluateMutation.mutate()}
                disabled={evaluateMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {evaluateMutation.isPending ? "Evaluating..." : "Evaluate All Policies"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="bg-slate-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{policy.holder.name}</h3>
                    <p className="text-sm text-slate-400">
                      Flight {policy.flight.number} • {policy.flight.airline}
                    </p>
                    <p className="text-sm text-slate-400">
                      {policy.flight.from} → {policy.flight.to}
                    </p>
                    <p className="text-xs text-slate-500">Confirmation: {policy.holder.confirmationNumber}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-purple-600">{policy.id}</Badge>
                    <p className="text-lg font-bold text-green-400 mt-1">
                      ${policy.coverage.amount}
                    </p>
                  </div>
                </div>

                {/* Triggers */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-300">Coverage Tiers:</p>
                  {policy.triggers.map((trigger, idx) => (
                    <div key={idx} className="bg-slate-600 rounded p-2 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-white">{trigger.description}</p>
                        <p className="text-xs text-slate-400">Delay ≥ {trigger.threshold} minutes</p>
                      </div>
                      <p className="text-sm font-bold text-green-400">${trigger.payout}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Payouts */}
        {pendingPayouts.length > 0 && (
          <Card className="bg-slate-800 border-yellow-600 border-2">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Pending Payouts - Admin Approval Required
              </CardTitle>
              <CardDescription className="text-slate-400">
                Review delay evidence and approve or reject payouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Admin Credentials */}
              <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white">Admin Credentials</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="adminEmail" className="text-slate-300">
                      Email
                    </Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adminPassword" className="text-slate-300">
                      Password
                    </Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Payouts */}
              {pendingPayouts.map((payout) => (
                <div key={payout.id} className="bg-slate-700 rounded-lg p-4 space-y-4 border border-yellow-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{payout.holder.name}</h3>
                      <p className="text-sm text-slate-400">
                        Flight {payout.flight.number}: {payout.flight.from} → {payout.flight.to}
                      </p>
                      <Badge className="bg-yellow-600 mt-2">{payout.id}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Payout Amount</p>
                      <p className="text-2xl font-bold text-green-400">${payout.amount}</p>
                    </div>
                  </div>

                  {/* Delay Evidence */}
                  <div className="bg-slate-600 rounded p-3 space-y-2">
                    <p className="text-sm font-semibold text-white">Delay Evidence:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-400">Airport:</p>
                        <p className="text-white font-semibold">
                          {payout.evidence.delayData.airport.code} - {payout.evidence.delayData.airport.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Delay:</p>
                        <p className="text-white font-semibold">
                          {payout.evidence.delayData.delayMinutes} minutes
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Category:</p>
                        {getDelayCategoryBadge(payout.evidence.delayData.delayCategory)}
                      </div>
                      <div>
                        <p className="text-slate-400">Trigger Threshold:</p>
                        <p className="text-white font-semibold">{payout.trigger.threshold} min</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Reason:</p>
                      <p className="text-white text-sm">{payout.evidence.delayData.delayReason}</p>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  <div>
                    <Label htmlFor={`reason-${payout.id}`} className="text-slate-300">
                      Rejection Reason (optional)
                    </Label>
                    <Textarea
                      id={`reason-${payout.id}`}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason if rejecting this payout..."
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => approveMutation.mutate(payout.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Payout
                    </Button>
                    <Button
                      onClick={() => {
                        if (!rejectionReason.trim()) {
                          toast.error("Please enter a rejection reason");
                          return;
                        }
                        rejectMutation.mutate({ payoutId: payout.id, reason: rejectionReason });
                      }}
                      disabled={rejectMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Payout
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {pendingPayouts.length === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-400">No pending payouts at this time</p>
              <p className="text-xs text-slate-500 mt-1">
                Click "Evaluate All Policies" to check for delays and create payouts
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
