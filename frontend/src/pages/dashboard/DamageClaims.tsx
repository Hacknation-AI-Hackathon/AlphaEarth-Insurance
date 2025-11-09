import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Phone, Mail, AlertTriangle, CheckCircle, Loader2, MapPin, Search, ChevronDown, ChevronUp } from "lucide-react";
import { useClaimProcessing, useHealthCheck } from "@/hooks/useClaimProcessing";
import { ClaimProcessingResponse, apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { geocodeAddress } from "@/lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";

export default function DamageClaims() {
  const [claimData, setClaimData] = useState<ClaimProcessingResponse | null>(null);
  const [formData, setFormData] = useState({
    address: "",
    radiusKm: "5",
    longitude: "-95.35",
    latitude: "29.7",
    locationName: "",
    startDate: "2017-08-01",
    endDate: "2017-09-07",
    hazard: "roof" as "flood" | "wildfire" | "roof" | "",
    satellite: "sentinel2" as "sentinel2" | "landsat8" | "landsat9" | "modis",
    maxCloud: "30",
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showManualCoordinates, setShowManualCoordinates] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const { mutate: processClaim, isPending } = useClaimProcessing();
  const { data: healthData, isError: healthError, isLoading: healthLoading } = useHealthCheck();
  const { toast } = useToast();
  const { addNotification, processingState, setProcessingState, startProcessing, stopProcessing } = useNotifications();

  // Sync processing state with React Query mutation state
  useEffect(() => {
    if (isPending) {
      // Mutation is pending, ensure processing state is set
      if (!processingState.isProcessing) {
        startProcessing();
      }
    }
  }, [isPending, processingState.isProcessing, startProcessing]);

  // Show popup if processing state says so (persists across navigation)
  // This ensures the popup appears even after navigating away and coming back
  const showProcessingPopup = processingState.showPopup;
  
  // When component mounts, if processing state indicates processing, ensure popup is visible
  useEffect(() => {
    // If processing state says we're processing or there's an error, show the popup
    // This ensures the popup persists when user navigates back to this page
    if ((processingState.isProcessing || processingState.error) && !processingState.showPopup) {
      setProcessingState({ showPopup: true });
    }
  }, [processingState, setProcessingState]);

  const handleGeocode = async () => {
    if (!formData.address.trim()) {
      toast({
        title: "Error",
        description: "Please enter an address",
        variant: "destructive",
      });
      return;
    }

    setIsGeocoding(true);
    try {
      const radius = parseFloat(formData.radiusKm) || 5;
      const result = await geocodeAddress(formData.address, radius);
      
      setFormData({
        ...formData,
        longitude: result.center[0].toFixed(6),
        latitude: result.center[1].toFixed(6),
        locationName: result.displayName,
      });

      // Add success notification to top-right panel
      addNotification({
        title: "Location Found",
        description: result.displayName,
        type: "success",
      });

      // Toast removed - using notification panel only
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Could not find location. Please try a different address or enter coordinates manually.";
      
      // Add error notification to top-right panel
      addNotification({
        title: "Geocoding Error",
        description: errorMessage,
        type: "error",
      });

      // Toast removed - using notification panel only
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.hazard) {
      toast({
        title: "Error",
        description: "Please select a hazard type",
        variant: "destructive",
      });
      return;
    }

    // Validate coordinates
    const centerLon = parseFloat(formData.longitude);
    const centerLat = parseFloat(formData.latitude);
    const radius = parseFloat(formData.radiusKm) || 5;

    if (isNaN(centerLon) || isNaN(centerLat)) {
      toast({
        title: "Error",
        description: "Please enter a valid address or coordinates",
        variant: "destructive",
      });
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast({
        title: "Error",
        description: "Please enter valid dates",
        variant: "destructive",
      });
      return;
    }

    if (startDate >= endDate) {
      toast({
        title: "Error",
        description: "Start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    // Calculate bounding box from center point and radius
    // Approximate: 1 degree latitude ≈ 111 km, 1 degree longitude ≈ 111 km * cos(latitude)
    const latOffset = radius / 111; // degrees
    const lonOffset = radius / (111 * Math.cos(centerLat * Math.PI / 180)); // degrees

    const minLon = centerLon - lonOffset;
    const minLat = centerLat - latOffset;
    const maxLon = centerLon + lonOffset;
    const maxLat = centerLat + latOffset;

    // Calculate pre and post date windows
    // Split the date range: first 1/3 for pre-event, last 1/3 for post-event
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const preDays = Math.max(1, Math.floor(totalDays / 3));
    const postDays = Math.max(1, Math.floor(totalDays / 3));

    const preEndDate = new Date(startDate);
    preEndDate.setDate(preEndDate.getDate() + preDays);

    const postStartDate = new Date(endDate);
    postStartDate.setDate(postStartDate.getDate() - postDays);

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const request = {
      preprocessing: {
        aoi: [minLon, minLat, maxLon, maxLat] as [number, number, number, number],
        pre: {
          start: formatDate(startDate),
          end: formatDate(preEndDate),
        },
        post: {
          start: formatDate(postStartDate),
          end: formatDate(endDate),
        },
        satellite: formData.satellite,
        max_cloud: parseInt(formData.maxCloud),
      },
      hazard: {
        hazard: formData.hazard as "flood" | "wildfire" | "roof",
      },
      claim: {
        include_summary: true,
        include_tiles: true,
      },
    };

    // Quick backend health check before starting
    const checkBackendHealth = async () => {
      try {
        // Use the API client's healthCheck method which has proper error handling
        await apiClient.healthCheck();
        return true;
      } catch (error) {
        // Health check failed - backend is down or unreachable
        console.error("Backend health check failed:", error);
        return false;
      }
    };

    // Check backend health first
    checkBackendHealth().then((isHealthy) => {
      if (!isHealthy) {
        addNotification({
          title: "Backend Unavailable",
          description: "Unable to connect to the backend server. Please ensure the server is running on port 8000.",
          type: "error",
        });
        return;
      }

      // Backend is healthy, proceed with processing
      // Start processing in global state (persists across navigation)
      startProcessing();

      // Add notification (will show at top via NotificationPanel)
      addNotification({
        title: "Processing Started",
        description: "Your claim is being processed. This may take up to 30 minutes.",
        type: "info",
      });

      processClaim(request, {
        onSuccess: (data) => {
          setClaimData(data);
          // Stop processing but keep popup visible to show success
          stopProcessing(null);
          
          // Add success notification
          addNotification({
            title: "Processing Complete",
            description: "Claim processed successfully! Results are now available.",
            type: "success",
          });

          // Toast is optional - notification is already shown
        },
        onError: (error) => {
          // Processing was running but failed
          const errorMessage = error instanceof Error 
            ? error.message 
            : "An error occurred while processing your claim. Please try again.";
          
          // Stop processing with error (keeps popup visible to show error)
          stopProcessing(errorMessage);
          
          // Add error notification
          addNotification({
            title: "Processing Failed",
            description: errorMessage,
            type: "error",
          });
        },
      });
    });
  };

  const confidenceScore = claimData?.validation?.confidence?.confidence_score || 0;
  const damagePct = claimData?.hazard?.damage_pct || 0;
  const confidenceLabel = claimData?.validation?.confidence?.label || "Unknown";

  return (
    <div className="space-y-6" style={{ background: 'transparent', minHeight: '100vh' }}>
      {/* Processing Popup is now in DashboardLayout - visible on all pages */}
      
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
            Process claims using satellite imagery analysis
          </p>
        </div>
      </div>

      {/* Claim Processing Form */}
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
            Area of Interest (AOI)
          </h3>
          
          {/* Address Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Address</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter address (e.g., 123 Main St, Boston, MA 02130)"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleGeocode();
                    }
                  }}
                  style={{
                    background: 'rgba(26, 31, 55, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                />
                <Button
                  onClick={handleGeocode}
                  disabled={isGeocoding || !formData.address.trim()}
                  style={{
                    background: '#0075FF',
                    color: 'white',
                    border: 'none',
                    minWidth: '100px'
                  }}
                >
                  {isGeocoding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              {formData.locationName && (
                <p className="text-xs mt-2" style={{ color: '#22C55E' }}>
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  {formData.locationName}
                </p>
              )}
            </div>
            <div>
              <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Search Radius (km)</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={formData.radiusKm}
                onChange={(e) => setFormData({ ...formData, radiusKm: e.target.value })}
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              />
            </div>
          </div>

          {/* Manual Coordinates (Collapsible) */}
          <div className="mb-4">
            <button
              onClick={() => setShowManualCoordinates(!showManualCoordinates)}
              className="flex items-center gap-2 text-sm mb-2"
              style={{ color: '#A0AEC0' }}
              type="button"
            >
              {showManualCoordinates ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Manual Coordinates
            </button>
            {showManualCoordinates && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Enter longitude"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    style={{
                      background: 'rgba(26, 31, 55, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }}
                  />
                </div>
                <div>
                  <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Enter latitude"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    style={{
                      background: 'rgba(26, 31, 55, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <h3 
            className="text-lg font-bold mb-4 mt-6"
            style={{ color: 'white' }}
          >
            Time Windows
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              />
            </div>
            <div>
              <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>End Date</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              />
            </div>
          </div>

          <h3 
            className="text-lg font-bold mb-4 mt-6"
            style={{ color: 'white' }}
          >
            Processing Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
            <div>
              <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Hazard Type</Label>
              <Select value={formData.hazard} onValueChange={(value) => setFormData({ ...formData, hazard: value as any })}>
                <SelectTrigger style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}>
                  <SelectValue placeholder="Select hazard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flood">Flood</SelectItem>
                  <SelectItem value="wildfire">Wildfire</SelectItem>
                  <SelectItem value="roof">Roof Damage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Processing Options (Collapsible) */}
          <div className="mb-6">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center gap-2 text-sm mb-2"
              style={{ color: '#A0AEC0' }}
              type="button"
            >
              {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Advanced Options
            </button>
            {showAdvancedOptions && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Satellite</Label>
                  <Input
                    value="Sentinel-2"
                    disabled
                    style={{
                      background: 'rgba(26, 31, 55, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#A0AEC0',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
                <div>
                  <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>Max Cloud Cover (%)</Label>
                  <Input
                    type="number"
                    value={formData.maxCloud}
                    onChange={(e) => setFormData({ ...formData, maxCloud: e.target.value })}
                    style={{
                      background: 'rgba(26, 31, 55, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full"
            style={{
              background: isPending ? 'rgba(0, 117, 255, 0.5)' : '#0075FF',
              color: 'white',
              border: 'none',
              cursor: isPending ? 'not-allowed' : 'pointer'
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Process Claim
              </>
            )}
          </Button>
          {isPending && (
            <p 
              className="text-xs text-center mt-2"
              style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Display, sans-serif' }}
            >
              ⏱️ Processing in the background - feel free to continue browsing
            </p>
          )}
        </div>
      </div>

      {/* Results Section - Only show if claimData exists */}
      {claimData && (
        <>
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
                    {Math.round(confidenceScore * 100)}%
                  </span>
                </div>
                <div 
                  className="w-full h-3 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ width: `${confidenceScore * 100}%`, background: '#0075FF' }}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: '#A0AEC0' }}>
                  Label: {confidenceLabel}
                </p>
              </div>

              {damagePct > 0 && (
                <div className="mb-4">
                  <p 
                    className="font-medium mb-3"
                    style={{ color: 'white' }}
                  >
                    Damage Detected:
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: '#A0AEC0' }}
                  >
                    Damage Percentage: {damagePct.toFixed(2)}%
                  </p>
                </div>
              )}

              {claimData.summary && (
                <div className="mb-4">
                  <p 
                    className="font-medium mb-3"
                    style={{ color: 'white' }}
                  >
                    Summary:
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: '#A0AEC0' }}
                  >
                    {claimData.summary}
                  </p>
                </div>
              )}

              {claimData.ranked_hazards && claimData.ranked_hazards.length > 0 && (
                <div className="mb-4">
                  <p 
                    className="font-medium mb-3"
                    style={{ color: 'white' }}
                  >
                    Ranked Hazards:
                  </p>
                  <ul className="space-y-2">
                    {claimData.ranked_hazards.map((hazard, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                        <span 
                          className="text-sm"
                          style={{ color: '#A0AEC0' }}
                        >
                          {hazard.hazard}: {hazard.fused_score?.toFixed(2)} (Confidence: {hazard.confidence_label})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Validation Metrics */}
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
                <h3 
                  className="text-lg font-bold mb-4"
                  style={{ color: 'white' }}
                >
                  📊 Validation Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#A0AEC0' }}>Cross Sensor</p>
                    <p className="text-lg font-bold" style={{ color: 'white' }}>
                      {claimData.validation.cross_sensor.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#A0AEC0' }}>Meteorology</p>
                    <p className="text-lg font-bold" style={{ color: 'white' }}>
                      {claimData.validation.meteorology.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#A0AEC0' }}>Spatial Coherence</p>
                    <p className="text-lg font-bold" style={{ color: 'white' }}>
                      {claimData.validation.spatial_coherence.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  🟢 CLAIM PROCESSED
                </span>
              </div>
              <div className="space-y-2">
                <p 
                  className="text-xl font-bold"
                  style={{ color: 'white' }}
                >
                  Processing Complete
                </p>
                <p 
                  className="text-sm"
                  style={{ color: '#A0AEC0' }}
                >
                  Analysis completed successfully. Review the results above.
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
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}