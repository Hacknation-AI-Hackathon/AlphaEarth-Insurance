import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, FileText, Bell, Mail } from "lucide-react";

export default function ImpactMap() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Disaster Impact Mapping</h1>
          <p className="text-muted-foreground">Real-time property exposure tracking</p>
        </div>
      </div>

      {/* Event Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[300px]">
              <select className="w-full px-3 py-2 border rounded-md">
                <option>Hurricane Elena | Category 4 | Oct 15, 2024</option>
                <option>Hurricane Delta | Category 3 | Sep 28, 2024</option>
                <option>Tropical Storm Charlie | Jul 12, 2024</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Last updated: 2 minutes ago</span>
              <Button size="sm" variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Large Map Placeholder */}
      <Card>
        <CardContent className="p-6">
          <div className="h-[500px] bg-gradient-to-br from-blue-50 via-orange-50 to-red-50 rounded-lg border-2 border-dashed border-gray-300 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">Interactive Disaster Map</p>
                <p className="text-sm text-gray-600">
                  Hurricane path, storm cone, and property risk zones
                </p>
              </div>
            </div>

            {/* Map Legend Overlay */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-2 min-w-[200px]">
              <p className="font-bold text-sm mb-2">Risk Zones</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Critical</span>
                </div>
                <span className="font-bold">45</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>High Risk</span>
                </div>
                <span className="font-bold">67</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Moderate</span>
                </div>
                <span className="font-bold">89</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Low Risk</span>
                </div>
                <span className="font-bold">156</span>
              </div>
            </div>

            {/* Sample Hurricane Path */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full">
                <path
                  d="M 100 400 Q 200 300, 300 250 Q 400 200, 500 150"
                  stroke="#DC2626"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="10,5"
                />
                <circle cx="500" cy="150" r="8" fill="#DC2626" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Impact Card */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Impact Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Insured Value</p>
              <p className="text-3xl font-bold text-primary">$47.2M</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Estimated Total Damage</p>
              <p className="text-3xl font-bold text-red-600">$12.8M</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Auto-Approved Claims</p>
              <p className="text-3xl font-bold text-green-600">$4.2M</p>
              <p className="text-xs text-muted-foreground">89 properties</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-3xl font-bold text-orange-600">$8.6M</p>
              <p className="text-xs text-muted-foreground">112 properties</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Worst-Case Scenario Card */}
      <Card className="border-orange-500 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Worst-Case Scenario Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-medium">If storm shifts 20 miles east:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Additional Exposure</p>
              <p className="text-2xl font-bold text-orange-700">$23.1M</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Additional Properties at Risk</p>
              <p className="text-2xl font-bold text-orange-700">156</p>
            </div>
          </div>
          <Button className="w-full md:w-auto mt-2">Run Simulation</Button>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Impact Report
        </Button>
        <Button variant="outline">
          <Bell className="h-4 w-4 mr-2" />
          Alert All Field Agents
        </Button>
        <Button variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          Email Stakeholders
        </Button>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
}
