package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeePerformanceDTO {
    private UUID employeeId;
    private String employeeName;
    private String email;
    private Long totalAppointments;
    private Long completedAppointments;
    private Long inProgressAppointments;
    private Long pendingAppointments;
    private Double completionRate;
    private Double totalHoursLogged;
    private Double averageHoursPerAppointment;
    private Integer rank;
}

