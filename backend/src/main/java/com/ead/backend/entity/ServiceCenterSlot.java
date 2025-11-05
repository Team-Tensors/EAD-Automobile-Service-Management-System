package com.ead.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "service_center_slot")
@Data
@NoArgsConstructor
public class ServiceCenterSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_center_id", nullable = false)
    private ServiceCenter serviceCenter;

    @Column(name = "slot_number", nullable = false)
    private Integer slotNumber; // 1 or 2

    @Column(name = "is_booked", nullable = false)
    private Boolean isBooked = false;

    @Column(name = "appointment_id")
    private UUID appointmentId; // Null if not booked
}