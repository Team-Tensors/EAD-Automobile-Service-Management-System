package com.ead.backend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
// import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "service_center")
@Data
@NoArgsConstructor
public class ServiceCenter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    private String phone;
    private String email;

    @Column(columnDefinition = "JSONB")
    private String operatingHours;

    @Column(nullable = false)
    private Boolean isActive = true;

    // Add the inverse relationship
    @OneToMany(mappedBy = "serviceCenter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ServiceType> serviceTypes;

    // ... rest of your fields and methods
}