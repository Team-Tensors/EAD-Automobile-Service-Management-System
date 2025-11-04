package com.ead.backend.service;

import com.ead.backend.dto.ServiceCenterDTO;
import com.ead.backend.repository.ServiceCenterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceCenterService {

    @Autowired
    private ServiceCenterRepository repository;

    public List<ServiceCenterDTO> getAllActive() {
        return repository.findByIsActiveTrue().stream()
                .map(ServiceCenterDTO::new)
                .collect(Collectors.toList());
    }

    public List<ServiceCenterDTO> getNearby(BigDecimal latitude, BigDecimal longitude, double radiusInKm) {
        return repository.findNearbyServiceCenters(latitude, longitude, radiusInKm).stream()
                .map(ServiceCenterDTO::new)
                .collect(Collectors.toList());
    }

    public List<ServiceCenterDTO> getByCity(String city) {
        return repository.findByCityAndIsActiveTrue(city).stream()
                .map(ServiceCenterDTO::new)
                .collect(Collectors.toList());
    }

    public List<ServiceCenterDTO> getWithAvailableSlots() {
        return repository.findByIsActiveTrueAndCenterSlotGreaterThan(0).stream()
                .map(ServiceCenterDTO::new)
                .collect(Collectors.toList());
    }
}