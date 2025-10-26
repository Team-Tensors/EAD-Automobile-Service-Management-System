package com.ead.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "appointment")
@Data
@NoArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Customer who booked
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Vehicle being serviced
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    // Type: SERVICE or MODIFICATION
    @Enumerated(EnumType.STRING)
    @Column(name = "appointment_type", nullable = false)
    private AppointmentType appointmentType;

    // One of these will be used
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id")
    private ServiceType serviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modification_type_id")
    private ModificationType modificationType;

    // Appointment date & time
    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;

    // EMPLOYEE SETS: When work actually starts
    @Column(name = "start_time")
    private LocalDateTime startTime;

    // EMPLOYEE SETS: When work ends
    @Column(name = "end_time")
    private LocalDateTime endTime;

    // Status
    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED

    // Optional notes
    @Column
    private String description;

    // EMPLOYEES assigned to this job (Admin or self-assign)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "appointment_employees",
            joinColumns = @JoinColumn(name = "appointment_id"),
            inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    private Set<User> assignedEmployees = new HashSet<>();
}