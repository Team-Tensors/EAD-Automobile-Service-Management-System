package com.ead.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import com.ead.backend.enums.AppointmentType;

@Entity
@Table(name = "appointment")
@Data
@NoArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "UUID")
    private UUID id;

    // Customer who booked
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Vehicle being serviced
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    // Type: SERVICE or MODIFICATION (for UI/logic)
    @Enumerated(EnumType.STRING)
    @Column(name = "appointment_type", nullable = false)
    private AppointmentType appointmentType;

    // Unified reference: one column for both service & modification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_or_modification_id", nullable = false)
    private ServiceOrModification serviceOrModification;

    // Service center where the appointment is scheduled
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_center_id", nullable = false)
    private ServiceCenter serviceCenter;

    // Appointment scheduled time
    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;

    // Actual start time (set by employee)
    @Column(name = "start_time")
    private LocalDateTime startTime;

    // Actual end time (set by employee)
    @Column(name = "end_time")
    private LocalDateTime endTime;

    // Status
    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED

    // Optional notes
    @Column
    private String description;

    // Employees assigned to this job
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "appointment_employees",
            joinColumns = @JoinColumn(name = "appointment_id"),
            inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    private Set<User> assignedEmployees = new HashSet<>();

    // ENSURE appointmentType matches serviceOrModification.type
    @PrePersist
    @PreUpdate
    private void validateTypeConsistency() {
        if (this.serviceOrModification != null && this.appointmentType != null) {
            if (!this.serviceOrModification.getType().equals(this.appointmentType)) {
                throw new IllegalStateException(
                        "Appointment type (" + appointmentType +
                                ") must match ServiceOrModification type (" + serviceOrModification.getType() + ")"
                );
            }
        }
    }
}