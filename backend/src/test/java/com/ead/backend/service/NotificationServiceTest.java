package com.ead.backend.service;

import com.ead.backend.entity.Notification;
import com.ead.backend.repository.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private NotificationService service;

    @BeforeEach
    void setUp() {
        // nothing for now
    }

    @AfterEach
    void tearDown() {
        // ensure emitters map is cleared between tests
        try {
            Field f = NotificationService.class.getDeclaredField("emitters");
            f.setAccessible(true);
            Map<UUID, SseEmitter> emitters = (Map<UUID, SseEmitter>) f.get(service);
            emitters.clear();
        } catch (Exception ignored) {
        }
    }

    // Helper to inject a mock emitter into the private emitters map
    @SuppressWarnings("unchecked")
    private void putEmitter(UUID userId, SseEmitter emitter) throws Exception {
        Field f = NotificationService.class.getDeclaredField("emitters");
        f.setAccessible(true);
        Map<UUID, SseEmitter> emitters = (Map<UUID, SseEmitter>) f.get(service);
        // If map is null (shouldn't be), create one
        if (emitters == null) {
            emitters = new ConcurrentHashMap<>();
            f.set(service, emitters);
        }
        emitters.put(userId, emitter);
    }

    // Helper to read emitters map size
    @SuppressWarnings("unchecked")
    private boolean emittersContains(UUID userId) throws Exception {
        Field f = NotificationService.class.getDeclaredField("emitters");
        f.setAccessible(true);
        Map<UUID, SseEmitter> emitters = (Map<UUID, SseEmitter>) f.get(service);
        return emitters != null && emitters.containsKey(userId);
    }

    @Test
    void subscribe_returnsEmitterStored() {
        UUID userId = UUID.randomUUID();
        SseEmitter emitter = service.subscribe(userId);

        assertThat(emitter).isNotNull();
        // verify stored via reflection
        try {
            assertThat(emittersContains(userId)).isTrue();
        } catch (Exception e) {
            // if reflection fails, still assert emitter not null
            assertThat(emitter).isNotNull();
        }
    }

    @Test
    void sendNotification_savesAndSendsSse() throws Exception {
        UUID userId = UUID.randomUUID();
        String type = "INFO";
        String message = "Hi";
        Map<String, Object> data = Collections.singletonMap("k", "v");

        // mock object mapper
        when(objectMapper.writeValueAsString(eq(data))).thenReturn("{\"k\":\"v\"}");

        // capture saved notification
        ArgumentCaptor<Notification> savedCaptor = ArgumentCaptor.forClass(Notification.class);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        // mock emitter and inject
        SseEmitter mockEmitter = mock(SseEmitter.class);
        doNothing().when(mockEmitter).send(any(SseEmitter.SseEventBuilder.class));
        putEmitter(userId, mockEmitter);

        // Act
        service.sendNotification(userId, type, message, data);

        // Assert
        verify(objectMapper).writeValueAsString(eq(data));
        verify(notificationRepository).save(savedCaptor.capture());
        Notification saved = savedCaptor.getValue();
        assertThat(saved.getUserId()).isEqualTo(userId);
        assertThat(saved.getType()).isEqualTo(type);
        assertThat(saved.getMessage()).isEqualTo(message);
        assertThat(saved.getData()).isEqualTo("{\"k\":\"v\"}");

        // verify SSE was attempted
        verify(mockEmitter, times(1)).send(any(SseEmitter.SseEventBuilder.class));
    }

    @Test
    void sendNotification_whenObjectMapperThrows_doesNotSaveOrSend() throws Exception {
        UUID userId = UUID.randomUUID();
        String type = "WARN";
        String message = "oops";
        Object data = Collections.emptyMap();

        when(objectMapper.writeValueAsString(any())).thenThrow(new RuntimeException("json-fail"));

        SseEmitter mockEmitter = mock(SseEmitter.class);
        putEmitter(userId, mockEmitter);

        // Should not throw
        assertDoesNotThrow(() -> service.sendNotification(userId, type, message, data));

        verify(objectMapper).writeValueAsString(any());
        verifyNoInteractions(notificationRepository);
        verifyNoInteractions(mockEmitter);
    }

    @Test
    void sendNotification_whenEmitterFails_removesEmitter() throws Exception {
        UUID userId = UUID.randomUUID();
        String type = "ALERT";
        String message = "boom";
        Object data = Collections.singletonMap("x", 1);

        when(objectMapper.writeValueAsString(eq(data))).thenReturn("{\"x\":1}");
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        SseEmitter badEmitter = mock(SseEmitter.class);
        doThrow(new IOException("send-failed")).when(badEmitter).send(any(SseEmitter.SseEventBuilder.class));
        putEmitter(userId, badEmitter);

        // Act: should not throw because sendNotification catches exceptions
        assertDoesNotThrow(() -> service.sendNotification(userId, type, message, data));

        // repository still saved
        verify(notificationRepository).save(any(Notification.class));

        // emitter should have been removed from internal map
        assertThat(emittersContains(userId)).isFalse();
    }

    @Test
    void sendToAll_savesForEachAndSends() throws Exception {
        UUID u1 = UUID.randomUUID();
        UUID u2 = UUID.randomUUID();
        Object payload = Collections.singletonMap("p", true);

        when(objectMapper.writeValueAsString(eq(payload))).thenReturn("{\"p\":true}");

        SseEmitter e1 = mock(SseEmitter.class);
        SseEmitter e2 = mock(SseEmitter.class);
        doNothing().when(e1).send(any(SseEmitter.SseEventBuilder.class));
        doNothing().when(e2).send(any(SseEmitter.SseEventBuilder.class));

        putEmitter(u1, e1);
        putEmitter(u2, e2);

        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        service.sendToAll("BROAD", "hello", payload);

        // Assert: each user should have a notification saved and emitter.send called
        verify(notificationRepository, times(2)).save(any(Notification.class));
        verify(e1).send(any(SseEmitter.SseEventBuilder.class));
        verify(e2).send(any(SseEmitter.SseEventBuilder.class));
    }

    @Test
    void getUserNotifications_delegatesToRepository() {
        UUID userId = UUID.randomUUID();
        Notification n = new Notification(userId, "T", "M", "{}");
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(eq(userId))).thenReturn(List.of(n));

        List<Notification> results = service.getUserNotifications(userId);

        assertThat(results).hasSize(1).containsExactly(n);
        verify(notificationRepository).findByUserIdOrderByCreatedAtDesc(eq(userId));
    }

    @Test
    void getUnreadNotifications_delegatesToRepository() {
        UUID userId = UUID.randomUUID();
        Notification n = new Notification(userId, "T", "M", "{}");
        when(notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(eq(userId))).thenReturn(List.of(n));

        List<Notification> results = service.getUnreadNotifications(userId);

        assertThat(results).hasSize(1).containsExactly(n);
        verify(notificationRepository).findByUserIdAndIsReadFalseOrderByCreatedAtDesc(eq(userId));
    }

    @Test
    void markAsRead_setsFlagAndSaves() {
        Long id = 42L;
        Notification n = new Notification();
        n.setId(id);
        n.setIsRead(false);

        when(notificationRepository.findById(eq(id))).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        service.markAsRead(id);

        ArgumentCaptor<Notification> cap = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(cap.capture());
        assertThat(cap.getValue().getIsRead()).isTrue();
    }

    @Test
    @SuppressWarnings("unchecked")
    void markAllAsRead_marksAllAndSavesAll() {
        UUID userId = UUID.randomUUID();
        Notification a = new Notification();
        a.setId(1L);
        a.setIsRead(false);
        Notification b = new Notification();
        b.setId(2L);
        b.setIsRead(false);

        when(notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(eq(userId)))
                .thenReturn(List.of(a, b));
        when(notificationRepository.saveAll(any())).thenAnswer(i -> i.getArgument(0));

        service.markAllAsRead(userId);

        @SuppressWarnings({ "rawtypes", "unchecked" })
        ArgumentCaptor<List> cap = ArgumentCaptor.forClass((Class) List.class);
        verify(notificationRepository).saveAll(cap.capture());
        List<Notification> savedList = (List<Notification>) cap.getValue();
        assertThat(savedList).allMatch(Notification::getIsRead);
    }

    @Test
    void getUnreadCount_delegatesToRepository() {
        UUID userId = UUID.randomUUID();
        when(notificationRepository.countByUserIdAndIsReadFalse(eq(userId))).thenReturn(7L);

        Long count = service.getUnreadCount(userId);
        assertThat(count).isEqualTo(7L);
        verify(notificationRepository).countByUserIdAndIsReadFalse(eq(userId));
    }

    @Test
    void clearAllNotifications_callsRepositoryDelete() {
        UUID userId = UUID.randomUUID();

        doNothing().when(notificationRepository).deleteByUserId(eq(userId));

        service.clearAllNotifications(userId);

        verify(notificationRepository).deleteByUserId(eq(userId));
    }
}
