package com.ead.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TimeLogRequestDto {
    private UUID employeeId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String notes;
}
