import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Flight Delay Insurance</h1>
        <p className="text-muted-foreground">Real-time monitoring and automatic payouts</p>
      </div>

      {/* Controls Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <select className="w-full px-3 py-2 border rounded-md">
                <option>Miami International (MIA)</option>
                <option>JFK International (JFK)</option>
                <option>LAX International (LAX)</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Area Placeholder */}
      <Card>
        <CardContent className="p-6">
          <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300">
            <div className="text-center">
              <p className="text-lg font-medium text-blue-900">Flight Path Map</p>
              <p className="text-sm text-blue-700">Weather overlay and risk zones visualization</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Risk Flights Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚠️ High Risk Flights (Next 6 hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flight Number</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Delay Risk</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Auto-Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flights.map((flight) => (
                <TableRow key={flight.flight}>
                  <TableCell className="font-medium">{flight.flight}</TableCell>
                  <TableCell>{flight.route}</TableCell>
                  <TableCell>{flight.departure}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        flight.riskLevel === "high"
                          ? "destructive"
                          : flight.riskLevel === "medium"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {flight.risk}%{" "}
                      {flight.riskLevel === "high"
                        ? "🔴"
                        : flight.riskLevel === "medium"
                        ? "🟠"
                        : "🟡"}
                    </Badge>
                  </TableCell>
                  <TableCell>{flight.reason}</TableCell>
                  <TableCell className="font-bold">{flight.payout}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-2xl font-bold">💰 Automated Payouts Triggered Today</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Passengers Compensated</p>
                <p className="text-3xl font-bold">47</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Disbursed</p>
                <p className="text-3xl font-bold text-primary">$6,800</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Processing Time</p>
                <p className="text-3xl font-bold">3 min</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
