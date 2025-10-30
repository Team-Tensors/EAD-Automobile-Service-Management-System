import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import NotificationPanel from "@/components/Notification/NotificationPanel";
import notificationService from "../../services/NotificationService";
import type { Notification } from "../../types/notification.types";

interface NotificationBellProps {
  userId?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    // Initialize
    fetchInitialData();
    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        notificationService.closeConnection();
      }
    };
  }, [userId]);

  const fetchInitialData = async () => {
    if (!userId) return;
    try {
      const [notifs, count] = await Promise.all([
        notificationService.getUserNotifications(userId),
        notificationService.getUnreadCount(userId),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const connectSSE = () => {
    if (!userId) return;
    eventSourceRef.current = notificationService.subscribeToNotifications(
      userId,
      (notification) => {
        handleNewNotification(notification);
      },
      (error) => {
        console.error("SSE connection error:", error);
        // Reconnect after 5 seconds
        setTimeout(connectSSE, 5000);
      }
    );
  };

  const handleNewNotification = (notification: any) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Show browser notification
    notificationService.showBrowserNotification(
      notification.type,
      notification.message
    );
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleClearAll = async () => {
    if (!userId) return;

    try {
      await notificationService.clearAllNotifications(userId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const handleTogglePanel = () => {
    if (!isPanelOpen) {
      setIsPanelOpen(true);
    } else {
      setTimeout(() => setIsPanelOpen(false), 300);
    }
  };

  const handleClosePanel = () => {
    setTimeout(() => setIsPanelOpen(false), 300);
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={handleTogglePanel}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isPanelOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onClose={handleClosePanel}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClearAll={handleClearAll}
            onRequestPermission={() =>
              notificationService.requestBrowserPermission()
            }
          />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
