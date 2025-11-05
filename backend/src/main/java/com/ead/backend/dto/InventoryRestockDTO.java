package com.ead.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryRestockDTO {

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Restock quantity must be at least 1")
    private Integer quantity;
}
