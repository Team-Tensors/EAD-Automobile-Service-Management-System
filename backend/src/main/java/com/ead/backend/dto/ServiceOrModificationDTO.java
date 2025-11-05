package com.ead.backend.dto;

import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOrModificationDTO {
    private UUID id;
    private String name;
    private String description;
    private Double estimatedCost;
    private Integer estimatedTimeMinutes;
}