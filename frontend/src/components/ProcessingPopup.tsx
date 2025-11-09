import { useState } from "react";
import { Loader2, Minimize2, Maximize2, X, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcessingPopupProps {
  isVisible: boolean;
  onClose: () => void;
  isProcessing?: boolean;
  error?: string | null;
}

export const ProcessingPopup = ({ isVisible, onClose, isProcessing = false, error = null }: ProcessingPopupProps) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible) return null;

  // Determine status: processing, success, or error
  const status = error ? 'error' : (isProcessing ? 'processing' : 'success');

  return (
    <>
      {/* Minimized State - Small button in bottom right */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all hover:scale-110"
          style={{
            background: status === 'error' 
              ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
              : status === 'success'
              ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
              : 'linear-gradient(135deg, #0075FF 0%, #00D4FF 100%)',
            color: 'white',
          }}
        >
          {status === 'processing' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : status === 'error' ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
        </button>
      ) : (
        /* Full Popup */
        <div
          className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
          style={{
            fontFamily: 'Plus Jakarta Display, sans-serif',
          }}
        >
          <div
            className="rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: status === 'error'
                ? 'linear-gradient(175deg, rgba(127, 29, 29, 0.95) 0%, rgba(153, 27, 27, 0.95) 100%)'
                : status === 'success'
                ? 'linear-gradient(175deg, rgba(20, 83, 45, 0.95) 0%, rgba(22, 101, 52, 0.95) 100%)'
                : 'linear-gradient(175deg, rgba(6, 11, 38, 0.95) 0%, rgba(26, 31, 55, 0.95) 100%)',
              border: status === 'error'
                ? '1px solid rgba(239, 68, 68, 0.5)'
                : status === 'success'
                ? '1px solid rgba(34, 197, 94, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4"
              style={{
                borderBottom: status === 'error'
                  ? '1px solid rgba(239, 68, 68, 0.3)'
                  : status === 'success'
                  ? '1px solid rgba(34, 197, 94, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                {status === 'processing' ? (
                  <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#0075FF' }} />
                ) : status === 'error' ? (
                  <AlertCircle className="h-5 w-5" style={{ color: '#EF4444' }} />
                ) : (
                  <CheckCircle className="h-5 w-5" style={{ color: '#22C55E' }} />
                )}
                <h3
                  className="font-bold text-sm"
                  style={{ color: 'white' }}
                >
                  {status === 'error' ? 'Processing Failed' : status === 'success' ? 'Processing Complete' : 'Processing Claim'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/10"
                  onClick={() => setIsMinimized(true)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/10"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {status === 'processing' ? (
                <>
                  <p
                    className="text-sm mb-3"
                    style={{ color: '#A0AEC0' }}
                  >
                    Your claim is being processed. This may take up to 30 minutes.
                  </p>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div
                      className="h-full rounded-full animate-pulse-slow"
                      style={{
                        background: 'linear-gradient(90deg, #0075FF 0%, #00D4FF 100%)',
                        width: '100%',
                      }}
                    />
                  </div>
                  <p
                    className="text-xs mt-3"
                    style={{ color: '#A0AEC0' }}
                  >
                    You can continue using the site. We'll notify you when it's complete. The request will timeout after 45 minutes.
                  </p>
                </>
              ) : status === 'error' ? (
                <>
                  <p
                    className="text-sm mb-2 font-semibold"
                    style={{ color: '#FEE2E2' }}
                  >
                    Processing failed
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: '#FCA5A5' }}
                  >
                    {error || "An error occurred while processing your claim. Please try again."}
                  </p>
                  <p
                    className="text-xs mt-3"
                    style={{ color: '#FCA5A5' }}
                  >
                    Check the notification panel for more details.
                  </p>
                </>
              ) : (
                <>
                  <p
                    className="text-sm mb-2 font-semibold"
                    style={{ color: '#D1FAE5' }}
                  >
                    Processing completed successfully!
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: '#A0AEC0' }}
                  >
                    Results are now available below. Check notifications for details.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

