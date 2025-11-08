import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, AlertTriangle, Droplets, Flame, Wind } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Navigation } from "@/components/Navigation";
import { RiskMap } from "@/components/RiskMap";

const mockLocations = [
  { name: "San Francisco, CA", lat: 37.7749, lon: -122.4194, flood: 15, wildfire: 45, storm: 25 },
  { name: "Miami, FL", lat: 25.7617, lon: -80.1918, flood: 75, wildfire: 10, storm: 65 },
  { name: "Houston, TX", lat: 29.7604, lon: -95.3698, flood: 60, wildfire: 20, storm: 55 },
];

const Demo = () => {
  const [selectedLocation, setSelectedLocation] = useState(mockLocations[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const getRiskLevel = (score: number): { label: string; color: string } => {
    if (score < 30) return { label: "Low Risk", color: "bg-green-600" };
    if (score < 60) return { label: "Medium Risk", color: "bg-yellow-600" };
    if (score < 80) return { label: "High Risk", color: "bg-orange-600" };
    return { label: "Critical Risk", color: "bg-red-600" };
  };

  const overallRisk = Math.round((selectedLocation.flood + selectedLocation.wildfire + selectedLocation.storm) / 3);
  const riskLevel = getRiskLevel(overallRisk);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Real-Time Risk Assessment</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enter any address or coordinates to get instant climate risk analysis powered by satellite data
            </p>
          </div>

          {/* Search Section */}
          <Card className="p-6 mb-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter address or coordinates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Quick Select:</p>
                <div className="flex flex-wrap gap-2">
                  {mockLocations.map((loc) => (
                    <Button
                      key={loc.name}
                      variant={selectedLocation.name === loc.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLocation(loc)}
                    >
                      <MapPin className="mr-2 h-3 w-3" />
                      {loc.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Risk Assessment Grid */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left Panel - Risk Results */}
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{selectedLocation.name}</h2>
                  <Badge className={`${riskLevel.color} text-white`}>
                    {riskLevel.label}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Risk Score</span>
                    <span className="font-bold">{overallRisk}/100</span>
                  </div>
                  <Progress value={overallRisk} className="h-3" />
                </div>

                <div className="space-y-4 pt-4">
                  {/* Flood Risk */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Flood Risk</span>
                      </div>
                      <span className="text-sm font-bold">{selectedLocation.flood}%</span>
                    </div>
                    <Progress value={selectedLocation.flood} className="h-2" />
                  </div>

                  {/* Wildfire Risk */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">Wildfire Risk</span>
                      </div>
                      <span className="text-sm font-bold">{selectedLocation.wildfire}%</span>
                    </div>
                    <Progress value={selectedLocation.wildfire} className="h-2" />
                  </div>

                  {/* Storm Risk */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wind className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Storm Risk</span>
                      </div>
                      <span className="text-sm font-bold">{selectedLocation.storm}%</span>
                    </div>
                    <Progress value={selectedLocation.storm} className="h-2" />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Risk scores calculated using satellite imagery, historical climate data, 
                      terrain analysis, and real-time weather patterns.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Right Panel - Map View */}
            <RiskMap 
              lat={selectedLocation.lat}
              lon={selectedLocation.lon}
              name={selectedLocation.name}
              riskScore={overallRisk}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Demo;
