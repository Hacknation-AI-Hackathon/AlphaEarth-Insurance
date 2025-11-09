import { Building, AlertTriangle, FileText, DollarSign, Shield, MoreVertical, TrendingUp, Users, MapPin, Activity, Target, CheckCircle, Bell, CreditCard, Clock, Satellite, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import bradenImage from "@/assets/images/braden.jpg";

// Summary Cards Data
const statsCards = [
  {
    title: "Total Properties",
    value: "12,847",
    change: "+8%",
    changeType: "positive" as const,
    icon: Building,
  },
  {
    title: "Active Claims",
    value: "156",
    change: "+12%",
    changeType: "positive" as const,
    icon: AlertTriangle,
  },
  {
    title: "Risk Assessments",
    value: "3,052",
    change: "+23%",
    changeType: "positive" as const,
    icon: FileText,
  },
  {
    title: "Total Payouts",
    value: "$2.4M",
    change: "+15%",
    changeType: "positive" as const,
    icon: DollarSign,
  },
];

// Claims Overview Data
const claimsData = [
  { month: "Jan", claims: 45 },
  { month: "Feb", claims: 52 },
  { month: "Mar", claims: 48 },
  { month: "Apr", claims: 61 },
  { month: "May", claims: 58 },
  { month: "Jun", claims: 67 },
  { month: "Jul", claims: 73 },
  { month: "Aug", claims: 69 },
  { month: "Sep", claims: 75 },
  { month: "Oct", claims: 82 },
  { month: "Nov", claims: 78 },
  { month: "Dec", claims: 89 },
];

// Properties Monitored Data
const propertiesData = [
  { day: "Mon", properties: 120 },
  { day: "Tue", properties: 145 },
  { day: "Wed", properties: 132 },
  { day: "Thu", properties: 168 },
  { day: "Fri", properties: 155 },
  { day: "Sat", properties: 142 },
  { day: "Sun", properties: 138 },
];

// Active Claims Data
const activeClaims = [
  { name: "Hurricane Damage - Miami, FL", members: 2, amount: "$47,500", completion: 85, avatars: ["JD", "SM"] },
  { name: "Flood Assessment - Houston, TX", members: 1, amount: "$32,100", completion: 60, avatars: ["JD"] },
  { name: "Wildfire Risk - Los Angeles, CA", members: 3, amount: "$18,900", completion: 45, avatars: ["JD", "SM", "AK"] },
  { name: "Storm Damage - New Orleans, LA", members: 2, amount: "$89,400", completion: 100, avatars: ["JD", "SM"] },
  { name: "Coastal Erosion - Charleston, SC", members: 1, amount: "$12,300", completion: 30, avatars: ["JD"] },
  { name: "Tornado Assessment - Oklahoma, OK", members: 2, amount: "$56,200", completion: 75, avatars: ["JD", "AK"] },
];

// Recent Activity Data
const recentActivity = [
  { id: 1, title: "Claim Approved", description: "Claim #CLM-4521 - $47,500", icon: CheckCircle, date: "22 DEC 7:20 PM" },
  { id: 2, title: "New Claim Filed", description: "Claim #CLM-4522 - Hurricane damage", icon: FileText, date: "21 DEC 11:21 PM" },
  { id: 3, title: "Risk Assessment", description: "Property #PRP-8923 - High risk detected", icon: AlertTriangle, date: "21 DEC 9:28 PM" },
  { id: 4, title: "Payout Processed", description: "Payment #PAY-3210 - $32,100", icon: CreditCard, date: "20 DEC 3:52 PM" },
  { id: 5, title: "Assessment Complete", description: "Risk score: 87 - Miami property", icon: Target, date: "19 DEC 11:35 PM" },
  { id: 6, title: "New Property Added", description: "Property #PRP-9851 - Monitoring started", icon: Satellite, date: "18 DEC 4:41 PM" },
];

const chartConfig = {
  claims: {
    label: "Claims",
    color: "#0075FF",
  },
  properties: {
    label: "Properties",
    color: "#0075FF",
  },
};

export default function Dashboard() {
  return (
    <div className="space-y-6" style={{ background: 'transparent', minHeight: '100vh' }}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div 
            key={index}
            className="relative"
            style={{ 
              width: '100%',
              height: '80px',
              borderRadius: '20px',
              overflow: 'hidden'
            }}
          >
            {/* Background */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.74) 0%, rgba(26, 31, 55, 0.50) 100%)',
                borderRadius: '20px',
                backdropFilter: 'blur(60px)',
                zIndex: 0
              }}
            />
            
            {/* Content */}
            <div 
              className="relative z-10 w-full h-full"
              style={{ 
                fontFamily: 'Plus Jakarta Display, sans-serif',
                position: 'relative'
              }}
            >
              {/* Title */}
              <div 
                style={{
                  position: 'absolute',
                  left: '21.50px',
                  top: '21.50px',
                  color: '#A0AEC0',
                  fontSize: '12px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '400',
                  lineHeight: '12px'
                }}
              >
                {stat.title}
              </div>
              
              {/* Value */}
              <div 
                style={{
                  position: 'absolute',
                  left: '21.50px',
                  top: '36.50px',
                  color: 'white',
                  fontSize: '18px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '700',
                  lineHeight: '25.20px'
                }}
              >
                {stat.value}
              </div>
              
              {/* Change percentage */}
              <div 
                style={{
                  position: 'absolute',
                  left: '100px',
                  top: '40.50px',
                  color: stat.changeType === "positive" ? '#01B574' : '#EF4444',
                  fontSize: '14px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '700',
                  lineHeight: '19.60px'
                }}
              >
                {stat.change}
              </div>
              
              {/* Icon */}
              <div 
                style={{
                  position: 'absolute',
                  right: '17.50px',
                  top: '17.50px',
                  width: '45px',
                  height: '45px',
                  background: '#0075FF',
                  boxShadow: '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Card, Claim Approval Rate, and Property Coverage */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Welcome Card */}
        <div 
          className="relative flex-shrink"
          style={{ 
            flex: '1.5',
            minWidth: '400px',
            height: '344px',
            borderRadius: '20px',
            overflow: 'hidden'
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
              backgroundPosition: 'right center',
              backgroundRepeat: 'no-repeat',
              borderRadius: '20px',
              zIndex: 0
            }}
          />
          
          {/* Gradient overlay - dark on left, transparent on right */}
          <div 
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
              background: 'linear-gradient(90deg, rgba(11, 20, 38, 0.85) 0%, rgba(11, 20, 38, 0.6) 40%, rgba(11, 20, 38, 0.2) 70%, transparent 100%)',
              borderRadius: '20px',
              zIndex: 1
            }}
          />
          
          {/* Content */}
          <div 
            className="relative z-10 h-full flex flex-col justify-between"
            style={{ 
              fontFamily: 'Plus Jakarta Display, sans-serif',
              padding: '36px 31px 14px 31px'
            }}
          >
            <div>
              {/* Welcome back text */}
              <div 
                style={{
                  color: '#A0AEC0',
                  fontSize: '14px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '400',
                  lineHeight: '14px',
                  marginBottom: '11.5px'
                }}
              >
                Welcome back,
              </div>
              
              {/* Name */}
              <div 
                style={{
                  color: 'white',
                  fontSize: '28px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '700',
                  lineHeight: '28px',
                  marginBottom: '18.5px'
                }}
              >
                Mark Johnson
              </div>
              
              {/* Subtitle */}
              <div 
                style={{
                  color: '#A0AEC0',
                  fontSize: '16px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '400',
                  lineHeight: '24px',
                  marginTop: '10px'
                }}
              >
                Glad to see you again!<br/>Ask me anything.
              </div>
            </div>
            
            {/* Tap to record button */}
            <button 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity self-start"
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                marginTop: 'auto',
                position: 'relative'
              }}
            >
              <span 
                style={{
                  color: 'white',
                  fontSize: '12px',
                  fontFamily: 'Plus Jakarta Display, sans-serif',
                  fontWeight: '400',
                  lineHeight: '12px',
                  textAlign: 'center'
                }}
              >
                Tap to record
              </span>
              <div 
                style={{
                  width: '13px',
                  height: '13px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ArrowRight 
                  className="h-3 w-3 text-white" 
                  style={{ 
                    strokeWidth: '2',
                    filter: 'drop-shadow(0 0 1px white)'
                  }} 
                />
              </div>
            </button>
          </div>
        </div>

        {/* Claim Approval Rate */}
        <div 
          className="relative flex-1"
          style={{ 
            borderRadius: '20px',
            overflow: 'hidden',
            height: '344px',
            minWidth: '280px'
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
            className="relative z-10 h-full flex flex-col p-6"
            style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
          >
            <div className="mb-4">
              <h3 className="text-white text-lg font-bold mb-1">Claim Approval Rate</h3>
              <p className="text-sm" style={{ color: '#A0AEC0' }}>From all claims</p>
            </div>
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="relative w-32 h-32 mb-4">
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
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.87)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="h-12 w-12" style={{ color: '#0075FF' }} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">87%</p>
              <p className="text-xs" style={{ color: '#A0AEC0' }}>Auto-approved claims.</p>
              <div className="flex items-center justify-between w-full mt-4 px-4">
                <span className="text-xs" style={{ color: '#718096' }}>0%</span>
                <span className="text-xs" style={{ color: '#718096' }}>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Property Coverage */}
        <div 
          className="relative flex-1"
          style={{ 
            borderRadius: '20px',
            overflow: 'hidden',
            height: '344px',
            minWidth: '280px'
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
            className="relative z-10 h-full flex flex-col p-6"
            style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
          >
            <div className="mb-4">
              <h3 className="text-white text-lg font-bold mb-1">Property Coverage</h3>
              <p className="text-sm" style={{ color: '#A0AEC0' }}>Safety score</p>
            </div>
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="relative w-32 h-32 mb-4">
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
                    stroke="#22C55E"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.88)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building className="h-12 w-12 text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">8.8</p>
              <p className="text-xs" style={{ color: '#A0AEC0' }}>Risk Score</p>
              <div className="flex items-center justify-between w-full mt-4 px-4">
                <span className="text-xs" style={{ color: '#718096' }}>0</span>
                <span className="text-xs" style={{ color: '#718096' }}>10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Overview and Properties Monitored */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Claims Overview */}
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
              <h3 className="text-white text-lg font-bold mb-1">Claims Overview</h3>
              <p className="text-green-400 text-sm flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                (+23) more than last month
              </p>
            </div>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={claimsData}>
                    <defs>
                      <linearGradient id="claimsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0075FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0075FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent className="bg-slate-800 border-slate-700" />}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="claims" 
                      stroke="#0075FF" 
                      strokeWidth={2}
                      fill="url(#claimsGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </div>

        {/* Properties Monitored */}
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
              <h3 className="text-white text-lg font-bold mb-1">Properties Monitored</h3>
              <p className="text-green-400 text-sm flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                (+145) than last week
              </p>
            </div>
            <div className="h-[200px] mb-4">
              <ChartContainer config={chartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={propertiesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent className="bg-slate-800 border-slate-700" />}
                    />
                    <Bar dataKey="properties" fill="#0075FF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building className="h-4 w-4" style={{ color: '#0075FF' }} />
                  <span className="text-xs" style={{ color: '#A0AEC0' }}>Properties</span>
                </div>
                <p className="text-white font-bold">12,847</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4" style={{ color: '#0075FF' }} />
                  <span className="text-xs" style={{ color: '#A0AEC0' }}>Claims</span>
                </div>
                <p className="text-white font-bold">156</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4" style={{ color: '#0075FF' }} />
                  <span className="text-xs" style={{ color: '#A0AEC0' }}>Locations</span>
                </div>
                <p className="text-white font-bold">342</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4" style={{ color: '#0075FF' }} />
                  <span className="text-xs" style={{ color: '#A0AEC0' }}>Assessments</span>
                </div>
                <p className="text-white font-bold">3,052</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Claims and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Claims */}
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
              <h3 className="text-white text-lg font-bold mb-1">Active Claims</h3>
              <p className="text-green-400 text-sm">156 total claims</p>
            </div>
            <div className="space-y-4">
              {activeClaims.map((claim, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg"
                  style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm mb-2">{claim.name}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {claim.avatars.slice(0, 3).map((avatar, i) => (
                              <Avatar key={i} className="h-6 w-6 border-2" style={{ borderColor: '#1A1F37' }}>
                                <AvatarFallback className="text-white text-xs" style={{ background: '#0075FF' }}>
                                  {avatar}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-xs" style={{ color: '#A0AEC0' }}>
                            {claim.members} {claim.members === 1 ? 'analyst' : 'analysts'}
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: '#A0AEC0' }}>{claim.amount}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm mb-1">{claim.completion}%</p>
                      <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ width: `${claim.completion}%`, background: '#0075FF' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
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
              <h3 className="text-white text-lg font-bold mb-1">Recent Activity</h3>
              <p className="text-green-400 text-sm flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                +23% this month
              </p>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div 
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ background: 'rgba(0, 117, 255, 0.2)' }}
                    >
                      <Icon className="h-4 w-4" style={{ color: '#0075FF' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{activity.title}</p>
                          <p className="text-xs" style={{ color: '#A0AEC0' }}>{activity.description}</p>
                        </div>
                        <p className="text-xs whitespace-nowrap" style={{ color: '#718096' }}>{activity.date}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="flex items-center justify-between py-6 border-t" 
        style={{ 
          borderColor: 'rgba(255, 255, 255, 0.1)',
          fontFamily: 'Plus Jakarta Display, sans-serif'
        }}
      >
        <p className="text-sm" style={{ color: '#A0AEC0' }}>
          © 2024 AlphaEarth Insurance. Powered by satellite data and AI risk assessment.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm hover:text-white transition-colors" style={{ color: '#A0AEC0' }}>Support</a>
          <a href="#" className="text-sm hover:text-white transition-colors" style={{ color: '#A0AEC0' }}>Documentation</a>
          <a href="#" className="text-sm hover:text-white transition-colors" style={{ color: '#A0AEC0' }}>Terms</a>
        </div>
      </div>
    </div>
  );
}

