import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Satellite,
  Target,
  Plane,
  Zap,
  Map,
  Menu,
  X,
  Home,
  Settings,
  BarChart3,
  CreditCard,
  RefreshCw,
  User,
  FileText,
  Rocket,
  HelpCircle,
  Table,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { NotificationPanel } from "@/components/NotificationPanel";
import { ProcessingPopup } from "@/components/ProcessingPopup";
import { useNotifications } from "@/contexts/NotificationContext";
import { useClaimProcessing } from "@/hooks/useClaimProcessing";
import bgDesignImage from "@/assets/images/Bg-design1.jpg";
import bradenImage from "@/assets/images/braden.jpg";
import richardImage from "@/assets/images/richard.jpg";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Satellite, label: "Damage Claims", path: "/dashboard/damage-claims" },
  { icon: Target, label: "Risk Scoring", path: "/dashboard/risk-scoring" },
  { icon: Plane, label: "Flight Delays", path: "/dashboard/flight-delays" },
  { icon: Zap, label: "Parametric", path: "/dashboard/parametric" },
  { icon: Map, label: "Impact Map", path: "/dashboard/impact-map" },
];

const accountPages = [
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];

// Page title mapping
const getPageTitle = (pathname: string): string => {
  if (pathname === "/dashboard" || pathname === "/dashboard/") return "Dashboard";
  if (pathname.includes("damage-claims")) return "Damage Claims";
  if (pathname.includes("risk-scoring")) return "Risk Scoring";
  if (pathname.includes("flight-delays")) return "Flight Delays";
  if (pathname.includes("parametric")) return "Parametric";
  if (pathname.includes("impact-map")) return "Impact Map";
  if (pathname.includes("profile")) return "Profile";
  return "Dashboard";
};

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const { processingState, setProcessingState } = useNotifications();
  const { isPending } = useClaimProcessing();

  return (
    <div 
      className="min-h-screen flex w-full relative"
      style={{ 
        backgroundImage: `url(${bgDesignImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay to dull the background image */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }}
      />
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-[264px] h-screen
          flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          md:left-2 md:top-2 md:bottom-2
          md:h-[calc(100vh-16px)]
        `}
        style={{ 
          background: 'linear-gradient(157deg, rgba(6, 11, 38, 0.94) 0%, rgba(26, 31, 55, 0) 100%)',
          borderRadius: '20px',
          backdropFilter: 'blur(60px)',
          zIndex: 10
        }}
      >
        {/* Logo */}
        <div className="px-6 py-9 flex-shrink-0">
          <div 
            className="text-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <div 
              className="text-white text-sm font-normal tracking-[2.52px]"
              style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
            >
              ALPHA EARTH
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="min-h-full flex flex-col">
            {/* Navigation Menu */}
            <nav className="space-y-2 pt-2">
              {menuItems.map((item, index) => {
                const isActive = item.path === "/dashboard" 
                  ? location.pathname === "/dashboard" || location.pathname === "/dashboard/"
                  : location.pathname.startsWith(item.path);
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/dashboard"}
                    className="block transition-colors relative"
                    style={{
                      width: '219.50px',
                      height: '54px'
                    }}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {/* Active background */}
                    {isActive && (
                      <div 
                        style={{
                          width: '219.50px',
                          height: '54px',
                          left: 0,
                          top: 0,
                          position: 'absolute',
                          background: '#1A1F37',
                          boxShadow: '0px 3.500000238418579px 5.500000476837158px rgba(0, 0, 0, 0.02)',
                          borderRadius: '15px'
                        }}
                      />
                    )}
                    {/* Icon container */}
                    <div 
                      style={{
                        width: '30px',
                        height: '30px',
                        left: '16px',
                        top: '12px',
                        position: 'absolute',
                        background: isActive ? '#0075FF' : '#1A1F37',
                        borderRadius: '12px',
                        boxShadow: '0px 3.500000238418579px 5.500000476837158px rgba(0, 0, 0, 0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                      }}
                    >
                      <item.icon 
                        className="h-[15px] w-[15px]" 
                        style={{ color: isActive ? 'white' : '#0075FF' }}
                      />
                    </div>
                    {/* Label */}
                    <span 
                      style={{
                        left: '61px',
                        top: '20px',
                        position: 'absolute',
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        color: 'white',
                        fontSize: '14px',
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        fontWeight: '400',
                        lineHeight: '14px',
                        zIndex: 10
                      }}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Account Pages Section */}
            <div className="pt-6 mt-4">
              <div 
                className="mb-4"
                style={{
                  color: 'white',
                  fontSize: '12px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '400',
                  lineHeight: '18px'
                }}
              >
                ACCOUNT PAGES
              </div>
              <nav className="space-y-2">
                {accountPages.map((item) => {
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className="block transition-colors relative"
                      style={{
                        width: '219.50px',
                        height: '54px'
                      }}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {/* Active background */}
                      {isActive && (
                        <div 
                          style={{
                            width: '219.50px',
                            height: '54px',
                            left: 0,
                            top: 0,
                            position: 'absolute',
                            background: '#1A1F37',
                            boxShadow: '0px 3.500000238418579px 5.500000476837158px rgba(0, 0, 0, 0.02)',
                            borderRadius: '15px'
                          }}
                        />
                      )}
                      {/* Icon container */}
                      <div 
                        style={{
                          width: '30px',
                          height: '30px',
                          left: '16px',
                          top: '12px',
                          position: 'absolute',
                          background: isActive ? '#0075FF' : '#1A1F37',
                          borderRadius: '12px',
                          boxShadow: '0px 3.500000238418579px 5.500000476837158px rgba(0, 0, 0, 0.02)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10
                        }}
                      >
                        <item.icon 
                          className="h-[15px] w-[15px]" 
                          style={{ color: isActive ? 'white' : '#0075FF' }}
                        />
                      </div>
                      {/* Label */}
                      <span 
                        style={{
                          left: '61px',
                          top: '20px',
                          position: 'absolute',
                          justifyContent: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          color: 'white',
                          fontSize: '14px',
                          fontFamily: 'Plus Jakarta Display, sans-serif',
                          fontWeight: '400',
                          lineHeight: '14px',
                          zIndex: 10
                        }}
                      >
                        {item.label}
                      </span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Spacer to push help card to bottom */}
            <div className="flex-1" />
            
            {/* Help Card - Sticky at bottom */}
            <div className="px-0 pt-6 pb-4 mt-auto flex justify-center">
              <div 
                className="relative overflow-hidden rounded-[15px]"
                style={{ 
                  width: '218px',
                  height: '169.50px'
                }}
              >
                {/* Richard image background with overlay */}
                <div 
                  className="absolute inset-0 rounded-[15px]"
                  style={{
                    backgroundImage: `url(${richardImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                
                {/* Gradient overlay - deep indigo to blue/purple */}
                <div 
                  className="absolute inset-0 rounded-[15px]"
                  style={{
                    background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(59, 130, 246, 0.7) 50%, rgba(139, 92, 246, 0.6) 100%)'
                  }}
                />
                
                {/* Additional wave-like gradient for depth */}
                <div 
                  className="absolute inset-0 rounded-[15px] opacity-50"
                  style={{
                    background: 'radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.4) 0%, transparent 70%)'
                  }}
                />
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between p-4">
                  {/* Icon - White square with blue circle and white question mark */}
                  <div 
                    className="w-[35px] h-[35px] rounded-xl flex items-center justify-center"
                    style={{ background: 'white' }}
                  >
                    <div 
                      className="w-[18px] h-[18px] rounded-full flex items-center justify-center"
                      style={{ background: '#0075FF' }}
                    >
                      <span 
                        style={{
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '700',
                          lineHeight: '1'
                        }}
                      >
                        ?
                      </span>
                    </div>
                  </div>
                  
                  {/* Text Content */}
                  <div>
                    <div 
                      className="mb-1"
                      style={{
                        color: 'white',
                        fontSize: '14px',
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        fontWeight: '700',
                        lineHeight: '19.60px'
                      }}
                    >
                      Need help?
                    </div>
                    <div 
                      className="mb-3"
                      style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '12px',
                        fontFamily: 'Plus Jakarta Display, sans-serif',
                        fontWeight: '400',
                        lineHeight: '12px'
                      }}
                    >
                      Please check our docs
                    </div>
                    
                    {/* Documentation Button */}
                    <button
                      className="w-full rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity"
                      style={{
                        height: '35px',
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        background: 'rgba(30, 58, 138, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}
                      onClick={() => window.open('/docs', '_blank')}
                    >
                      <span
                        style={{
                          color: 'white',
                          fontSize: '10px',
                          fontFamily: 'Plus Jakarta Display, sans-serif',
                          fontWeight: '700',
                          lineHeight: '10px',
                          textAlign: 'center',
                          letterSpacing: '0.5px'
                        }}
                      >
                        DOCUMENTATION
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative md:ml-[280px]" style={{ background: 'transparent', zIndex: 10 }}>
        {/* Top Navigation Bar */}
        <header 
          className="px-6 py-4"
          style={{ 
            borderColor: 'rgba(255, 255, 255, 0.1)',
            background: 'transparent'
          }}
        >
          <div className="flex items-center justify-between">
            {/* Left Section - Breadcrumb and Page Title */}
            <div className="flex flex-col" style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}>
              {/* Breadcrumb */}
              <div 
                style={{
                  color: '#A0AEC0',
                  fontSize: '12px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '400',
                  lineHeight: '18px',
                  marginBottom: '4px'
                }}
              >
                Pages / {pageTitle}
              </div>
              {/* Page Title */}
              <div 
                style={{
                  color: 'white',
                  fontSize: '20px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '700',
                  lineHeight: '28px'
                }}
              >
                {pageTitle}
              </div>
            </div>
            
            {/* Right Section - Search Bar and Icons */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div style={{
                width: 199,
                height: 39.50,
                background: '#0F1535',
                overflow: 'hidden',
                borderRadius: 15,
                outline: '0.50px rgba(226, 232, 240, 0.30) solid',
                outlineOffset: '-0.50px',
                justifyContent: 'flex-start',
                alignItems: 'center',
                display: 'inline-flex'
              }}>
                {/* Icon Container */}
                <div style={{
                  width: 37.50,
                  alignSelf: 'stretch',
                  overflow: 'hidden',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex'
                }}>
                  <div style={{
                    height: 20,
                    paddingLeft: 6,
                    paddingRight: 6,
                    paddingTop: 4,
                    paddingBottom: 4,
                    overflow: 'hidden',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 5,
                    display: 'flex'
                  }}>
                    <Search 
                      className="h-4 w-4" 
                      style={{ 
                        color: '#2D3748',
                        width: '15px',
                        height: '15px'
                      }} 
                    />
                  </div>
                </div>
                {/* Input Field */}
                <div style={{
                  overflow: 'hidden',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  display: 'inline-flex',
                  flex: 1,
                  paddingRight: 12
                }}>
                  <input
                    type="text"
                    placeholder="Type here..."
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#A0AEC0',
                      fontSize: 12,
                      fontFamily: 'Plus Jakarta Display, sans-serif',
                      fontWeight: '400',
                      lineHeight: 18,
                      width: '100%',
                      padding: 0
                    }}
                  />
                </div>
              </div>
              
              {/* Icons */}
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Settings className="h-5 w-5" />
              </Button>
              <NotificationDropdown />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto relative">
          <Outlet />
          <NotificationPanel />
        </main>
      </div>

      {/* Global Processing Popup - Visible on all dashboard pages */}
      <ProcessingPopup 
        isVisible={processingState.showPopup} 
        onClose={() => {
          setProcessingState({ showPopup: false });
        }}
        isProcessing={isPending || processingState.isProcessing}
        error={processingState.error}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

