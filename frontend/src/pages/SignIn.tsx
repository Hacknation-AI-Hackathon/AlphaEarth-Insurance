import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import purpleTunnel from '../assets/images/Baackground-image.jpg';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Prevent body scrolling when component mounts and set font
  useEffect(() => {
    // Store original styles
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalHtmlStyle = window.getComputedStyle(document.documentElement).overflow;
    const originalBodyFont = document.body.style.fontFamily;
    const originalHtmlFont = document.documentElement.style.fontFamily;
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Set font family globally
    document.body.style.fontFamily = 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif';
    document.documentElement.style.fontFamily = 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif';
    
    // Cleanup: restore original styles when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
      document.documentElement.style.overflow = originalHtmlStyle;
      document.body.style.fontFamily = originalBodyFont;
      document.documentElement.style.fontFamily = originalHtmlFont;
    };
  }, []);

  const handleSubmit = () => {
    console.log('Sign In:', { email, password, rememberMe });
    // Navigate to dashboard after sign in
    navigate('/dashboard');
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden',
      fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex'
    }}>
      {/* Background Gradient */}
      <div style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        background: 'linear-gradient(169deg, #0F123B 0%, #090D2E 59%, #020515 100%)',
        zIndex: 0
      }} />
      
      {/* Top Navigation Bar - Centered Across Page */}
      <div style={{
        position: 'absolute',
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
        zIndex: 10,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* ALPHA EARTH Logo */}
        <div 
          onClick={() => navigate('/')}
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
            onClick={() => navigate('/')}
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
            onClick={() => navigate('/')}
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
          
          {/* DEMO */}
          <div 
            onClick={() => navigate('/demo')}
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
            }}>DEMO</div>
          </div>
          
          {/* SIGN IN */}
          <div style={{
            padding: '4px 8px',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            opacity: 0.7
          }}>
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
      
      {/* Left Panel - Purple Tunnel Image */}
      <div style={{
        width: '50%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1
      }}>
        {/* Background Image */}
        <div style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${purpleTunnel})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.4) saturate(1.5)',
          position: 'absolute'
        }} />
        {/* Gradient Overlay */}
        <div style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse 32.68% 41.19% at 51.90% 57.23%, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0) 100%)',
          position: 'absolute'
        }} />
        
        {/* Text Content - Centered */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          zIndex: 2
        }}>
          <div style={{
            fontSize: 'clamp(14px, 1.5vw, 20px)',
            fontWeight: 400,
            lineHeight: '1.2',
            letterSpacing: '3.6px',
            marginBottom: '1rem',
            fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            PROTECTING YOUR FUTURE:
          </div>
          <div style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 700,
            lineHeight: '1.2',
            letterSpacing: '6.48px',
            wordWrap: 'break-word',
            fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            ALPHA EARTH INSURANCE
          </div>
        </div>
      </div>
      
      {/* Right Panel - Sign In Form */}
      <div style={{
        width: '50%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1,
        padding: '2rem',
        boxSizing: 'border-box',
        overflow: 'hidden',
        background: 'linear-gradient(169deg, #0F123B 0%, #090D2E 59%, #020515 100%)'
      }}>
        {/* Sign In Form Container - Blur Transparent */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '500px',
          width: '100%',
          margin: '0 auto',
          paddingTop: 'clamp(80px, 10vh, 100px)',
          paddingBottom: '2rem'
        }}>
          {/* Blur Transparent Container */}
          <div style={{
            width: '100%',
            background: 'linear-gradient(93deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.04) 100%)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxSizing: 'border-box',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(21px)'
          }}>
            {/* Title */}
            <div style={{
              color: 'white',
              fontSize: 'clamp(24px, 3vw, 30px)',
              fontWeight: 700,
              lineHeight: '1.3',
              marginBottom: '2rem',
              fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>
              Nice to see you!
            </div>
            
            {/* Email Label */}
            <div style={{
              color: 'white',
              fontSize: 'clamp(12px, 1.2vw, 14px)',
              fontWeight: 400,
              marginBottom: '0.5rem',
              fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>
              Email
            </div>
            
            {/* Email Input */}
            <div style={{
              width: '100%',
              height: '50px',
              paddingLeft: 20,
              paddingRight: 20,
              marginBottom: '1.5rem',
              background: 'linear-gradient(70deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.04) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'white',
                  fontSize: 'clamp(12px, 1.2vw, 14px)',
                  fontWeight: 400,
                  fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              />
            </div>
            
            {/* Password Label */}
            <div style={{
              color: 'white',
              fontSize: 'clamp(12px, 1.2vw, 14px)',
              fontWeight: 400,
              marginBottom: '0.5rem',
              fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>
              Password
            </div>
            
            {/* Password Input */}
            <div style={{
              width: '100%',
              height: '50px',
              paddingLeft: 20,
              paddingRight: 20,
              marginBottom: '1.5rem',
              background: 'linear-gradient(70deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.04) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'white',
                  fontSize: 'clamp(12px, 1.2vw, 14px)',
                  fontWeight: 400,
                  fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#A0AEC0',
                  padding: '0 5px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Remember Me */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '2rem'
            }}>
              <div
                onClick={() => setRememberMe(!rememberMe)}
                style={{
                  width: 36,
                  height: 18.48,
                  padding: '1.44px',
                  background: rememberMe ? '#0075FF' : '#4B5563',
                  borderRadius: 97.74,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  justifyContent: rememberMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  width: 13.5,
                  height: 13.5,
                  background: 'white',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease'
                }} />
              </div>
              <div style={{
                color: 'white',
                fontSize: 'clamp(11px, 1vw, 12px)',
                fontWeight: 400,
                fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                Remember me
              </div>
            </div>
            
            {/* Sign In Button */}
            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                height: '45px',
                background: '#0075FF',
                borderRadius: 12,
                backdropFilter: 'blur(60px)',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif',
                transition: 'all 0.3s ease',
                marginBottom: '1.5rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              SIGN IN
            </button>
            
            {/* Don't have an account */}
            <div style={{
              marginTop: '1.5rem',
              textAlign: 'center'
            }}>
              <span style={{ 
                color: '#A0AEC0', 
                fontSize: 'clamp(12px, 1.2vw, 14px)', 
                fontWeight: 400,
                fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                Don't have an account?{' '}
              </span>
              <span 
                onClick={() => navigate('/signup')}
                style={{ 
                  color: 'white', 
                  fontSize: 'clamp(12px, 1.2vw, 14px)', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                Sign up
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
