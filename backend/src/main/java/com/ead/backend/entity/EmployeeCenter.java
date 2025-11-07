package com.ead.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "employee_center", indexes = {
        @Index(name = "idx_employee_center_employee_id", columnList = "employee_id"),
        @Index(name = "idx_employee_center_service_center_id", columnList = "service_center_id")
})
@Data
@NoArgsConstructor
public class EmployeeCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @ManyToOne
    @JoinColumn(name = "service_center_id")
    private ServiceCenter serviceCenter;
}
