import { Satellite } from "lucide-react";
import spacexImage from "@/assets/images/spacex.jpg";
import { NeedHelp } from "./NeedHelp";

export const Hero = () => {
  const handleScrollToHowItWorks = () => {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden" style={{ background: '#000000', paddingTop: '120px', height: '100vh', position: 'relative' }}>
      {/* Background Image */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url(${spacexImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0
      }} />
      
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)',
        zIndex: 1
      }} />
      
      <div className="container relative mx-auto px-4 py-24 md:py-32" style={{ zIndex: 10, transform: 'translateY(-45px)', position: 'relative' }}>
        <div className="mx-auto max-w-4xl text-center space-y-8" style={{ position: 'relative', zIndex: 11 }}>
          {/* Badge - Apple-style Glassmorphism */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontWeight: 400,
            letterSpacing: '0.5px'
          }}>
            <Satellite className="h-4 w-4" style={{ color: '#ffffff' }} />
            <span>Powered by GoogleEarth Intelligence</span>
          </div>

          {/* Main Heading - Apple-style */}
          <h1 className="text-5xl md:text-7xl" style={{
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: '1.05'
          }}>
            <span style={{
              color: '#ffffff',
              textShadow: 'none',
              mixBlendMode: 'normal',
              display: 'inline-block',
              transform: 'translateX(20px)'
            }}>
              Insurance{' '}
            </span>
            <span style={{
              color: '#ffffff',
              textShadow: 'none',
              display: 'inline-block',
              transform: 'translateX(40px)',
              mixBlendMode: 'normal'
            }}>
              Intelligence
            </span>
            <br />
            <span style={{ 
              color: '#ffffff',
              textShadow: 'none',
              display: 'inline-block',
              transform: 'translateX(-45px)',
              fontWeight: 600,
              mixBlendMode: 'normal'
            }}>
              From{' '}
            </span>
            <span style={{ 
              color: '#ffffff',
              textShadow: 'none',
              display: 'inline-block',
              transform: 'translateX(65px)',
              fontWeight: 600,
              mixBlendMode: 'normal'
            }}>
              Space
            </span>
          </h1>

          {/* Subheading - Apple-style */}
          <p className="text-xl md:text-2xl max-w-2xl mx-auto" style={{ 
            color: '#ffffff',
            textShadow: 'none',
            marginTop: '150px',
            fontWeight: 400,
            letterSpacing: '0.011em',
            lineHeight: '1.47059',
            mixBlendMode: 'normal',
            opacity: 0.9
          }}>
            Predict risk before disasters strike. Assess damage in real-time. 
            Automate claims with satellite imagery and AI.
          </p>

          {/* CTA Buttons - Apple-style */}
          <div className="flex justify-center items-center gap-4 pt-8">
            {/* Learn More Button - Solid Blue */}
            <a 
              href="/demo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 22px',
                borderRadius: '22px',
                background: '#0071e3',
                color: '#ffffff',
                fontSize: '17px',
                fontWeight: 400,
                textDecoration: 'none',
                transition: 'background-color 0.2s ease',
                cursor: 'pointer',
                border: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#0077ed'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#0071e3'}
            >
              View Demo
            </a>
            
            {/* View Demo Button - Transparent with Blue Border */}
            <a 
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToHowItWorks();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 22px',
                borderRadius: '22px',
                background: 'transparent',
                color: '#0071e3',
                fontSize: '17px',
                fontWeight: 400,
                textDecoration: 'none',
                transition: 'background-color 0.2s ease',
                cursor: 'pointer',
                border: '1px solid #0071e3',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 113, 227, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
      
      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24" style={{
        background: 'linear-gradient(to top, #000000, transparent)',
        zIndex: 5
      }} />
      
    </section>
  );
};
