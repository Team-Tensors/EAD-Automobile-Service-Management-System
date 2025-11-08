package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerInsightDTO {
    private UUID customerId;
    private String customerName;
    private String email;
    private String phoneNumber;
    private Long totalAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;
    private Double totalSpent;
    private LocalDateTime firstAppointmentDate;
    private LocalDateTime lastAppointmentDate;
    private Boolean isRepeatCustomer;
    private Integer vehicleCount;
    private Integer daysSinceLastAppointment;
}

