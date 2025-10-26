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

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")               // only logged-in users
public class VehicleController {

    private final VehicleService vehicleService;

    /**
     * POST /api/vehicles
     * Body: JSON representation of Vehicle (user field is ignored – set by service)
     */
    @PostMapping
    public ResponseEntity<Vehicle> addVehicle(@Valid @RequestBody VehicleCreateDto dto) {
        Vehicle vehicle = new Vehicle();
        vehicle.setBrand(dto.getBrand());
        vehicle.setModel(dto.getModel());
        vehicle.setYear(dto.getYear());
        vehicle.setColor(dto.getColor());
        vehicle.setLicensePlate(dto.getLicensePlate());

        // optional ISO date parsing
        if (dto.getLastServiceDate() != null && !dto.getLastServiceDate().isBlank()) {
            vehicle.setLastServiceDate(LocalDateTime.parse(dto.getLastServiceDate()));
        }

        Vehicle saved = vehicleService.addVehicle(vehicle);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
}