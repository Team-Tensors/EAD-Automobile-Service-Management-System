package com.ead.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class SelfShiftScheduleRequestDTO {

    @NotNull(message = "Appointment id required")
    private UUID appointmentId;
}
