package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueTrendDTO {
    private LocalDate period;
    private String periodLabel;
    private Double revenue;
    private Long appointmentCount;
    private Double serviceRevenue;
    private Double modificationRevenue;
    private Long serviceCount;
    private Long modificationCount;
}

