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
    <section className="py-20" style={{ background: '#000000' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="mb-4 inline-block px-4 py-2 rounded-full" style={{
            background: 'rgba(0, 117, 255, 0.1)',
            color: '#0075FF',
            fontSize: '14px',
            fontWeight: 500
          }}>Simple Process</div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>How It Works</h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
                  <div className="hidden lg:block absolute top-20 left-[60%] w-full h-0.5" style={{
                    background: 'linear-gradient(to right, rgba(0, 117, 255, 0.5), transparent)'
                  }} />
                )}
                
                <div className="p-6 text-center hover:shadow-lg transition-all duration-300 relative" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(21px)'
                }}>
                  <div className="space-y-4">
                    {/* Number Badge */}
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold mx-auto" style={{
                      background: 'rgba(0, 117, 255, 0.1)',
                      color: '#0075FF'
                    }}>
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className="flex justify-center">
                      <div className="h-12 w-12 rounded-lg flex items-center justify-center border-2" style={{
                        background: '#000000',
                        borderColor: step.color === "text-primary" ? '#0075FF' : '#00D4FF'
                      }}>
                        <Icon className="h-6 w-6" style={{ color: step.color === "text-primary" ? '#0075FF' : '#00D4FF' }} />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold" style={{ color: '#ffffff' }}>{step.title}</h3>
                    <p className="leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="p-8 max-w-4xl mx-auto" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(21px)'
          }}>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Ready to Transform Insurance?</h3>
              <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Join the future of climate-aware risk assessment and automated claims processing
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <div className="text-base py-2 px-4 rounded-full inline-block" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  ✓ 99.2% Accuracy
                </div>
                <div className="text-base py-2 px-4 rounded-full inline-block" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  ✓ Real-Time Data
                </div>
                <div className="text-base py-2 px-4 rounded-full inline-block" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  ✓ Global Coverage
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
