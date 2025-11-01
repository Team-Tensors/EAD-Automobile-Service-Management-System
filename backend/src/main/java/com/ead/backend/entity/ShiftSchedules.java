package com.ead.backend.entity;

import com.ead.backend.enums.ShiftAssignmentType;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "shift_schedules", indexes = {
        @Index(name = "idx_employee_date", columnList = "employee_id, shift_date"),
        @Index(name = "idx_shift_date", columnList = "shift_date, start_time")
})
public class ShiftSchedules {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "shift_id")
    private UUID shiftId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @OneToOne(fetch = FetchType.LAZY)
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
