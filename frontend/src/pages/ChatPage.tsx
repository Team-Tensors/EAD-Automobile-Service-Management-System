import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send,
  ArrowLeft,
  AlertCircle,
  MessageCircle,
  Wifi,
  WifiOff,
  CheckCheck,
  Check,
} from "lucide-react";
import chatService from "@/services/chatService";
import webSocketService from "@/services/webSocketService";
import type { ChatRoom, ChatMessage } from "@/types/chat";
import type {
  WebSocketMessage,
  TypingIndicator,
  UserStatus,
} from "@/services/webSocketService";
import { useAuth } from "@/hooks/useAuth";

const ChatPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const initWebSocket = async () => {
      try {
        if (!token) {
          console.error("No token available for WebSocket connection");
          return;
        }
        await webSocketService.connect(token);
        setWsConnected(true);
      } catch (error) {
        console.error("WebSocket connection failed:", error);
        setError(
          "Real-time connection failed. Messages will still work but won't update instantly."
        );
      }
    };

    if (token) {
      initWebSocket();
    }

    return () => {
      webSocketService.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const loadChat = async () => {
      if (!appointmentId) return;

      setLoading(true);
      setError(null);

      try {
        const roomResponse = await chatService.getChatRoomByAppointment(
          appointmentId
        );
        setChatRoom(roomResponse.data);

        const messagesResponse = await chatService.getMessages(
          roomResponse.data.chatRoomId
        );
        setMessages(messagesResponse.data);

        await chatService.markAsRead(roomResponse.data.chatRoomId);

        if (webSocketService.isConnected()) {
          webSocketService.joinChatRoom(roomResponse.data.chatRoomId);
        }

        setTimeout(scrollToBottom, 100);
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [appointmentId]);

  useEffect(() => {
    if (!chatRoom || !webSocketService.isConnected()) {
      console.log('Subscription effect skipped:', { 
        hasChatRoom: !!chatRoom, 
        isConnected: webSocketService.isConnected(),
        wsConnected: wsConnected
      });
      return;
    }

    console.log('Setting up WebSocket subscriptions for chatRoom:', chatRoom.chatRoomId);

    const messageSubscription = webSocketService.subscribeToChat(
      chatRoom.chatRoomId,
      (wsMessage: WebSocketMessage) => {
        console.log('Message received in ChatPage:', wsMessage);
        const newMsg: ChatMessage = {
          messageId: wsMessage.messageId,
          chatRoomId: wsMessage.chatRoomId,
          senderId: wsMessage.senderId,
          senderName: wsMessage.senderName,
          message: wsMessage.message,
          sentAt: wsMessage.sentAt,
          isRead: false,
          isSentByMe: String(wsMessage.senderId) === String(user?.id),
        };

        setMessages((prev) => {
          if (prev.some((m) => m.messageId === newMsg.messageId)) {
            return prev;
          }
          return [...prev, newMsg];
        });

        if (!newMsg.isSentByMe) {
          webSocketService.markAsRead(chatRoom.chatRoomId);
        }

        setTimeout(scrollToBottom, 100);
      }
    );

    console.log('Message subscription result:', messageSubscription ? 'Success' : 'Failed');

    const typingSubscription = webSocketService.subscribeToTyping(
      chatRoom.chatRoomId,
      (typing: TypingIndicator) => {
        if (typing.userName !== user?.email) {
          setOtherUserTyping(typing.isTyping);

          if (typing.isTyping) {
            setTimeout(() => setOtherUserTyping(false), 3000);
          }
        }
      }
    );

    const statusSubscription = webSocketService.subscribeToUserStatus(
      chatRoom.chatRoomId,
      (status: UserStatus) => {
        if (String(status.userId) !== String(user?.id)) {
          setOtherUserOnline(status.status === "ONLINE");
        }
      }
    );

    const readSubscription = webSocketService.subscribeToReadReceipts(
      chatRoom.chatRoomId,
      (data: WebSocketMessage) => {
        if (String(data.senderId) !== String(user?.id)) {
          setMessages((prev) =>
            prev.map((msg) => (msg.isSentByMe ? { ...msg, isRead: true } : msg))
          );
        }
      }
    );

    return () => {
      console.log('Cleaning up WebSocket subscriptions');
      messageSubscription?.unsubscribe();
      typingSubscription?.unsubscribe();
      statusSubscription?.unsubscribe();
      readSubscription?.unsubscribe();
    };
  }, [chatRoom, user, wsConnected]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (chatRoom && webSocketService.isConnected()) {
      webSocketService.sendTypingIndicator(chatRoom.chatRoomId, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        webSocketService.sendTypingIndicator(chatRoom.chatRoomId, false);
      }, 2000);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatRoom) return;

    setSending(true);
    setError(null);

    try {
      if (webSocketService.isConnected()) {
        webSocketService.sendMessage(chatRoom.chatRoomId, newMessage.trim());
      } else {
        const response = await chatService.sendMessage({
          chatRoomId: chatRoom.chatRoomId,
          message: newMessage.trim(),
        });

        const newMsg: ChatMessage = {
          messageId: response.data.messageId,
          chatRoomId: chatRoom.chatRoomId,
          senderId: user?.id ?? "",
          senderName: user?.fullName || `${user?.firstName} ${user?.lastName}`,
          message: newMessage.trim(),
          sentAt: response.data.sentAt,
          isRead: false,
          isSentByMe: true,
        };

        setMessages((prev) => [...prev, newMsg]);
      }

      setNewMessage("");

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      webSocketService.sendTypingIndicator(chatRoom.chatRoomId, false);

      setTimeout(scrollToBottom, 100);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-black via-zinc-900 to-black flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-zinc-800 border-t-orange-500 mb-6"></div>
            </div>
            <p className="text-gray-400 font-medium">
              Loading your conversation...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="min-h-screen bg-linear-to-br from-black via-zinc-900 to-black flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
            <div className="bg-red-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Chat Not Available
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              This appointment doesn't have a chat room yet. Chat is created
              when an employee is assigned.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-linear-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-zinc-900 to-black flex flex-col">
      {/* Chat Header */}
      <div className="bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800/50 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95 p-2 hover:bg-zinc-800 rounded-lg"
              title="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-linear-to-br from-orange-500 to-orange-600 p-2 rounded-lg shadow-lg shadow-orange-500/25">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-white truncate">
                  {chatRoom.customerName}{" "}
                  <span className="text-gray-600">↔</span>{" "}
                  {chatRoom.employeeName}
                </h1>
                {wsConnected ? (
                  <div
                    className="flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20"
                    title="Connected"
                  >
                    <Wifi className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">
                      Live
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1.5 bg-gray-500/10 px-2.5 py-1 rounded-full border border-gray-500/20"
                    title="Disconnected"
                  >
                    <WifiOff className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400 font-medium">
                      Offline
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  {chatRoom.vehicleInfo} • {chatRoom.serviceType}
                </p>
                {otherUserOnline && (
                  <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
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
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm text-red-200 flex items-start gap-3 shadow-lg">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
              <p className="text-sm leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 inline-block">
                  <div className="bg-linear-to-br from-orange-500/20 to-orange-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-orange-400" />
                  </div>
                  <p className="text-gray-400 font-medium">No messages yet</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Start the conversation!
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const showAvatar =
                  index === 0 ||
                  messages[index - 1].isSentByMe !== msg.isSentByMe;
                return (
                  <div
                    key={msg.messageId}
                    className={`flex ${
                      msg.isSentByMe ? "justify-end" : "justify-start"
                    } group`}
                  >
                    <div
                      className={`flex gap-2 max-w-[75%] ${
                        msg.isSentByMe ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {showAvatar && (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto ${
                            msg.isSentByMe
                              ? "bg-linear-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                              : "bg-zinc-700 text-gray-300 border border-zinc-600"
                          }`}
                        >
                          {msg.senderName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {!showAvatar && <div className="w-8"></div>}

                      <div>
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-lg transition-all ${
                            msg.isSentByMe
                              ? "bg-linear-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/25 rounded-br-md"
                              : "bg-zinc-800/90 backdrop-blur-sm text-gray-100 border border-zinc-700/50 rounded-bl-md"
                          }`}
                        >
                          {!msg.isSentByMe && showAvatar && (
                            <p className="text-xs font-semibold mb-1.5 text-orange-400">
                              {msg.senderName}
                            </p>
                          )}
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap overflow-wrap-anywhere">
                            {msg.message}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-2 mt-1 px-1 ${
                            msg.isSentByMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <p className="text-xs text-gray-500 font-medium">
                            {formatTime(msg.sentAt)}
                          </p>
                          {msg.isSentByMe && (
                            <div className="text-orange-400">
                              {msg.isRead ? (
                                <CheckCheck className="w-4 h-4" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {otherUserTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                    {chatRoom.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-zinc-800/90 backdrop-blur-sm rounded-2xl rounded-bl-md px-5 py-3 border border-zinc-700/50 shadow-lg">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                      <span
                        className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></span>
                    </div>
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
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
