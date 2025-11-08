package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerInsightsResponseDTO {
    private Long totalCustomers;
    private Long repeatCustomers;
    private Long newCustomers;
    private Double repeatCustomerRate;
    private Double averageAppointmentsPerCustomer;
    private Double averageSpendPerCustomer;
    private Long totalAppointments;
    private List<CustomerInsightDTO> customerInsights;
    private List<CustomerInsightDTO> topCustomers;
}

