import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Waves, Wind, CloudRain, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParametricPolicies, usePendingParametricPayouts, useEvaluatePolicy, useCreateTestPolicy } from "@/hooks/useParametric";
import { useToast } from "@/hooks/use-toast";

const payoutHistory = [
  {
    trigger: "Water Level",
    date: "Oct 15, 2024 14:45",
    actual: "8.2 ft",
    threshold: "8.0 ft",
    amount: "$5,000",
    status: "Paid",
  },
  {
    trigger: "Rainfall",
    date: "Oct 12, 2024 09:30",
    actual: "310mm",
    threshold: "300mm",
    amount: "$5,000",
    status: "Paid",
  },
  {
    trigger: "Wind Speed",
    date: "Oct 8, 2024 22:15",
    actual: "155 km/h",
    threshold: "150 km/h",
    amount: "$5,000",
    status: "Paid",
  },
  {
    trigger: "Water Level",
    date: "Oct 3, 2024 11:20",
    actual: "8.1 ft",
    threshold: "8.0 ft",
    amount: "$5,000",
    status: "Paid",
  },
];

export default function Parametric() {
  const [searchInput, setSearchInput] = useState("");

  // Fetch real parametric data from backend
  const { data: policiesData, isLoading: policiesLoading } = useParametricPolicies();
  const { data: payoutsData, isLoading: payoutsLoading } = usePendingParametricPayouts();
  const evaluatePolicy = useEvaluatePolicy();
  const createTestPolicy = useCreateTestPolicy();
  const { toast } = useToast();

  // Log data to console
  console.log("Parametric Data:", {
    policies: policiesData?.policies || [],
    payouts: payoutsData?.payouts || []
  });

  // Handle evaluate policy
  const handleEvaluate = async (policyId: string) => {
    try {
      await evaluatePolicy.mutateAsync(policyId);
      toast({
        title: "Policy Evaluated",
        description: "Triggers evaluated successfully! Check payouts for results.",
      });
    } catch (error) {
      toast({
        title: "Evaluation Failed",
        description: error instanceof Error ? error.message : "Failed to evaluate policy",
        variant: "destructive",
      });
    }
  };

  // Handle create test policy
  const handleCreateTestPolicy = async () => {
    try {
      await createTestPolicy.mutateAsync();
      toast({
        title: "Test Policy Created",
        description: "Test policy with low wind thresholds created successfully!",
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create test policy",
        variant: "destructive",
      });
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      toast({
        title: "Search",
        description: `Searching for: ${searchInput}`,
      });
      // Add search functionality here
    }
  };
  
  return (
    <div className="space-y-6" style={{ background: 'transparent', minHeight: '100vh' }}>
      {/* Description */}
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
      </div>

      {/* Search Section */}
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
        </div>
      </div>

      {/* Trigger Monitors - 3 Large Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Water Level Monitor */}
        <div 
          className="relative"
          style={{ 
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(239, 68, 68, 0.3)'
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
          
          {/* Background Layer 2 - Gradient overlay with red tint */}
          <div 
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
              background: 'linear-gradient(85deg, rgba(239, 68, 68, 0.1) 0%, #1A1F37 100%, #1A1F37 100%)',
              borderRadius: '20px',
              zIndex: 2
            }}
          />
          
          {/* Content */}
          <div 
            className="relative z-10 p-6"
            style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
          >
            <div className="flex items-center justify-center mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#0075FF' }}
              >
                <Waves className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 
              className="text-center text-lg font-bold mb-4"
              style={{ color: 'white' }}
            >
              Water Level Monitor
            </h3>
            <div className="space-y-4">
              {/* Main Information Container */}
              <div className="space-y-4">
                <div className="text-center">
                  <p 
                    className="text-sm mb-1"
                    style={{ color: '#A0AEC0' }}
                  >
                    Current Reading
                  </p>
                  <p 
                    className="text-5xl font-bold"
                    style={{ color: '#0075FF' }}
                  >
                    8.2 ft
                  </p>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: '#A0AEC0' }}
                  >
                    Threshold: 8.0 ft
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#A0AEC0' }}>Threshold Status</span>
                    <span 
                      className="font-bold"
                      style={{ color: '#EF4444' }}
                    >
                      103%
                    </span>
                  </div>
                  <div 
                    className="w-full h-3 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div 
                      className="h-full rounded-full animate-pulse"
                      style={{ width: '103%', background: '#EF4444', maxWidth: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Message Container */}
              <div 
                className="w-full text-center py-2 rounded-lg"
                style={{
                  background: 'rgba(148, 163, 184, 0.2)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#94A3B8'
                }}
              >
                <span className="font-medium text-base">
                  THRESHOLD EXCEEDED
                </span>
              </div>

              {/* Payout Message Container */}
              <div 
                className="rounded-lg p-4 text-center"
                style={{
                  background: 'rgba(148, 163, 184, 0.2)',
                  border: '1px solid rgba(148, 163, 184, 0.3)'
                }}
              >
                <p 
                  className="font-bold"
                  style={{ color: '#94A3B8' }}
                >
                  AUTO-PAYOUT TRIGGERED
                </p>
                <p 
                  className="text-2xl font-bold mt-2"
                  style={{ color: '#94A3B8' }}
                >
                  $5,000
                </p>
                <p 
                  className="text-xs mt-1"
                  style={{ color: '#94A3B8' }}
                >
                  Triggered 15 minutes ago
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wind Speed Monitor */}
        <div 
          className="relative"
          style={{ 
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(245, 158, 11, 0.3)'
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
          
          {/* Background Layer 2 - Gradient overlay with orange tint */}
          <div 
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
              background: 'linear-gradient(85deg, rgba(245, 158, 11, 0.1) 0%, #1A1F37 100%, #1A1F37 100%)',
              borderRadius: '20px',
              zIndex: 2
            }}
          />
          
          {/* Content */}
          <div 
            className="relative z-10 p-6"
            style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
          >
            <div className="flex items-center justify-center mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#94A3B8' }}
              >
                <Wind className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 
              className="text-center text-lg font-bold mb-4"
              style={{ color: 'white' }}
            >
              Wind Speed Monitor
            </h3>
            <div className="space-y-4">
              {/* Main Information Container */}
              <div className="space-y-4">
                <div className="text-center">
                  <p 
                    className="text-sm mb-1"
                    style={{ color: '#A0AEC0' }}
                  >
                    Current Reading
                  </p>
                  <p 
                    className="text-5xl font-bold"
                    style={{ color: '#0075FF' }}
                  >
                    145 km/h
                  </p>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: '#A0AEC0' }}
                  >
                    Threshold: 150 km/h
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#A0AEC0' }}>Threshold Status</span>
                    <span 
                      className="font-bold"
                      style={{ color: '#F59E0B' }}
                    >
                      96%
                    </span>
                  </div>
                  <div 
                    className="w-full h-3 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div 
                      className="h-full rounded-full animate-pulse"
                      style={{ width: '96%', background: '#F59E0B' }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Message Container */}
              <div 
                className="w-full text-center py-2 rounded-lg"
                style={{
                  background: 'rgba(148, 163, 184, 0.2)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#94A3B8'
                }}
              >
                <span className="font-medium text-base">
                  Monitoring - Near threshold
                </span>
              </div>

              {/* Payout Message Container */}
              <div 
                className="rounded-lg p-4 text-center"
                style={{
                  background: 'rgba(148, 163, 184, 0.2)',
                  border: '1px solid rgba(148, 163, 184, 0.3)'
                }}
              >
                <p 
                  className="font-bold"
                  style={{ color: '#94A3B8' }}
                >
                  Payout pending...
                </p>
                <p 
                  className="text-2xl font-bold mt-2"
                  style={{ color: '#94A3B8' }}
                >
                  $5,000 ready
                </p>
                <p 
                  className="text-xs mt-1"
                  style={{ color: '#94A3B8' }}
                >
                  Monitoring closely
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rainfall Monitor */}
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
            <div className="flex items-center justify-center mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#0075FF' }}
              >
                <CloudRain className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 
              className="text-center text-lg font-bold mb-4"
              style={{ color: 'white' }}
            >
              Rainfall Monitor
            </h3>
            <div className="space-y-4">
              {/* Main Information Container */}
              <div className="space-y-4">
                <div className="text-center">
                  <p 
                    className="text-sm mb-1"
                    style={{ color: '#A0AEC0' }}
                  >
                    Current Reading
                  </p>
                  <p 
                    className="text-5xl font-bold"
                    style={{ color: '#0075FF' }}
                  >
                    285mm
                  </p>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: '#A0AEC0' }}
                  >
                    24hr total | Threshold: 300mm
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#A0AEC0' }}>Threshold Status</span>
                    <span 
                      className="font-bold"
                      style={{ color: '#0075FF' }}
                    >
                      95%
                    </span>
                  </div>
                  <div 
                    className="w-full h-3 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div 
                      className="h-full rounded-full"
                      style={{ width: '95%', background: '#0075FF' }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Message Container */}
              <div 
                className="w-full text-center py-2 rounded-lg"
                style={{
                  background: 'rgba(148, 163, 184, 0.2)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#94A3B8'
                }}
              >
                <span className="font-medium text-base">
                  Active Monitoring
                </span>
              </div>

              {/* Payout Message Container */}
              <div 
                className="rounded-lg p-4 text-center"
                style={{
                  background: 'rgba(148, 163, 184, 0.2)',
                  border: '1px solid rgba(148, 163, 184, 0.3)'
                }}
              >
                <p 
                  className="font-medium"
                  style={{ color: '#94A3B8' }}
                >
                  No payout yet
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ color: '#94A3B8' }}
                >
                  Within normal range
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payout History Table */}
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
            Recent Automatic Payouts
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <TableHead style={{ color: '#A0AEC0' }}>Trigger Type</TableHead>
                  <TableHead style={{ color: '#A0AEC0' }}>Date/Time</TableHead>
                  <TableHead style={{ color: '#A0AEC0' }}>Actual Value</TableHead>
                  <TableHead style={{ color: '#A0AEC0' }}>Threshold</TableHead>
                  <TableHead style={{ color: '#A0AEC0' }}>Payout Amount</TableHead>
                  <TableHead style={{ color: '#A0AEC0' }}>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutHistory.map((entry, index) => (
                  <TableRow 
                    key={index}
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <TableCell style={{ color: 'white' }} className="font-medium">{entry.trigger}</TableCell>
                    <TableCell style={{ color: '#A0AEC0' }}>{entry.date}</TableCell>
                    <TableCell style={{ color: 'white' }} className="font-bold">{entry.actual}</TableCell>
                    <TableCell style={{ color: '#A0AEC0' }}>{entry.threshold}</TableCell>
                    <TableCell className="font-bold" style={{ color: '#22C55E' }}>{entry.amount}</TableCell>
                    <TableCell>
                      <div 
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          color: '#22C55E'
                        }}
                      >
                        {entry.status}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
