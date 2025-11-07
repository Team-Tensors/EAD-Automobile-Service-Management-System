package com.ead.backend.controller;

import com.ead.backend.dto.*;
import com.ead.backend.entity.User;
import com.ead.backend.service.ChatService;
import com.ead.backend.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Slf4j
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
        try {
            if (principal == null) {
                log.error("Principal is null - user not authenticated");
                return;
            }
            
            log.info("Received message from user: {} for chatRoom: {}", 
                principal.getName(), payload.getChatRoomId());
            
            User user = userDetailsService.getUserByEmail(principal.getName());
            chatService.sendMessage(payload.getChatRoomId(), payload.getMessage(), user);
            
            log.info("Message sent successfully to chatRoom: {}", payload.getChatRoomId());
        } catch (Exception e) {
            log.error("Error sending message: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Handle typing indicators
     * Client sends to: /app/chat.typing
     * Server broadcasts to: /topic/chat/{chatRoomId}/typing
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingIndicatorDTO payload, Principal principal) {
        try {
            if (principal == null) {
                log.error("Principal is null for typing indicator");
                return;
            }
            
            log.debug("Typing indicator from user: {} for chatRoom: {}, isTyping: {}", 
                principal.getName(), payload.getChatRoomId(), payload.getIsTyping());
            
            User user = userDetailsService.getUserByEmail(principal.getName());
            chatService.sendTypingIndicator(payload.getChatRoomId(), user.getFullName(), payload.getIsTyping());
        } catch (Exception e) {
            log.error("Error handling typing indicator: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle mark as read
     * Client sends to: /app/chat.markRead
     * Server broadcasts to: /topic/chat/{chatRoomId}/read
     */
    @MessageMapping("/chat.markRead")
    public void markAsRead(@Payload UUID chatRoomId, Principal principal) {
        try {
            if (principal == null) {
                log.error("Principal is null for markAsRead");
                return;
            }
            
            log.debug("Mark as read from user: {} for chatRoom: {}", 
                principal.getName(), chatRoomId);
            
            User user = userDetailsService.getUserByEmail(principal.getName());
            chatService.markAsRead(chatRoomId, user.getId());
        } catch (Exception e) {
            log.error("Error marking as read: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle user joining a chat room
     * Client sends to: /app/chat.join
     * Server broadcasts to: /topic/chat/{chatRoomId}/status
     */
    @MessageMapping("/chat.join")
    public void joinChatRoom(@Payload UUID chatRoomId, Principal principal) {
        try {
            if (principal == null) {
                log.error("Principal is null for chat.join");
                return;
            }
            
            log.info("User joining chatRoom: {} - Principal: {}", 
                chatRoomId, principal.getName());
            
            User user = userDetailsService.getUserByEmail(principal.getName());
            chatService.sendUserStatus(chatRoomId, user.getId().toString(), user.getFullName(), "ONLINE");
            
            log.info("User {} joined chatRoom: {} successfully", user.getFullName(), chatRoomId);
        } catch (Exception e) {
            log.error("Error joining chat room: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle user leaving a chat room
     * Client sends to: /app/chat.leave
     * Server broadcasts to: /topic/chat/{chatRoomId}/status
     */
    @MessageMapping("/chat.leave")
    public void leaveChatRoom(@Payload UUID chatRoomId, Principal principal) {
        try {
            if (principal == null) {
                log.warn("Principal is null for chat.leave");
                return;
            }
            
            log.info("User leaving chatRoom: {} - Principal: {}", 
                chatRoomId, principal.getName());
            
            User user = userDetailsService.getUserByEmail(principal.getName());
            chatService.sendUserStatus(chatRoomId, user.getId().toString(), user.getFullName(), "OFFLINE");
        } catch (Exception e) {
            log.error("Error leaving chat room: {}", e.getMessage(), e);
        }
    }
}

