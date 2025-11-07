package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusDTO {
    private String userId;
    private UUID chatRoomId;
    private String userName;
    private String status; // ONLINE, OFFLINE
    private LocalDateTime timestamp;
}

