import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Scan, Brain, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    number: "01",
    title: "Select Location",
    description: "Enter an address, coordinates, or select an area on the map to begin assessment.",
    color: "text-primary",
  },
  {
    icon: Scan,
    number: "02",
    title: "Satellite Analysis",
    description: "Our AI analyzes satellite imagery, terrain data, weather patterns, and historical climate events.",
    color: "text-secondary",
  },
  {
    icon: Brain,
    number: "03",
    title: "AI Risk Calculation",
    description: "AlphaEarth processes multiple data sources to generate comprehensive risk scores for floods, fires, and storms.",
    color: "text-primary",
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "Instant Results",
    description: "Receive detailed risk reports, insurance recommendations, and continuous monitoring.",
    color: "text-secondary",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4">Simple Process</Badge>
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From satellite to insurance decision in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 relative">
                  <div className="space-y-4">
                    {/* Number Badge */}
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary mx-auto">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className="flex justify-center">
                      <div className={`h-12 w-12 rounded-lg bg-background flex items-center justify-center border-2 ${step.color === "text-primary" ? "border-primary" : "border-secondary"}`}>
                        <Icon className={`h-6 w-6 ${step.color}`} />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Card className="p-8 max-w-4xl mx-auto bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Ready to Transform Insurance?</h3>
              <p className="text-lg text-muted-foreground">
                Join the future of climate-aware risk assessment and automated claims processing
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Badge variant="secondary" className="text-base py-2 px-4">
                  ✓ 99.2% Accuracy
                </Badge>
                <Badge variant="secondary" className="text-base py-2 px-4">
                  ✓ Real-Time Data
                </Badge>
                <Badge variant="secondary" className="text-base py-2 px-4">
                  ✓ Global Coverage
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
