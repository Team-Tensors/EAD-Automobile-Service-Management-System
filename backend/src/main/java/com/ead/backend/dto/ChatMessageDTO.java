package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private UUID messageId;
    private UUID chatRoomId;
    private String senderId;
    private String senderName;
    private String message;
    private LocalDateTime sentAt;
    private Boolean isRead;
    private Boolean isSentByMe;
}

