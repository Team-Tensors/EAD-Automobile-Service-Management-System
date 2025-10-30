package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {
    private Long id;
    private Long userId;
    private String userFullName;
    private String address;
    private String phoneNumber;
    private String email;
    private Long vehicleId;
    private String brand;
    private String model;
    private String year;
    private String color;
    private LocalDateTime lastServiceDate;
    private String licensePlate;
    private String appointmentType;
    private Long serviceTypeId;
    private Long modificationTypeId;
    private String serviceName;
    private String serviceDescription;
    private Double estimatedCost;
    private Integer estimatedTimeMinutes;
    private LocalDateTime appointmentDate;
    private String status;
    private String description;
    private Set<Long> assignedEmployeeIds;
}
