// src/main/java/com/ead/backend/repository/VehicleRepository.java
package com.ead.backend.repository;

import com.ead.backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    List<Vehicle> findByUserId(UUID userId);
}