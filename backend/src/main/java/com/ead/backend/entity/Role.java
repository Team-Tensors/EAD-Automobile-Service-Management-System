package com.ead.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;  // e.g., "CUSTOMER", "EMPLOYEE", "ADMIN"

    public Role(String name) {
        this.name = name;
    }

    // Explicit getters and setters to ensure compilation works
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    enum RoleName {
        CUSTOMER,
        EMPLOYEE,
        ADMIN
    }
}
