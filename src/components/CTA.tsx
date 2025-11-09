import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Rocket } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-20 px-4 bg-gradient-hero">
      <div className="container mx-auto max-w-4xl">
        <Card className="p-12 border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-satellite-glow/10 border border-satellite-glow/30">
              <Rocket className="w-4 h-4 text-satellite-glow" />
              <span className="text-sm font-medium text-foreground">Ready to Transform Insurance?</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Start Assessing Risk From Space Today
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join leading insurers using AlphaEarth intelligence to predict disasters, automate claims, and protect what matters most.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2 shadow-lg">
                Request Demo
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                Contact Sales
              </Button>
            </div>

            <p className="text-sm text-muted-foreground pt-4">
              Built for the AlphaEarth Insurance Challenge • Powered by AI & Satellite Intelligence
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};
