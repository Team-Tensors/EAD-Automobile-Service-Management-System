// src/main/java/com/ead/backend/dto/VehicleCreateDto.java
package com.ead.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VehicleCreateDto {

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Model is required")
    private String model;

    @NotBlank(message = "Year is required")
    @Pattern(regexp = "\\d{4}", message = "Year must be a 4-digit number")
    private String year;

    @NotBlank(message = "Color is required")
    private String color;

    private String lastServiceDate;

    @NotBlank(message = "License plate is required")
    private String licensePlate;
}