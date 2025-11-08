package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeePerformanceResponseDTO {
    private Integer totalEmployees;
    private Long totalAppointments;
    private Double averageCompletionRate;
    private Double totalHoursLogged;
    private List<EmployeePerformanceDTO> employees;
    private List<EmployeePerformanceDTO> topPerformers;
}

