package com.ead.backend.service;

import com.ead.backend.dto.NotificationEventDTO;
import com.ead.backend.entity.Notification;
import com.ead.backend.repository.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(userId, emitter);

        log.info("User {} subscribed to notifications", userId);

        emitter.onCompletion(() -> {
            emitters.remove(userId);
            log.info("User {} unsubscribed (completion)", userId);
        });

        emitter.onTimeout(() -> {
            emitters.remove(userId);
            log.info("User {} unsubscribed (timeout)", userId);
        });

        emitter.onError(e -> {
            emitters.remove(userId);
            log.error("Error for user {}: {}", userId, e.getMessage());
        });

        return emitter;
    }

    @Transactional
    public void sendNotification(Long userId, String type, String message, Object data) {
        try {
            // 1. Save to database
            String dataJson = objectMapper.writeValueAsString(data);
            Notification notification = new Notification(userId, type, message, dataJson);
            notificationRepository.save(notification);

            // 2. Send via SSE (real-time)
            NotificationEventDTO event = new NotificationEventDTO(type, message, data);
            sendSseEvent(userId, event);

            log.info("Notification sent to user {}: {}", userId, type);
        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage());
        }
    }

    private void sendSseEvent(Long userId, NotificationEventDTO event) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(event));
            } catch (IOException e) {
                emitters.remove(userId);
                log.error("Failed to send SSE to user {}", userId);
            }
        }
    }

    public void sendToAll(String type, String message, Object data) {
        NotificationEventDTO event = new NotificationEventDTO(type, message, data);
        emitters.forEach((userId, emitter) -> {
            try {
                // Save to database for each user
                String dataJson = objectMapper.writeValueAsString(data);
                Notification notification = new Notification(userId, type, message, dataJson);
                notificationRepository.save(notification);

                // Send SSE
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(event));
            } catch (Exception e) {
                emitters.remove(userId);
            }
        });
    }

    // Get all notifications for a user
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Get unread notifications
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    // Mark as read
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }

    // Mark all as read
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    // Get unread count
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // Clear all notifications
    @Transactional
    public void clearAllNotifications(Long userId) {
        notificationRepository.deleteByUserId(userId);
    }
}