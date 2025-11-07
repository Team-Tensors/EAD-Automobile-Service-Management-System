package com.ead.backend.dto;

import com.ead.backend.enums.AppointmentType;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOrModificationDTO {
    private UUID id;
    private AppointmentType type;
    private String name;
    private String description;
    private Double estimatedCost;
    private Integer estimatedTimeMinutes;
}