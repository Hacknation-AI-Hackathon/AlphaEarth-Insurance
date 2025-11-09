import { useNotifications } from "@/contexts/NotificationContext";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export const NotificationPanel = () => {
  const { notifications, removeNotification, markAsRead } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);

  // Show notifications with different auto-dismiss times based on type
  // Filter out "Processing Started" notifications (they're shown in the popup)
  useEffect(() => {
    const updateVisibleNotifications = () => {
      const now = Date.now();
      
      const recent = notifications
        .filter((n) => {
          const age = now - n.timestamp.getTime();
          // Don't show "Processing Started" in the panel - it's in the popup
          const isProcessingStarted = n.title === "Processing Started" && n.type === "info";
          
          // Different display durations based on type
          let maxAge = 10000; // 10 seconds default
          if (n.type === "error") {
            maxAge = 10000; // 10 seconds for errors
          } else if (n.type === "success") {
            maxAge = 8000; // 8 seconds for success
          } else if (n.type === "info") {
            maxAge = 5000; // 5 seconds for info
          }
          
          // Auto-mark as read and remove if expired
          if (age >= maxAge && !n.read) {
            markAsRead(n.id);
            return false;
          }
          
          return age < maxAge && !n.read && !isProcessingStarted;
        })
        .slice(0, 3)
        .map((n) => n.id);

      setVisibleNotifications((prev) => {
        // Only update if there's a change to prevent unnecessary re-renders
        if (JSON.stringify(prev) !== JSON.stringify(recent)) {
          return recent;
        }
        return prev;
      });
    };

    updateVisibleNotifications();

    // Update every 500ms to check which notifications should be hidden
    const interval = setInterval(updateVisibleNotifications, 500);

    return () => clearInterval(interval);
  }, [notifications, markAsRead]);

  const displayNotifications = notifications.filter((n) =>
    visibleNotifications.includes(n.id)
  );

  if (displayNotifications.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 z-40 w-80 max-w-[calc(100vw-2rem)] space-y-2">
      {displayNotifications.map((notification) => (
        <div
          key={notification.id}
          className="p-3 rounded-lg shadow-lg backdrop-blur-md animate-fade-in relative"
          style={{
            background:
              notification.type === "error"
                ? "rgba(239, 68, 68, 0.9)"
                : notification.type === "success"
                ? "rgba(34, 197, 94, 0.9)"
                : "rgba(6, 11, 38, 0.95)",
            border: `1px solid ${
              notification.type === "error"
                ? "rgba(239, 68, 68, 0.5)"
                : "rgba(255, 255, 255, 0.1)"
            }`,
            fontFamily: "Plus Jakarta Display, sans-serif",
          }}
        >
          <button
            onClick={() => {
              markAsRead(notification.id);
              removeNotification(notification.id);
              setVisibleNotifications((prev) => prev.filter((id) => id !== notification.id));
            }}
            className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
            style={{ cursor: 'pointer' }}
          >
            <X className="h-4 w-4" />
          </button>
          <p className="font-semibold text-sm text-white mb-1 pr-6">
            {notification.title}
          </p>
          <p className="text-xs text-white/80">
            {notification.description}
          </p>
        </div>
      ))}
    </div>
  );
};

