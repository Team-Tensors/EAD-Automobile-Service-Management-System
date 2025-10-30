// src/main/java/com/ead/backend/controller/VehicleController.java
package com.ead.backend.controller;

import com.ead.backend.dto.VehicleCreateDto;
import com.ead.backend.entity.Vehicle;
import com.ead.backend.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@CrossOrigin(origins = "${frontend.url}", allowCredentials = "true")
public class VehicleController {

    private final VehicleService vehicleService;

    // === GET: List all vehicles for current user ===
    @GetMapping
    public ResponseEntity<List<Vehicle>> getUserVehicles() {
        List<Vehicle> vehicles = vehicleService.getUserVehicles();
        return ResponseEntity.ok(vehicles);
    }

    // === GET: Get one vehicle by ID (with ownership check) ===
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicle(@PathVariable Long id) {
        Vehicle vehicle = vehicleService.getVehicleByIdAndUser(id);
        return ResponseEntity.ok(vehicle);
    }

    // === POST: Add new vehicle ===
    @PostMapping
    public ResponseEntity<Vehicle> addVehicle(@Valid @RequestBody VehicleCreateDto dto) {
        Vehicle vehicle = new Vehicle();
        mapDtoToEntity(dto, vehicle);
        Vehicle saved = vehicleService.addVehicle(vehicle);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // === PUT: Update existing vehicle ===
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleCreateDto dto) {

        Vehicle existing = vehicleService.getVehicleByIdAndUser(id);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        mapDtoToEntity(dto, existing);
        Vehicle updated = vehicleService.updateVehicle(existing);
        return ResponseEntity.ok(updated);
    }

    // === DELETE: Remove vehicle ===
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        boolean deleted = vehicleService.deleteVehicleByIdAndUser(id);
        return deleted
                ? ResponseEntity.noContent().build()
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // === Helper: Map DTO → Entity ===
    private void mapDtoToEntity(VehicleCreateDto dto, Vehicle vehicle) {
        vehicle.setBrand(dto.getBrand());
        vehicle.setModel(dto.getModel());
        vehicle.setYear(dto.getYear());
        vehicle.setColor(dto.getColor());
        vehicle.setLicensePlate(dto.getLicensePlate());

        if (dto.getLastServiceDate() != null && !dto.getLastServiceDate().isBlank()) {
            LocalDate date = LocalDate.parse(dto.getLastServiceDate());
            vehicle.setLastServiceDate(date.atStartOfDay()); // LocalDate → LocalDateTime
        } else {
            vehicle.setLastServiceDate(null);
        }
    }
}