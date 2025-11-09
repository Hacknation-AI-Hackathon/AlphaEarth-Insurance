import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, AlertTriangle, Droplets, Flame, Wind, CloudRain } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RiskScore {
  type: string;
  score: number;
  level: "low" | "medium" | "high";
  icon: React.ElementType;
}

export const RiskAssessmentTool = () => {
  const [location, setLocation] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const riskScores: RiskScore[] = [
    { type: "Flood Risk", score: 72, level: "high", icon: Droplets },
    { type: "Wildfire Risk", score: 45, level: "medium", icon: Flame },
    { type: "Storm Risk", score: 28, level: "low", icon: Wind },
    { type: "Drought Risk", score: 61, level: "medium", icon: CloudRain },
  ];

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-success";
      case "medium":
        return "text-warning";
      case "high":
        return "text-destructive";
      default:
        return "text-foreground";
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case "low":
        return "bg-gradient-risk-low";
      case "medium":
        return "bg-gradient-risk-medium";
      case "high":
        return "bg-gradient-risk-high";
      default:
        return "bg-muted";
    }
  };

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="mb-4">
            <MapPin className="w-3 h-3 mr-1" />
            Risk Assessment Engine
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Analyze Any Location on Earth
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter coordinates or an address to generate real-time climate risk scores powered by satellite data and AI.
          </p>
        </div>

        {/* Search Input */}
        <Card className="p-8 mb-8 border-2">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Enter location, coordinates, or property address..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-14 text-lg"
              />
            </div>
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !location}
              className="h-14 px-8 bg-primary hover:bg-primary/90 gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Assess Risk
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {showResults && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Location Info */}
            <Card className="p-6 border-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">San Francisco Bay Area, CA</h3>
                  <p className="text-muted-foreground">37.7749° N, 122.4194° W</p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Last Updated: 2 mins ago
                </Badge>
              </div>
            </Card>

            {/* Risk Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {riskScores.map((risk) => {
                const Icon = risk.icon;
                return (
                  <Card key={risk.type} className="p-6 border-2 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${getRiskBg(risk.level)}`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-foreground">{risk.type}</h4>
                            <p className="text-sm text-muted-foreground capitalize">{risk.level} Risk Level</p>
                          </div>
                        </div>
                        <div className={`text-3xl font-bold ${getRiskColor(risk.level)}`}>
                          {risk.score}
                        </div>
                      </div>
                      <Progress value={risk.score} className="h-3" />
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* AI Insights */}
            <Card className="p-6 border-2 border-primary/20 bg-primary/5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <AlertTriangle className="w-5 h-5" />
                  AI-Generated Risk Insights
                </div>
                <p className="text-foreground leading-relaxed">
                  This property shows elevated flood risk (72%) due to proximity to coastal areas and rising sea levels. Recent satellite data indicates increased soil moisture and storm patterns in the region. Wildfire risk is moderate (45%) with dry vegetation detected in surrounding areas. Recommend enhanced flood insurance coverage and regular property monitoring.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};
