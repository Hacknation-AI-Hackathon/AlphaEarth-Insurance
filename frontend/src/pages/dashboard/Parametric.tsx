import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Waves, Wind, CloudRain, Search, AlertCircle, CheckCircle, XCircle, TrendingUp, DollarSign, Shield, Activity } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useParametricPolicies,
  usePendingParametricPayouts,
  useEvaluatePolicy,
  useCreateTestPolicy,
  useParametricStatistics,
  useApproveParametricPayout,
  useRejectParametricPayout,
} from "@/hooks/useParametric";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

// Type definitions
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
    threshold: number | string;
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
  waterLevel?: number;
  waterLevelChange?: number;
  floodStage?: number;
  siteName?: string;
  precipitation24h?: number;
  precipitation7d?: number;
  intensity?: string;
  soilMoisture?: number;
  saturation?: number;
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

export default function Parametric() {
  const [searchInput, setSearchInput] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState("admin@alphaearth.com");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [rejectionReason, setRejectionReason] = useState("");
  const [evaluationResults, setEvaluationResults] = useState<any>(null);

  // Fetch data from backend
  const { data: policiesData, isLoading: policiesLoading } = useParametricPolicies();
  const { data: payoutsData, isLoading: payoutsLoading } = usePendingParametricPayouts();
  const { data: statsData } = useParametricStatistics();
  const evaluatePolicy = useEvaluatePolicy();
  const createTestPolicy = useCreateTestPolicy();
  const approvePayout = useApproveParametricPayout();
  const rejectPayout = useRejectParametricPayout();
  const { toast } = useToast();

  const policies: Policy[] = policiesData?.policies || [];
  const pendingPayouts: Payout[] = payoutsData?.payouts || [];
  const stats = statsData?.statistics;

  // Handle evaluate policy
  const handleEvaluate = async (policyId: string) => {
    try {
      setSelectedPolicy(policyId);
      const result = await evaluatePolicy.mutateAsync(policyId);
      setEvaluationResults(result.results);
      sonnerToast.success("Trigger evaluation complete!");
    } catch (error) {
      sonnerToast.error(`Failed to evaluate triggers: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Handle create test policy
  const handleCreateTestPolicy = async () => {
    try {
      await createTestPolicy.mutateAsync();
      sonnerToast.success("Test policy created! Now evaluate triggers to create a payout.");
    } catch (error) {
      sonnerToast.error(`Failed to create test policy: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Handle approve payout
  const handleApprove = async (payoutId: string) => {
    try {
      await approvePayout.mutateAsync({
        payoutId,
        adminEmail,
        adminPassword,
      });
      setRejectionReason("");
      sonnerToast.success("Payout approved!");
    } catch (error: any) {
      sonnerToast.error(`Failed to approve: ${error.message || "Unknown error"}`);
    }
  };

  // Handle reject payout
  const handleReject = async (payoutId: string) => {
    if (!rejectionReason.trim()) {
      sonnerToast.error("Please enter a rejection reason");
      return;
    }
    try {
      await rejectPayout.mutateAsync({
        payoutId,
        adminEmail,
        adminPassword,
        reason: rejectionReason,
      });
      setRejectionReason("");
      sonnerToast.success("Payout rejected");
    } catch (error: any) {
      sonnerToast.error(`Failed to reject: ${error.message || "Unknown error"}`);
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      toast({
        title: "Search",
        description: `Searching for: ${searchInput}`,
      });
    }
  };

  // Helper functions for badges
  const getConfidenceBadge = (confidence: string) => {
    const colors: Record<string, string> = {
      "very high": "bg-green-500",
      high: "bg-blue-500",
      medium: "bg-yellow-500",
      low: "bg-orange-500",
    };
  return (
      <Badge className={`${colors[confidence] || "bg-gray-500"} text-white text-xs`}>
        {confidence.toUpperCase()}
      </Badge>
    );
  };

  const getRainIntensityBadge = (intensity: string) => {
    const colors: Record<string, string> = {
      extreme: "bg-red-600 text-white",
      heavy: "bg-orange-600 text-white",
      moderate: "bg-yellow-600 text-white",
      light: "bg-blue-500 text-white",
      none: "bg-gray-500 text-white",
    };
    return (
      <Badge className={`${colors[intensity] || "bg-gray-500"} text-xs`}>
        {intensity.toUpperCase()} RAIN
      </Badge>
    );
  };

  const getFloodAlertBadge = (severity: string) => {
    const colors: Record<string, string> = {
      Extreme: "bg-red-700 text-white",
      Severe: "bg-red-600 text-white",
      Moderate: "bg-orange-500 text-white",
      Minor: "bg-yellow-500 text-white",
    };
    return (
      <Badge className={`${colors[severity] || "bg-gray-500"} text-white text-xs`}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  // Card background component
  const CardBackground = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative ${className}`} style={{ borderRadius: '20px', overflow: 'hidden' }}>
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
      <div className="relative z-10" style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6" style={{ background: 'transparent', minHeight: '100vh' }}>
      {/* Header Description */}
      <div style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}>
        <p
          className="text-sm mb-4"
              style={{
            color: '#A0AEC0',
            fontSize: '14px',
            fontFamily: 'Plus Jakarta Display, sans-serif'
          }}
        >
          Monitor parametric insurance policies and automatic payouts in real-time
        </p>

        {/* Test Mode Button */}
        <CardBackground className="p-4 mb-4" style={{ border: '1px solid rgba(234, 179, 8, 0.3)' }}>
          <p className="text-sm mb-2" style={{ color: '#FCD34D' }}>
            💡 <strong>Testing Mode:</strong> Create a test policy with low wind thresholds (5-30 km/h) to trigger payouts immediately
          </p>
            <Button 
            onClick={handleCreateTestPolicy}
            disabled={createTestPolicy.isPending}
              className="transition-all hover:opacity-90"
              style={{
              background: '#F59E0B',
                color: 'white',
                border: 'none',
              }}
            >
            {createTestPolicy.isPending ? "Creating..." : "Create Test Policy"}
            </Button>
        </CardBackground>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Policies */}
        <div 
          className="relative"
          style={{ 
              width: '100%',
              height: '80px',
            borderRadius: '20px',
              overflow: 'hidden'
          }}
        >
          <div 
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
                background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.74) 0%, rgba(26, 31, 55, 0.50) 100%)',
              borderRadius: '20px',
              backdropFilter: 'blur(60px)',
                zIndex: 0
              }}
            />
            <div
              className="relative z-10 w-full h-full"
              style={{
                fontFamily: 'Plus Jakarta Display, sans-serif',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '21.50px',
                  top: '21.50px',
                  color: '#A0AEC0',
                  fontSize: '12px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '400',
                  lineHeight: '12px'
                }}
              >
                Active Policies
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '21.50px',
                  top: '36.50px',
                  color: 'white',
                  fontSize: '18px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '700',
                  lineHeight: '25.20px'
                }}
              >
                {stats.policies.active}
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: '17.50px',
                  top: '17.50px',
                  width: '45px',
                  height: '45px',
                  background: '#0075FF',
                  boxShadow: '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          {/* Pending Payouts */}
          <div
            className="relative"
            style={{
              width: '100%',
              height: '80px',
              borderRadius: '20px',
              overflow: 'hidden'
            }}
          >
          <div 
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
                background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.74) 0%, rgba(26, 31, 55, 0.50) 100%)',
              borderRadius: '20px',
                backdropFilter: 'blur(60px)',
                zIndex: 0
              }}
            />
            <div
              className="relative z-10 w-full h-full"
              style={{
                fontFamily: 'Plus Jakarta Display, sans-serif',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '21.50px',
                  top: '21.50px',
                  color: '#A0AEC0',
                  fontSize: '12px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '400',
                  lineHeight: '12px'
                }}
              >
                Pending Payouts
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '21.50px',
                  top: '36.50px',
                  color: 'white',
                  fontSize: '18px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '700',
                  lineHeight: '25.20px'
                }}
              >
                {stats.payouts.pending.count}
                </div>
              <div
                style={{
                  position: 'absolute',
                  left: '100px',
                  top: '40.50px',
                  color: '#FCD34D',
                  fontSize: '14px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '700',
                  lineHeight: '19.60px'
                }}
              >
                ${stats.payouts.pending.totalAmount.toLocaleString()}
                  </div>
                  <div 
                style={{
                  position: 'absolute',
                  right: '17.50px',
                  top: '17.50px',
                  width: '45px',
                  height: '45px',
                  background: '#F59E0B',
                  boxShadow: '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DollarSign className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

          {/* Approved */}
              <div 
            className="relative"
                style={{
              width: '100%',
              height: '80px',
              borderRadius: '20px',
              overflow: 'hidden'
            }}
          >
            <div
                style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.74) 0%, rgba(26, 31, 55, 0.50) 100%)',
                borderRadius: '20px',
                backdropFilter: 'blur(60px)',
                zIndex: 0
              }}
            />
            <div
              className="relative z-10 w-full h-full"
              style={{
                fontFamily: 'Plus Jakarta Display, sans-serif',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '21.50px',
                  top: '21.50px',
                  color: '#A0AEC0',
                  fontSize: '12px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '400',
                  lineHeight: '12px'
                }}
              >
                Approved
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '21.50px',
                  top: '36.50px',
                  color: 'white',
                  fontSize: '18px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '700',
                  lineHeight: '25.20px'
                }}
              >
                {stats.payouts.approved.count}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '100px',
                  top: '40.50px',
                  color: '#22C55E',
                  fontSize: '14px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '700',
                  lineHeight: '19.60px'
                }}
              >
                ${stats.payouts.approved.totalAmount.toLocaleString()}
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: '17.50px',
                  top: '17.50px',
                  width: '45px',
                  height: '45px',
                  background: '#22C55E',
                  boxShadow: '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

          {/* Rejected */}
        <div 
          className="relative"
          style={{ 
              width: '100%',
              height: '80px',
            borderRadius: '20px',
              overflow: 'hidden'
          }}
        >
          <div 
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
                background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.74) 0%, rgba(26, 31, 55, 0.50) 100%)',
              borderRadius: '20px',
              backdropFilter: 'blur(60px)',
                zIndex: 0
            }}
          />
          <div 
              className="relative z-10 w-full h-full"
            style={{
                fontFamily: 'Plus Jakarta Display, sans-serif',
                position: 'relative'
              }}
            >
              <div
                style={{
              position: 'absolute',
                  left: '21.50px',
                  top: '21.50px',
                  color: '#A0AEC0',
                  fontSize: '12px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '400',
                  lineHeight: '12px'
                }}
              >
                Rejected
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '21.50px',
                  top: '36.50px',
                  color: 'white',
                  fontSize: '18px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '700',
                  lineHeight: '25.20px'
                }}
              >
                {stats.payouts.rejected.count}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '100px',
                  top: '40.50px',
                  color: '#EF4444',
                  fontSize: '14px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '700',
                  lineHeight: '19.60px'
                }}
              >
                ${stats.payouts.rejected.totalAmount.toLocaleString()}
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: '17.50px',
                  top: '17.50px',
                  width: '45px',
                  height: '45px',
                  background: '#EF4444',
                  boxShadow: '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <XCircle className="h-5 w-5 text-white" />
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Section */}
      <CardBackground className="p-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search policies, locations, or triggers..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-4 py-2.5 rounded-lg transition-all"
            style={{
              background: 'rgba(26, 31, 55, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              outline: 'none',
              fontFamily: 'Plus Jakarta Display, sans-serif',
              fontSize: '14px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(0, 117, 255, 0.5)';
              e.target.style.background = 'rgba(26, 31, 55, 0.8)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.background = 'rgba(26, 31, 55, 0.6)';
            }}
          />
          <Button
            onClick={handleSearch}
            className="transition-all hover:opacity-90"
            style={{
              background: '#0075FF',
              color: 'white',
              border: 'none',
              fontFamily: 'Plus Jakarta Display, sans-serif'
            }}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </CardBackground>

      {/* Policies List */}
      <CardBackground className="p-6">
        <div className="mb-4">
          <h3 className="text-white text-lg font-bold mb-1 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Active Policies
            </h3>
          <p className="text-sm" style={{ color: '#A0AEC0' }}>
            Insurance policies with parametric wind speed and flood risk triggers
          </p>
        </div>

            <div className="space-y-4">
          {policies.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: '#A0AEC0' }}>No policies found</p>
              <p className="text-xs mt-1" style={{ color: '#718096' }}>
                Create a test policy to get started
              </p>
            </div>
          ) : (
            policies.map((policy) => (
              <div
                key={policy.id}
                className="rounded-lg p-4 space-y-3"
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-medium text-sm mb-2">{policy.holder.name}</h3>
                    <p className="text-xs" style={{ color: '#A0AEC0' }}>{policy.location.address}</p>
                    <p className="text-xs" style={{ color: '#718096' }}>
                      {policy.location.lat.toFixed(4)}°N, {Math.abs(policy.location.lon).toFixed(4)}°W
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge style={{ background: '#0075FF', color: 'white', fontSize: '10px' }}>
                      {policy.id}
                    </Badge>
                    <p className="text-xs mt-1" style={{ color: '#A0AEC0' }}>{policy.coverage.type}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: '#22C55E' }}>
                      ${policy.coverage.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Triggers */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold" style={{ color: '#CBD5E0' }}>Triggers:</p>
                  {policy.triggers.map((trigger, idx) => (
                    <div
                      key={idx}
                      className="rounded p-2 flex justify-between items-center"
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {trigger.type === 'wind_speed' ? (
                          <Wind className="h-4 w-4" style={{ color: '#60A5FA' }} />
                        ) : (
                          <Waves className="h-4 w-4" style={{ color: '#22D3EE' }} />
                        )}
                        <div>
                          <p className="text-xs" style={{ color: 'white' }}>{trigger.description}</p>
                          <p className="text-xs" style={{ color: '#A0AEC0' }}>
                            {trigger.type === 'wind_speed'
                              ? `Wind ≥ ${trigger.threshold} km/h`
                              : `Flood Risk ≥ ${String(trigger.threshold).toUpperCase()}`}
                          </p>
                  </div>
                </div>
                      <p className="text-xs font-bold" style={{ color: '#22C55E' }}>
                        ${trigger.payout.toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>

                {/* Evaluate Button */}
                <Button
                  onClick={() => handleEvaluate(policy.id)}
                  disabled={evaluatePolicy.isPending && selectedPolicy === policy.id}
                  className="w-full transition-all hover:opacity-90"
                  style={{
                    background: '#0075FF',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  <Wind className="h-4 w-4 mr-2" />
                  {evaluatePolicy.isPending && selectedPolicy === policy.id
                    ? "Evaluating Conditions..."
                    : "Evaluate Triggers Now"}
                </Button>

                {/* Show evaluation results */}
                {evaluationResults && selectedPolicy === policy.id && (
                  <div
                    className="rounded-lg p-4 space-y-3 mt-3"
                style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(0, 117, 255, 0.5)',
                    }}
                  >
                    <h4 className="text-xs font-semibold" style={{ color: '#60A5FA' }}>Latest Evaluation Results</h4>

                    {/* Wind Data Sources */}
                    {evaluationResults.triggersEvaluated[0]?.windData?.sources && (
                      <div className="space-y-2">
                        <p className="text-xs" style={{ color: '#A0AEC0' }}>Wind Measurement Sources:</p>
                        {evaluationResults.triggersEvaluated[0].windData.sources.map((source: WindSource, idx: number) => (
                          <div
                            key={idx}
                            className="rounded p-2"
                style={{
                              background: 'rgba(26, 31, 55, 0.6)',
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-medium" style={{ color: 'white' }}>{source.source}</p>
                                <p className="text-xs" style={{ color: '#A0AEC0' }}>{source.method}</p>
                                <p className="text-xs" style={{ color: '#718096' }}>Delay: {source.delay}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold" style={{ color: '#60A5FA' }}>
                                  {source.windSpeed.toFixed(1)} km/h
                                </p>
                                {getConfidenceBadge(source.confidence)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Wind Consensus */}
                    {evaluationResults.triggersEvaluated[0]?.windData?.consensus && (
                      <div
                        className="rounded p-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(29, 78, 216, 0.3) 100%)',
                        }}
                      >
                        <p className="text-xs mb-1" style={{ color: '#93C5FD' }}>CONSENSUS WIND SPEED</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xl font-bold" style={{ color: 'white' }}>
                              {evaluationResults.triggersEvaluated[0].windData.consensus.windSpeed.toFixed(1)} km/h
                            </p>
                            <p className="text-xs" style={{ color: '#CBD5E0' }}>
                              Range: {evaluationResults.triggersEvaluated[0].windData.consensus.range.min.toFixed(1)} -{' '}
                              {evaluationResults.triggersEvaluated[0].windData.consensus.range.max.toFixed(1)} km/h
                </p>
              </div>
                          <div className="text-right">
                            {getConfidenceBadge(evaluationResults.triggersEvaluated[0].windData.consensus.confidence)}
                            <p className="text-xs mt-1" style={{ color: '#CBD5E0' }}>
                              {evaluationResults.triggersEvaluated[0].windData.consensus.sourceCount} sources
                            </p>
            </div>
          </div>
        </div>
                    )}

                    {/* Flood Data Sources */}
                    {evaluationResults.triggersEvaluated[0]?.floodData?.sources && (
                      <div className="space-y-2">
                        <p className="text-xs" style={{ color: '#A0AEC0' }}>Flood Data Sources:</p>
                        {evaluationResults.triggersEvaluated[0].floodData.sources.map((source: FloodSource, idx: number) => (
                          <div
                            key={idx}
                            className="rounded p-2"
          style={{ 
                              background: 'rgba(26, 31, 55, 0.6)',
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-xs font-medium" style={{ color: 'white' }}>{source.source}</p>
                                <p className="text-xs" style={{ color: '#A0AEC0' }}>{source.method}</p>
                                {source.waterLevel && (
                                  <p className="text-xs mt-1" style={{ color: '#22D3EE' }}>
                                    Water Level: {source.waterLevel.toFixed(2)} ft{' '}
                                    {source.floodStage && `(Flood Stage: ${source.floodStage.toFixed(2)} ft)`}
                                  </p>
                                )}
                                {source.precipitation24h !== undefined && (
                                  <div className="mt-2 space-y-1">
                                    <p className="text-xs" style={{ color: '#22D3EE' }}>
                                      Precipitation: {source.precipitation24h.toFixed(1)} mm (24h) •{' '}
                                      {source.precipitation7d?.toFixed(1)} mm (7d)
                                    </p>
                                    {source.intensity && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs" style={{ color: '#A0AEC0' }}>Rain Intensity:</span>
                                        {getRainIntensityBadge(source.intensity)}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {source.saturation !== undefined && (
                                  <p className="text-xs mt-1" style={{ color: '#22D3EE' }}>
                                    Soil Saturation: {source.saturation}%
                                  </p>
                                )}
                                {source.alertCount && source.alertCount > 0 && (
                                  <div className="mt-2 space-y-1">
                                    <p className="text-xs font-semibold" style={{ color: '#EF4444' }}>
                                      ⚠️ {source.alertCount} Flood Alert(s)
                                    </p>
                                    {source.alerts?.map((alert, alertIdx) => (
                                      <div
                                        key={alertIdx}
                                        className="rounded p-2"
            style={{
                                          background: 'rgba(127, 29, 29, 0.3)',
                                          border: '1px solid rgba(239, 68, 68, 0.5)',
                                        }}
                                      >
                                        <div className="flex items-center gap-2 mb-1">
                                          {getFloodAlertBadge(alert.severity)}
                                          <span className="text-xs font-medium" style={{ color: '#FCA5A5' }}>
                                            {alert.event}
                                          </span>
                                        </div>
                                        <p className="text-xs" style={{ color: '#FEE2E2' }}>{alert.headline}</p>
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

                    {/* Flood Risk Assessment */}
                    {evaluationResults.triggersEvaluated[0]?.floodData?.assessment && (
                      <div
                        className="rounded p-3"
            style={{
                          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(8, 145, 178, 0.3) 100%)',
                        }}
                      >
                        <p className="text-xs mb-1" style={{ color: '#67E8F9' }}>FLOOD RISK ASSESSMENT</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xl font-bold" style={{ color: 'white' }}>
                              {evaluationResults.triggersEvaluated[0].floodData.assessment.riskLevel.toUpperCase()}
                            </p>
                            <p className="text-xs" style={{ color: '#CBD5E0' }}>
                              Risk Score: {evaluationResults.triggersEvaluated[0].floodData.assessment.riskScore}/100
                            </p>
                          </div>
                          <div className="text-right">
                            {getConfidenceBadge(evaluationResults.triggersEvaluated[0].floodData.assessment.confidence)}
                            <p className="text-xs mt-1" style={{ color: '#CBD5E0' }}>
                              {evaluationResults.triggersEvaluated[0].floodData.assessment.sourceCount} sources
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trigger Status */}
                    <div>
                      <p className="text-xs mb-2" style={{ color: '#A0AEC0' }}>Trigger Status:</p>
                      {evaluationResults.triggersEvaluated.map((evaluation: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs mb-1">
                          {evaluation.activated ? (
                            <AlertCircle className="h-3 w-3" style={{ color: '#EF4444' }} />
                          ) : (
                            <CheckCircle className="h-3 w-3" style={{ color: '#22C55E' }} />
                          )}
                          <span style={{ color: evaluation.activated ? '#EF4444' : '#22C55E' }}>
                            {evaluation.reason}
                          </span>
                        </div>
                      ))}
                    </div>

                    {evaluationResults.triggersActivated.length > 0 && (
                      <Badge
                        className="w-full justify-center"
                        style={{
                          background: '#EF4444',
                          color: 'white',
                        }}
                      >
                        {evaluationResults.triggersActivated.length} TRIGGER(S) ACTIVATED - Payout Pending
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardBackground>

      {/* Pending Payouts */}
      {pendingPayouts.length > 0 && (
        <CardBackground className="p-6" style={{ border: '2px solid rgba(234, 179, 8, 0.5)' }}>
          <div className="mb-4">
            <h3 className="text-white text-lg font-bold mb-1 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" style={{ color: '#FCD34D' }} />
              Pending Payouts - Admin Approval Required
            </h3>
            <p className="text-sm" style={{ color: '#A0AEC0' }}>
              Review and approve or reject payouts based on satellite evidence
            </p>
          </div>

          {/* Admin Credentials */}
          <div
            className="rounded-lg p-4 space-y-3 mb-4"
            style={{
              background: 'rgba(26, 31, 55, 0.4)',
            }}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'white' }}>Admin Credentials</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="adminEmail" className="text-xs" style={{ color: '#CBD5E0' }}>Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="mt-1"
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                  }}
                />
              </div>
              <div>
                <Label htmlFor="adminPassword" className="text-xs" style={{ color: '#CBD5E0' }}>Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="mt-1"
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                  }}
                />
            </div>
            </div>
          </div>

          {/* Payouts */}
            <div className="space-y-4">
            {pendingPayouts.map((payout) => (
              <div
                key={payout.id}
                className="rounded-lg p-4 space-y-4"
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-medium text-sm mb-2">{payout.holder.name}</h3>
                    <p className="text-xs" style={{ color: '#A0AEC0' }}>{payout.location.address}</p>
                    <Badge className="mt-2" style={{ background: '#F59E0B', color: 'white', fontSize: '10px' }}>
                      {payout.id}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: '#A0AEC0' }}>Payout Amount</p>
                    <p className="text-xl font-bold" style={{ color: '#22C55E' }}>
                      ${payout.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Trigger Info */}
                <div
                  className="rounded p-3"
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                  }}
                >
                  <p className="text-xs" style={{ color: '#A0AEC0' }}>Triggered By</p>
                  <p className="text-sm font-semibold" style={{ color: 'white' }}>{payout.trigger.description}</p>
                  <p className="text-xs" style={{ color: '#A0AEC0' }}>
                    Threshold:{' '}
                    {typeof payout.trigger.threshold === 'number'
                      ? `${payout.trigger.threshold} km/h`
                      : String(payout.trigger.threshold).toUpperCase() + ' risk'}
                  </p>
                </div>

                {/* Evidence */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold" style={{ color: 'white' }}>Satellite Evidence:</p>

                  {/* Wind Consensus */}
                  {payout.evidence.windData && (
                    <>
                      <div
                        className="rounded p-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(29, 78, 216, 0.3) 100%)',
                        }}
                      >
                        <p className="text-xs" style={{ color: '#93C5FD' }}>CONSENSUS WIND MEASUREMENT</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-lg font-bold" style={{ color: 'white' }}>
                            {payout.evidence.windData.consensus.windSpeed.toFixed(1)} km/h
                          </p>
                          {getConfidenceBadge(payout.evidence.windData.consensus.confidence)}
                  </div>
                        <p className="text-xs mt-1" style={{ color: '#CBD5E0' }}>
                          {payout.evidence.windData.consensus.sourceCount} sources • σ ={' '}
                          {payout.evidence.windData.consensus.standardDeviation.toFixed(1)} km/h
                        </p>
                      </div>

                      {/* Wind Sources */}
                      {payout.evidence.windData.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className="rounded p-2 flex justify-between items-center"
                          style={{
                            background: 'rgba(15, 23, 42, 0.6)',
                          }}
                        >
                          <div>
                            <p className="text-xs" style={{ color: 'white' }}>{source.source}</p>
                            <p className="text-xs" style={{ color: '#A0AEC0' }}>{source.method}</p>
                  </div>
                          <div className="text-right">
                            <p className="text-sm font-bold" style={{ color: '#60A5FA' }}>
                              {source.windSpeed.toFixed(1)} km/h
                            </p>
                            {getConfidenceBadge(source.confidence)}
                </div>
              </div>
                      ))}
                    </>
                  )}

                  {/* Flood Risk Summary */}
                  {payout.evidence.floodData && (
                    <>
              <div 
                        className="rounded p-3 space-y-2"
                style={{
                          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(8, 145, 178, 0.3) 100%)',
                          border: '2px solid rgba(6, 182, 212, 0.5)',
                        }}
                      >
                        <p className="text-xs font-bold uppercase" style={{ color: '#67E8F9' }}>
                          🌊 Flood Evidence
                        </p>

                        {/* Rain Intensity */}
                        {payout.evidence.floodData.sources.find((s) => s.intensity) && (
                          <div
                            className="rounded p-2"
                style={{
                              background: 'rgba(26, 31, 55, 0.5)',
                            }}
                          >
                            <p className="text-xs mb-1" style={{ color: '#CBD5E0' }}>Rain Intensity</p>
                            {getRainIntensityBadge(
                              payout.evidence.floodData.sources.find((s) => s.intensity)?.intensity || 'none'
                            )}
                            <p className="text-xs mt-1" style={{ color: '#A5F3FC' }}>
                              {payout.evidence.floodData.sources.find((s) => s.precipitation24h)?.precipitation24h?.toFixed(1)} mm in 24h
                            </p>
                          </div>
                        )}

                        {/* Flood Warnings */}
                        {payout.evidence.floodData.sources.find((s) => s.alertCount && s.alertCount > 0) && (
                          <div
                            className="rounded p-2"
                            style={{
                              background: 'rgba(127, 29, 29, 0.4)',
                              border: '1px solid rgba(239, 68, 68, 0.5)',
                            }}
                          >
                            <p className="text-xs font-bold mb-1" style={{ color: '#FCA5A5' }}>
                              ⚠️ {payout.evidence.floodData.sources.find((s) => s.alertCount)?.alertCount} Flood
                              Warning(s)
                            </p>
                            {payout.evidence.floodData.sources
                              .find((s) => s.alerts)
                              ?.alerts?.map((alert, idx) => (
                                <div key={idx} className="flex items-center gap-1 mb-1">
                                  {getFloodAlertBadge(alert.severity)}
                                  <span className="text-xs" style={{ color: '#FEE2E2' }}>
                                    {alert.event}
                                  </span>
              </div>
                              ))}
            </div>
                        )}
          </div>

                      <div
                        className="rounded p-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(8, 145, 178, 0.3) 100%)',
                        }}
                      >
                        <p className="text-xs" style={{ color: '#67E8F9' }}>FLOOD RISK ASSESSMENT</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-lg font-bold" style={{ color: 'white' }}>
                            {payout.evidence.floodData.assessment.riskLevel.toUpperCase()}
                          </p>
                          {getConfidenceBadge(payout.evidence.floodData.assessment.confidence)}
        </div>
                        <p className="text-xs mt-1" style={{ color: '#CBD5E0' }}>
                          {payout.evidence.floodData.assessment.sourceCount} sources • Risk Score:{' '}
                          {payout.evidence.floodData.assessment.riskScore}/100
                        </p>
      </div>

                      {/* Flood Sources */}
                      {payout.evidence.floodData.sources.map((source, idx) => (
      <div 
                          key={idx}
                          className="rounded p-2"
        style={{ 
                            background: 'rgba(15, 23, 42, 0.6)',
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-xs font-medium" style={{ color: 'white' }}>{source.source}</p>
                              <p className="text-xs" style={{ color: '#A0AEC0' }}>{source.method}</p>
                              {source.waterLevel && (
                                <p className="text-xs mt-1" style={{ color: '#22D3EE' }}>
                                  Water: {source.waterLevel.toFixed(2)} ft{' '}
                                  {source.floodStage && `(Flood Stage: ${source.floodStage.toFixed(2)} ft)`}
                                </p>
                              )}
                              {source.precipitation24h !== undefined && (
                                <div className="mt-1 space-y-1">
                                  <p className="text-xs" style={{ color: '#22D3EE' }}>
                                    Precip: {source.precipitation24h.toFixed(1)} mm (24h) •{' '}
                                    {source.precipitation7d?.toFixed(1)} mm (7d)
                                  </p>
                                  {source.intensity && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs" style={{ color: '#CBD5E0' }}>Intensity:</span>
                                      {getRainIntensityBadge(source.intensity)}
                                    </div>
                                  )}
                                </div>
                              )}
                              {source.saturation !== undefined && (
                                <p className="text-xs mt-1" style={{ color: '#22D3EE' }}>
                                  Soil: {source.saturation}%
                                </p>
                              )}
                              {source.alertCount && source.alertCount > 0 && (
                                <div className="mt-1 space-y-1">
                                  <p className="text-xs font-semibold" style={{ color: '#FCA5A5' }}>
                                    ⚠️ {source.alertCount} Alert(s)
                                  </p>
                                  {source.alerts?.map((alert, alertIdx) => (
                                    <div
                                      key={alertIdx}
                                      className="rounded p-1.5"
          style={{
                                        background: 'rgba(127, 29, 29, 0.4)',
                                        border: '1px solid rgba(239, 68, 68, 0.5)',
                                      }}
                                    >
                                      <div className="flex items-center gap-1 mb-0.5">
                                        {getFloodAlertBadge(alert.severity)}
                                        <span className="text-xs" style={{ color: '#FEE2E2' }}>
                                          {alert.event}
                                        </span>
                                      </div>
                                      <p className="text-xs" style={{ color: '#FEE2E2' }}>{alert.headline}</p>
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
                  <Label htmlFor={`reason-${payout.id}`} className="text-xs" style={{ color: '#CBD5E0' }}>
                    Rejection Reason (optional)
                  </Label>
                  <Textarea
                    id={`reason-${payout.id}`}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason if rejecting this payout..."
                    className="mt-1"
          style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                    }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(payout.id)}
                    disabled={approvePayout.isPending}
                    className="flex-1 transition-all hover:opacity-90"
                    style={{
                      background: '#22C55E',
                      color: 'white',
                      border: 'none',
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Payout
                  </Button>
                  <Button
                    onClick={() => handleReject(payout.id)}
                    disabled={rejectPayout.isPending}
                    className="flex-1 transition-all hover:opacity-90"
                        style={{
                      background: '#EF4444',
                      color: 'white',
                      border: 'none',
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Payout
                  </Button>
                      </div>
              </div>
                ))}
          </div>
        </CardBackground>
      )}

      {pendingPayouts.length === 0 && (
        <CardBackground className="p-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-3" style={{ color: '#22C55E' }} />
          <p style={{ color: '#A0AEC0' }}>No pending payouts at this time</p>
          <p className="text-xs mt-1" style={{ color: '#718096' }}>
            Evaluate policy triggers to check current wind and flood conditions
          </p>
        </CardBackground>
      )}
    </div>
  );
}
