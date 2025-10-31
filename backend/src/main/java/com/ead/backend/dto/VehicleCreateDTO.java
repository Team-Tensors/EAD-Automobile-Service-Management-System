package com.ead.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VehicleCreateDTO {

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Model is required")
    private String model;

    @NotBlank(message = "Year is required")
    @Pattern(regexp = "^(19|20)\\d{2}$", message = "Year must be a valid 4-digit year (1900–2099)")
    private String year;

    @NotBlank(message = "Color is required")
    private String color;

    @NotBlank(message = "License plate is required")
    private String licensePlate;

    // Format: "2025-04-05" (from HTML <input type="date">)
    private String lastServiceDate; // Optional
}