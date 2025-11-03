package com.ead.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class ShiftScheduleRequestDTO {
    @NotNull(message = "Employee id required")
    private UUID employeeId;

    @NotNull(message = "Appointment id required")
    private UUID appointmentId;
}
