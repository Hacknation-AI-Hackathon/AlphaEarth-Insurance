import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Phone, Mail, AlertTriangle, CheckCircle } from "lucide-react";

export default function DamageClaims() {
  return (
    <div className="space-y-6" style={{ background: 'transparent', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ 
              color: 'white',
              fontFamily: 'Plus Jakarta Display, sans-serif',
              fontWeight: '700'
            }}
          >
            Automated Damage Claims
          </h1>
          <p 
            className="mb-1"
            style={{ 
              color: '#A0AEC0',
              fontSize: '14px',
              fontFamily: 'Plus Jakarta Display, sans-serif'
            }}
          >
            Hurricane Elena - Oct 15, 2024
          </p>
          <p 
            className="text-sm"
            style={{ 
              color: '#A0AEC0',
              fontSize: '12px',
              fontFamily: 'Plus Jakarta Display, sans-serif'
            }}
          >
            124 properties affected | $8.2M estimated damage
          </p>
        </div>
      </div>

      {/* Property Header Card */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p 
                className="text-sm mb-1"
                style={{ color: '#A0AEC0', fontSize: '12px' }}
              >
                Property ID
              </p>
              <p 
                className="font-bold text-lg"
                style={{ color: 'white', fontSize: '18px' }}
              >
                #4521
              </p>
            </div>
            <div>
              <p 
                className="text-sm mb-1"
                style={{ color: '#A0AEC0', fontSize: '12px' }}
              >
                Address
              </p>
              <p 
                className="font-medium"
                style={{ color: 'white', fontSize: '14px' }}
              >
                123 Ocean Drive, Miami Beach, FL
              </p>
            </div>
            <div>
              <p 
                className="text-sm mb-1"
                style={{ color: '#A0AEC0', fontSize: '12px' }}
              >
                Policyholder
              </p>
              <p 
                className="font-medium"
                style={{ color: 'white', fontSize: '14px' }}
              >
                John Mitchell
              </p>
            </div>
            <div>
              <p 
                className="text-sm mb-1"
                style={{ color: '#A0AEC0', fontSize: '12px' }}
              >
                Insured Value
              </p>
              <p 
                className="font-bold"
                style={{ color: 'white', fontSize: '16px' }}
              >
                $450,000
              </p>
            </div>
            <div>
              <p 
                className="text-sm mb-1"
                style={{ color: '#A0AEC0', fontSize: '12px' }}
              >
                Policy Number
              </p>
              <p 
                className="font-medium"
                style={{ color: 'white', fontSize: '14px' }}
              >
                INS-2024-45891
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Before/After Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Before */}
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
              className="text-lg font-bold mb-4"
              style={{ color: 'white' }}
            >
              📅 Before Hurricane (Oct 1, 2024)
            </h3>
            <div 
              className="h-64 rounded-lg mb-4 flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.6) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}
            >
              <p 
                className="font-medium"
                style={{ color: 'white' }}
              >
                Satellite Image - Property Intact
              </p>
            </div>
            <p 
              className="text-sm flex items-center gap-2 mb-4"
              style={{ color: '#A0AEC0' }}
            >
              <CheckCircle className="h-4 w-4" style={{ color: '#22C55E' }} />
              Property intact
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              style={{
                background: 'rgba(26, 31, 55, 0.4)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            >
              View Full Resolution
            </Button>
          </div>
        </div>

        {/* After */}
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
              className="text-lg font-bold mb-4"
              style={{ color: 'white' }}
            >
              📅 After Hurricane (Oct 15, 2024)
            </h3>
            <div 
              className="h-64 rounded-lg mb-4 flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.6) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <p 
                className="font-medium"
                style={{ color: 'white' }}
              >
                Satellite Image - Damage Detected
              </p>
            </div>
            <p 
              className="text-sm flex items-center gap-2 mb-4"
              style={{ color: '#A0AEC0' }}
            >
              <AlertTriangle className="h-4 w-4" style={{ color: '#EF4444' }} />
              Damage detected
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              style={{
                background: 'rgba(26, 31, 55, 0.4)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            >
              View Full Resolution
            </Button>
          </div>
        </div>
      </div>

      {/* AI Analysis Card */}
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
            className="text-lg font-bold mb-4"
            style={{ color: 'white' }}
          >
            🤖 AI Damage Assessment
          </h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span 
                className="text-sm font-medium"
                style={{ color: '#A0AEC0' }}
              >
                Confidence Score
              </span>
              <span 
                className="text-sm font-bold"
                style={{ color: 'white' }}
              >
                87%
              </span>
            </div>
            <div 
              className="w-full h-3 rounded-full overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div 
                className="h-full rounded-full transition-all"
                style={{ width: '87%', background: '#0075FF' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <p 
              className="font-medium mb-3"
              style={{ color: 'white' }}
            >
              Detected Issues:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                <span 
                  className="text-sm"
                  style={{ color: '#A0AEC0' }}
                >
                  Roof structural damage (Coverage area: 45%)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                <span 
                  className="text-sm"
                  style={{ color: '#A0AEC0' }}
                >
                  Water infiltration (Depth: moderate)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                <span 
                  className="text-sm"
                  style={{ color: '#A0AEC0' }}
                >
                  Exterior wall damage (North side)
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <p 
              className="text-2xl font-bold"
              style={{ color: '#0075FF' }}
            >
              Estimated Damage Cost: $47,500
            </p>
          </div>
        </div>
      </div>

      {/* Claim Status Card */}
      <div 
        className="relative"
        style={{ 
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }}
      >
        {/* Background Layer 1 - Backdrop blur with green tint */}
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
        
        {/* Background Layer 2 - Gradient overlay with green */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            background: 'linear-gradient(85deg, rgba(34, 197, 94, 0.1) 0%, #1A1F37 100%, #1A1F37 100%)',
            borderRadius: '20px',
            zIndex: 2
          }}
        />
        
        {/* Content */}
        <div 
          className="relative z-10 p-6 space-y-4"
          style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
        >
          <div 
            className="inline-block px-4 py-2 rounded-lg"
            style={{ 
              background: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            <span 
              className="text-lg font-bold"
              style={{ color: '#22C55E' }}
            >
              🟢 AUTO-APPROVED
            </span>
          </div>
          <div className="space-y-2">
            <p 
              className="text-xl font-bold"
              style={{ color: 'white' }}
            >
              Payout Amount: $47,500
            </p>
            <p 
              className="text-sm"
              style={{ color: '#A0AEC0' }}
            >
              Processing Time: 2 minutes (vs typical 14 days)
            </p>
          </div>
          <div className="flex gap-3 pt-2 flex-wrap">
            <Button
              style={{
                background: '#0075FF',
                color: 'white',
                border: 'none'
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button 
              variant="outline"
              style={{
                background: 'rgba(26, 31, 55, 0.4)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Notify Client
            </Button>
            <Button 
              variant="outline"
              style={{
                background: 'rgba(26, 31, 55, 0.4)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Client
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
