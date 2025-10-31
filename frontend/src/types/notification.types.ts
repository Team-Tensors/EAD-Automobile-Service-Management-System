export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  message: string;
  data: string | null;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType =
  | "LOGIN"
  | "BOOKING"
  | "PAYMENT"
  | "SERVICE"
  | "REMINDER"
  | "SYSTEM"
  | string;

export interface NotificationEventDTO {
  type: string;
  message: string;
  data: any;
}

export interface NotificationFilter {
  all: "all";
  unread: "unread";
}
