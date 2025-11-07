// src/types/chat.ts

export interface ChatRoom {
  chatRoomId: string;
  appointmentId: string;
  customerName: string;
  employeeName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  vehicleInfo: string;
  serviceType: string;
}

export interface ChatMessage {
  messageId: string;
  chatRoomId: string;
  senderId: string | number;
  senderName: string;
  message: string;
  sentAt: string;
  isRead: boolean;
  isSentByMe: boolean;
}

export interface SendMessageRequest {
  chatRoomId: string;
  message: string;
}

export interface SendMessageResponse {
  messageId: string;
  sentAt: string;
  status: string;
}