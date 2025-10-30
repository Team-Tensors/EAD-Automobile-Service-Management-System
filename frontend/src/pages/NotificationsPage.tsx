import React, { useState, useEffect } from "react";
import { Bell, Trash2, CheckCheck } from "lucide-react";
import notificationService from "@/services/NotificationService";
import NotificationItem from "@/components/Notification/NotificationItem";
import type { Notification } from "../types/notification.types";
import { useAuth } from "@/hooks/useAuth";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await notificationService.getUserNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleClearAll = async () => {
    if (!userId) return;

    try {
      await notificationService.clearAllNotifications(userId);
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col pt-12">
      <AuthenticatedNavbar />

      {/* Header Section */}
      <div className="bg-linear-to-r from-zinc-900 to-zinc-800 border-b border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Bell className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  {unreadCount} unread notification
                  {unreadCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            {/* Filter Tabs */}
            <div className="inline-flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              <button
                onClick={() => setFilter("all")}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === "all"
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                All
                <span className="ml-2 text-xs opacity-75">
                  ({notifications.length})
                </span>
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === "unread"
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Unread
                <span className="ml-2 text-xs opacity-75">({unreadCount})</span>
              </button>
            </div>

            {/* Action Buttons in Header */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-500/20 border border-orange-500/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-500/10"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark All Read</span>
                <span className="sm:hidden">Mark Read</span>
              </button>
              <button
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/20 border border-red-500/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">Clear</span>
              </button>
            </div>
          </div>
          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-16 text-center">
              <div className="inline-flex p-4 bg-zinc-800/50 rounded-full mb-4">
                <Bell className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Notifications
              </h3>
              <p className="text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all"
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotificationsPage;
