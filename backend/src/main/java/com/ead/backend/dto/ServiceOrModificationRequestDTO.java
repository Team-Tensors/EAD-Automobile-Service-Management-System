package com.ead.backend.dto;

import com.ead.backend.enums.AppointmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOrModificationRequestDTO {

    @NotNull(message = "Type is required")
    private AppointmentType type;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @Positive(message = "Estimated cost must be positive")
    private Double estimatedCost;

    @Positive(message = "Estimated time must be positive")
    private Integer estimatedTimeMinutes;
}

