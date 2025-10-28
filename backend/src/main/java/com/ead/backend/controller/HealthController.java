package com.ead.backend.controller;

import com.ead.backend.dto.HealthResponseDTO;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

    private final Environment environment;

    public HealthController(Environment environment) {
        this.environment = environment;
    }

    @GetMapping
    public ResponseEntity<HealthResponseDTO> health(){
        HealthResponseDTO healthResponseDTO = new HealthResponseDTO();
        healthResponseDTO.setStatus("API is running...");
        return ResponseEntity.ok(healthResponseDTO);
    }

    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> debug(){
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("activeProfiles", environment.getActiveProfiles());
        debugInfo.put("defaultProfiles", environment.getDefaultProfiles());
        debugInfo.put("swaggerEnabled", environment.getProperty("springdoc.swagger-ui.enabled", "not-set"));
        debugInfo.put("apiDocsEnabled", environment.getProperty("springdoc.api-docs.enabled", "not-set"));
        debugInfo.put("contextPath", environment.getProperty("server.servlet.context-path", "/"));
        debugInfo.put("serverPort", environment.getProperty("server.port", "8080"));
        return ResponseEntity.ok(debugInfo);
    }
}
