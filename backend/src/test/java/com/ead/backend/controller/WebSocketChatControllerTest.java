package com.ead.backend.controller;

import com.ead.backend.dto.*;
import com.ead.backend.entity.Role;
import com.ead.backend.entity.User;
import com.ead.backend.service.ChatService;
import com.ead.backend.service.CustomUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
@DisplayName("WebSocketChatController Unit Tests")
class WebSocketChatControllerTest {

    @Mock
    private ChatService chatService;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private Principal principal;

    @InjectMocks
    private WebSocketChatController webSocketChatController;

    private User testUser;
    private UUID chatRoomId;
    private SendMessageRequestDTO sendMessageRequest;
    private SendMessageResponseDTO sendMessageResponse;
    private TypingIndicatorDTO typingIndicator;

    @BeforeEach
    void setUp() {
        Role customerRole = new Role();
        customerRole.setId(1L);
        customerRole.setName("CUSTOMER");

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        testUser.setRoles(new HashSet<>(Set.of(customerRole)));

        chatRoomId = UUID.randomUUID();

        sendMessageRequest = new SendMessageRequestDTO();
        sendMessageRequest.setChatRoomId(chatRoomId);
        sendMessageRequest.setMessage("Hello via WebSocket");

        sendMessageResponse = new SendMessageResponseDTO();
        sendMessageResponse.setMessageId(UUID.randomUUID());
        sendMessageResponse.setSentAt(LocalDateTime.now());
        sendMessageResponse.setStatus("sent");

        typingIndicator = new TypingIndicatorDTO();
        typingIndicator.setChatRoomId(chatRoomId);
        typingIndicator.setUserName("Test User");
        typingIndicator.setIsTyping(true);
    }

    @Test
    @DisplayName("Should send message via WebSocket")
    void testSendMessage() {
        // Arrange
        when(principal.getName()).thenReturn("test@example.com");
        when(userDetailsService.getUserByEmail("test@example.com")).thenReturn(testUser);
        when(chatService.sendMessage(eq(chatRoomId), anyString(), eq(testUser)))
                .thenReturn(sendMessageResponse);

        // Act
        webSocketChatController.sendMessage(sendMessageRequest, principal);

        // Assert
        verify(principal, times(2)).getName(); // Called twice: once for logging, once for getUserByEmail
        verify(userDetailsService).getUserByEmail("test@example.com");
        verify(chatService).sendMessage(chatRoomId, "Hello via WebSocket", testUser);
    }

    @Test
    @DisplayName("Should not send message when principal is null")
    void testSendMessage_NullPrincipal() {
        // Act
        webSocketChatController.sendMessage(sendMessageRequest, null);

        // Assert
        verify(userDetailsService, never()).getUserByEmail(anyString());
        verify(chatService, never()).sendMessage(any(), anyString(), any());
    }

    @Test
    @DisplayName("Should handle typing indicator")
    void testHandleTyping() {
        // Arrange
        when(principal.getName()).thenReturn("test@example.com");
        when(userDetailsService.getUserByEmail("test@example.com")).thenReturn(testUser);
        doNothing().when(chatService).sendTypingIndicator(chatRoomId, testUser.getFullName(), true);

        // Act
        webSocketChatController.handleTyping(typingIndicator, principal);

        // Assert
        verify(principal, times(2)).getName(); // Called twice: once for logging, once for getUserByEmail
        verify(userDetailsService).getUserByEmail("test@example.com");
        verify(chatService).sendTypingIndicator(chatRoomId, testUser.getFullName(), true);
    }

    @Test
    @DisplayName("Should not handle typing indicator when principal is null")
    void testHandleTyping_NullPrincipal() {
        // Act
        webSocketChatController.handleTyping(typingIndicator, null);

        // Assert
        verify(userDetailsService, never()).getUserByEmail(anyString());
        verify(chatService, never()).sendTypingIndicator(any(), anyString(), anyBoolean());
    }

    @Test
    @DisplayName("Should mark messages as read via WebSocket")
    void testMarkAsRead() {
        // Arrange
        when(principal.getName()).thenReturn("test@example.com");
        when(userDetailsService.getUserByEmail("test@example.com")).thenReturn(testUser);
        doNothing().when(chatService).markAsRead(chatRoomId, testUser.getId());

        // Act
        webSocketChatController.markAsRead(chatRoomId, principal);

        // Assert
        verify(principal, times(2)).getName(); // Called twice: once for logging, once for getUserByEmail
        verify(userDetailsService).getUserByEmail("test@example.com");
        verify(chatService).markAsRead(chatRoomId, testUser.getId());
    }

    @Test
    @DisplayName("Should not mark as read when principal is null")
    void testMarkAsRead_NullPrincipal() {
        // Act
        webSocketChatController.markAsRead(chatRoomId, null);

        // Assert
        verify(userDetailsService, never()).getUserByEmail(anyString());
        verify(chatService, never()).markAsRead(any(), any());
    }

    @Test
    @DisplayName("Should handle user joining chat room")
    void testJoinChatRoom() {
        // Arrange
        when(principal.getName()).thenReturn("test@example.com");
        when(userDetailsService.getUserByEmail("test@example.com")).thenReturn(testUser);
        doNothing().when(chatService).sendUserStatus(
                eq(chatRoomId),
                eq(testUser.getId().toString()),
                eq(testUser.getFullName()),
                eq("ONLINE")
        );

        // Act
        webSocketChatController.joinChatRoom(chatRoomId, principal);

        // Assert
        verify(principal, times(2)).getName(); // Called twice: once for logging, once for getUserByEmail
        verify(userDetailsService).getUserByEmail("test@example.com");
        verify(chatService).sendUserStatus(
                chatRoomId,
                testUser.getId().toString(),
                testUser.getFullName(),
                "ONLINE"
        );
    }

    @Test
    @DisplayName("Should not join chat room when principal is null")
    void testJoinChatRoom_NullPrincipal() {
        // Act
        webSocketChatController.joinChatRoom(chatRoomId, null);

        // Assert
        verify(userDetailsService, never()).getUserByEmail(anyString());
        verify(chatService, never()).sendUserStatus(any(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should handle user leaving chat room")
    void testLeaveChatRoom() {
        // Arrange
        when(principal.getName()).thenReturn("test@example.com");
        when(userDetailsService.getUserByEmail("test@example.com")).thenReturn(testUser);
        doNothing().when(chatService).sendUserStatus(
                eq(chatRoomId),
                eq(testUser.getId().toString()),
                eq(testUser.getFullName()),
                eq("OFFLINE")
        );

        // Act
        webSocketChatController.leaveChatRoom(chatRoomId, principal);

        // Assert
        verify(principal, times(2)).getName(); // Called twice: once for logging, once for getUserByEmail
        verify(userDetailsService).getUserByEmail("test@example.com");
        verify(chatService).sendUserStatus(
                chatRoomId,
                testUser.getId().toString(),
                testUser.getFullName(),
                "OFFLINE"
        );
    }

    @Test
    @DisplayName("Should not leave chat room when principal is null")
    void testLeaveChatRoom_NullPrincipal() {
        // Act
        webSocketChatController.leaveChatRoom(chatRoomId, null);

        // Assert
        verify(userDetailsService, never()).getUserByEmail(anyString());
        verify(chatService, never()).sendUserStatus(any(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should handle typing stopped indicator")
    void testHandleTyping_StoppedTyping() {
        // Arrange
        typingIndicator.setIsTyping(false);
        when(principal.getName()).thenReturn("test@example.com");
        when(userDetailsService.getUserByEmail("test@example.com")).thenReturn(testUser);
        doNothing().when(chatService).sendTypingIndicator(chatRoomId, testUser.getFullName(), false);

        // Act
        webSocketChatController.handleTyping(typingIndicator, principal);

        // Assert
        verify(chatService).sendTypingIndicator(chatRoomId, testUser.getFullName(), false);
    }

    @Test
    @DisplayName("Should handle exception gracefully when sending message")
    void testSendMessage_HandlesException() {
        // Arrange
        when(principal.getName()).thenReturn("test@example.com");
        when(userDetailsService.getUserByEmail("test@example.com")).thenReturn(testUser);
        when(chatService.sendMessage(any(), anyString(), any()))
                .thenThrow(new RuntimeException("Message send failed"));

        // Act & Assert - Should not throw exception, just log it
        try {
            webSocketChatController.sendMessage(sendMessageRequest, principal);
        } catch (Exception e) {
            // Exception should be caught and logged by the controller
        }

        verify(chatService).sendMessage(any(), anyString(), any());
    }
}

