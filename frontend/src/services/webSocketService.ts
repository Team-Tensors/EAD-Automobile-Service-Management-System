import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import api from '../util/apiUtils';


export interface WebSocketMessage {
  messageId: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  message: string;
  sentAt: string;
  type: string;
}

export interface TypingIndicator {
  chatRoomId: string;
  userName: string;
  isTyping: boolean;
}

export interface UserStatus {
  userId: string;
  chatRoomId: string;
  userName: string;
  status: 'ONLINE' | 'OFFLINE';
  timestamp: string;
}

class WebSocketService {
  private client: Stomp.Client | null = null;
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  /**
   * Connect to WebSocket server
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${api.defaults.baseURL}/ws-chat`;
        
        // Create SockJS connection
        const socket = new SockJS(wsUrl);
        
        // Create STOMP client using over method
        this.client = Stomp.over(socket);

        // Set authentication headers
        const headers = {
          Authorization: `Bearer ${token}`
        };

        // Connection success
        this.client.connect(
          headers,
          (frame?: Stomp.Frame) => {
            console.log('WebSocket connected:', frame);
            this.connected = true;
            this.reconnectAttempts = 0;
            resolve();
          },
          (error: string | Stomp.Frame) => {
            console.error('WebSocket connection error:', error);
            this.connected = false;
            
            // Auto reconnect
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectAttempts++;
              setTimeout(() => {
                console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
                this.connect(token);
              }, this.reconnectDelay);
            }
            
            reject(error);
          }
        );

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.client && this.connected) {
      this.client.disconnect(() => {
        console.log('WebSocket disconnected');
        this.connected = false;
      });
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Subscribe to chat room messages
   */
  subscribeToChat(
    chatRoomId: string,
    onMessage: (message: WebSocketMessage) => void
  ) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    return this.client.subscribe(
      `/topic/chat/${chatRoomId}`,
      (message: Stomp.Message) => {
        const data: WebSocketMessage = JSON.parse(message.body);
        onMessage(data);
      }
    );
  }

  /**
   * Subscribe to typing indicators
   */
  subscribeToTyping(
    chatRoomId: string,
    onTyping: (typing: TypingIndicator) => void
  ) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    return this.client.subscribe(
      `/topic/chat/${chatRoomId}/typing`,
      (message: Stomp.Message) => {
        const data: TypingIndicator = JSON.parse(message.body);
        onTyping(data);
      }
    );
  }

  /**
   * Subscribe to read receipts
   */
  subscribeToReadReceipts(
    chatRoomId: string,
    onRead: (data: WebSocketMessage) => void
  ) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    return this.client.subscribe(
      `/topic/chat/${chatRoomId}/read`,
      (message: Stomp.Message) => {
        const data: WebSocketMessage = JSON.parse(message.body);
        onRead(data);
      }
    );
  }

  /**
   * Subscribe to user status changes
   */
  subscribeToUserStatus(
    chatRoomId: string,
    onStatus: (status: UserStatus) => void
  ) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    return this.client.subscribe(
      `/topic/chat/${chatRoomId}/status`,
      (message: Stomp.Message) => {
        const data: UserStatus = JSON.parse(message.body);
        onStatus(data);
      }
    );
  }

  /**
   * Send a chat message
   */
  sendMessage(chatRoomId: string, message: string) {
    if (!this.client || !this.connected) {
      throw new Error('WebSocket not connected');
    }

    this.client.send(
      '/app/chat.send',
      {},
      JSON.stringify({ chatRoomId, message })
    );
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(chatRoomId: string, isTyping: boolean) {
    if (!this.client || !this.connected) {
      return;
    }

    this.client.send(
      '/app/chat.typing',
      {},
      JSON.stringify({ chatRoomId, isTyping })
    );
  }

  /**
   * Mark messages as read
   */
  markAsRead(chatRoomId: string) {
    if (!this.client || !this.connected) {
      return;
    }

    this.client.send(
      '/app/chat.markRead',
      {},
      chatRoomId  // Send as plain string (UUID)
    );
  }

  /**
   * Join a chat room
   */
  joinChatRoom(chatRoomId: string) {
    if (!this.client || !this.connected) {
      return;
    }

    this.client.send(
      '/app/chat.join',
      {},
      chatRoomId  // Send as plain string (UUID)
    );
  }
}

export default new WebSocketService();