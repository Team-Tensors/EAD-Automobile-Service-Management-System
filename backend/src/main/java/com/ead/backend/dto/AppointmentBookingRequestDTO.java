package com.ead.backend.dto;

import com.ead.backend.enums.AppointmentType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AppointmentBookingRequestDTO {

    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;

    @NotNull(message = "Service/Modification ID is required")
    private UUID serviceOrModificationId;

    @NotNull(message = "Service center ID is required")
    private UUID serviceCenterId;

    @NotNull(message = "Appointment type is required")
    private AppointmentType appointmentType;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date cannot be in the past")
    private LocalDateTime appointmentDate;

    private String description;
}