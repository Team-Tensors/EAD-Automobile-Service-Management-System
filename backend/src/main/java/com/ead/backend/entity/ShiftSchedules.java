package com.ead.backend.entity;

import com.ead.backend.enums.ShiftAssignmentType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "shift_schedules", indexes = {
        @Index(name = "idx_employee_start_time", columnList = "employee_id, start_time"),
        @Index(name = "idx_start_time", columnList = "start_time")
})
public class ShiftSchedules {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "shift_id")
    private UUID shiftId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "assigned_by", nullable = false)
    private ShiftAssignmentType assignedBy;
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

}
