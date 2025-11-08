import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Waves, Wind, CloudRain } from "lucide-react";
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">⚡ Parametric Insurance</h1>
        <p className="text-muted-foreground">Live Monitoring - Gulf Coast Region</p>
        <Badge className="mt-2" variant="secondary">
          No paperwork - Automatic payouts
        </Badge>
      </div>

      {/* Trigger Monitors - 3 Large Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water Level Monitor */}
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                <Waves className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-center">🌊 Water Level Monitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current Reading</p>
              <p className="text-5xl font-bold text-primary">8.2 ft</p>
              <p className="text-sm text-muted-foreground mt-1">Threshold: 8.0 ft</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Threshold Status</span>
                <span className="font-bold text-red-600">103%</span>
              </div>
              <Progress value={103} className="h-3 bg-red-200 animate-pulse" />
            </div>

            <Badge variant="destructive" className="w-full justify-center text-base py-2">
              ⚠️ THRESHOLD EXCEEDED
            </Badge>

            <div className="bg-green-100 border border-green-500 rounded-lg p-4 text-center">
              <p className="font-bold text-green-900">✅ AUTO-PAYOUT TRIGGERED</p>
              <p className="text-2xl font-bold text-green-700 mt-2">$5,000</p>
              <p className="text-xs text-green-700 mt-1">Triggered 15 minutes ago</p>
            </div>
          </CardContent>
        </Card>

        {/* Wind Speed Monitor */}
        <Card className="border-orange-500 bg-orange-50">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-500 flex items-center justify-center">
                <Wind className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-center">💨 Wind Speed Monitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current Reading</p>
              <p className="text-5xl font-bold text-primary">145 km/h</p>
              <p className="text-sm text-muted-foreground mt-1">Threshold: 150 km/h</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Threshold Status</span>
                <span className="font-bold text-orange-600">96%</span>
              </div>
              <Progress value={96} className="h-3 bg-orange-200 animate-pulse" />
            </div>

            <Badge variant="secondary" className="w-full justify-center text-base py-2">
              ⏳ Monitoring - Near threshold
            </Badge>

            <div className="bg-yellow-100 border border-yellow-500 rounded-lg p-4 text-center">
              <p className="font-bold text-yellow-900">Payout pending...</p>
              <p className="text-2xl font-bold text-yellow-700 mt-2">$5,000 ready</p>
              <p className="text-xs text-yellow-700 mt-1">Monitoring closely</p>
            </div>
          </CardContent>
        </Card>

        {/* Rainfall Monitor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center">
                <CloudRain className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-center">🌧️ Rainfall Monitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current Reading</p>
              <p className="text-5xl font-bold text-primary">285mm</p>
              <p className="text-sm text-muted-foreground mt-1">24hr total | Threshold: 300mm</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Threshold Status</span>
                <span className="font-bold text-yellow-600">95%</span>
              </div>
              <Progress value={95} className="h-3" />
            </div>

            <Badge variant="secondary" className="w-full justify-center text-base py-2">
              👁️ Active Monitoring
            </Badge>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
              <p className="font-medium text-gray-700">No payout yet</p>
              <p className="text-sm text-gray-600 mt-1">Within normal range</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Automatic Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trigger Type</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Actual Value</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Payout Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutHistory.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{entry.trigger}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell className="font-bold">{entry.actual}</TableCell>
                  <TableCell>{entry.threshold}</TableCell>
                  <TableCell className="font-bold text-green-600">{entry.amount}</TableCell>
                  <TableCell>
                    <Badge variant="default">{entry.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
