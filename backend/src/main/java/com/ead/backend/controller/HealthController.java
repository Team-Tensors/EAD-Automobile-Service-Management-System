package com.ead.backend.controller;

import com.ead.backend.dto.HealthResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<HealthResponseDTO> health(){
        HealthResponseDTO healthResponseDTO = new HealthResponseDTO();
        healthResponseDTO.setStatus("API is running...");
        return ResponseEntity.ok(healthResponseDTO);
    }
}
