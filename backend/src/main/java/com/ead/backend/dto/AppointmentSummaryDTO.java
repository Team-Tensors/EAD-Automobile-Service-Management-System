package com.ead.backend.dto;

import com.ead.backend.entity.AppointmentType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentSummaryDTO {
    private Long id;
    private String vehicle;
    private String service;
    private AppointmentType type;
    private LocalDateTime date;
    private String status;
    private boolean canStart;
}