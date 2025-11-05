package com.ead.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class VehicleCreateDTO {

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Year is required")
    @Min(value = 1900, message = "Year cannot be less than 1900")
    @Max(value = 2099, message = "Year cannot be greater than 2099")
    private Integer year;

    @NotBlank(message = "Color is required")
    private String color;

    @NotBlank(message = "License plate is required")
    @Size(max=10)
    private String licensePlate;

    private String lastServiceDate;
}