import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";
import { DisasterMap } from "@/components/DisasterMap";
import {
  MapPin,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Home,
  Flame,
  Wind,
  Droplets,
  Cloud,
  ChevronRight,
  RefreshCw,
  Zap
} from "lucide-react";

interface DisasterEvent {
  id: string;
  name: string;
  type: "hurricane" | "wildfire" | "earthquake" | "severe_thunderstorm" | "severe_weather" | "flood" | "flash_flood";
  status: "active" | "developing" | "warning" | "critical" | "moderate" | "light" | "minor" | "strong" | "major";
  location: string;
  coordinates: { lat: number; lon: number };
  lastUpdated: string;
  isMock?: boolean;
}

interface PortfolioMetrics {
  totalProperties: number;
  propertiesAtRisk: number;
  totalInsuredValue: number;
  expectedLoss: number;
  percentile90Loss: number;
  percentile99Loss: number;
}

interface RiskDistribution {
  critical: { count: number; loss: number };
  high: { count: number; loss: number };
  moderate: { count: number; loss: number };
  low: { count: number; loss: number };
}

const DisasterMapping = () => {
  const [activeDisasters, setActiveDisasters] = useState<DisasterEvent[]>([]);
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterEvent | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics | null>(null);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isLoadingDisasters, setIsLoadingDisasters] = useState(true);
  const [disasterData, setDisasterData] = useState<any>(null);
  const [riskAssessments, setRiskAssessments] = useState<any[]>([]);

  useEffect(() => {
    loadActiveDisasters();
  }, []);

  const loadActiveDisasters = async () => {
    try {
      setIsLoadingDisasters(true);
      const response = await apiClient.getActiveDisasters();
      if (response.success && response.data) {
        setActiveDisasters(response.data as DisasterEvent[]);
      }
    } catch (error) {
      console.error('Error loading disasters:', error);
      toast.error('Failed to load active disasters');
    } finally {
      setIsLoadingDisasters(false);
    }
  };

  const handleAnalyzeDisaster = async (disaster: DisasterEvent) => {
    setSelectedDisaster(disaster);
    setIsAnalyzing(true);
    setShowResults(false);

    try {
      let response: any;

      if (disaster.type === 'hurricane') {
        response = await apiClient.analyzeHurricane(disaster.id);
      } else if (disaster.type === 'wildfire') {
        response = await apiClient.analyzeWildfire(disaster.id);
      } else if (disaster.type === 'earthquake') {
        response = await apiClient.analyzeEarthquake(disaster.id);
      } else if (disaster.type === 'severe_thunderstorm' || disaster.type === 'severe_weather' || disaster.type === 'flood' || disaster.type === 'flash_flood') {
        response = await apiClient.analyzeSevereWeather(disaster.id);
      } else {
        toast.error(`Unknown disaster type: ${disaster.type}`);
        setIsAnalyzing(false);
        return;
      }

      if (response.success && response.data) {
        const data = response.data as any;
        setPortfolioMetrics(data.portfolioMetrics);
        setRiskDistribution(data.riskDistribution);
        setAiSummary(data.aiSummary || "");
        setDisasterData(data.hurricaneData || data.wildfireData || data.impactZone || data.disaster);
        setRiskAssessments(data.riskAssessments || []);
        setShowResults(true);
        toast.success('Analysis complete!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze disaster. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDisasterIcon = (type: string) => {
    switch (type) {
      case "hurricane":
        return Wind;
      case "wildfire":
        return Flame;
      case "earthquake":
        return AlertTriangle;
      case "severe_thunderstorm":
      case "severe_weather":
        return Cloud;
      case "flood":
      case "flash_flood":
        return Droplets;
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-destructive text-destructive-foreground";
      case "developing":
        return "bg-warning text-warning-foreground";
      case "warning":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-8 h-8 text-satellite-glow" />
            <h1 className="text-4xl font-bold text-primary-foreground">Disaster Impact Mapping</h1>
          </div>
          <p className="text-xl text-primary-foreground/80 max-w-3xl">
            Real-time risk assessment and financial exposure analysis for active disasters using satellite intelligence and AI.
          </p>
        </div>

        {/* Active Disasters Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-satellite-glow" />
            Active Disasters
          </h2>
          
          {isLoadingDisasters ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-satellite-glow/30 border-t-satellite-glow rounded-full animate-spin mx-auto" />
              <p className="text-primary-foreground/70 mt-4">Loading active disasters...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeDisasters.map((disaster) => {
                const Icon = getDisasterIcon(disaster.type);
                return (
                  <Card 
                    key={disaster.id} 
                    className={`cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 ${
                      selectedDisaster?.id === disaster.id ? 'border-2 border-satellite-glow' : ''
                    }`}
                    onClick={() => !isAnalyzing && handleAnalyzeDisaster(disaster)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-2 rounded-lg ${
                          disaster.type === 'hurricane' ? 'bg-gradient-risk-high' :
                          disaster.type === 'wildfire' ? 'bg-gradient-risk-medium' :
                          disaster.type === 'earthquake' ? 'bg-gradient-risk-high' :
                          disaster.type === 'flood' || disaster.type === 'flash_flood' ? 'bg-gradient-risk-high' :
                          disaster.type === 'severe_thunderstorm' || disaster.type === 'severe_weather' ? 'bg-gradient-risk-medium' :
                          'bg-gradient-risk-low'
                        }`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {disaster.isMock && (
                            <Badge variant="outline" className="bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-400">
                              MOCK
                            </Badge>
                          )}
                          <Badge className={getStatusColor(disaster.status)}>
                            {disaster.status}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-xl">{disaster.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {disaster.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground mb-3">
                        Updated {new Date(disaster.lastUpdated).toLocaleString()}
                      </div>
                      <Button 
                        className="w-full gap-2" 
                        size="sm"
                        disabled={isAnalyzing}
                      >
                        <Zap className="w-4 h-4" />
                        Analyze Impact
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Analysis Loading */}
        {isAnalyzing && !showResults && (
          <Card className="mb-8 border-2 border-satellite-glow/50 bg-card/50 backdrop-blur-sm animate-in fade-in duration-300">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-satellite-glow/30 border-t-satellite-glow rounded-full animate-spin mx-auto" />
                <h3 className="text-2xl font-bold text-foreground">Analyzing Disaster Impact...</h3>
                <p className="text-muted-foreground">Processing satellite data and calculating property exposure</p>
                <Progress value={66} className="max-w-md mx-auto" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Dashboard */}
        {showResults && selectedDisaster && portfolioMetrics && riskDistribution && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* AI Summary */}
            {aiSummary && (
              <Card className="border-2 border-satellite-glow/30 bg-card/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-satellite-glow">
                    <Zap className="w-5 h-5" />
                    AI Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
                </CardContent>
              </Card>
            )}

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Properties at Risk
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">
                    {portfolioMetrics.propertiesAtRisk.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of {portfolioMetrics.totalProperties.toLocaleString()} total
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Total Exposure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {formatCurrency(portfolioMetrics.totalInsuredValue)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    insured value
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Expected Loss
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning">
                    {formatCurrency(portfolioMetrics.expectedLoss)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    mean scenario
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    99th Percentile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">
                    {formatCurrency(portfolioMetrics.percentile99Loss)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    worst case
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map Placeholder & Risk Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive Map */}
              <Card className="lg:col-span-2 border-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Impact Zone Map
                    </span>
                    <Button variant="outline" size="sm" className="gap-2" onClick={loadActiveDisasters}>
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {selectedDisaster.name} - Properties color-coded by risk level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video">
                    <DisasterMap
                      disaster={selectedDisaster}
                      disasterData={disasterData}
                      riskAssessments={riskAssessments}
                    />
                  </div>
                  <div className="mt-4 flex gap-2 justify-center flex-wrap">
                    <Badge variant="outline" className="bg-destructive/20 border-destructive text-destructive">
                      Critical: {riskDistribution.critical.count}
                    </Badge>
                    <Badge variant="outline" className="bg-warning/20 border-warning text-warning">
                      High: {riskDistribution.high.count}
                    </Badge>
                    <Badge variant="outline" className="bg-secondary/20 border-secondary text-secondary">
                      Moderate: {riskDistribution.moderate.count}
                    </Badge>
                    <Badge variant="outline" className="bg-success/20 border-success text-success">
                      Low: {riskDistribution.low.count}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Properties by risk tier</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(riskDistribution).map(([tier, data]) => (
                    <div key={tier} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold capitalize text-foreground">{tier}</span>
                        <span className="text-sm text-muted-foreground">
                          {data.count.toLocaleString()} properties
                        </span>
                      </div>
                      <Progress 
                        value={(data.count / portfolioMetrics.propertiesAtRisk) * 100} 
                        className={`h-3 ${
                          tier === 'critical' ? '[&>div]:bg-destructive' :
                          tier === 'high' ? '[&>div]:bg-warning' :
                          tier === 'moderate' ? '[&>div]:bg-secondary' :
                          '[&>div]:bg-success'
                        }`}
                      />
                      <div className="text-sm font-medium text-foreground">
                        Expected Loss: {formatCurrency(data.loss)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!showResults && !isAnalyzing && !isLoadingDisasters && (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto" />
                <h3 className="text-2xl font-bold text-foreground">Select a Disaster to Begin</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Choose an active disaster from above to analyze property exposure, calculate financial risk, and generate impact reports.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DisasterMapping;