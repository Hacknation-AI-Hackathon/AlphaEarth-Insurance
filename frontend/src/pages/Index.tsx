import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <HowItWorks />
      <div id="features">
        <Features />
      </div>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <Card className="p-12 max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Insurance?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the future of climate-aware risk assessment and automated claims processing
            </p>
            <Button size="lg" className="text-lg px-8">
              Get Started Today
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
