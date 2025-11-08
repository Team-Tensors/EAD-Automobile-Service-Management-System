package com.ead.backend.controller;

import com.ead.backend.dto.ServiceOrModificationDTO;
import com.ead.backend.dto.ServiceOrModificationRequestDTO;
import com.ead.backend.enums.AppointmentType;
import com.ead.backend.entity.ServiceOrModification;
import com.ead.backend.repository.ServiceOrModificationRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/services-modifications")

public class ServiceOrModificationController {

    @Autowired
    private ServiceOrModificationRepository somRepository;

    // ===================================================================
    // 1. Get all SERVICES (for dropdown when booking service)
    // ===================================================================
    @GetMapping("/services")
    public ResponseEntity<List<ServiceOrModificationDTO>> getServices() {
        List<ServiceOrModificationDTO> services = somRepository
                .findByType(AppointmentType.SERVICE)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(services);
    }

    // ===================================================================
    // 2. Get all MODIFICATIONS (for dropdown when booking modification)
    // ===================================================================
    @GetMapping("/modifications")
    public ResponseEntity<List<ServiceOrModificationDTO>> getModifications() {
        List<ServiceOrModificationDTO> modifications = somRepository
                .findByType(AppointmentType.MODIFICATION)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(modifications);
    }

    // ===================================================================
    // 3. Get all services and modifications (Admin)
    // ===================================================================
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public ResponseEntity<List<ServiceOrModificationDTO>> getAllServicesAndModifications() {
        List<ServiceOrModificationDTO> all = somRepository
                .findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(all);
    }

    // ===================================================================
    // 4. Get single service or modification by ID (Admin)
    // ===================================================================
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/{id}")
    public ResponseEntity<ServiceOrModificationDTO> getServiceOrModificationById(@PathVariable UUID id) {
        return somRepository.findById(id)
                .map(som -> ResponseEntity.ok(toDTO(som)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ===================================================================
    // 5. Create new service or modification (Admin)
    // ===================================================================
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin")
    public ResponseEntity<ServiceOrModificationDTO> createServiceOrModification(
            @Valid @RequestBody ServiceOrModificationRequestDTO request) {

        ServiceOrModification som = new ServiceOrModification();
        som.setType(request.getType());
        som.setName(request.getName());
        som.setDescription(request.getDescription());
        som.setEstimatedCost(request.getEstimatedCost());
        som.setEstimatedTimeMinutes(request.getEstimatedTimeMinutes());

        ServiceOrModification saved = somRepository.save(som);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    // ===================================================================
    // 6. Update existing service or modification (Admin)
    // ===================================================================
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}")
    public ResponseEntity<ServiceOrModificationDTO> updateServiceOrModification(
            @PathVariable UUID id,
            @Valid @RequestBody ServiceOrModificationRequestDTO request) {

        return somRepository.findById(id)
                .map(som -> {
                    som.setType(request.getType());
                    som.setName(request.getName());
                    som.setDescription(request.getDescription());
                    som.setEstimatedCost(request.getEstimatedCost());
                    som.setEstimatedTimeMinutes(request.getEstimatedTimeMinutes());

                    ServiceOrModification updated = somRepository.save(som);
                    return ResponseEntity.ok(toDTO(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ===================================================================
    // 7. Delete service or modification (Admin)
    // ===================================================================
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteServiceOrModification(@PathVariable UUID id) {
        if (somRepository.existsById(id)) {
            somRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ===================================================================
    // Helper: Convert Entity → DTO
    // ===================================================================
    private ServiceOrModificationDTO toDTO(ServiceOrModification som) {
        return new ServiceOrModificationDTO(
                som.getId(),
                som.getType(),
                som.getName(),
                som.getDescription(),
                som.getEstimatedCost(),
                som.getEstimatedTimeMinutes()
        );
    }
}