package com.ead.backend.dto;

import com.ead.backend.enums.AppointmentType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AppointmentBookingResponseDTO {
    private UUID id;
    private UUID vehicleId;
    private String vehicleInfo;
    private String serviceName;
    private AppointmentType appointmentType;
    private LocalDateTime appointmentDate;
    private String status;
    private String message;
}