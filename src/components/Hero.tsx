import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Satellite } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-satellite-glow/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-earth-green/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Icon badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Satellite className="w-4 h-4 text-primary animate-pulse-glow" />
            <span className="text-sm font-medium text-primary-foreground">Powered by AlphaEarth Intelligence</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
            Predict Risk From Space.
            <span className="block mt-2 bg-gradient-to-r from-satellite-glow to-earth-green bg-clip-text text-transparent">
              Approve Claims in Seconds.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed">
            Transform insurance with AI-powered geospatial intelligence. Assess climate risk, detect disaster damage, and automate claims using real-time satellite data and earth observation.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/disaster-mapping">
              <Button size="lg" className="bg-satellite-glow hover:bg-satellite-glow/90 text-space-dark font-semibold gap-2 shadow-lg shadow-satellite-glow/30 transition-all hover:shadow-xl hover:shadow-satellite-glow/50">
                Assess Risk Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold gap-2">
              <Globe className="w-5 h-5" />
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-satellite-glow">99.2%</div>
              <div className="text-sm text-primary-foreground/70">Damage Detection Accuracy</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-earth-green">24/7</div>
              <div className="text-sm text-primary-foreground/70">Real-Time Risk Monitoring</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-satellite-glow">&lt; 60s</div>
              <div className="text-sm text-primary-foreground/70">Automated Claim Processing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};
