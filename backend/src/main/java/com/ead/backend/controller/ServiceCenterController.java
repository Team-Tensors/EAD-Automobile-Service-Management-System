package com.ead.backend.controller;

import com.ead.backend.dto.ServiceCenterDTO;
import com.ead.backend.service.ServiceCenterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/service-centers")
public class ServiceCenterController {

    @Autowired
    private ServiceCenterService service;

    @GetMapping("/with-services")
    public ResponseEntity<List<ServiceCenterDTO>> getAllWithServices() {
        List<ServiceCenterDTO> centers = service.getAllActiveWithServices();
        return ResponseEntity.ok(centers);
    }

    @GetMapping("/nearby-with-services")
    public ResponseEntity<List<ServiceCenterDTO>> getNearbyWithServices(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(defaultValue = "50") double radius) {
        List<ServiceCenterDTO> centers = service.getNearbyWithServices(lat, lng, radius);
        return ResponseEntity.ok(centers);
    }
}