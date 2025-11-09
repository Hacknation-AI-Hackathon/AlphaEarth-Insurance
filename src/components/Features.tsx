import { Card } from "@/components/ui/card";
import { Satellite, Zap, Shield, Globe, TrendingUp, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Satellite,
    title: "Satellite Intelligence",
    description: "Real-time earth observation data from NASA, ESA, and commercial satellites for comprehensive risk assessment.",
  },
  {
    icon: Zap,
    title: "Instant Claims Processing",
    description: "Automated damage detection and claim approval in under 60 seconds using AI-powered image analysis.",
  },
  {
    icon: Shield,
    title: "Predictive Risk Models",
    description: "Machine learning algorithms that forecast disasters before they happen, enabling proactive protection.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Assess risk for any location on Earth with our worldwide satellite network and climate data.",
  },
  {
    icon: TrendingUp,
    title: "Historical Analysis",
    description: "Access decades of historical disaster data and climate trends to improve underwriting accuracy.",
  },
  {
    icon: CheckCircle,
    title: "Parametric Triggers",
    description: "Automatic payouts when satellite data confirms predefined conditions, eliminating paperwork delays.",
  },
];

export const Features = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Why AlphaEarth Intelligence?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your insurance operations with cutting-edge earth observation technology and AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-earth flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
