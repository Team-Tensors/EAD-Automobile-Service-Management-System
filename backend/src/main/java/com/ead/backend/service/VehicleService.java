package com.ead.backend.service;

import com.ead.backend.entity.User;
import com.ead.backend.entity.Vehicle;
import com.ead.backend.repository.UserRepository;
import com.ead.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private static final Logger logger = LoggerFactory.getLogger(VehicleService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // === CREATE ===
    @Transactional
    public Vehicle addVehicle(Vehicle vehicle) {
        User user = getCurrentUser();
        vehicle.setUser(user);
        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        // Send notification
        notificationService.sendNotification(
                user.getId(),
                "VEHICLE_ADDED",
                String.format("Your %s %s has been added successfully!",
                        savedVehicle.getBrand(), savedVehicle.getModel()),
                Map.of(
                        "vehicleId", savedVehicle.getId().toString(),
                        "brand", savedVehicle.getBrand(),
                        "model", savedVehicle.getModel(),
                        "licensePlate", savedVehicle.getLicensePlate(),
                        "year", savedVehicle.getYear() != null ? savedVehicle.getYear().toString() : "N/A"
                )
        );

        // Send confirmation email asynchronously
        try {
            emailService.sendVehicleAddedEmail(user.getEmail(), user.getFullName(), formatVehicleInfo(savedVehicle),
                    savedVehicle.getLicensePlate(), savedVehicle.getBrand(), savedVehicle.getModel(),
                    savedVehicle.getYear() != null ? savedVehicle.getYear().toString() : "N/A");
            logger.info("Vehicle added email sent to user: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send vehicle added email to: {}", user.getEmail(), e);
        }

        return savedVehicle;
    }

    // === READ: All ===
    public List<Vehicle> getUserVehicles() {
        User user = getCurrentUser();
        return vehicleRepository.findByUserId(user.getId());
    }

    // === READ: One (with ownership) ===
    public Vehicle getVehicleByIdAndUser(UUID id) {
        User user = getCurrentUser();
        return vehicleRepository.findById(id).filter(v -> v.getUser().getId().equals(user.getId())).orElse(null);
    }

    // === UPDATE ===
    @Transactional
    public Vehicle updateVehicle(Vehicle vehicle) {
        User user = getCurrentUser();
        Vehicle existingVehicle = getVehicleByIdAndUser(vehicle.getId());

        if (existingVehicle == null) {
            throw new RuntimeException("Vehicle not found or access denied");
        }

        boolean criticalChange = hasCriticalChanges(existingVehicle, vehicle);
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);

        // Send notification for critical changes
        if (criticalChange) {
            String changesSummary = getChangesSummary(existingVehicle, vehicle);
            notificationService.sendNotification(
                    user.getId(),
                    "VEHICLE_UPDATED",
                    String.format("Vehicle %s has been updated", vehicle.getLicensePlate()),
                    Map.of(
                            "vehicleId", updatedVehicle.getId().toString(),
                            "licensePlate", vehicle.getLicensePlate(),
                            "changes", changesSummary
                    )
            );

            // Send email only for critical changes
            try {
                emailService.sendVehicleUpdatedEmail(user.getEmail(), user.getFullName(),
                        formatVehicleInfo(updatedVehicle), vehicle.getLicensePlate(), changesSummary);
                logger.info("Vehicle updated email sent to user: {}", user.getEmail());
            } catch (Exception e) {
                logger.error("Failed to send vehicle updated email to: {}", user.getEmail(), e);
            }
        }

        return updatedVehicle;
    }

    // === DELETE ===
    @Transactional
    public boolean deleteVehicleByIdAndUser(UUID id) {
        User user = getCurrentUser();
        Vehicle vehicle = getVehicleByIdAndUser(id);

        if (vehicle != null) {
            String vehicleInfo = formatVehicleInfo(vehicle);
            String regNumber = vehicle.getLicensePlate();

            vehicleRepository.delete(vehicle);

            // Send notification
            notificationService.sendNotification(
                    user.getId(),
                    "VEHICLE_DELETED",
                    String.format("Vehicle %s has been removed from your account", regNumber),
                    Map.of(
                            "vehicleInfo", vehicleInfo,
                            "licensePlate", regNumber,
                            "deletedAt", LocalDateTime.now().format(DATE_FORMATTER)
                    )
            );

            // Send deletion confirmation email
            try {
                emailService.sendVehicleDeletedEmail(user.getEmail(), user.getFullName(), vehicleInfo,
                        regNumber, LocalDateTime.now().format(DATE_FORMATTER));
                logger.info("Vehicle deleted email sent to user: {}", user.getEmail());
            } catch (Exception e) {
                logger.error("Failed to send vehicle deleted email to: {}", user.getEmail(), e);
            }

            return true;
        }
        return false;
    }

    // === HELPER METHODS ===

    private String formatVehicleInfo(Vehicle vehicle) {
        StringBuilder info = new StringBuilder();
        info.append(vehicle.getYear() != null ? vehicle.getYear() + " " : "");
        info.append(vehicle.getBrand()).append(" ").append(vehicle.getModel());
        return info.toString();
    }

    private boolean hasCriticalChanges(Vehicle old, Vehicle updated) {
        if (!old.getLicensePlate().equals(updated.getLicensePlate())) {
            return true;
        }
        if (!old.getBrand().equals(updated.getBrand()) || !old.getModel().equals(updated.getModel())) {
            return true;
        }
        return false;
    }

    private String getChangesSummary(Vehicle old, Vehicle updated) {
        StringBuilder changes = new StringBuilder();

        if (!old.getLicensePlate().equals(updated.getLicensePlate())) {
            changes.append("Registration Number: ").append(old.getLicensePlate()).append(" → ").append(updated.getLicensePlate()).append("\n");
        }

        if (!old.getBrand().equals(updated.getBrand())) {
            changes.append("Make: ").append(old.getBrand()).append(" → ").append(updated.getBrand()).append("\n");
        }

        if (!old.getModel().equals(updated.getModel())) {
            changes.append("Model: ").append(old.getModel()).append(" → ").append(updated.getModel()).append("\n");
        }

        if (old.getYear() != null && updated.getYear() != null && !old.getYear().equals(updated.getYear())) {
            changes.append("Year: ").append(old.getYear()).append(" → ").append(updated.getYear());
        }

        return changes.toString().trim();
    }
}