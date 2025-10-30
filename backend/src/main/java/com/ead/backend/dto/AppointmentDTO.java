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
    private Long vehicleId;
    private String appointmentType;
    private Long serviceOrModificationId;
    private LocalDateTime appointmentDate;
    private String status;
    private String description;
    private Set<Long> assignedEmployeeIds;
}
