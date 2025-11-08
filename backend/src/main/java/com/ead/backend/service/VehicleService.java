// src/main/java/com/ead/backend/service/VehicleService.java
package com.ead.backend.service;

import com.ead.backend.dto.VehicleCreateDTO;
import com.ead.backend.dto.VehicleResponseDTO;
import com.ead.backend.entity.User;
import com.ead.backend.entity.Vehicle;
import com.ead.backend.mappers.VehicleMapper;
import com.ead.backend.repository.AppointmentRepository;
import com.ead.backend.repository.UserRepository;
import com.ead.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // CREATE
    @Transactional
    public VehicleResponseDTO addVehicle(VehicleCreateDTO dto) {
        User user = getCurrentUser();
        
        // Check for duplicate license plate
        if (vehicleRepository.findByLicensePlate(dto.getLicensePlate()).isPresent()) {
            throw new RuntimeException("A vehicle with this license plate already exists");
        }
        
        Vehicle vehicle = new Vehicle();

        VehicleMapper.updateEntity(dto, vehicle);  // ← Mapper
        vehicle.setUser(user);

        Vehicle saved = vehicleRepository.save(vehicle);

        sendAddNotifications(saved, user);
        return VehicleMapper.toDTO(saved);
    }

    // READ ALL
    public List<VehicleResponseDTO> getUserVehicles() {
        User user = getCurrentUser();
        List<Vehicle> vehicles = vehicleRepository.findByUserId(user.getId());
        return VehicleMapper.toDTOList(vehicles);
    }

    // READ ONE
    public VehicleResponseDTO getVehicleById(UUID id) {
        User user = getCurrentUser();
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found or access denied"));
        return VehicleMapper.toDTO(vehicle);
    }

    // UPDATE
    @Transactional
    public VehicleResponseDTO updateVehicle(UUID id, VehicleCreateDTO dto) {
        User user = getCurrentUser();
        Vehicle existing = vehicleRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found or access denied"));

        // Check for duplicate license plate (excluding current vehicle)
        vehicleRepository.findByLicensePlate(dto.getLicensePlate())
                .ifPresent(v -> {
                    if (!v.getId().equals(id)) {
                        throw new RuntimeException("A vehicle with this license plate already exists");
                    }
                });

        boolean critical = hasCriticalChanges(existing, dto);
        VehicleMapper.updateEntity(dto, existing);  // ← Mapper

        Vehicle updated = vehicleRepository.save(existing);

        if (critical) {
            sendUpdateNotifications(updated, existing, user);
        }

        return VehicleMapper.toDTO(updated);
    }

    // DELETE
    @Transactional
    public void deleteVehicle(UUID id) {
        User user = getCurrentUser();
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found or access denied"));

        // Check if vehicle has any confirmed or in-progress appointments
        if (appointmentRepository.hasActiveAppointments(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete vehicle with confirmed or in-progress appointments. " +
                    "Please cancel or complete all appointments first."
            );
        }

        vehicleRepository.delete(vehicle);
        sendDeleteNotifications(vehicle, user);
    }

    // === HELPER METHODS ===

    private boolean hasCriticalChanges(Vehicle old, VehicleCreateDTO dto) {
        return !old.getLicensePlate().equals(dto.getLicensePlate()) ||
                !old.getBrand().equals(dto.getBrand()) ||
                !old.getModel().equals(dto.getModel()) ||
                !Objects.equals(old.getYear(), dto.getYear());
    }

    private void sendAddNotifications(Vehicle v, User u) {
        String info = formatVehicleInfo(v);
        notificationService.sendNotification(
                u.getId(),
                "VEHICLE_ADDED",
                String.format("Your %s has been added!", info),
                Map.of(
                        "vehicleId", v.getId().toString(),
                        "licensePlate", v.getLicensePlate(),
                        "brand", v.getBrand(),
                        "model", v.getModel()
                )
        );

        try {
            emailService.sendVehicleAddedEmail(
                    u.getEmail(),
                    u.getFullName(),
                    info,
                    v.getLicensePlate(),
                    v.getBrand(),
                    v.getModel(),
                    v.getYear() != null ? v.getYear().toString() : "N/A"
            );
        } catch (Exception e) {
            // log error
        }
    }

    private void sendUpdateNotifications(Vehicle updated, Vehicle old, User u) {
        String changes = getChangesSummary(old, updated);
        notificationService.sendNotification(
                u.getId(),
                "VEHICLE_UPDATED",
                String.format("Vehicle %s updated", updated.getLicensePlate()),
                Map.of("changes", changes)
        );

        try {
            emailService.sendVehicleUpdatedEmail(
                    u.getEmail(),
                    u.getFullName(),
                    formatVehicleInfo(updated),
                    updated.getLicensePlate(),
                    changes
            );
        } catch (Exception e) {
            // log
        }
    }

    private void sendDeleteNotifications(Vehicle v, User u) {
        String info = formatVehicleInfo(v);
        notificationService.sendNotification(
                u.getId(),
                "VEHICLE_DELETED",
                String.format("Vehicle %s removed", v.getLicensePlate()),
                Map.of("licensePlate", v.getLicensePlate())
        );

        try {
            emailService.sendVehicleDeletedEmail(
                    u.getEmail(),
                    u.getFullName(),
                    info,
                    v.getLicensePlate(),
                    LocalDateTime.now().format(DATE_FORMATTER)
            );
        } catch (Exception e) {
            // log
        }
    }

    private String formatVehicleInfo(Vehicle v) {
        return (v.getYear() != null ? v.getYear() + " " : "") + v.getBrand() + " " + v.getModel();
    }

    private String getChangesSummary(Vehicle old, Vehicle updated) {
        StringBuilder sb = new StringBuilder();
        if (!old.getLicensePlate().equals(updated.getLicensePlate())) {
            sb.append("Plate: ").append(old.getLicensePlate()).append(" to ").append(updated.getLicensePlate()).append("\n");
        }
        if (!old.getBrand().equals(updated.getBrand())) {
            sb.append("Brand: ").append(old.getBrand()).append(" to ").append(updated.getBrand()).append("\n");
        }
        if (!old.getModel().equals(updated.getModel())) {
            sb.append("Model: ").append(old.getModel()).append(" to ").append(updated.getModel()).append("\n");
        }
        if (!Objects.equals(old.getYear(), updated.getYear())) {
            sb.append("Year: ").append(old.getYear()).append(" to ").append(updated.getYear());
        }
        return sb.toString().trim();
    }
}