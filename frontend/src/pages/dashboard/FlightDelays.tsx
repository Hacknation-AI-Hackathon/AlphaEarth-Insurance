import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const flights = [
  {
    flight: "AA2451",
    route: "MIA→JFK",
    departure: "18:45",
    risk: 87,
    reason: "Storm in path",
    payout: "$150",
    riskLevel: "high",
  },
  {
    flight: "DL1893",
    route: "MIA→ATL",
    departure: "19:20",
    risk: 72,
    reason: "Congestion",
    payout: "$100",
    riskLevel: "medium",
  },
  {
    flight: "UA3451",
    route: "MIA→ORD",
    departure: "20:15",
    risk: 64,
    reason: "Weather",
    payout: "$100",
    riskLevel: "medium",
  },
  {
    flight: "SW1234",
    route: "MIA→DEN",
    departure: "21:00",
    risk: 58,
    reason: "Conditions",
    payout: "$75",
    riskLevel: "low",
  },
  {
    flight: "AA8821",
    route: "MIA→LAX",
    departure: "22:30",
    risk: 45,
    reason: "Minor delay",
    payout: "$50",
    riskLevel: "low",
  },
];

export default function FlightDelays() {
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
          Real-time monitoring and automatic payouts
        </p>
      </div>

      {/* Controls Bar */}
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
          className="relative z-10 p-4"
          style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <select 
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option style={{ background: '#1A1F37' }}>Miami International (MIA)</option>
                <option style={{ background: '#1A1F37' }}>JFK International (JFK)</option>
                <option style={{ background: '#1A1F37' }}>LAX International (LAX)</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <input
                type="date"
                className="w-full px-3 py-2 rounded-lg"
                defaultValue={new Date().toISOString().split("T")[0]}
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>
            <Button
              style={{
                background: '#0075FF',
                color: 'white',
                border: 'none'
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Map Area Placeholder */}
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
          <div 
            className="h-64 rounded-lg flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.4) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}
          >
            <div className="text-center">
              <p 
                className="text-lg font-medium mb-1"
                style={{ color: 'white' }}
              >
                Flight Path Map
              </p>
              <p 
                className="text-sm"
                style={{ color: '#A0AEC0' }}
              >
                Weather overlay and risk zones visualization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* High Risk Flights Table */}
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
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{ color: 'white' }}
          >
            ⚠️ High Risk Flights (Next 6 hours)
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <TableHead style={{ color: '#A0AEC0' }}>Flight Number</TableHead>
                  <TableHead style={{ color: '#A0AEC0' }}>Route</TableHead>
                  <TableHead style={{ color: '#A0AEC0' }}>Departure</TableHead>
                  <TableHead style={{ color: '#A0AEC0' }}>Delay Risk</TableHead>
                  <TableHead style={{ color: '#A0AEC0' }}>Reason</TableHead>
                  <TableHead style={{ color: '#A0AEC0' }}>Auto-Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flights.map((flight) => (
                  <TableRow 
                    key={flight.flight}
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <TableCell style={{ color: 'white' }} className="font-medium">{flight.flight}</TableCell>
                    <TableCell style={{ color: '#A0AEC0' }}>{flight.route}</TableCell>
                    <TableCell style={{ color: '#A0AEC0' }}>{flight.departure}</TableCell>
                    <TableCell>
                      <div 
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{
                          background: flight.riskLevel === "high" 
                            ? 'rgba(239, 68, 68, 0.2)' 
                            : flight.riskLevel === "medium"
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(234, 179, 8, 0.2)',
                          color: flight.riskLevel === "high" 
                            ? '#EF4444' 
                            : flight.riskLevel === "medium"
                            ? '#F59E0B'
                            : '#EAB308',
                          border: `1px solid ${flight.riskLevel === "high" 
                            ? '#EF444440' 
                            : flight.riskLevel === "medium"
                            ? '#F59E0B40'
                            : '#EAB30840'}`
                        }}
                      >
                        {flight.risk}%{" "}
                        {flight.riskLevel === "high"
                          ? "🔴"
                          : flight.riskLevel === "medium"
                          ? "🟠"
                          : "🟡"}
                      </div>
                    </TableCell>
                    <TableCell style={{ color: '#A0AEC0' }}>{flight.reason}</TableCell>
                    <TableCell className="font-bold" style={{ color: '#0075FF' }}>{flight.payout}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div 
        className="relative"
        style={{ 
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 117, 255, 0.3)'
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
        
        {/* Background Layer 2 - Gradient overlay with blue tint */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            background: 'linear-gradient(85deg, rgba(0, 117, 255, 0.1) 0%, #1A1F37 100%, #1A1F37 100%)',
            borderRadius: '20px',
            zIndex: 2
          }}
        />
        
        {/* Content */}
        <div 
          className="relative z-10 p-6"
          style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
        >
          <div className="space-y-2">
            <p 
              className="text-2xl font-bold mb-4"
              style={{ color: 'white' }}
            >
              💰 Automated Payouts Triggered Today
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ color: '#A0AEC0' }}
                >
                  Passengers Compensated
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: 'white' }}
                >
                  47
                </p>
              </div>
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ color: '#A0AEC0' }}
                >
                  Total Disbursed
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: '#0075FF' }}
                >
                  $6,800
                </p>
              </div>
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ color: '#A0AEC0' }}
                >
                  Avg Processing Time
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: 'white' }}
                >
                  3 min
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
