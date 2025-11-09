import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";

export const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "#22C55E";
      case "error":
        return "#EF4444";
      case "warning":
        return "#F59E0B";
      default:
        return "#0075FF";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: "#EF4444",
              color: "white",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-lg shadow-2xl z-50 overflow-hidden"
          style={{
            background: 'linear-gradient(175deg, rgba(6, 11, 38, 0.95) 0%, rgba(26, 31, 55, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            maxHeight: '500px',
            fontFamily: 'Plus Jakarta Display, sans-serif',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h3 className="font-bold text-sm" style={{ color: 'white' }}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-white hover:bg-white/10"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-white hover:bg-white/10"
                  onClick={clearAll}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" style={{ color: '#A0AEC0' }} />
                <p className="text-sm" style={{ color: '#A0AEC0' }}>
                  No notifications
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                    !notification.read ? "bg-white/5" : ""
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      style={{
                        background: `${getNotificationColor(notification.type)}20`,
                        color: getNotificationColor(notification.type),
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p
                            className={`text-sm font-semibold mb-1 ${
                              !notification.read ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-xs mb-2" style={{ color: '#A0AEC0' }}>
                            {notification.description}
                          </p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

