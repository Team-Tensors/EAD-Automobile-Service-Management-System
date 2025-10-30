import React from "react";
import { Check } from "lucide-react";
import type { Notification } from "../../types/notification.types";
import {
  getNotificationIcon,
  getNotificationColor,
  formatNotificationTime,
} from "@/utill/notification.utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const IconComponent = getNotificationIcon(notification.type);
  
  return (
    <div
      className={`p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer ${
        !notification.isRead ? "bg-zinc-800/30" : ""
      }`}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="flex gap-3">
        <div
          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(
            notification.type
          )}`}
        >
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">
                {notification.type}
              </p>
              <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500">
                {formatNotificationTime(notification.createdAt)}
              </p>
            </div>

            {!notification.isRead && (
              <div className="shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="p-1 text-orange-500 hover:bg-zinc-700 rounded-full transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;