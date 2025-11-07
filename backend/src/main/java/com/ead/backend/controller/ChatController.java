package com.ead.backend.controller;

import com.ead.backend.dto.*;
import com.ead.backend.entity.User;
import com.ead.backend.service.ChatService;
import com.ead.backend.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final CustomUserDetailsService userDetailsService;

    /**
     * Get chat room by appointment ID
     */
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ChatRoomDTO> getChatRoomByAppointment(
            @PathVariable UUID appointmentId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetailsService.getUserByEmail(userDetails.getUsername());
        ChatRoomDTO chatRoom = chatService.getChatRoomByAppointment(appointmentId, user.getId());
        return ResponseEntity.ok(chatRoom);
    }

    /**
     * Get all chat rooms for the logged-in user
     */
    @GetMapping("/my-chats")
    public ResponseEntity<List<ChatRoomDTO>> getMyChatRooms(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetailsService.getUserByEmail(userDetails.getUsername());
        List<ChatRoomDTO> chatRooms = chatService.getMyChatRooms(user.getId());
        return ResponseEntity.ok(chatRooms);
    }

    /**
     * Get all messages in a chat room
     */
    @GetMapping("/{chatRoomId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(
            @PathVariable UUID chatRoomId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetailsService.getUserByEmail(userDetails.getUsername());
        List<ChatMessageDTO> messages = chatService.getMessages(chatRoomId, user.getId());
        return ResponseEntity.ok(messages);
    }

    /**
     * Send a message (REST fallback)
     */
    @PostMapping("/send")
    public ResponseEntity<SendMessageResponseDTO> sendMessage(
            @RequestBody SendMessageRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetailsService.getUserByEmail(userDetails.getUsername());
        SendMessageResponseDTO response = chatService.sendMessage(
                request.getChatRoomId(),
                request.getMessage(),
                user
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Mark messages as read
     */
    @PutMapping("/{chatRoomId}/mark-read")
    public ResponseEntity<MessageResponseDTO> markAsRead(
            @PathVariable UUID chatRoomId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetailsService.getUserByEmail(userDetails.getUsername());
        chatService.markAsRead(chatRoomId, user.getId());
        return ResponseEntity.ok(new MessageResponseDTO("Messages marked as read"));
    }
}

