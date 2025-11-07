package com.ead.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class InventoryItemCreateDTO {

    @NotBlank(message = "Item name is required")
    @Size(min = 2, max = 100, message = "Item name must be between 2 and 100 characters")
    private String itemName;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.01", message = "Unit price must be greater than 0")
    private BigDecimal unitPrice;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Minimum stock is required")
    @Min(value = 1, message = "Minimum stock must be at least 1")
    private Integer minStock;

    @NotNull(message = "Service center is required")
    private UUID serviceCenterId;
}
