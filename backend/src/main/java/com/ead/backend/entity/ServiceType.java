package com.ead.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;                 // e.g. "Oil Change"

    @Column
    private String description;

    @Column
    private Double estimatedCost;

    @Column
    private Integer estimatedTimeMinutes;
}