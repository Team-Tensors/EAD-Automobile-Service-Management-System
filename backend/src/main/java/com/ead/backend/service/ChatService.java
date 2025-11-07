package com.ead.backend.service;

import com.ead.backend.dto.*;
import com.ead.backend.entity.*;
import com.ead.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AppointmentService appointmentService;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    /**
     * Get or create chat room for an appointment
     */
    @Transactional
    public ChatRoom getOrCreateChatRoom(UUID appointmentId) {
        // Check if chat room already exists
        return chatRoomRepository.findByAppointment_Id(appointmentId)
                .orElseGet(() -> {
                    // Get appointment details
                    Appointment appointment = appointmentService.findById(appointmentId);

                    // Create new chat room
                    ChatRoom chatRoom = new ChatRoom();
                    chatRoom.setAppointment(appointment);
                    chatRoom.setCustomer(appointment.getUser());

                    // Set employee if assigned
                    if (!appointment.getAssignedEmployees().isEmpty()) {
                        chatRoom.setEmployee(appointment.getAssignedEmployees().iterator().next());
                    }

                    return chatRoomRepository.save(chatRoom);
                });
    }

    /**
     * Get chat room by appointment ID
     */
    public ChatRoomDTO getChatRoomByAppointment(UUID appointmentId, UUID userId) {
        ChatRoom chatRoom = getOrCreateChatRoom(appointmentId);
        return convertToChatRoomDTO(chatRoom, userId);
    }

    /**
     * Get all chat rooms for a user
     */
    public List<ChatRoomDTO> getMyChatRooms(UUID userId) {
        List<ChatRoom> chatRooms = chatRoomRepository.findAllByUserId(userId);
        return chatRooms.stream()
                .map(chatRoom -> convertToChatRoomDTO(chatRoom, userId))
                .collect(Collectors.toList());
    }

    /**
     * Get all messages in a chat room
     */
    public List<ChatMessageDTO> getMessages(UUID chatRoomId, UUID userId) {
        List<ChatMessage> messages = chatMessageRepository.findAllByChatRoomId(chatRoomId);
        return messages.stream()
                .map(msg -> convertToChatMessageDTO(msg, userId))
                .collect(Collectors.toList());
    }

    /**
     * Send a message via WebSocket
     */
    @Transactional
    public SendMessageResponseDTO sendMessage(UUID chatRoomId, String messageText, User sender) {
        // Get chat room
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        // Create message
        ChatMessage message = new ChatMessage();
        message.setChatRoom(chatRoom);
        message.setSender(sender);
        message.setMessage(messageText);
        message.setIsRead(false);

        ChatMessage savedMessage = chatMessageRepository.save(message);

        // Update chat room's last message
        chatRoom.setLastMessage(messageText);
        chatRoom.setLastMessageAt(savedMessage.getSentAt());
        chatRoomRepository.save(chatRoom);

        // Create WebSocket message DTO
        ChatMessageDTO wsMessage = new ChatMessageDTO();
        wsMessage.setMessageId(savedMessage.getMessageId());
        wsMessage.setChatRoomId(chatRoomId);
        wsMessage.setSenderId(sender.getId().toString());
        wsMessage.setSenderName(sender.getFullName());
        wsMessage.setMessage(messageText);
        wsMessage.setSentAt(savedMessage.getSentAt());
        wsMessage.setIsRead(false);

        // Broadcast to chat room
        messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId, wsMessage);

        // Send notification if customer sent the message
        sendNewMessageNotification(chatRoom, sender, messageText);

        // Return response
        return new SendMessageResponseDTO(
                savedMessage.getMessageId(),
                savedMessage.getSentAt(),
                "sent"
        );
    }

    /**
     * Mark messages as read
     */
    @Transactional
    public void markAsRead(UUID chatRoomId, UUID userId) {
        List<ChatMessage> unreadMessages = chatMessageRepository.findUnreadMessages(chatRoomId, userId);

        LocalDateTime now = LocalDateTime.now();
        unreadMessages.forEach(msg -> {
            msg.setIsRead(true);
            msg.setReadAt(now);
        });

        chatMessageRepository.saveAll(unreadMessages);

        // Notify via WebSocket
        if (!unreadMessages.isEmpty()) {
            ChatMessageDTO readReceipt = new ChatMessageDTO();
            readReceipt.setChatRoomId(chatRoomId);
            readReceipt.setSenderId(userId.toString());
            readReceipt.setIsRead(true);

            messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId + "/read", readReceipt);
        }
    }

    /**
     * Send typing indicator
     */
    public void sendTypingIndicator(UUID chatRoomId, String userName, Boolean isTyping) {
        TypingIndicatorDTO indicator = new TypingIndicatorDTO(chatRoomId, userName, isTyping);
        messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId + "/typing", indicator);
    }

    /**
     * Send user status
     */
    public void sendUserStatus(UUID chatRoomId, String userId, String userName, String status) {
        UserStatusDTO statusDTO = new UserStatusDTO(
                userId,
                chatRoomId,
                userName,
                status,
                LocalDateTime.now()
        );
        messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId + "/status", statusDTO);
    }

    // Helper methods

    private ChatRoomDTO convertToChatRoomDTO(ChatRoom chatRoom, UUID userId) {
        Appointment appointment = chatRoom.getAppointment();
        Integer unreadCount = chatMessageRepository.countUnreadMessages(chatRoom.getChatRoomId(), userId);

        String vehicleInfo = String.format("%s %s (%s)",
                appointment.getVehicle().getBrand(),
                appointment.getVehicle().getModel(),
                appointment.getVehicle().getLicensePlate()
        );

        return new ChatRoomDTO(
                chatRoom.getChatRoomId(),
                appointment.getId(),
                chatRoom.getCustomer().getFullName(),
                chatRoom.getEmployee() != null ? chatRoom.getEmployee().getFullName() : "Not Assigned",
                chatRoom.getLastMessage(),
                chatRoom.getLastMessageAt(),
                unreadCount,
                vehicleInfo,
                appointment.getServiceOrModification().getName()
        );
    }

    private ChatMessageDTO convertToChatMessageDTO(ChatMessage message, UUID userId) {
        boolean isSentByMe = message.getSender().getId().equals(userId);

        return new ChatMessageDTO(
                message.getMessageId(),
                message.getChatRoom().getChatRoomId(),
                message.getSender().getId().toString(),
                message.getSender().getFullName(),
                message.getMessage(),
                message.getSentAt(),
                message.getIsRead(),
                isSentByMe
        );
    }

    /**
     * Send notification when a new message is received
     * If customer sends message, notify the employee
     */
    private void sendNewMessageNotification(ChatRoom chatRoom, User sender, String messageText) {
        try {
            // Check if sender is a customer (not an employee)
            boolean isCustomer = sender.getRoles().stream()
                    .anyMatch(role -> "CUSTOMER".equals(role.getName()));

            // If customer sent the message and there's an assigned employee, notify the employee
            if (isCustomer && chatRoom.getEmployee() != null) {
                UUID employeeId = chatRoom.getEmployee().getId();
                String customerName = sender.getFullName();
                
                // Create notification data
                java.util.Map<String, Object> notificationData = new java.util.HashMap<>();
                notificationData.put("chatRoomId", chatRoom.getChatRoomId().toString());
                notificationData.put("customerId", sender.getId().toString());
                notificationData.put("customerName", customerName);
                notificationData.put("messagePreview", messageText.length() > 50 
                    ? messageText.substring(0, 50) + "..." 
                    : messageText);
                notificationData.put("appointmentId", chatRoom.getAppointment().getId().toString());
                
                // Send notification
                notificationService.sendNotification(
                    employeeId,
                    "NEW_CHAT_MESSAGE",
                    String.format("%s sent you a message: %s", customerName, 
                        messageText.length() > 30 ? messageText.substring(0, 30) + "..." : messageText),
                    notificationData
                );
            }
        } catch (Exception e) {
            // Log error but don't fail the message sending
            System.err.println("Failed to send chat notification: " + e.getMessage());
        }
    }
}

