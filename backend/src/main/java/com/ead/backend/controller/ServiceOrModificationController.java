package com.ead.backend.controller;

import com.ead.backend.dto.ServiceOrModificationDTO;
import com.ead.backend.enums.AppointmentType;
import com.ead.backend.entity.ServiceOrModification;
import com.ead.backend.repository.ServiceOrModificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    // Helper: Convert Entity → DTO
    // ===================================================================
    private ServiceOrModificationDTO toDTO(ServiceOrModification som) {
        return new ServiceOrModificationDTO(
                som.getId(),
                som.getName(),
                som.getDescription(),
                som.getEstimatedCost(),
                som.getEstimatedTimeMinutes()
        );
    }
}