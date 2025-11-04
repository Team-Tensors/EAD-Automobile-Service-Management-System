package com.ead.backend.dto;

import com.ead.backend.entity.*;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
public class ShiftScheduleAppointmentsDTO {

    private String appointmentId;
    private String userName;
    private String vehicle;
    private String appointmentType;
    private String serviceOrModification;
    private String serviceCenter;
    private LocalDateTime appointmentDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status = "PENDING"; // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    private String description;
}
