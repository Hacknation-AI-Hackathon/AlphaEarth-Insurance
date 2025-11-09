import { createContext, useContext, useState, ReactNode } from "react";

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: "info" | "success" | "error" | "warning";
  timestamp: Date;
  read: boolean;
}

interface ProcessingState {
  isProcessing: boolean;
  startTime: number | null;
  error: string | null;
  showPopup: boolean;
  dismissed: boolean; // Track if user manually dismissed the popup
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
  // Processing state
  processingState: ProcessingState;
  setProcessingState: (state: Partial<ProcessingState>) => void;
  startProcessing: () => void;
  stopProcessing: (error?: string | null) => void;
  dismissPopup: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [processingState, setProcessingStateInternal] = useState<ProcessingState>({
    isProcessing: false,
    startTime: null,
    error: null,
    showPopup: false,
    dismissed: false,
  });

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const setProcessingState = (state: Partial<ProcessingState>) => {
    setProcessingStateInternal((prev) => ({ ...prev, ...state }));
  };

  const startProcessing = () => {
    setProcessingStateInternal({
      isProcessing: true,
      startTime: Date.now(),
      error: null,
      showPopup: true,
      dismissed: false, // Reset dismissed flag when starting new processing
    });
  };

  const stopProcessing = (error?: string | null) => {
    setProcessingStateInternal((prev) => ({
      ...prev,
      isProcessing: false,
      error: error || null,
      // Only show popup if it wasn't dismissed by user
      showPopup: !prev.dismissed,
    }));
  };
  
  const dismissPopup = () => {
    setProcessingStateInternal((prev) => ({
      ...prev,
      showPopup: false,
      dismissed: true, // Mark as dismissed so it won't reopen
    }));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        unreadCount,
        processingState,
        setProcessingState,
        startProcessing,
        stopProcessing,
        dismissPopup,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

