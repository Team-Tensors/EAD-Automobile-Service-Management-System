package com.ead.backend.service;

import com.ead.backend.dto.ServiceCenterDTO;
import com.ead.backend.entity.ServiceCenter;
import com.ead.backend.entity.ServiceType;
import com.ead.backend.repository.ServiceCenterRepository;
import com.ead.backend.repository.ServiceTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceCenterService {

    @Autowired
    private ServiceCenterRepository repository;

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    public List<ServiceCenterDTO> getAllActiveWithServices() {
        List<ServiceCenter> centers = repository.findByIsActiveTrue();
        List<ServiceType> allServices = serviceTypeRepository.findAll();
        return centers.stream()
                .map(center -> {
                    ServiceCenterDTO dto = new ServiceCenterDTO(center);
                    dto.setServices(allServices);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<ServiceCenterDTO> getNearbyWithServices(BigDecimal latitude, BigDecimal longitude, double radiusInKm) {
        List<ServiceCenter> centers = repository.findNearbyServiceCenters(latitude, longitude, radiusInKm);
        List<ServiceType> allServices = serviceTypeRepository.findAll();
        return centers.stream()
                .map(center -> {
                    ServiceCenterDTO dto = new ServiceCenterDTO(center);
                    dto.setServices(allServices);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<ServiceCenterDTO> getByCityWithServices(String city) {
        List<ServiceCenter> centers = repository.findByCityAndIsActiveTrue(city);
        List<ServiceType> allServices = serviceTypeRepository.findAll();
        return centers.stream()
                .map(center -> {
                    ServiceCenterDTO dto = new ServiceCenterDTO(center);
                    dto.setServices(allServices);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}