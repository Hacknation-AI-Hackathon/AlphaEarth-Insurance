import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertCircle, Wind, CheckCircle, XCircle, TrendingUp, DollarSign, Waves } from "lucide-react";

const API_URL = "http://localhost:5001/api/parametric";

interface Policy {
  id: string;
  propertyId: string;
  holder: {
    name: string;
    email: string;
  };
  location: {
    lat: number;
    lon: number;
    address: string;
  };
  coverage: {
    amount: number;
    currency: string;
    type: string;
  };
  triggers: Array<{
    type: string;
    threshold: number | string; // number for wind, string for flood risk levels
    payout: number;
    description: string;
  }>;
  active: boolean;
  createdAt: string;
}

interface WindSource {
  source: string;
  windSpeed: number;
  windDirection?: number;
  confidence: string;
  delay: string;
  method: string;
  timestamp: string;
}

interface FloodSource {
  source: string;
  confidence: string;
  method: string;
  timestamp: string;
  // USGS specific fields
  waterLevel?: number;
  waterLevelChange?: number;
  floodStage?: number;
  siteName?: string;
  // Precipitation specific fields
  precipitation24h?: number;
  precipitation7d?: number;
  intensity?: string;
  // Soil moisture specific fields
  soilMoisture?: number;
  saturation?: number;
  // NOAA alerts specific fields
  alertCount?: number;
  alerts?: Array<{
    event: string;
    severity: string;
    headline: string;
  }>;
}

interface Payout {
  id: string;
  policyId: string;
  status: string;
  amount: number;
  currency: string;
  trigger: {
    type: string;
    threshold: number | string;
    description: string;
  };
  evidence: {
    windData?: {
      consensus: {
        windSpeed: number;
        confidence: string;
        sourceCount: number;
        standardDeviation: number;
        range: { min: number; max: number };
      };
      sources: WindSource[];
      timestamp: string;
    };
    floodData?: {
      assessment: {
        riskScore: number;
        riskLevel: string;
        confidence: string;
        factors: {
          waterLevel: number;
          precipitation: number;
          soilSaturation: number;
          alerts: number;
        };
        sourceCount: number;
      };
      sources: FloodSource[];
      timestamp: string;
    };
  };
  holder: {
    name: string;
    email: string;
  };
  location: {
    lat: number;
    lon: number;
    address: string;
  };
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export default function ParametricInsurance() {
  const queryClient = useQueryClient();
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState("admin@alphaearth.com");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [rejectionReason, setRejectionReason] = useState("");
  const [evaluationResults, setEvaluationResults] = useState<any>(null);

  // Fetch policies
  const { data: policiesData } = useQuery({
    queryKey: ["parametric-policies"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/policies`);
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch pending payouts
  const { data: pendingPayoutsData } = useQuery({
    queryKey: ["pending-payouts"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/payouts/pending`);
      return res.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ["parametric-stats"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/statistics`);
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Evaluate triggers mutation
  const evaluateMutation = useMutation({
    mutationFn: async (policyId: string) => {
      const res = await fetch(`${API_URL}/evaluate/${policyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventContext: {
            eventName: "Manual Trigger Evaluation",
            timestamp: new Date().toISOString(),
          },
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setEvaluationResults(data.results);
      queryClient.invalidateQueries({ queryKey: ["pending-payouts"] });
      toast.success("Trigger evaluation complete!");
    },
    onError: () => {
      toast.error("Failed to evaluate triggers");
    },
  });

  // Approve payout mutation
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
      queryClient.invalidateQueries({ queryKey: ["pending-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["parametric-stats"] });
      toast.success("Payout approved!");
    },
    onError: (error: any) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  // Reject payout mutation
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
      queryClient.invalidateQueries({ queryKey: ["pending-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["parametric-stats"] });
      setRejectionReason("");
      toast.success("Payout rejected");
    },
    onError: (error: any) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });

  // Create test policy mutation
  const createTestPolicyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/create-test-policy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["parametric-policies"] });
      toast.success("Test policy created! Now evaluate triggers to create a payout.");
    },
    onError: (error: any) => {
      toast.error(`Failed to create test policy: ${error.message}`);
    },
  });

  const policies: Policy[] = policiesData?.policies || [];
  const pendingPayouts: Payout[] = pendingPayoutsData?.payouts || [];
  const stats = statsData?.statistics;

  const getConfidenceBadge = (confidence: string) => {
    const colors: Record<string, string> = {
      "very high": "bg-green-500",
      high: "bg-blue-500",
      medium: "bg-yellow-500",
      low: "bg-orange-500",
    };
    return <Badge className={colors[confidence] || "bg-gray-500"}>{confidence.toUpperCase()}</Badge>;
  };

  const getRainIntensityBadge = (intensity: string) => {
    const colors: Record<string, string> = {
      extreme: "bg-red-600 text-white",
      heavy: "bg-orange-600 text-white",
      moderate: "bg-yellow-600 text-white",
      light: "bg-blue-500 text-white",
      none: "bg-gray-500 text-white",
    };
    return <Badge className={colors[intensity] || "bg-gray-500"}>{intensity.toUpperCase()} RAIN</Badge>;
  };

  const getFloodAlertBadge = (severity: string) => {
    const colors: Record<string, string> = {
      Extreme: "bg-red-700 text-white animate-pulse",
      Severe: "bg-red-600 text-white",
      Moderate: "bg-orange-500 text-white",
      Minor: "bg-yellow-500 text-white",
    };
    return <Badge className={colors[severity] || "bg-gray-500"}>{severity.toUpperCase()}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Parametric Insurance</h1>
          <p className="text-blue-200">Automated trigger-based insurance with multi-source satellite verification</p>

          {/* Test Mode Button */}
          <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-yellow-200 mb-2">
              💡 <strong>Testing Mode:</strong> Create a test policy with low wind thresholds (5-30 km/h) to trigger payouts immediately
            </p>
            <Button
              onClick={() => createTestPolicyMutation.mutate()}
              disabled={createTestPolicyMutation.isPending}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {createTestPolicyMutation.isPending ? "Creating..." : "Create Test Policy"}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
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
                <p className="text-xs text-slate-400">
                  ${stats.payouts.pending.totalAmount.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.payouts.approved.count}</div>
                <p className="text-xs text-slate-400">
                  ${stats.payouts.approved.totalAmount.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">{stats.payouts.rejected.count}</div>
                <p className="text-xs text-slate-400">
                  ${stats.payouts.rejected.totalAmount.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Policies */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Active Policies
            </CardTitle>
            <CardDescription className="text-slate-400">
              Insurance policies with parametric wind speed and flood risk triggers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="bg-slate-700 rounded-lg p-4 space-y-3 border border-slate-600"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{policy.holder.name}</h3>
                    <p className="text-sm text-slate-400">{policy.location.address}</p>
                    <p className="text-xs text-slate-500">
                      {policy.location.lat.toFixed(4)}°N, {Math.abs(policy.location.lon).toFixed(4)}°W
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-600">Policy {policy.id}</Badge>
                    <p className="text-sm text-slate-400 mt-1">{policy.coverage.type}</p>
                    <p className="text-lg font-bold text-green-400 mt-1">
                      ${policy.coverage.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Triggers */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-300">Triggers:</p>
                  {policy.triggers.map((trigger, idx) => (
                    <div key={idx} className="bg-slate-600 rounded p-2 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {trigger.type === 'wind_speed' ? (
                          <Wind className="h-4 w-4 text-blue-400" />
                        ) : (
                          <Waves className="h-4 w-4 text-cyan-400" />
                        )}
                        <div>
                          <p className="text-sm text-white">{trigger.description}</p>
                          <p className="text-xs text-slate-400">
                            {trigger.type === 'wind_speed'
                              ? `Wind ≥ ${trigger.threshold} km/h`
                              : `Flood Risk ≥ ${String(trigger.threshold).toUpperCase()}`}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-green-400">
                        ${trigger.payout.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Evaluate Button */}
                <Button
                  onClick={() => {
                    setSelectedPolicy(policy.id);
                    evaluateMutation.mutate(policy.id);
                  }}
                  disabled={evaluateMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Wind className="h-4 w-4 mr-2" />
                  {evaluateMutation.isPending && selectedPolicy === policy.id
                    ? "Evaluating Conditions..."
                    : "Evaluate Triggers Now"}
                </Button>

                {/* Show evaluation results */}
                {evaluationResults && selectedPolicy === policy.id && (
                  <div className="bg-slate-900 rounded-lg p-4 space-y-3 border border-blue-500">
                    <h4 className="text-sm font-semibold text-blue-300">Latest Evaluation Results</h4>

                    {/* Wind Data Sources */}
                    {evaluationResults.triggersEvaluated[0]?.windData?.sources && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400">Wind Measurement Sources:</p>
                        {evaluationResults.triggersEvaluated[0].windData.sources.map((source: WindSource, idx: number) => (
                          <div key={idx} className="bg-slate-800 rounded p-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-white font-medium">{source.source}</p>
                                <p className="text-xs text-slate-400">{source.method}</p>
                                <p className="text-xs text-slate-500">Delay: {source.delay}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-blue-400">{source.windSpeed.toFixed(1)} km/h</p>
                                {getConfidenceBadge(source.confidence)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Wind Consensus */}
                    {evaluationResults.triggersEvaluated[0]?.windData?.consensus && (
                      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded p-3">
                        <p className="text-xs text-blue-300 mb-1">CONSENSUS WIND SPEED</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-bold text-white">
                              {evaluationResults.triggersEvaluated[0].windData.consensus.windSpeed.toFixed(1)} km/h
                            </p>
                            <p className="text-xs text-slate-300">
                              Range: {evaluationResults.triggersEvaluated[0].windData.consensus.range.min.toFixed(1)} - {evaluationResults.triggersEvaluated[0].windData.consensus.range.max.toFixed(1)} km/h
                            </p>
                          </div>
                          <div className="text-right">
                            {getConfidenceBadge(evaluationResults.triggersEvaluated[0].windData.consensus.confidence)}
                            <p className="text-xs text-slate-300 mt-1">
                              {evaluationResults.triggersEvaluated[0].windData.consensus.sourceCount} sources
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Flood Data Sources */}
                    {evaluationResults.triggersEvaluated[0]?.floodData?.sources && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400">Flood Data Sources:</p>
                        {evaluationResults.triggersEvaluated[0].floodData.sources.map((source: FloodSource, idx: number) => (
                          <div key={idx} className="bg-slate-800 rounded p-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm text-white font-medium">{source.source}</p>
                                <p className="text-xs text-slate-400">{source.method}</p>
                                {source.waterLevel && (
                                  <p className="text-xs text-cyan-400 mt-1">
                                    Water Level: {source.waterLevel.toFixed(2)} ft {source.floodStage && `(Flood Stage: ${source.floodStage.toFixed(2)} ft)`}
                                  </p>
                                )}
                                {source.precipitation24h !== undefined && (
                                  <div className="mt-2 space-y-1">
                                    <p className="text-xs text-cyan-400">
                                      Precipitation: {source.precipitation24h.toFixed(1)} mm (24h) • {source.precipitation7d?.toFixed(1)} mm (7d)
                                    </p>
                                    {source.intensity && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">Rain Intensity:</span>
                                        {getRainIntensityBadge(source.intensity)}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {source.saturation !== undefined && (
                                  <p className="text-xs text-cyan-400 mt-1">
                                    Soil Saturation: {source.saturation}%
                                  </p>
                                )}
                                {source.alertCount && source.alertCount > 0 && (
                                  <div className="mt-2 space-y-1">
                                    <p className="text-xs text-red-400 font-semibold">⚠️ {source.alertCount} Flood Alert(s)</p>
                                    {source.alerts?.map((alert, alertIdx) => (
                                      <div key={alertIdx} className="bg-red-900/30 border border-red-600 rounded p-2">
                                        <div className="flex items-center gap-2 mb-1">
                                          {getFloodAlertBadge(alert.severity)}
                                          <span className="text-xs text-red-300 font-medium">{alert.event}</span>
                                        </div>
                                        <p className="text-xs text-red-200">{alert.headline}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-2">
                                {getConfidenceBadge(source.confidence)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Flood Risk Summary Card */}
                    {evaluationResults.triggersEvaluated[0]?.floodData && (
                      <div className="bg-gradient-to-br from-cyan-900 to-blue-900 border-2 border-cyan-500 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-bold text-cyan-300 uppercase">🌊 Flood Risk Summary</p>

                        {/* Rain Intensity */}
                        {evaluationResults.triggersEvaluated[0].floodData.sources.find((s: FloodSource) => s.intensity) && (
                          <div className="bg-slate-800/50 rounded p-2">
                            <p className="text-xs text-slate-300 mb-1">Rain Intensity</p>
                            {getRainIntensityBadge(
                              evaluationResults.triggersEvaluated[0].floodData.sources.find((s: FloodSource) => s.intensity)?.intensity || 'none'
                            )}
                            <p className="text-xs text-cyan-300 mt-1">
                              {evaluationResults.triggersEvaluated[0].floodData.sources.find((s: FloodSource) => s.precipitation24h)?.precipitation24h?.toFixed(1)} mm (24h)
                            </p>
                          </div>
                        )}

                        {/* Flood Warnings */}
                        {evaluationResults.triggersEvaluated[0].floodData.sources.find((s: FloodSource) => s.alertCount && s.alertCount > 0) && (
                          <div className="bg-red-900/30 border border-red-500 rounded p-2">
                            <p className="text-xs text-red-300 font-bold mb-2">
                              ⚠️ Active Flood Warnings: {evaluationResults.triggersEvaluated[0].floodData.sources.find((s: FloodSource) => s.alertCount)?.alertCount}
                            </p>
                            {evaluationResults.triggersEvaluated[0].floodData.sources
                              .find((s: FloodSource) => s.alerts)?.alerts?.map((alert, idx) => (
                                <div key={idx} className="flex items-center gap-2 mb-1">
                                  {getFloodAlertBadge(alert.severity)}
                                  <span className="text-xs text-red-200">{alert.event}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Flood Risk Assessment */}
                    {evaluationResults.triggersEvaluated[0]?.floodData?.assessment && (
                      <div className="bg-gradient-to-r from-cyan-900 to-cyan-800 rounded p-3">
                        <p className="text-xs text-cyan-300 mb-1">FLOOD RISK ASSESSMENT</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-bold text-white">
                              {evaluationResults.triggersEvaluated[0].floodData.assessment.riskLevel.toUpperCase()}
                            </p>
                            <p className="text-xs text-slate-300">
                              Risk Score: {evaluationResults.triggersEvaluated[0].floodData.assessment.riskScore}/100
                            </p>
                          </div>
                          <div className="text-right">
                            {getConfidenceBadge(evaluationResults.triggersEvaluated[0].floodData.assessment.confidence)}
                            <p className="text-xs text-slate-300 mt-1">
                              {evaluationResults.triggersEvaluated[0].floodData.assessment.sourceCount} sources
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trigger Status */}
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Trigger Status:</p>
                      {evaluationResults.triggersEvaluated.map((evaluation: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm mb-1">
                          {evaluation.activated ? (
                            <AlertCircle className="h-4 w-4 text-red-400" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          )}
                          <span className={evaluation.activated ? "text-red-400" : "text-green-400"}>
                            {evaluation.reason}
                          </span>
                        </div>
                      ))}
                    </div>

                    {evaluationResults.triggersActivated.length > 0 && (
                      <Badge className="bg-red-600 w-full justify-center">
                        {evaluationResults.triggersActivated.length} TRIGGER(S) ACTIVATED - Payout Pending
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Payouts */}
        {pendingPayouts.length > 0 && (
          <Card className="bg-slate-800 border-yellow-600 border-2">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Pending Payouts - Admin Approval Required
              </CardTitle>
              <CardDescription className="text-slate-400">
                Review and approve or reject payouts based on satellite evidence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Admin Credentials */}
              <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white">Admin Credentials</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="adminEmail" className="text-slate-300">Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adminPassword" className="text-slate-300">Password</Label>
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
                      <p className="text-sm text-slate-400">{payout.location.address}</p>
                      <Badge className="bg-yellow-600 mt-2">{payout.id}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Payout Amount</p>
                      <p className="text-2xl font-bold text-green-400">
                        ${payout.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Trigger Info */}
                  <div className="bg-slate-600 rounded p-3">
                    <p className="text-xs text-slate-400">Triggered By</p>
                    <p className="text-sm text-white font-semibold">{payout.trigger.description}</p>
                    <p className="text-xs text-slate-400">
                      Threshold: {typeof payout.trigger.threshold === 'number'
                        ? `${payout.trigger.threshold} km/h`
                        : String(payout.trigger.threshold).toUpperCase() + ' risk'}
                    </p>
                  </div>

                  {/* Evidence */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-white">Satellite Evidence:</p>

                    {/* Wind Consensus */}
                    {payout.evidence.windData && (
                      <>
                        <div className="bg-blue-900 rounded p-3">
                          <p className="text-xs text-blue-300">CONSENSUS WIND MEASUREMENT</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xl font-bold text-white">
                              {payout.evidence.windData.consensus.windSpeed.toFixed(1)} km/h
                            </p>
                            {getConfidenceBadge(payout.evidence.windData.consensus.confidence)}
                          </div>
                          <p className="text-xs text-slate-300 mt-1">
                            {payout.evidence.windData.consensus.sourceCount} sources •
                            σ = {payout.evidence.windData.consensus.standardDeviation.toFixed(1)} km/h
                          </p>
                        </div>

                        {/* Wind Sources */}
                        {payout.evidence.windData.sources.map((source, idx) => (
                          <div key={idx} className="bg-slate-600 rounded p-2 flex justify-between items-center">
                            <div>
                              <p className="text-xs text-white">{source.source}</p>
                              <p className="text-xs text-slate-400">{source.method}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-blue-400">{source.windSpeed.toFixed(1)} km/h</p>
                              {getConfidenceBadge(source.confidence)}
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Flood Risk Summary */}
                    {payout.evidence.floodData && (
                      <>
                        <div className="bg-gradient-to-br from-cyan-900 to-blue-900 border-2 border-cyan-500 rounded p-3 space-y-2">
                          <p className="text-sm font-bold text-cyan-300 uppercase">🌊 Flood Evidence</p>

                          {/* Rain Intensity */}
                          {payout.evidence.floodData.sources.find((s) => s.intensity) && (
                            <div className="bg-slate-700/50 rounded p-2">
                              <p className="text-xs text-slate-300 mb-1">Rain Intensity</p>
                              {getRainIntensityBadge(
                                payout.evidence.floodData.sources.find((s) => s.intensity)?.intensity || 'none'
                              )}
                              <p className="text-xs text-cyan-200 mt-1">
                                {payout.evidence.floodData.sources.find((s) => s.precipitation24h)?.precipitation24h?.toFixed(1)} mm in 24h
                              </p>
                            </div>
                          )}

                          {/* Flood Warnings */}
                          {payout.evidence.floodData.sources.find((s) => s.alertCount && s.alertCount > 0) && (
                            <div className="bg-red-900/40 border border-red-500 rounded p-2">
                              <p className="text-xs text-red-300 font-bold mb-1">
                                ⚠️ {payout.evidence.floodData.sources.find((s) => s.alertCount)?.alertCount} Flood Warning(s)
                              </p>
                              {payout.evidence.floodData.sources
                                .find((s) => s.alerts)?.alerts?.map((alert, idx) => (
                                  <div key={idx} className="flex items-center gap-1 mb-1">
                                    {getFloodAlertBadge(alert.severity)}
                                    <span className="text-xs text-red-200">{alert.event}</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>

                        <div className="bg-cyan-900 rounded p-3">
                          <p className="text-xs text-cyan-300">FLOOD RISK ASSESSMENT</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xl font-bold text-white">
                              {payout.evidence.floodData.assessment.riskLevel.toUpperCase()}
                            </p>
                            {getConfidenceBadge(payout.evidence.floodData.assessment.confidence)}
                          </div>
                          <p className="text-xs text-slate-300 mt-1">
                            {payout.evidence.floodData.assessment.sourceCount} sources •
                            Risk Score: {payout.evidence.floodData.assessment.riskScore}/100
                          </p>
                        </div>

                        {/* Flood Sources */}
                        {payout.evidence.floodData.sources.map((source, idx) => (
                          <div key={idx} className="bg-slate-600 rounded p-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-xs text-white font-medium">{source.source}</p>
                                <p className="text-xs text-slate-400">{source.method}</p>
                                {source.waterLevel && (
                                  <p className="text-xs text-cyan-400 mt-1">
                                    Water: {source.waterLevel.toFixed(2)} ft {source.floodStage && `(Flood Stage: ${source.floodStage.toFixed(2)} ft)`}
                                  </p>
                                )}
                                {source.precipitation24h !== undefined && (
                                  <div className="mt-1 space-y-1">
                                    <p className="text-xs text-cyan-400">
                                      Precip: {source.precipitation24h.toFixed(1)} mm (24h) • {source.precipitation7d?.toFixed(1)} mm (7d)
                                    </p>
                                    {source.intensity && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-slate-300">Intensity:</span>
                                        {getRainIntensityBadge(source.intensity)}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {source.saturation !== undefined && (
                                  <p className="text-xs text-cyan-400 mt-1">
                                    Soil: {source.saturation}%
                                  </p>
                                )}
                                {source.alertCount && source.alertCount > 0 && (
                                  <div className="mt-1 space-y-1">
                                    <p className="text-xs text-red-300 font-semibold">⚠️ {source.alertCount} Alert(s)</p>
                                    {source.alerts?.map((alert, alertIdx) => (
                                      <div key={alertIdx} className="bg-red-900/40 border border-red-500 rounded p-1.5">
                                        <div className="flex items-center gap-1 mb-0.5">
                                          {getFloodAlertBadge(alert.severity)}
                                          <span className="text-xs text-red-200">{alert.event}</span>
                                        </div>
                                        <p className="text-xs text-red-100">{alert.headline}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-2">
                                {getConfidenceBadge(source.confidence)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Rejection Reason Input */}
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
                Evaluate policy triggers to check current wind and flood conditions
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
