package com.ead.backend.controller;

import com.ead.backend.dto.*;
import com.ead.backend.entity.User;
import com.ead.backend.service.ChatService;
import com.ead.backend.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class WebSocketChatController {

    private final ChatService chatService;
    private final CustomUserDetailsService userDetailsService;

    /**
     * Handle incoming chat messages via WebSocket
     * Client sends to: /app/chat.send
     * Server broadcasts to: /topic/chat/{chatRoomId}
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequestDTO payload, Principal principal) {
        User user = userDetailsService.getUserByEmail(principal.getName());
        chatService.sendMessage(payload.getChatRoomId(), payload.getMessage(), user);
    }

    /**
     * Handle typing indicators
     * Client sends to: /app/chat.typing
     * Server broadcasts to: /topic/chat/{chatRoomId}/typing
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingIndicatorDTO payload, Principal principal) {
        User user = userDetailsService.getUserByEmail(principal.getName());
        chatService.sendTypingIndicator(payload.getChatRoomId(), user.getFullName(), payload.getIsTyping());
    }

    /**
     * Handle mark as read
     * Client sends to: /app/chat.markRead
     * Server broadcasts to: /topic/chat/{chatRoomId}/read
     */
    @MessageMapping("/chat.markRead")
    public void markAsRead(@Payload UUID chatRoomId, Principal principal) {
        User user = userDetailsService.getUserByEmail(principal.getName());
        chatService.markAsRead(chatRoomId, user.getId());
    }

    /**
     * Handle user joining a chat room
     * Client sends to: /app/chat.join
     * Server broadcasts to: /topic/chat/{chatRoomId}/status
     */
    @MessageMapping("/chat.join")
    public void joinChatRoom(@Payload UUID chatRoomId, Principal principal) {
        User user = userDetailsService.getUserByEmail(principal.getName());
        chatService.sendUserStatus(chatRoomId, user.getId().toString(), user.getFullName(), "ONLINE");
    }

    /**
     * Handle user leaving a chat room
     * Client sends to: /app/chat.leave
     * Server broadcasts to: /topic/chat/{chatRoomId}/status
     */
    @MessageMapping("/chat.leave")
    public void leaveChatRoom(@Payload UUID chatRoomId, Principal principal) {
        User user = userDetailsService.getUserByEmail(principal.getName());
        chatService.sendUserStatus(chatRoomId, user.getId().toString(), user.getFullName(), "OFFLINE");
    }
}

