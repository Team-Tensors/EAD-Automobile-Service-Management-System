package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {
    private UUID id;
    private UUID userId;
    private String userFullName;
    private String address;
    private String phoneNumber;
    private String email;
    private UUID vehicleId;
    private String brand;
    private String model;
    private Integer year;
    private String color;
    private LocalDateTime lastServiceDate;
    private String licensePlate;
    private String appointmentType;
    private Long serviceOrModificationId;
    private String serviceOrModificationName;
    private String serviceOrModificationDescription;
    private Double estimatedCost;
    private Integer estimatedTimeMinutes;
    private LocalDateTime appointmentDate;
    private String status;
    private String description;
    private Set<UUID> assignedEmployeeIds;
}
