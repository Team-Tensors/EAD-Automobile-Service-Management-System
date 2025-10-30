import React, { useState, useEffect, useRef } from "react";
import { X, CheckCheck, Trash2, Bell } from "lucide-react";
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
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-96 bg-zinc-950/95 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-2xl z-50 max-h-[600px] flex flex-col transition-all duration-300 ease-in-out transform"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-orange-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                filter === "unread"
                  ? "bg-orange-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="p-2 text-orange-500 hover:bg-zinc-800 rounded-md transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-2 text-red-500 hover:bg-zinc-800 rounded-md transition-colors"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-400">
              No notifications
            </p>
            <p className="text-sm text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
          <button
            onClick={() => {
              navigate("/notifications");
              onClose();
            }}
            className="w-full text-center text-sm font-medium text-orange-500 hover:text-orange-400 py-2 hover:bg-zinc-800 rounded-md transition-all"
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
