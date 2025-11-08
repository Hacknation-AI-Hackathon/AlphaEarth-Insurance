import { useState, useEffect } from "react";
import { Search, Droplets, Flame, Wind, AlertCircle, Download, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RiskMap } from "@/components/RiskMap";
import { useToast } from "@/hooks/use-toast";

interface CityData {
  name: string;
  overall: number;
  flood: number;
  wildfire: number;
  storm: number;
  coords: [number, number];
  insights: string[];
}

const cityData: Record<string, CityData> = {
  "San Francisco, CA": {
    name: "San Francisco, CA",
    overall: 28,
    flood: 15,
    wildfire: 45,
    storm: 25,
    coords: [37.7749, -122.4194],
    insights: [
      "Low elevation coastal area",
      "Active wildfire zones nearby",
      "Earthquake risk present",
      "Good drainage infrastructure",
    ],
  },
  "Miami, FL": {
    name: "Miami, FL",
    overall: 82,
    flood: 90,
    wildfire: 5,
    storm: 85,
    coords: [25.7617, -80.1918],
    insights: [
      "FEMA flood zone AE",
      "3ft above sea level",
      "Hurricane exposure high",
      "3 floods in last 10 years",
    ],
  },
  "Houston, TX": {
    name: "Houston, TX",
    overall: 65,
    flood: 75,
    wildfire: 10,
    storm: 60,
    coords: [29.7604, -95.3698],
    insights: [
      "Hurricane corridor",
      "Flat terrain with poor drainage",
      "Frequent flooding events",
      "Low wildfire risk",
    ],
  },
  "Los Angeles, CA": {
    name: "Los Angeles, CA",
    overall: 71,
    flood: 20,
    wildfire: 85,
    storm: 45,
    coords: [34.0522, -118.2437],
    insights: [
      "Extreme wildfire risk",
      "Drought-prone vegetation",
      "Proximity to fire zones",
      "Earthquake fault lines",
    ],
  },
};

export default function RiskScoring() {
  const [selectedCity, setSelectedCity] = useState<CityData>(cityData["San Francisco, CA"]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [animateScores, setAnimateScores] = useState(false);
  const { toast } = useToast();

  const handleCitySelect = (cityName: string) => {
    setIsLoading(true);
    setAnimateScores(false);

    setTimeout(() => {
      setSelectedCity(cityData[cityName]);
      setIsLoading(false);
      setAnimateScores(true);
      toast({
        title: "✓ Risk analysis complete!",
        description: `Analysis for ${cityName} is ready.`,
      });
    }, 1500);
  };

  const handleSearch = () => {
    const found = Object.keys(cityData).find(
      (key) => key.toLowerCase().includes(searchInput.toLowerCase())
    );
    if (found) {
      handleCitySelect(found);
    } else {
      toast({
        title: "Location not found",
        description: "Try one of the quick select options",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setAnimateScores(true);
  }, []);

  const getRiskColor = (score: number) => {
    if (score < 40) return "bg-green-500";
    if (score < 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getRiskBadge = (score: number) => {
    if (score < 40) return { text: "🟢 Low Risk", variant: "default" as const };
    if (score < 70) return { text: "🟡 Medium Risk", variant: "secondary" as const };
    return { text: "🔴 High Risk", variant: "destructive" as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Real-Time Risk Assessment</h1>
        <p className="text-muted-foreground">
          Enter any address or coordinates to get instant climate risk analysis powered by satellite data
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter address or coordinates..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Quick Select Buttons */}
            <div className="flex flex-wrap gap-2">
              {Object.keys(cityData).map((city) => (
                <Button
                  key={city}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCitySelect(city)}
                  disabled={isLoading}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {city}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Area */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT PANEL - Risk Scores */}
          <div className="lg:col-span-2 space-y-4">
            {/* Location Header */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold">{selectedCity.name}</h2>
                  <Badge {...getRiskBadge(selectedCity.overall)}>
                    {getRiskBadge(selectedCity.overall).text}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Overall Risk Score */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold">{selectedCity.overall}</span>
                  <span className="text-2xl text-muted-foreground mb-1">/100</span>
                </div>
                <Progress
                  value={selectedCity.overall}
                  className={`h-3 ${animateScores ? "transition-all duration-1000" : ""}`}
                />
              </CardContent>
            </Card>

            {/* Individual Risk Bars */}
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Flood Risk */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Droplets className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">🌊 Flood Risk</span>
                    </div>
                    <span className="font-bold">{selectedCity.flood}%</span>
                  </div>
                  <Progress
                    value={selectedCity.flood}
                    className={`h-2 ${animateScores ? "transition-all duration-700 delay-200" : ""}`}
                  />
                </div>

                {/* Wildfire Risk */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <Flame className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="font-medium">🔥 Wildfire Risk</span>
                    </div>
                    <span className="font-bold">{selectedCity.wildfire}%</span>
                  </div>
                  <Progress
                    value={selectedCity.wildfire}
                    className={`h-2 ${animateScores ? "transition-all duration-700 delay-400" : ""}`}
                  />
                </div>

                {/* Storm Risk */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Wind className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="font-medium">🌀 Storm Risk</span>
                    </div>
                    <span className="font-bold">{selectedCity.storm}%</span>
                  </div>
                  <Progress
                    value={selectedCity.storm}
                    className={`h-2 ${animateScores ? "transition-all duration-700 delay-600" : ""}`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💡 AI Insights - Why This Risk Score?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedCity.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Risk Report
              </Button>
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Email Quote
              </Button>
            </div>

            {/* Disclaimer */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Risk scores calculated using satellite imagery, historical climate data, terrain
                    analysis, and real-time weather patterns.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL - Map */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardContent className="p-0 h-[800px]">
                <RiskMap
                  center={selectedCity.coords}
                  zoom={12}
                  riskLevel={selectedCity.overall}
                />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs bg-white/90 backdrop-blur-sm p-2 rounded">
                  <span>Lat: {selectedCity.coords[0].toFixed(4)}°</span>
                  <span>Lon: {selectedCity.coords[1].toFixed(4)}°</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
