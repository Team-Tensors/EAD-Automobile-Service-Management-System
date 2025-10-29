package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor

public class NotificationEventDTO {
    private String id;
    private String type;
    private String message;
    private String timestamp;
    private Object data;

    public NotificationEventDTO(String type, String message, Object data) {
        this.id = UUID.randomUUID().toString();
        this.type = type;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now().toString();
    }
}
