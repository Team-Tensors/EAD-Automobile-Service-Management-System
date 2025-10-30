package com.ead.backend.dto;

import com.ead.backend.entity.ServiceType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ServiceCenterDTO {
    private Long id;
    private String name;
    private String address;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private String email;
    private String operatingHours;
    private Boolean isActive;
    private List<ServiceType> services;

    public ServiceCenterDTO() {}

    // Constructor to map from ServiceCenter entity
    public ServiceCenterDTO(com.ead.backend.entity.ServiceCenter center) {
        this.id = center.getId();
        this.name = center.getName();
        this.address = center.getAddress();
        this.city = center.getCity();
        this.latitude = center.getLatitude();
        this.longitude = center.getLongitude();
        this.phone = center.getPhone();
        this.email = center.getEmail();
        this.operatingHours = center.getOperatingHours();
        this.isActive = center.getIsActive();
    }
}