package com.ead.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "service_centers")
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

    @Column(name = "operating_hours", columnDefinition = "TEXT")
    private String operatingHours;

    @Column(nullable = false)
    private Boolean isActive = true;

    // One-sided Many-to-Many relationship
    // Only ServiceCenter knows about this relationship
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "service_center_services", // Join table name
        joinColumns = @JoinColumn(name = "service_center_id"),
        inverseJoinColumns = @JoinColumn(name = "service_type_id")
    )
    @JsonIgnore // Prevent serialization issues
    private Set<ServiceType> serviceTypes = new HashSet<>();

    // Helper methods to manage the relationship
    public void addServiceType(ServiceType serviceType) {
        this.serviceTypes.add(serviceType);
    }

    public void removeServiceType(ServiceType serviceType) {
        this.serviceTypes.remove(serviceType);
    }

    public boolean hasServiceType(ServiceType serviceType) {
        return this.serviceTypes.contains(serviceType);
    }

    // ... rest of your existing methods ...
}