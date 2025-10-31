package com.ead.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShiftScheduleRequestDTO {
    @NotNull(message = "Employee id required")
    private Long employeeId;

    @NotNull(message = "Appointment id required")
    private Long appointmentId;
}
