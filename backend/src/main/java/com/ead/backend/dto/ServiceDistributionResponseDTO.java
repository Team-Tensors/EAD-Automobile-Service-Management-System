package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDistributionResponseDTO {
    private Long totalAppointments;
    private Long serviceCount;
    private Long modificationCount;
    private Double servicePercentage;
    private Double modificationPercentage;
    private List<ServiceTypeDistributionDTO> serviceBreakdown;
}

