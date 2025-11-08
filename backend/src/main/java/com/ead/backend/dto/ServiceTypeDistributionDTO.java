package com.ead.backend.dto;

import com.ead.backend.enums.AppointmentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTypeDistributionDTO {
    private UUID serviceId;
    private String serviceName;
    private AppointmentType serviceType;
    private Long count;
    private Double percentage;
    private Double totalRevenue;
    private Double averageCost;
}

