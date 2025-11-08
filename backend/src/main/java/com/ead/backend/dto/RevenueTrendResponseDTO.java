package com.ead.backend.dto;

import com.ead.backend.enums.PeriodType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueTrendResponseDTO {
    private Double totalRevenue;
    private Double averageRevenue;
    private Double maxRevenue;
    private Double minRevenue;
    private Long totalAppointments;
    private PeriodType periodType;
    private List<RevenueTrendDTO> trends;
}

