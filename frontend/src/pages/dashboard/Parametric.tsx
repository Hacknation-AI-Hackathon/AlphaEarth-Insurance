import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Waves, Wind, CloudRain, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
          ⚡ Parametric Insurance
        </h1>
        <p 
          className="text-sm mb-2"
          style={{ 
            color: '#A0AEC0',
            fontSize: '14px',
            fontFamily: 'Plus Jakarta Display, sans-serif'
          }}
        >
          Live Monitoring - Gulf Coast Region
        </p>
        <div 
          className="inline-block px-3 py-1 rounded-lg"
          style={{ 
            background: 'rgba(148, 163, 184, 0.2)',
            border: '1px solid rgba(148, 163, 184, 0.3)'
          }}
        >
          <span 
            className="text-xs font-medium"
            style={{ color: '#94A3B8' }}
          >
            No paperwork - Automatic payouts
          </span>
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
              🌊 Water Level Monitor
            </h3>
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

              <div 
                className="w-full text-center py-2 rounded-lg"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444'
                }}
              >
                <span className="font-medium text-base">
                  ⚠️ THRESHOLD EXCEEDED
                </span>
              </div>

              <div 
                className="rounded-lg p-4 text-center"
                style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}
              >
                <p 
                  className="font-bold"
                  style={{ color: '#22C55E' }}
                >
                  ✅ AUTO-PAYOUT TRIGGERED
                </p>
                <p 
                  className="text-2xl font-bold mt-2"
                  style={{ color: '#22C55E' }}
                >
                  $5,000
                </p>
                <p 
                  className="text-xs mt-1"
                  style={{ color: '#22C55E' }}
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
              💨 Wind Speed Monitor
            </h3>
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

              <div 
                className="w-full text-center py-2 rounded-lg"
                style={{
                  background: 'rgba(148, 163, 184, 0.2)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#94A3B8'
                }}
              >
                <span className="font-medium text-base">
                  ⏳ Monitoring - Near threshold
                </span>
              </div>

              <div 
                className="rounded-lg p-4 text-center"
                style={{
                  background: 'rgba(234, 179, 8, 0.2)',
                  border: '1px solid rgba(234, 179, 8, 0.3)'
                }}
              >
                <p 
                  className="font-bold"
                  style={{ color: '#EAB308' }}
                >
                  Payout pending...
                </p>
                <p 
                  className="text-2xl font-bold mt-2"
                  style={{ color: '#EAB308' }}
                >
                  $5,000 ready
                </p>
                <p 
                  className="text-xs mt-1"
                  style={{ color: '#EAB308' }}
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
              🌧️ Rainfall Monitor
            </h3>
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
                    style={{ color: '#EAB308' }}
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

              <div 
                className="w-full text-center py-2 rounded-lg"
                style={{
                  background: 'rgba(148, 163, 184, 0.2)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#94A3B8'
                }}
              >
                <span className="font-medium text-base">
                  👁️ Active Monitoring
                </span>
              </div>

              <div 
                className="rounded-lg p-4 text-center"
                style={{
                  background: 'rgba(148, 163, 184, 0.1)',
                  border: '1px solid rgba(148, 163, 184, 0.2)'
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
