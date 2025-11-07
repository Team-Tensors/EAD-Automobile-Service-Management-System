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
  | "LOGIN_SUCCESS"
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_ASSIGNED"
  | "TASK_ASSIGNED"
  | "APPOINTMENT_STARTED"
  | "APPOINTMENT_COMPLETED"
  | "VEHICLE_ADDED"
  | "VEHICLE_UPDATED"
  | "VEHICLE_DELETED"
  | "NEW_CHAT_MESSAGE"
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
