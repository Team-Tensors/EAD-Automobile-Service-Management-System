package com.ead.backend.dto;

import com.ead.backend.enums.AppointmentType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AppointmentSummaryDTO {
    private UUID id;
    private String vehicle;
    private String service;
    private AppointmentType type;
    private LocalDateTime date;
    private String status;
    private boolean canStart;
}