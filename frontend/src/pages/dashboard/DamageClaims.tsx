import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useClaimProcessing, useHealthCheck } from "@/hooks/useClaimProcessing";
import { ClaimProcessingResponse, apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { geocodeAddress } from "@/lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";
import { DatePicker } from "@/components/ui/date-picker";
import { DamageAssessmentPopup } from "@/components/DamageAssessmentPopup";

export default function DamageClaims() {
  const [claimData, setClaimData] = useState<ClaimProcessingResponse | null>(null);
  const [showResultsPopup, setShowResultsPopup] = useState(false);
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
    } else {
      // When mutation completes (success or error), ensure processing is stopped
      // This is a fallback in case the callbacks don't fire
      if (processingState.isProcessing) {
        // Only stop if we haven't already stopped (to avoid overriding error state)
        if (!processingState.error) {
          stopProcessing(null);
        }
      }
    }
  }, [isPending, processingState.isProcessing, processingState.error, startProcessing, stopProcessing]);

  // Show popup if processing state says so (persists across navigation)
  // This ensures the popup appears even after navigating away and coming back
  const showProcessingPopup = processingState.showPopup;
  
  // When component mounts, if processing state indicates processing, ensure popup is visible
  // BUT only if it hasn't been dismissed by the user
  useEffect(() => {
    // If processing state says we're processing or there's an error, show the popup
    // This ensures the popup persists when user navigates back to this page
    // BUT only if the user hasn't dismissed it
    if ((processingState.isProcessing || processingState.error) && !processingState.showPopup && !processingState.dismissed) {
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

    // Start processing immediately - don't block on health check
    // The actual API call will provide proper error handling
    startProcessing();

    // Add notification (will show at top via NotificationPanel)
    addNotification({
      title: "Processing Started",
      description: "Your claim is being processed. This may take up to 30 minutes.",
      type: "info",
    });

    // Process the claim - the API client will handle errors properly
    processClaim(request, {
      onSuccess: (data) => {
        console.log("Claim processing successful:", data);
        setClaimData(data);
        // Stop processing immediately when backend responds
        stopProcessing(null);
        
        // Open the results popup automatically
        setShowResultsPopup(true);
        
        // Add success notification
        addNotification({
          title: "Processing Complete",
          description: "Claim processed successfully! Results are now available.",
          type: "success",
        });
      },
      onError: (error) => {
        // Processing was running but failed - stop immediately when backend sends error
        console.error("Claim processing failed:", error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : "An error occurred while processing your claim. Please try again.";
        
        // Stop processing immediately with error when backend responds
        stopProcessing(errorMessage);
        
        // Add error notification with detailed message
        addNotification({
          title: "Processing Failed",
          description: errorMessage.includes("Network error") || errorMessage.includes("Unable to connect")
            ? "Unable to connect to the backend server. Please ensure the server is running on port 5000."
            : errorMessage,
          type: "error",
        });
      },
    });
  };

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
                    "Search"
                  )}
                </Button>
              </div>
              {formData.locationName && (
                <p className="text-xs mt-2" style={{ color: '#22C55E' }}>
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
              <DatePicker
                value={formData.startDate}
                onChange={(value) => setFormData({ ...formData, startDate: value })}
                placeholder="MM/DD/YYYY"
                style={{
                  background: 'rgba(26, 31, 55, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              />
            </div>
            <div>
              <Label style={{ color: '#A0AEC0', fontSize: '12px' }}>End Date</Label>
              <DatePicker
                value={formData.endDate}
                onChange={(value) => setFormData({ ...formData, endDate: value })}
                placeholder="MM/DD/YYYY"
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
              "Process Claim"
            )}
          </Button>
          {isPending && (
            <p 
              className="text-xs text-center mt-2"
              style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Display, sans-serif' }}
            >
              Processing in the background - feel free to continue browsing
            </p>
          )}
        </div>
      </div>

      {/* Results Button - Show if claimData exists */}
      {claimData && (
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
            <div className="space-y-4">
              <div>
                <p 
                  className="text-xl font-bold mb-2"
                  style={{ color: 'white' }}
                >
                  Processing Complete
                </p>
                <p 
                  className="text-sm"
                  style={{ color: '#A0AEC0' }}
                >
                  Analysis completed successfully. Click below to view detailed results.
                </p>
              </div>
              <Button
                onClick={() => setShowResultsPopup(true)}
                className="w-full"
                style={{
                  background: '#0075FF',
                  color: 'white',
                  border: 'none'
                }}
              >
                View Damage Assessment Results
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Damage Assessment Popup */}
      <DamageAssessmentPopup
        isOpen={showResultsPopup}
        onClose={() => setShowResultsPopup(false)}
        claimData={claimData}
        mapCenter={formData.latitude && formData.longitude 
          ? [parseFloat(formData.latitude), parseFloat(formData.longitude)] 
          : undefined}
      />
    </div>
  );
}