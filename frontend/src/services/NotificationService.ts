import type { Notification } from "../types/notification.types";
import { STORAGE_KEYS } from "../types/constants";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class NotificationService {
  private eventSource: EventSource | null = null;

  // Get auth token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  // Get auth headers
  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Subscribe to SSE notifications
  subscribeToNotifications(
    userId: number,
    onNotification: (notification: any) => void,
    onError?: (error: any) => void
  ): EventSource {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}/api/notifications/subscribe/${userId}?token=${token}`;

    const eventSource = new EventSource(url);

    eventSource.addEventListener("notification", (event) => {
      try {
        const notification = JSON.parse(event.data);
        onNotification(notification);
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    });

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      if (onError) onError(error);

      // Auto-reconnect logic
      setTimeout(() => {
        console.log("Attempting SSE reconnection...");
        this.closeConnection();
        this.subscribeToNotifications(userId, onNotification, onError);
      }, 5000);
    };

    this.eventSource = eventSource;
    return eventSource;
  }

  // Close SSE connection
  closeConnection(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Get all notifications for user
  async getUserNotifications(userId: number): Promise<Notification[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/user/${userId}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }
      throw new Error("Failed to fetch notifications");
    }

    return response.json();
  }

  // Get unread notifications
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/user/${userId}/unread`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }
      throw new Error("Failed to fetch unread notifications");
    }

    return response.json();
  }

  // Get unread count
  async getUnreadCount(userId: number): Promise<number> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/user/${userId}/unread/count`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }
      throw new Error("Failed to fetch unread count");
    }

    return response.json();
  }

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}/read`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }
      throw new Error("Failed to mark notification as read");
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/user/${userId}/read-all`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }
      throw new Error("Failed to mark all as read");
    }
  }

  // Clear all notifications
  async clearAllNotifications(userId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/user/${userId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }
      throw new Error("Failed to clear notifications");
    }
  }

  // Request browser notification permission
  requestBrowserPermission(): void {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  // Show browser notification
  showBrowserNotification(title: string, message: string): void {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/notification-icon.png",
      });
    }
  }
}

export default new NotificationService();
