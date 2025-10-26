package com.ead.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TimeLogRequestDto {
    private Long employeeId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String notes;
}
