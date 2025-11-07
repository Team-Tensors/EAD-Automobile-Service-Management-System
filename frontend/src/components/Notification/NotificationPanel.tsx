import React, { useState, useEffect, useRef } from "react";
import { X, CheckCheck, Trash2, Bell, Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import NotificationItem from "@/components/Notification/NotificationItem";
import type { Notification } from "../../types/notification.types";
import { useNavigate } from "react-router-dom";

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onClose: () => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onRequestPermission: () => void;
  isVisible?: boolean;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isClosing, setIsClosing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleMarkAllAsRead = async () => {
    setActionLoading('markAll');
    try {
      await onMarkAllAsRead();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearAll = async () => {
    setActionLoading('clear');
    try {
      await onClearAll();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          theme === "light" ? "bg-black/10" : "bg-black/20"
        } ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`absolute right-0 mt-2 w-96 border rounded-2xl shadow-2xl z-50 max-h-[600px] flex flex-col overflow-hidden transition-all duration-200 ${
          theme === "light"
            ? "bg-gradient-to-b from-white to-gray-50 border-gray-200"
            : "bg-linear-to-b from-zinc-900 to-zinc-950 border-zinc-800/50"
        } ${isClosing ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
        style={{
          boxShadow: theme === "light" 
            ? '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            : '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Success Toast */}
        {showSuccess && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-10 animate-in fade-in slide-in-from-top-2 duration-300">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Action completed!</span>
          </div>
        )}

        {/* Header */}
        <div className={`p-5 border-b backdrop-blur-sm ${
          theme === "light"
            ? "border-gray-200 bg-gray-50/50"
            : "border-zinc-800/50 bg-zinc-900/50"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Bell className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className={`text-lg font-bold ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}>
                Notifications
              </h3>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                theme === "light"
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  : "text-gray-400 hover:text-white hover:bg-zinc-800/50"
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter & Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className={`flex gap-2 p-1 rounded-lg ${
              theme === "light" ? "bg-gray-200/50" : "bg-zinc-800/30"
            }`}>
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  filter === "all"
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : theme === "light"
                    ? "text-gray-600 hover:text-gray-900 hover:bg-white"
                    : "text-gray-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                All
                <span className="ml-1.5 text-xs opacity-75">
                  {notifications.length}
                </span>
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  filter === "unread"
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : theme === "light"
                    ? "text-gray-600 hover:text-gray-900 hover:bg-white"
                    : "text-gray-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-orange-600 rounded text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={actionLoading === 'markAll'}
                  className="p-2 text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:scale-100"
                  title="Mark all as read"
                >
                  <CheckCheck className={`w-4 h-4 ${actionLoading === 'markAll' ? 'animate-pulse' : ''}`} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={actionLoading === 'clear'}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:scale-100"
                  title="Clear all"
                >
                  <Trash2 className={`w-4 h-4 ${actionLoading === 'clear' ? 'animate-pulse' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className={`overflow-y-auto flex-1 scrollbar-thin scrollbar-track-transparent ${
          theme === "light" ? "scrollbar-thumb-gray-300" : "scrollbar-thumb-zinc-700"
        }`}>
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className={`p-4 rounded-full mb-4 ${
                theme === "light" ? "bg-gray-100" : "bg-zinc-800/30"
              }`}>
                <Bell className={`w-12 h-12 ${
                  theme === "light" ? "text-gray-400" : "text-zinc-600"
                }`} />
              </div>
              <p className={`text-lg font-semibold mb-1 ${
                theme === "light" ? "text-gray-900" : "text-gray-300"
              }`}>
                {filter === "unread" ? "All caught up!" : "No notifications yet"}
              </p>
              <p className={`text-sm text-center ${
                theme === "light" ? "text-gray-600" : "text-gray-500"
              }`}>
                {filter === "unread" 
                  ? "You've read all your notifications" 
                  : "We'll notify you when something arrives"}
              </p>
            </div>
          ) : (
            <div className={`divide-y ${
              theme === "light" ? "divide-gray-200" : "divide-zinc-800/50"
            }`}>
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className="animate-in fade-in slide-in-from-top-1 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className={`p-3 border-t backdrop-blur-sm ${
            theme === "light"
              ? "border-gray-200 bg-gray-50/50"
              : "border-zinc-800/50 bg-zinc-900/50"
          }`}>
            <button
              onClick={() => {
                navigate("/notifications");
                onClose();
              }}
              className="w-full text-center text-sm font-semibold text-orange-500 hover:text-orange-400 py-2.5 hover:bg-orange-500/10 rounded-lg transition-all duration-200 hover:scale-[1.02]"
            >
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPanel;