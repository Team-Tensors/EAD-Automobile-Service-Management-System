// src/main/java/com/ead/backend/service/VehicleService.java
package com.ead.backend.service;

import com.ead.backend.entity.User;
import com.ead.backend.entity.Vehicle;
import com.ead.backend.repository.UserRepository;
import com.ead.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // === CREATE ===
    public Vehicle addVehicle(Vehicle vehicle) {
        vehicle.setUser(getCurrentUser());
        return vehicleRepository.save(vehicle);
    }

    // === READ: All ===
    public List<Vehicle> getUserVehicles() {
        User user = getCurrentUser();
        return vehicleRepository.findByUserId(user.getId());
    }

    // === READ: One (with ownership) ===
    public Vehicle getVehicleByIdAndUser(Long id) {
        User user = getCurrentUser();
        return vehicleRepository.findById(id)
                .filter(v -> v.getUser().getId().equals(user.getId()))
                .orElse(null);
    }

    // === UPDATE ===
    @Transactional
    public Vehicle updateVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    // === DELETE ===
    @Transactional
    public boolean deleteVehicleByIdAndUser(Long id) {
        Vehicle vehicle = getVehicleByIdAndUser(id);
        if (vehicle != null) {
            vehicleRepository.delete(vehicle);
            return true;
        }
        return false;
    }
}