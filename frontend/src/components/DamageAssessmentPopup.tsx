import { Dialog, DialogPortal, DialogOverlay, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { ClaimProcessingResponse } from "@/lib/api";
import { SatelliteImageryMap } from "@/components/SatelliteImageryMap";
import { Shield, AlertTriangle, CheckCircle, TrendingUp, BarChart3, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DamageAssessmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  claimData: ClaimProcessingResponse | null;
  mapCenter?: [number, number]; // Optional map center coordinates [lat, lon]
}

export const DamageAssessmentPopup = ({ isOpen, onClose, claimData, mapCenter: propsMapCenter }: DamageAssessmentPopupProps) => {
  if (!claimData) return null;

  // Handle confidence score - could be 0-1 or 0-100
  const rawConfidenceScore = claimData?.validation?.confidence?.confidence_score || 0;
  const confidenceScore = rawConfidenceScore > 1 ? rawConfidenceScore / 100 : rawConfidenceScore;
  const damagePct = claimData?.hazard?.damage_pct || 0;
  const confidenceLabel = claimData?.validation?.confidence?.label || "Unknown";
  
  // Get image URLs if available
  const preImageUrl = claimData?.preprocessing?.pre?.url_template;
  const postImageUrl = claimData?.preprocessing?.post?.url_template;

  // Use provided map center, or calculate from AOI if available (AOI format: [minLon, minLat, maxLon, maxLat])
  let mapCenter: [number, number] | undefined = propsMapCenter;
  if (!mapCenter) {
    const aoi = claimData?.preprocessing?.aoi;
    if (aoi && Array.isArray(aoi) && aoi.length === 4) {
      const centerLon = (aoi[0] + aoi[2]) / 2;
      const centerLat = (aoi[1] + aoi[3]) / 2;
      mapCenter = [centerLat, centerLon];
    }
  }

  return (
    <>
      <style>{`
        /* Custom scrollbar styling for the popup to match dark theme */
        .damage-assessment-popup::-webkit-scrollbar {
          width: 10px;
        }
        .damage-assessment-popup::-webkit-scrollbar-track {
          background: rgba(6, 11, 38, 0.8);
          border-radius: 5px;
          margin: 5px 0;
        }
        .damage-assessment-popup::-webkit-scrollbar-thumb {
          background: rgba(160, 174, 192, 0.4);
          border-radius: 5px;
          border: 2px solid rgba(6, 11, 38, 0.8);
        }
        .damage-assessment-popup::-webkit-scrollbar-thumb:hover {
          background: rgba(160, 174, 192, 0.6);
        }
        /* Firefox scrollbar */
        .damage-assessment-popup {
          scrollbar-width: thin;
          scrollbar-color: rgba(160, 174, 192, 0.4) rgba(6, 11, 38, 0.8);
        }
        /* Glassmorphic overlay */
        [data-radix-dialog-overlay] {
          background: rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(10px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(10px) saturate(180%) !important;
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-50 w-full max-w-4xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] damage-assessment-popup overflow-y-auto"
            )}
            style={{
              background: 'linear-gradient(93deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.04) 100%)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              backdropFilter: 'blur(21px) saturate(180%)',
              WebkitBackdropFilter: 'blur(21px) saturate(180%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              color: 'white'
            }}
          >
        <DialogHeader className="flex flex-row items-center justify-between mb-6 pr-0">
          <DialogTitle 
            className="text-2xl font-bold m-0"
            style={{ color: 'white', fontFamily: 'Plus Jakarta Display, sans-serif' }}
          >
            AI Damage Assessment
          </DialogTitle>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 disabled:pointer-events-none flex-shrink-0 ml-4"
            style={{
              color: 'white',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              minWidth: '24px',
              minHeight: '24px'
            }}
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="space-y-6" style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}>
          {/* Main Metrics Grid - Confidence and Damage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Confidence Score Card */}
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ background: 'rgba(0, 117, 255, 0.2)' }}
                    >
                      <Shield className="h-4 w-4" style={{ color: '#0075FF' }} />
                    </div>
                    <span 
                      className="text-sm font-medium"
                      style={{ color: '#A0AEC0' }}
                    >
                      Confidence Score
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <p 
                    className="text-3xl font-bold mb-1"
                    style={{ color: 'white' }}
                  >
                    {Math.round(confidenceScore * 100)}%
                  </p>
                  <p className="text-xs" style={{ color: '#A0AEC0' }}>
                    {confidenceLabel.charAt(0).toUpperCase() + confidenceLabel.slice(1).toLowerCase()} confidence
                  </p>
                </div>
                <div 
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ width: `${confidenceScore * 100}%`, background: '#0075FF' }}
                  />
                </div>
              </div>
            </div>

            {/* Damage Percentage Card */}
            {damagePct > 0 && (
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ background: 'rgba(239, 68, 68, 0.2)' }}
                      >
                        <AlertTriangle className="h-4 w-4" style={{ color: '#EF4444' }} />
                      </div>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: '#A0AEC0' }}
                      >
                        Damage Detected
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p 
                      className="text-3xl font-bold mb-1"
                      style={{ color: 'white' }}
                    >
                      {damagePct.toFixed(2)}%
                    </p>
                    <p className="text-xs" style={{ color: '#A0AEC0' }}>
                      Total area affected
                    </p>
                  </div>
                  <div 
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(damagePct, 100)}%`, background: '#EF4444' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Section - Card Style */}
          {claimData.summary && (
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
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: 'rgba(0, 117, 255, 0.2)' }}
                  >
                    <BarChart3 className="h-4 w-4" style={{ color: '#0075FF' }} />
                  </div>
                  <h3 
                    className="text-lg font-bold"
                    style={{ color: 'white' }}
                  >
                    Summary
                  </h3>
                </div>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: '#A0AEC0' }}
                >
                  {claimData.summary}
                </p>
              </div>
            </div>
          )}

          {/* Ranked Hazards Section - Card Style */}
          {claimData.ranked_hazards && claimData.ranked_hazards.length > 0 && (
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
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: 'rgba(34, 197, 94, 0.2)' }}
                  >
                    <TrendingUp className="h-4 w-4" style={{ color: '#22C55E' }} />
                  </div>
                  <h3 
                    className="text-lg font-bold"
                    style={{ color: 'white' }}
                  >
                    Ranked Hazards
                  </h3>
                </div>
                <div className="space-y-3">
                  {claimData.ranked_hazards.map((hazard, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-lg flex items-center justify-between"
                      style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg flex-shrink-0"
                          style={{ background: 'rgba(0, 117, 255, 0.2)' }}
                        >
                          <CheckCircle className="h-4 w-4" style={{ color: '#22C55E' }} />
                        </div>
                        <div>
                          <p 
                            className="text-sm font-medium"
                            style={{ color: 'white' }}
                          >
                            {hazard.hazard.charAt(0).toUpperCase() + hazard.hazard.slice(1)}
                          </p>
                          <p 
                            className="text-xs"
                            style={{ color: '#A0AEC0' }}
                          >
                            Confidence: {hazard.confidence_label}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p 
                          className="text-sm font-bold"
                          style={{ color: '#0075FF' }}
                        >
                          {hazard.fused_score?.toFixed(2)}
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: '#718096' }}
                        >
                          Fused Score
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Validation Metrics Section - Card Style */}
          {claimData.validation && (
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
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: 'rgba(0, 117, 255, 0.2)' }}
                  >
                    <BarChart3 className="h-4 w-4" style={{ color: '#0075FF' }} />
                  </div>
                  <h3 
                    className="text-lg font-bold"
                    style={{ color: 'white' }}
                  >
                    Validation Metrics
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className="p-4 rounded-lg"
                    style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                  >
                    <p className="text-xs mb-2" style={{ color: '#A0AEC0' }}>Cross Sensor</p>
                    <p className="text-2xl font-bold" style={{ color: 'white' }}>
                      {claimData.validation.cross_sensor?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-lg"
                    style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                  >
                    <p className="text-xs mb-2" style={{ color: '#A0AEC0' }}>Meteorology</p>
                    <p className="text-2xl font-bold" style={{ color: 'white' }}>
                      {claimData.validation.meteorology?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-lg"
                    style={{ background: 'rgba(26, 31, 55, 0.4)' }}
                  >
                    <p className="text-xs mb-2" style={{ color: '#A0AEC0' }}>Spatial Coherence</p>
                    <p className="text-2xl font-bold" style={{ color: 'white' }}>
                      {claimData.validation.spatial_coherence?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Images Section - Pre and Post Event - Card Style */}
          {(preImageUrl || postImageUrl) && (
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
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: 'rgba(0, 117, 255, 0.2)' }}
                  >
                    <Shield className="h-4 w-4" style={{ color: '#0075FF' }} />
                  </div>
                  <h3 
                    className="text-lg font-bold"
                    style={{ color: 'white' }}
                  >
                    Satellite Imagery
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preImageUrl && (
                    <SatelliteImageryMap
                      urlTemplate={preImageUrl}
                      center={mapCenter}
                      zoom={11}
                      title="Pre-Event Imagery"
                    />
                  )}
                  {postImageUrl && (
                    <SatelliteImageryMap
                      urlTemplate={postImageUrl}
                      center={mapCenter}
                      zoom={11}
                      title="Post-Event Imagery"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Claim Status Section - Card Style */}
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
              className="relative z-10 p-6"
              style={{ fontFamily: 'Plus Jakarta Display, sans-serif' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="p-2 rounded-lg"
                  style={{ background: 'rgba(34, 197, 94, 0.2)' }}
                >
                  <CheckCircle className="h-5 w-5" style={{ color: '#22C55E' }} />
                </div>
                <div>
                  <p 
                    className="text-lg font-bold"
                    style={{ color: '#22C55E' }}
                  >
                    CLAIM PROCESSED
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: '#A0AEC0' }}
                  >
                    Analysis completed successfully
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 flex-wrap">
            <Button
              onClick={() => {
                // Generate report functionality
                console.log('Generate report');
              }}
              style={{
                background: '#0075FF',
                color: 'white',
                border: 'none'
              }}
            >
              Generate Report
            </Button>
            <Button 
              onClick={() => {
                // Export data functionality
                const dataStr = JSON.stringify(claimData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'claim-data.json';
                link.click();
                URL.revokeObjectURL(url);
              }}
              variant="outline"
              style={{
                background: 'rgba(26, 31, 55, 0.4)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            >
              Export Data
            </Button>
          </div>
        </div>
        </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
};
