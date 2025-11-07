// Create this file: src/services/chatService.ts

import api from '@/util/apiUtils';
import type { ChatRoom, ChatMessage, SendMessageRequest } from '@/types/chat';

class ChatService {
  private base = '/chat';

  /**
   * Get chat room by appointment ID
   */
  async getChatRoomByAppointment(appointmentId: string) {
    return await api.get<ChatRoom>(`${this.base}/appointment/${appointmentId}`);
  }

  /**
   * Get all chat rooms for the logged-in user
   */
  async getMyChatRooms() {
    return await api.get<ChatRoom[]>(`${this.base}/my-chats`);
  }

  /**
   * Get all messages in a chat room
   */
  async getMessages(chatRoomId: string) {
    return await api.get<ChatMessage[]>(`${this.base}/${chatRoomId}/messages`);
  }

  /**
   * Send a message
   */
  async sendMessage(payload: SendMessageRequest) {
    return await api.post(`${this.base}/send`, payload);
  }

  /**
   * Mark messages as read
   */
  async markAsRead(chatRoomId: string) {
    return await api.put(`${this.base}/${chatRoomId}/mark-read`);
  }
}

export default new ChatService();