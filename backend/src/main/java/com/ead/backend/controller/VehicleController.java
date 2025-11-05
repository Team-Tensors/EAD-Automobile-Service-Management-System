package com.ead.backend.controller;

import com.ead.backend.dto.VehicleCreateDTO;
import com.ead.backend.dto.VehicleResponseDTO;
import com.ead.backend.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<List<VehicleResponseDTO>> getUserVehicles() {
        return ResponseEntity.ok(vehicleService.getUserVehicles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponseDTO> getVehicle(@PathVariable UUID id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @PostMapping
    public ResponseEntity<VehicleResponseDTO> addVehicle(@Valid @RequestBody VehicleCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vehicleService.addVehicle(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponseDTO> updateVehicle(
            @PathVariable UUID id,
            @Valid @RequestBody VehicleCreateDTO dto) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable UUID id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
}