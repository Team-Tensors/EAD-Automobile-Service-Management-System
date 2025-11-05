package com.ead.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.ead.backend.enums.AppointmentType;

import java.util.UUID;

@Entity
@Table(
        name = "service_or_modification",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"unique_name"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOrModification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "UUID")
    private UUID id;

    /** SERVICE or MODIFICATION */
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 12)
    private AppointmentType type;

    /** Display name (e.g., "Oil Change") */
    @Column(name = "name", nullable = false)
    private String name;

    /** Must be unique across system: type + "_" + name */
    @Column(name = "unique_name", nullable = false, unique = true)
    private String uniqueName;

    @Column
    private String description;

    @Column
    private Double estimatedCost;

    @Column
    private Integer estimatedTimeMinutes;

    /** Auto generate uniqueName before DB insert */
    @PrePersist
    @PreUpdate
    private void generateUniqueName() {
        if (type != null && name != null) {
            this.uniqueName = type.toString() + "_" + name.replace(" ", "_");
        }
    }
}
