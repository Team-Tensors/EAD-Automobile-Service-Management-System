package com.ead.backend.controller;

import com.ead.backend.entity.Notification;
import com.ead.backend.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController controller;

    private MockMvc mockMvc;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        testUserId = UUID.randomUUID();
    }

    private Notification createSampleNotification(Long id) {
        Notification n = new Notification();
        n.setId(id);
        n.setUserId(testUserId);
        n.setType("TEST_TYPE");
        n.setMessage("Test message");
        n.setData("{\"key\":\"value\"}");
        n.setIsRead(false);
        n.setCreatedAt(LocalDateTime.now());
        return n;
    }

    @Test
    void getUserNotifications_returnsAllNotifications() throws Exception {
        // Given
        List<Notification> notifications = Arrays.asList(
                createSampleNotification(1L),
                createSampleNotification(2L));
        when(notificationService.getUserNotifications(testUserId)).thenReturn(notifications);

        // When/Then
        mockMvc.perform(get("/notifications/user/{userId}", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].type").value("TEST_TYPE"));

        verify(notificationService).getUserNotifications(testUserId);
    }

    @Test
    void getUserNotifications_whenNoNotifications_returnsEmptyList() throws Exception {
        // Given
        when(notificationService.getUserNotifications(testUserId))
                .thenReturn(Collections.emptyList());

        // When/Then
        mockMvc.perform(get("/notifications/user/{userId}", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(notificationService).getUserNotifications(testUserId);
    }

    @Test
    void getUnreadNotifications_returnsUnreadOnly() throws Exception {
        // Given
        Notification unread = createSampleNotification(1L);
        when(notificationService.getUnreadNotifications(testUserId))
                .thenReturn(Collections.singletonList(unread));

        // When/Then
        mockMvc.perform(get("/notifications/user/{userId}/unread", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].isRead").value(false));

        verify(notificationService).getUnreadNotifications(testUserId);
    }

    @Test
    void getUnreadCount_returnsCorrectCount() throws Exception {
        // Given
        when(notificationService.getUnreadCount(testUserId)).thenReturn(5L);

        // When/Then
        mockMvc.perform(get("/notifications/user/{userId}/unread/count", testUserId))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));

        verify(notificationService).getUnreadCount(testUserId);
    }

    @Test
    void markAsRead_success() throws Exception {
        // Given
        Long notificationId = 1L;
        doNothing().when(notificationService).markAsRead(notificationId);

        // When/Then
        mockMvc.perform(put("/notifications/{notificationId}/read", notificationId))
                .andExpect(status().isOk());

        verify(notificationService).markAsRead(notificationId);
    }

    @Test
    void markAllAsRead_success() throws Exception {
        // Given
        doNothing().when(notificationService).markAllAsRead(testUserId);

        // When/Then
        mockMvc.perform(put("/notifications/user/{userId}/read-all", testUserId))
                .andExpect(status().isOk());

        verify(notificationService).markAllAsRead(testUserId);
    }

    @Test
    void clearAllNotifications_success() throws Exception {
        // Given
        doNothing().when(notificationService).clearAllNotifications(testUserId);

        // When/Then
        mockMvc.perform(delete("/notifications/user/{userId}", testUserId))
                .andExpect(status().isOk());

        verify(notificationService).clearAllNotifications(testUserId);
    }

}