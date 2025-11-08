package com.ead.backend.service;

import com.ead.backend.dto.*;
import com.ead.backend.entity.*;
import com.ead.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChatService Unit Tests")
class ChatServiceTest {

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private AppointmentService appointmentService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ChatService chatService;

    private User customer;
    private User employee;
    private Appointment appointment;
    private ChatRoom chatRoom;
    private ChatMessage chatMessage;
    private Vehicle vehicle;
    private ServiceOrModification service;
    private Role customerRole;
    private Role employeeRole;

    @BeforeEach
    void setUp() {
        // Setup roles
        customerRole = new Role();
        customerRole.setId(1L);
        customerRole.setName("CUSTOMER");

        employeeRole = new Role();
        employeeRole.setId(2L);
        employeeRole.setName("EMPLOYEE");

        // Setup customer user
        customer = new User();
        customer.setId(UUID.randomUUID());
        customer.setEmail("customer@example.com");
        customer.setFullName("John Customer");
        customer.setRoles(new HashSet<>(Set.of(customerRole)));

        // Setup employee user
        employee = new User();
        employee.setId(UUID.randomUUID());
        employee.setEmail("employee@example.com");
        employee.setFullName("Jane Employee");
        employee.setRoles(new HashSet<>(Set.of(employeeRole)));

        // Setup vehicle
        vehicle = new Vehicle();
        vehicle.setId(UUID.randomUUID());
        vehicle.setBrand("Toyota");
        vehicle.setModel("Camry");
        vehicle.setLicensePlate("ABC123");
        vehicle.setYear(2020);

        // Setup service
        service = new ServiceOrModification();
        service.setId(UUID.randomUUID());
        service.setName("Oil Change");

        // Setup appointment
        appointment = new Appointment();
        appointment.setId(UUID.randomUUID());
        appointment.setUser(customer);
        appointment.setVehicle(vehicle);
        appointment.setServiceOrModification(service);
        appointment.setAssignedEmployees(new HashSet<>(Set.of(employee)));

        // Setup chat room
        chatRoom = new ChatRoom();
        chatRoom.setChatRoomId(UUID.randomUUID());
        chatRoom.setAppointment(appointment);
        chatRoom.setCustomer(customer);
        chatRoom.setEmployee(employee);
        chatRoom.setLastMessage("Hello");
        chatRoom.setLastMessageAt(LocalDateTime.now());
        chatRoom.setCreatedAt(LocalDateTime.now());

        // Setup chat message
        chatMessage = new ChatMessage();
        chatMessage.setMessageId(UUID.randomUUID());
        chatMessage.setChatRoom(chatRoom);
        chatMessage.setSender(customer);
        chatMessage.setMessage("Test message");
        chatMessage.setSentAt(LocalDateTime.now());
        chatMessage.setIsRead(false);
    }

    @Test
    @DisplayName("Should get or create chat room when it doesn't exist")
    void testGetOrCreateChatRoom_WhenNotExists() {
        // Arrange
        UUID appointmentId = appointment.getId();
        when(chatRoomRepository.findByAppointment_Id(appointmentId)).thenReturn(Optional.empty());
        when(appointmentService.findById(appointmentId)).thenReturn(appointment);
        when(chatRoomRepository.save(any(ChatRoom.class))).thenReturn(chatRoom);

        // Act
        ChatRoom result = chatService.getOrCreateChatRoom(appointmentId);

        // Assert
        assertNotNull(result);
        verify(chatRoomRepository).findByAppointment_Id(appointmentId);
        verify(appointmentService).findById(appointmentId);
        verify(chatRoomRepository).save(any(ChatRoom.class));
    }

    @Test
    @DisplayName("Should get existing chat room")
    void testGetOrCreateChatRoom_WhenExists() {
        // Arrange
        UUID appointmentId = appointment.getId();
        when(chatRoomRepository.findByAppointment_Id(appointmentId)).thenReturn(Optional.of(chatRoom));

        // Act
        ChatRoom result = chatService.getOrCreateChatRoom(appointmentId);

        // Assert
        assertNotNull(result);
        assertEquals(chatRoom.getChatRoomId(), result.getChatRoomId());
        verify(chatRoomRepository).findByAppointment_Id(appointmentId);
        verify(appointmentService, never()).findById(any());
        verify(chatRoomRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should get chat room by appointment")
    void testGetChatRoomByAppointment() {
        // Arrange
        UUID appointmentId = appointment.getId();
        when(chatRoomRepository.findByAppointment_Id(appointmentId)).thenReturn(Optional.of(chatRoom));
        when(chatMessageRepository.countUnreadMessages(any(), any())).thenReturn(3);

        // Act
        ChatRoomDTO result = chatService.getChatRoomByAppointment(appointmentId, customer.getId());

        // Assert
        assertNotNull(result);
        assertEquals(chatRoom.getChatRoomId(), result.getChatRoomId());
        assertEquals(appointmentId, result.getAppointmentId());
        assertEquals(customer.getFullName(), result.getCustomerName());
        assertEquals(employee.getFullName(), result.getEmployeeName());
        assertEquals(3, result.getUnreadCount());
    }

    @Test
    @DisplayName("Should get all chat rooms for user")
    void testGetMyChatRooms() {
        // Arrange
        UUID userId = customer.getId();
        List<ChatRoom> chatRooms = Arrays.asList(chatRoom);
        when(chatRoomRepository.findAllByUserId(userId)).thenReturn(chatRooms);
        when(chatMessageRepository.countUnreadMessages(any(), any())).thenReturn(2);

        // Act
        List<ChatRoomDTO> result = chatService.getMyChatRooms(userId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(chatRoom.getChatRoomId(), result.get(0).getChatRoomId());
        verify(chatRoomRepository).findAllByUserId(userId);
    }

    @Test
    @DisplayName("Should get all messages in chat room")
    void testGetMessages() {
        // Arrange
        UUID chatRoomId = chatRoom.getChatRoomId();
        List<ChatMessage> messages = Arrays.asList(chatMessage);
        when(chatMessageRepository.findAllByChatRoomId(chatRoomId)).thenReturn(messages);

        // Act
        List<ChatMessageDTO> result = chatService.getMessages(chatRoomId, customer.getId());

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(chatMessage.getMessageId(), result.get(0).getMessageId());
        assertEquals(chatMessage.getMessage(), result.get(0).getMessage());
        assertTrue(result.get(0).getIsSentByMe());
        verify(chatMessageRepository).findAllByChatRoomId(chatRoomId);
    }

    @Test
    @DisplayName("Should send message successfully")
    void testSendMessage() {
        // Arrange
        UUID chatRoomId = chatRoom.getChatRoomId();
        String messageText = "Hello World";
        when(chatRoomRepository.findById(chatRoomId)).thenReturn(Optional.of(chatRoom));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(chatMessage);
        when(chatRoomRepository.save(any(ChatRoom.class))).thenReturn(chatRoom);

        // Act
        SendMessageResponseDTO result = chatService.sendMessage(chatRoomId, messageText, customer);

        // Assert
        assertNotNull(result);
        assertEquals(chatMessage.getMessageId(), result.getMessageId());
        assertEquals("sent", result.getStatus());
        verify(chatRoomRepository).findById(chatRoomId);
        verify(chatMessageRepository).save(any(ChatMessage.class));
        verify(chatRoomRepository).save(any(ChatRoom.class));
        verify(messagingTemplate).convertAndSend(eq("/topic/chat/" + chatRoomId), any(ChatMessageDTO.class));
    }

    @Test
    @DisplayName("Should throw exception when chat room not found for sending message")
    void testSendMessage_ChatRoomNotFound() {
        // Arrange
        UUID chatRoomId = UUID.randomUUID();
        when(chatRoomRepository.findById(chatRoomId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            chatService.sendMessage(chatRoomId, "Test message", customer);
        });
        verify(chatMessageRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should mark messages as read")
    void testMarkAsRead() {
        // Arrange
        UUID chatRoomId = chatRoom.getChatRoomId();
        UUID userId = customer.getId();
        List<ChatMessage> unreadMessages = Arrays.asList(chatMessage);
        when(chatMessageRepository.findUnreadMessages(chatRoomId, userId)).thenReturn(unreadMessages);
        when(chatMessageRepository.saveAll(anyList())).thenReturn(unreadMessages);

        // Act
        chatService.markAsRead(chatRoomId, userId);

        // Assert
        verify(chatMessageRepository).findUnreadMessages(chatRoomId, userId);
        verify(chatMessageRepository).saveAll(anyList());
        verify(messagingTemplate).convertAndSend(eq("/topic/chat/" + chatRoomId + "/read"), any(ChatMessageDTO.class));
    }

    @Test
    @DisplayName("Should send typing indicator")
    void testSendTypingIndicator() {
        // Arrange
        UUID chatRoomId = chatRoom.getChatRoomId();
        String userName = "John Doe";
        Boolean isTyping = true;

        // Act
        chatService.sendTypingIndicator(chatRoomId, userName, isTyping);

        // Assert
        verify(messagingTemplate).convertAndSend(
            eq("/topic/chat/" + chatRoomId + "/typing"),
            any(TypingIndicatorDTO.class)
        );
    }

    @Test
    @DisplayName("Should send user status")
    void testSendUserStatus() {
        // Arrange
        UUID chatRoomId = chatRoom.getChatRoomId();
        String userId = customer.getId().toString();
        String userName = customer.getFullName();
        String status = "ONLINE";

        // Act
        chatService.sendUserStatus(chatRoomId, userId, userName, status);

        // Assert
        verify(messagingTemplate).convertAndSend(
            eq("/topic/chat/" + chatRoomId + "/status"),
            any(UserStatusDTO.class)
        );
    }

    @Test
    @DisplayName("Should handle empty unread messages list")
    void testMarkAsRead_NoUnreadMessages() {
        // Arrange
        UUID chatRoomId = chatRoom.getChatRoomId();
        UUID userId = customer.getId();
        when(chatMessageRepository.findUnreadMessages(chatRoomId, userId)).thenReturn(Collections.emptyList());

        // Act
        chatService.markAsRead(chatRoomId, userId);

        // Assert
        verify(chatMessageRepository).findUnreadMessages(chatRoomId, userId);
        verify(chatMessageRepository).saveAll(anyList());
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

    @Test
    @DisplayName("Should identify message sent by current user")
    void testGetMessages_IsSentByMe() {
        // Arrange
        UUID chatRoomId = chatRoom.getChatRoomId();
        List<ChatMessage> messages = Arrays.asList(chatMessage);
        when(chatMessageRepository.findAllByChatRoomId(chatRoomId)).thenReturn(messages);

        // Act - Get messages as the sender (customer)
        List<ChatMessageDTO> resultAsCustomer = chatService.getMessages(chatRoomId, customer.getId());

        // Assert
        assertTrue(resultAsCustomer.get(0).getIsSentByMe());

        // Act - Get messages as different user (employee)
        List<ChatMessageDTO> resultAsEmployee = chatService.getMessages(chatRoomId, employee.getId());

        // Assert
        assertFalse(resultAsEmployee.get(0).getIsSentByMe());
    }
}

