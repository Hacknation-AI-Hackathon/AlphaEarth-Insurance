import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Edit, 
  ArrowRight, 
  Battery, 
  TrendingUp, 
  Zap, 
  Activity,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  CreditCard,
  CheckCircle,
  User
} from "lucide-react";
import bradenImage from "@/assets/images/braden.jpg";
import richardImage from "@/assets/images/richard.jpg";
import charlesImage from "@/assets/images/charles.jpg";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [emailNotifications, setEmailNotifications] = useState({
    follows: true,
    answers: false,
    mentions: true,
  });
  const [appNotifications, setAppNotifications] = useState({
    launches: true,
    updates: false,
    newsletter: true,
    weekly: false,
  });

  return (
    <div className="space-y-6" style={{ background: 'transparent', minHeight: '100vh' }}>
      {/* Top Section - 4 Cards in 2 Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Row 1: User Profile and Welcome Back */}
        {/* User Profile Card - Left */}
        <div className="lg:col-span-3">
          <div 
            className="relative"
            style={{ 
              borderRadius: '20px',
              overflow: 'hidden'
            }}
          >
            {/* Background Layer 1 - Backdrop blur */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                borderRadius: '20px',
                backdropFilter: 'blur(60px)',
                zIndex: 1
              }}
            />
            
            {/* Background Layer 2 - Gradient overlay */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
                borderRadius: '20px',
                zIndex: 2
              }}
            />
            
            {/* Content */}
            <div 
              className="relative z-10 p-6 flex flex-col items-center"
              style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
            >
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-4" style={{ borderColor: '#1A1F37' }}>
                  <AvatarFallback 
                    className="text-2xl font-bold"
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}
                  >
                    MJ
                  </AvatarFallback>
                </Avatar>
                <button 
                  className="absolute bottom-0 right-0 p-2 rounded-full"
                  style={{
                    background: '#0075FF',
                    border: '2px solid #1A1F37',
                    cursor: 'pointer'
                  }}
                >
                  <Edit className="h-4 w-4 text-white" />
                </button>
              </div>
              <h2 
                className="text-xl font-bold mb-1"
                style={{ color: 'white' }}
              >
                Mark Johnson
              </h2>
              <p 
                className="text-sm mb-4"
                style={{ color: '#A0AEC0' }}
              >
                mark@alphaearth.com
              </p>
            </div>
          </div>
        </div>

        {/* Welcome Back Card - Middle Left */}
        <div className="lg:col-span-4">
          <div 
            className="relative h-full"
            style={{ 
              borderRadius: '20px',
              overflow: 'hidden',
              minHeight: '200px'
            }}
          >
            {/* Background Image */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                backgroundImage: `url(${bradenImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                borderRadius: '20px',
                zIndex: 0
              }}
            />
            
            {/* Gradient overlay */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
                borderRadius: '20px',
                zIndex: 1
              }}
            />
            
            {/* Content */}
            <div 
              className="relative z-10 h-full flex flex-col justify-between p-6"
              style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
            >
              <div>
                <h2 
                  className="text-2xl font-bold mb-2"
                  style={{ color: 'white' }}
                >
                  Welcome back!
                </h2>
                <p 
                  className="text-base"
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                >
                  Nice to see you, Mark Johnson!
                </p>
              </div>
              <button 
                className="flex items-center gap-2 self-start mt-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <span style={{ fontSize: '14px' }}>View your policies</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Insurance Overview Card - Top Middle */}
        <div className="lg:col-span-5">
          <div 
            className="relative h-full"
            style={{ 
              borderRadius: '20px',
              overflow: 'hidden',
              minHeight: '200px'
            }}
          >
            {/* Background Layer 1 - Backdrop blur */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                borderRadius: '20px',
                backdropFilter: 'blur(60px)',
                zIndex: 1
              }}
            />
            
            {/* Background Layer 2 - Gradient overlay */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
                borderRadius: '20px',
                zIndex: 2
              }}
            />
            
            {/* Content */}
            <div 
              className="relative z-10 p-6 h-full flex flex-col"
              style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
            >
              <div className="mb-4">
                <h3 
                  className="text-lg font-bold mb-1"
                  style={{ color: 'white' }}
                >
                  Insurance Overview
                </h3>
                <p 
                  className="text-xs"
                  style={{ color: '#A0AEC0' }}
                >
                  Hello, Mark Johnson! Your coverage is active.
                </p>
              </div>
              
              {/* Circular Progress */}
              <div className="flex-1 flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#0075FF"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.68)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="h-12 w-12" style={{ color: '#0075FF' }} />
                  </div>
                </div>
                <div className="ml-4">
                  <p 
                    className="text-3xl font-bold mb-1"
                    style={{ color: 'white' }}
                  >
                    68%
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: '#A0AEC0' }}
                  >
                    Coverage Active
                  </p>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: '#A0AEC0' }}
                  >
                    $2.4M Protected
                  </p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <div 
                  className="p-3 rounded-lg"
                  style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Battery className="h-4 w-4" style={{ color: '#0075FF' }} />
                    <span 
                      className="text-xs"
                      style={{ color: '#A0AEC0' }}
                    >
                      Policies
                    </span>
                  </div>
                  <p 
                    className="text-lg font-bold"
                    style={{ color: 'white' }}
                  >
                    12
                  </p>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4" style={{ color: '#22C55E' }} />
                    <span 
                      className="text-xs"
                      style={{ color: '#A0AEC0' }}
                    >
                      Claims
                    </span>
                  </div>
                  <p 
                    className="text-lg font-bold"
                    style={{ color: 'white' }}
                  >
                    156
                  </p>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4" style={{ color: '#F59E0B' }} />
                    <span 
                      className="text-xs"
                      style={{ color: '#A0AEC0' }}
                    >
                      Active Claims
                    </span>
                  </div>
                  <p 
                    className="text-lg font-bold"
                    style={{ color: 'white' }}
                  >
                    8
                  </p>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-4 w-4" style={{ color: '#0075FF' }} />
                    <span 
                      className="text-xs"
                      style={{ color: '#A0AEC0' }}
                    >
                      This Month
                    </span>
                  </div>
                  <p 
                    className="text-lg font-bold"
                    style={{ color: 'white' }}
                  >
                    +23%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Profile Information Card - Full Width Below Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <div 
            className="relative"
            style={{ 
              borderRadius: '20px',
              overflow: 'hidden'
            }}
          >
            {/* Background Layer 1 - Backdrop blur */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                borderRadius: '20px',
                backdropFilter: 'blur(60px)',
                zIndex: 1
              }}
            />
            
            {/* Background Layer 2 - Gradient overlay */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
                borderRadius: '20px',
                zIndex: 2
              }}
            />
            
            {/* Content */}
            <div 
              className="relative z-10 p-6"
              style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
            >
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {["OVERVIEW", "TEAMS", "PROJECTS"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: activeTab === tab ? '#0075FF' : 'transparent',
                      color: activeTab === tab ? 'white' : '#A0AEC0',
                      border: activeTab === tab ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <h3 
                className="text-lg font-bold mb-4"
                style={{ color: 'white' }}
              >
                Profile Information
              </h3>
              
              <p 
                className="text-sm mb-6 leading-relaxed"
                style={{ color: '#A0AEC0' }}
              >
                Hi, I'm Mark Johnson, a risk assessment specialist at AlphaEarth Insurance. 
                Decisions: If you can't decide, the answer is no. If two equally difficult paths, 
                choose the one more painful in the short term (pain avoidance is creating an illusion of equality).
              </p>

              {/* User Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                  >
                    <User className="h-5 w-5" style={{ color: '#0075FF' }} />
                  </div>
                  <div>
                    <p 
                      className="text-xs"
                      style={{ color: '#A0AEC0' }}
                    >
                      Full Name
                    </p>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'white' }}
                    >
                      Mark Johnson
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                  >
                    <Phone className="h-5 w-5" style={{ color: '#0075FF' }} />
                  </div>
                  <div>
                    <p 
                      className="text-xs"
                      style={{ color: '#A0AEC0' }}
                    >
                      Mobile
                    </p>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'white' }}
                    >
                      (44) 123 1234 123
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                  >
                    <Mail className="h-5 w-5" style={{ color: '#0075FF' }} />
                  </div>
                  <div>
                    <p 
                      className="text-xs"
                      style={{ color: '#A0AEC0' }}
                    >
                      Email
                    </p>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'white' }}
                    >
                      mark@alphaearth.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                  >
                    <MapPin className="h-5 w-5" style={{ color: '#0075FF' }} />
                  </div>
                  <div>
                    <p 
                      className="text-xs"
                      style={{ color: '#A0AEC0' }}
                    >
                      Location
                    </p>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'white' }}
                    >
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                  >
                    <CreditCard className="h-5 w-5" style={{ color: '#0075FF' }} />
                  </div>
                  <div className="flex-1">
                    <p 
                      className="text-xs mb-2"
                      style={{ color: '#A0AEC0' }}
                    >
                      Social Media
                    </p>
                    <div className="flex gap-3">
                      <button 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(26, 31, 55, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                      >
                        <Facebook className="h-4 w-4" style={{ color: '#0075FF' }} />
                      </button>
                      <button 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(26, 31, 55, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                      >
                        <Twitter className="h-4 w-4" style={{ color: '#0075FF' }} />
                      </button>
                      <button 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(26, 31, 55, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                      >
                        <Instagram className="h-4 w-4" style={{ color: '#0075FF' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - Platform Settings and Need Help */}
        <div className="lg:col-span-5 space-y-4">
          {/* Platform Settings Card */}
          <div>
          <div 
            className="relative"
            style={{ 
              borderRadius: '20px',
              overflow: 'hidden'
            }}
          >
            {/* Background Layer 1 - Backdrop blur */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                borderRadius: '20px',
                backdropFilter: 'blur(60px)',
                zIndex: 1
              }}
            />
            
            {/* Background Layer 2 - Gradient overlay */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
                borderRadius: '20px',
                zIndex: 2
              }}
            />
            
            {/* Content */}
            <div 
              className="relative z-10 p-6"
              style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
            >
              <h3 
                className="text-lg font-bold mb-6"
                style={{ color: 'white' }}
              >
                Platform Settings
              </h3>

              {/* Account Section */}
              <div className="mb-6">
                <h4 
                  className="text-sm font-bold mb-4"
                  style={{ color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  ACCOUNT
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label 
                      className="text-sm flex-1"
                      style={{ color: 'white' }}
                    >
                      Email me when a claim is filed
                    </label>
                    <Switch
                      checked={emailNotifications.follows}
                      onCheckedChange={(checked) => 
                        setEmailNotifications({ ...emailNotifications, follows: checked })
                      }
                      className="data-[state=checked]:bg-[#0075FF] data-[state=unchecked]:bg-[#1A1F37]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label 
                      className="text-sm flex-1"
                      style={{ color: 'white' }}
                    >
                      Email me when a claim is approved
                    </label>
                    <Switch
                      checked={emailNotifications.answers}
                      onCheckedChange={(checked) => 
                        setEmailNotifications({ ...emailNotifications, answers: checked })
                      }
                      className="data-[state=checked]:bg-[#0075FF] data-[state=unchecked]:bg-[#1A1F37]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label 
                      className="text-sm flex-1"
                      style={{ color: 'white' }}
                    >
                      Email me about risk alerts
                    </label>
                    <Switch
                      checked={emailNotifications.mentions}
                      onCheckedChange={(checked) => 
                        setEmailNotifications({ ...emailNotifications, mentions: checked })
                      }
                      className="data-[state=checked]:bg-[#0075FF] data-[state=unchecked]:bg-[#1A1F37]"
                    />
                  </div>
                </div>
              </div>

              {/* Application Section */}
              <div>
                <h4 
                  className="text-sm font-bold mb-4"
                  style={{ color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  APPLICATION
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label 
                      className="text-sm flex-1"
                      style={{ color: 'white' }}
                    >
                      New policy updates
                    </label>
                    <Switch
                      checked={appNotifications.launches}
                      onCheckedChange={(checked) => 
                        setAppNotifications({ ...appNotifications, launches: checked })
                      }
                      className="data-[state=checked]:bg-[#0075FF] data-[state=unchecked]:bg-[#1A1F37]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label 
                      className="text-sm flex-1"
                      style={{ color: 'white' }}
                    >
                      Monthly risk reports
                    </label>
                    <Switch
                      checked={appNotifications.updates}
                      onCheckedChange={(checked) => 
                        setAppNotifications({ ...appNotifications, updates: checked })
                      }
                      className="data-[state=checked]:bg-[#0075FF] data-[state=unchecked]:bg-[#1A1F37]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label 
                      className="text-sm flex-1"
                      style={{ color: 'white' }}
                    >
                      Subscribe to newsletter
                    </label>
                    <Switch
                      checked={appNotifications.newsletter}
                      onCheckedChange={(checked) => 
                        setAppNotifications({ ...appNotifications, newsletter: checked })
                      }
                      className="data-[state=checked]:bg-[#0075FF] data-[state=unchecked]:bg-[#1A1F37]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label 
                      className="text-sm flex-1"
                      style={{ color: 'white' }}
                    >
                      Receive weekly summaries
                    </label>
                    <Switch
                      checked={appNotifications.weekly}
                      onCheckedChange={(checked) => 
                        setAppNotifications({ ...appNotifications, weekly: checked })
                      }
                      className="data-[state=checked]:bg-[#0075FF] data-[state=unchecked]:bg-[#1A1F37]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Need Help Card - Below Platform Settings */}
          <div>
            <div 
              className="relative h-full"
              style={{ 
                borderRadius: '20px',
                overflow: 'hidden',
                minHeight: '200px'
              }}
            >
              {/* Background Image */}
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  backgroundImage: `url(${richardImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  borderRadius: '20px',
                  zIndex: 0
                }}
              />
              
              {/* Gradient overlay */}
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
                  borderRadius: '20px',
                  zIndex: 1
                }}
              />
              
              {/* Content */}
              <div 
                className="relative z-10 h-full flex flex-col justify-between p-6"
                style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'white' }}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: '#0075FF' }}
                  >
                    <span 
                      style={{
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}
                    >
                      ?
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 
                    className="text-lg font-bold mb-2"
                    style={{ color: 'white' }}
                  >
                    Need help?
                  </h3>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    Please check our docs
                  </p>
                  <button
                    className="w-full rounded-xl flex items-center justify-center py-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}
                    onClick={() => window.open('/docs', '_blank')}
                  >
                    DOCUMENTATION
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects/Recent Claims Card - Bottom Right */}
        <div className="lg:col-span-7">
          <div 
            className="relative"
            style={{ 
              borderRadius: '20px',
              overflow: 'hidden'
            }}
          >
            {/* Background Layer 1 - Backdrop blur */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.89) 0%, rgba(26, 31, 55, 0.50) 100%)',
                borderRadius: '20px',
                backdropFilter: 'blur(60px)',
                zIndex: 1
              }}
            />
            
            {/* Background Layer 2 - Gradient overlay */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'linear-gradient(85deg, rgba(14, 13, 57, 0) 0%, #1A1F37 100%, #1A1F37 100%)',
                borderRadius: '20px',
                zIndex: 2
              }}
            />
            
            {/* Content */}
            <div 
              className="relative z-10 p-6"
              style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
            >
              <div className="mb-4">
                <h3 
                  className="text-lg font-bold mb-1"
                  style={{ color: 'white' }}
                >
                  Recent Claims
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: '#A0AEC0' }}
                >
                  Your latest insurance claims and assessments
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Claim 1 */}
                <div 
                  className="rounded-lg overflow-hidden"
                  style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                >
                  <div 
                    className="h-32 bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${charlesImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="p-4">
                    <h4 
                      className="text-sm font-bold mb-1"
                      style={{ color: 'white' }}
                    >
                      Hurricane Damage
                    </h4>
                    <p 
                      className="text-xs mb-3"
                      style={{ color: '#A0AEC0' }}
                    >
                      Property assessment completed with AI-powered analysis.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <Avatar className="h-6 w-6 border-2" style={{ borderColor: '#1A1F37' }}>
                          <AvatarFallback className="text-xs" style={{ background: '#0075FF', color: 'white' }}>
                            MJ
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6 border-2" style={{ borderColor: '#1A1F37' }}>
                          <AvatarFallback className="text-xs" style={{ background: '#22C55E', color: 'white' }}>
                            AK
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        style={{ 
                          color: '#0075FF',
                          fontSize: '10px',
                          padding: '4px 8px'
                        }}
                      >
                        VIEW ALL
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Claim 2 */}
                <div 
                  className="rounded-lg overflow-hidden"
                  style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                >
                  <div 
                    className="h-32 bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${bradenImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="p-4">
                    <h4 
                      className="text-sm font-bold mb-1"
                      style={{ color: 'white' }}
                    >
                      Flood Assessment
                    </h4>
                    <p 
                      className="text-xs mb-3"
                      style={{ color: '#A0AEC0' }}
                    >
                      Real-time satellite monitoring detected water levels.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <Avatar className="h-6 w-6 border-2" style={{ borderColor: '#1A1F37' }}>
                          <AvatarFallback className="text-xs" style={{ background: '#0075FF', color: 'white' }}>
                            MJ
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        style={{ 
                          color: '#0075FF',
                          fontSize: '10px',
                          padding: '4px 8px'
                        }}
                      >
                        VIEW ALL
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Claim 3 */}
                <div 
                  className="rounded-lg overflow-hidden"
                  style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                >
                  <div 
                    className="h-32 bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${richardImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="p-4">
                    <h4 
                      className="text-sm font-bold mb-1"
                      style={{ color: 'white' }}
                    >
                      Wildfire Risk
                    </h4>
                    <p 
                      className="text-xs mb-3"
                      style={{ color: '#A0AEC0' }}
                    >
                      Pre-emptive risk analysis using thermal imaging.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <Avatar className="h-6 w-6 border-2" style={{ borderColor: '#1A1F37' }}>
                          <AvatarFallback className="text-xs" style={{ background: '#0075FF', color: 'white' }}>
                            MJ
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6 border-2" style={{ borderColor: '#1A1F37' }}>
                          <AvatarFallback className="text-xs" style={{ background: '#F59E0B', color: 'white' }}>
                            SM
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6 border-2" style={{ borderColor: '#1A1F37' }}>
                          <AvatarFallback className="text-xs" style={{ background: '#22C55E', color: 'white' }}>
                            AK
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        style={{ 
                          color: '#0075FF',
                          fontSize: '10px',
                          padding: '4px 8px'
                        }}
                      >
                        VIEW ALL
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

