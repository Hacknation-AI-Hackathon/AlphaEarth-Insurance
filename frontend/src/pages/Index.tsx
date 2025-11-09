import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  const handleScrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative" style={{
      background: '#000000',
      color: '#ffffff'
    }}>
      {/* Top Navigation Bar - Centered Across Page */}
      <div style={{
        position: 'fixed',
        top: 'clamp(1.5rem, 3vh, 2rem)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(95%, 987.5px)',
        height: '70px',
        background: 'linear-gradient(93deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.04) 100%)',
        borderRadius: 20,
        border: '2px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(21px) saturate(180%)',
        WebkitBackdropFilter: 'blur(21px) saturate(180%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(1rem, 2vw, 1.5rem)',
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* ALPHA EARTH Logo */}
        <div 
          onClick={handleScrollToTop}
          style={{
            color: 'white',
            fontSize: 'clamp(12px, 1.2vw, 16px)',
            fontWeight: 400,
            letterSpacing: '2.52px',
            fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          ALPHA EARTH
        </div>
        
        {/* Navigation Items */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(0.5rem, 1vw, 1rem)',
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}>
          {/* HOME */}
          <div 
            onClick={handleScrollToTop}
            style={{
              padding: '4px 8px',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ 
              color: 'white', 
              fontSize: 'clamp(9px, 0.8vw, 12px)', 
              fontWeight: 400,
              letterSpacing: '2.52px',
              fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif',
              whiteSpace: 'nowrap'
            }}>HOME</div>
          </div>
          
          {/* FEATURES */}
          <div 
            onClick={handleScrollToFeatures}
            style={{
              padding: '4px 8px',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ 
              color: 'white', 
              fontSize: 'clamp(9px, 0.8vw, 12px)', 
              fontWeight: 400,
              letterSpacing: '2.52px',
              fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif',
              whiteSpace: 'nowrap'
            }}>FEATURES</div>
          </div>
          
          {/* SIGN IN */}
          <div 
            onClick={() => navigate('/signin')}
            style={{
              padding: '4px 8px',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ 
              color: 'white', 
              fontSize: 'clamp(9px, 0.8vw, 12px)', 
              fontWeight: 400,
              letterSpacing: '2.52px',
              fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif',
              whiteSpace: 'nowrap'
            }}>SIGN IN</div>
          </div>
          
          {/* SIGN UP Button */}
          <button 
            onClick={() => navigate('/signup')}
            style={{
              padding: '8px clamp(12px, 1.5vw, 16px)',
              background: '#0075FF',
              borderRadius: 12,
              backdropFilter: 'blur(60px)',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              fontSize: 'clamp(9px, 0.8vw, 12px)',
              fontWeight: 400,
              letterSpacing: '2.52px',
              fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.background = '#0077ed';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = '#0075FF';
            }}
          >
            SIGN UP
          </button>
        </div>
      </div>

      <Hero />
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <div id="features">
        <Features />
      </div>
      
      {/* CTA Section */}
      <section className="py-20" style={{ background: '#000000' }}>
        <div className="container mx-auto px-4">
          <div className="p-12 max-w-4xl mx-auto text-center" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(21px)'
          }}>
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>Ready to Transform Insurance?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Join the future of climate-aware risk assessment and automated claims processing
            </p>
            <Button size="lg" className="text-lg px-8" style={{
              background: '#0075FF',
              color: '#ffffff',
              border: 'none'
            }}>
              Get Started Today
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
