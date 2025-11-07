import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, AlertCircle, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import chatService from '@/services/chatService';
import webSocketService from '@/services/webSocketService';
import type { ChatRoom, ChatMessage } from '@/types/chat';
import type { WebSocketMessage, TypingIndicator, UserStatus } from '@/services/webSocketService';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedNavbar from '@/components/Navbar/AuthenticatedNavbar';
import Footer from '@/components/Footer/Footer';

const ChatPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth(); // Make sure your useAuth hook returns token
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        if (!token) {
          console.error('No token available for WebSocket connection');
          return;
        }
        await webSocketService.connect(token);
        setWsConnected(true);
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setError('Real-time connection failed. Messages will still work but won\'t update instantly.');
      }
    };

    if (token) {
      initWebSocket();
    }

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, [token]);

  // Load chat room and initial messages
  useEffect(() => {
    const loadChat = async () => {
      if (!appointmentId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get chat room
        const roomResponse = await chatService.getChatRoomByAppointment(appointmentId);
        setChatRoom(roomResponse.data);
        
        // Get messages
        const messagesResponse = await chatService.getMessages(roomResponse.data.chatRoomId);
        setMessages(messagesResponse.data);
        
        // Mark as read
        await chatService.markAsRead(roomResponse.data.chatRoomId);
        
        // Join chat room via WebSocket
        if (webSocketService.isConnected()) {
          webSocketService.joinChatRoom(roomResponse.data.chatRoomId);
        }
        
        setTimeout(scrollToBottom, 100);
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [appointmentId]);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!chatRoom || !webSocketService.isConnected()) return;

    // Subscribe to new messages
    const messageSubscription = webSocketService.subscribeToChat(
      chatRoom.chatRoomId,
      (wsMessage: WebSocketMessage) => {
        // Add new message to list
        const newMsg: ChatMessage = {
          messageId: wsMessage.messageId,
          chatRoomId: wsMessage.chatRoomId,
          senderId: wsMessage.senderId,
          senderName: wsMessage.senderName,
          message: wsMessage.message,
          sentAt: wsMessage.sentAt,
          isRead: false,
          isSentByMe: String(wsMessage.senderId) === String(user?.id)
        };
        
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.messageId === newMsg.messageId)) {
            return prev;
          }
          return [...prev, newMsg];
        });
        
        // Auto mark as read if not from me
        if (!newMsg.isSentByMe) {
          webSocketService.markAsRead(chatRoom.chatRoomId);
        }
        
        setTimeout(scrollToBottom, 100);
      }
    );

    // Subscribe to typing indicators
    const typingSubscription = webSocketService.subscribeToTyping(
      chatRoom.chatRoomId,
      (typing: TypingIndicator) => {
        // Only show if it's not me typing
        if (typing.userName !== user?.email) {
          setOtherUserTyping(typing.isTyping);
          
          // Clear typing after 3 seconds
          if (typing.isTyping) {
            setTimeout(() => setOtherUserTyping(false), 3000);
          }
        }
      }
    );

    // Subscribe to user status
    const statusSubscription = webSocketService.subscribeToUserStatus(
      chatRoom.chatRoomId,
      (status: UserStatus) => {
        // Update online status if it's the other user
        if (String(status.userId) !== String(user?.id)) {
          setOtherUserOnline(status.status === 'ONLINE');
        }
      }
    );

    // Subscribe to read receipts
    const readSubscription = webSocketService.subscribeToReadReceipts(
      chatRoom.chatRoomId,
      (data: WebSocketMessage) => {
        // Mark my messages as read
        if (String(data.senderId) !== String(user?.id)) {
          setMessages(prev => 
            prev.map(msg => 
              msg.isSentByMe ? { ...msg, isRead: true } : msg
            )
          );
        }
      }
    );

    // Cleanup subscriptions
    return () => {
      messageSubscription?.unsubscribe();
      typingSubscription?.unsubscribe();
      statusSubscription?.unsubscribe();
      readSubscription?.unsubscribe();
    };
  }, [chatRoom, user]);

  // Handle message input change (typing indicator)
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (chatRoom && webSocketService.isConnected()) {
      webSocketService.sendTypingIndicator(chatRoom.chatRoomId, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        webSocketService.sendTypingIndicator(chatRoom.chatRoomId, false);
      }, 2000);
    }
  };

  // Send message via WebSocket
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatRoom) return;
    
    setSending(true);
    setError(null);
    
    try {
      if (webSocketService.isConnected()) {
        // Send via WebSocket (real-time)
        webSocketService.sendMessage(chatRoom.chatRoomId, newMessage.trim());
      } else {
        // Fallback to HTTP if WebSocket not connected
        const response = await chatService.sendMessage({
          chatRoomId: chatRoom.chatRoomId,
          message: newMessage.trim()
        });
        
        // Add to messages manually
        const newMsg: ChatMessage = {
          messageId: response.data.messageId,
          chatRoomId: chatRoom.chatRoomId,
          senderId: user?.id ?? '',
          senderName: user?.fullName || `${user?.firstName} ${user?.lastName}`,
          message: newMessage.trim(),
          sentAt: response.data.sentAt,
          isRead: false,
          isSentByMe: true
        };
        
        setMessages(prev => [...prev, newMsg]);
      }
      
      setNewMessage('');
      
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      webSocketService.sendTypingIndicator(chatRoom.chatRoomId, false);
      
      setTimeout(scrollToBottom, 100);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col pt-12">
        <AuthenticatedNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mb-4"></div>
            <p className="text-gray-400">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="min-h-screen bg-black flex flex-col pt-12">
        <AuthenticatedNavbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Chat Not Available</h2>
            <p className="text-gray-400 mb-6">
              This appointment doesn't have a chat room yet. Chat is created when an employee is assigned.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col pt-12">
      <AuthenticatedNavbar />
      
      {/* Chat Header */}
      <div className="bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-800 sticky top-12 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-5 h-5 text-orange-400" />
                <h1 className="text-lg font-bold text-white">
                  {chatRoom.customerName} ↔ {chatRoom.employeeName}
                </h1>
                {/* Connection status */}
                {wsConnected ? (
                  <div title="Connected">
                    <Wifi className="w-4 h-4 text-green-400" />
                  </div>
                ) : (
                  <div title="Disconnected">
                    <WifiOff className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400">
                  {chatRoom.vehicleInfo} • {chatRoom.serviceType}
                </p>
                {otherUserOnline && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Online
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-600/20 text-red-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.messageId}
                  className={`flex ${msg.isSentByMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 ${
                      msg.isSentByMe
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-800 text-gray-100 border border-zinc-700'
                    }`}
                  >
                    {!msg.isSentByMe && (
                      <p className="text-xs font-semibold mb-1 text-orange-400">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap overflow-wrap-anywhere">
                      {msg.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p
                        className={`text-xs ${
                          msg.isSentByMe ? 'text-orange-200' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(msg.sentAt)}
                      </p>
                      {msg.isSentByMe && msg.isRead && (
                        <span className="text-xs text-orange-200">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing indicator */}
            {otherUserTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-lg px-4 py-3 border border-zinc-700">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-zinc-900/90 backdrop-blur-sm border-t border-zinc-800 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1 bg-zinc-800 text-white rounded-lg px-4 py-3 border border-zinc-700 focus:outline-none focus:border-orange-500 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ChatPage;