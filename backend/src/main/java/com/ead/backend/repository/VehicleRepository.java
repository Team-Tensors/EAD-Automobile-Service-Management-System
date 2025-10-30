// src/main/java/com/ead/backend/repository/VehicleRepository.java
package com.ead.backend.repository;

import com.ead.backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByUserId(Long userId);
}