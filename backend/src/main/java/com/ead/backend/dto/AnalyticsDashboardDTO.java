package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDashboardDTO {
    private Double totalRevenue;
    private Long totalAppointments;
    private Long completedAppointments;
    private Long pendingAppointments;
    private Long inProgressAppointments;
    private Long cancelledAppointments;
    private Long totalCustomers;
    private Long totalEmployees;
    private Double completionRate;
    private Double averageServiceCost;
    private Double repeatCustomerRate;
    private List<ServiceTypeDistributionDTO> popularServices;
    private List<EmployeePerformanceDTO> topEmployees;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
}

