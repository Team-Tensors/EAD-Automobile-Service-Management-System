package com.ead.backend.dto;

import com.ead.backend.entity.AppointmentType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentBookingResponseDTO {
    private Long id;
    private Long vehicleId;
    private String vehicleInfo; // e.g., "Toyota Camry 2020"
    private String serviceName;
    private AppointmentType appointmentType;
    private LocalDateTime appointmentDate;
    private String status;
    private String message;
}