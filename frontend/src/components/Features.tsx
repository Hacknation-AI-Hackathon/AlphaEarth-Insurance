import { Card } from "@/components/ui/card";
import { Satellite, Zap, Shield, BarChart3, Globe, Clock } from "lucide-react";

const features = [
  {
    icon: Satellite,
    title: "Satellite Intelligence",
    description: "Real-time analysis of Earth observation data from multiple satellite sources including Landsat, Sentinel, and MODIS.",
  },
  {
    icon: Zap,
    title: "Instant Assessment",
    description: "Get property risk scores in seconds using AI-powered analysis of terrain, climate patterns, and historical data.",
  },
  {
    icon: Shield,
    title: "Automated Claims",
    description: "Process insurance claims automatically using before-and-after satellite imagery to verify damage.",
  },
  {
    icon: BarChart3,
    title: "Risk Analytics",
    description: "Comprehensive climate risk dashboards with flood zones, wildfire probability, and storm exposure metrics.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Assess risk anywhere on Earth with our worldwide satellite coverage and geospatial intelligence.",
  },
  {
    icon: Clock,
    title: "24/7 Monitoring",
    description: "Continuous monitoring of insured assets with real-time alerts for emerging climate threats.",
  },
];

export const Features = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powered by AlphaEarth AI</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Next-generation insurance technology combining satellite imagery, 
            machine learning, and real-time climate data
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="p-6 hover:shadow-lg transition-all hover:scale-105 duration-300 border-border/50"
              >
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
