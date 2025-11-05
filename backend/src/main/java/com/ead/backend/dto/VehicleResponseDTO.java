package com.ead.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;


@Data
public class VehicleResponseDTO {

    private String id;
    private String brand;
    private String model;
    private Integer year;
    private String color;
    private LocalDateTime lastServiceDate;
    private String licensePlate;

}