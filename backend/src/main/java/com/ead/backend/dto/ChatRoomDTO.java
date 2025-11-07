package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomDTO {
    private UUID chatRoomId;
    private UUID appointmentId;
    private String customerName;
    private String employeeName;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private Integer unreadCount;
    private String vehicleInfo;
    private String serviceType;
}

