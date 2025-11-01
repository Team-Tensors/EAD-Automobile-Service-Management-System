package com.ead.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOrModificationDTO {
    private Long id;
    private String name;
    private String description;
    private Double estimatedCost;
    private Integer estimatedTimeMinutes;
}