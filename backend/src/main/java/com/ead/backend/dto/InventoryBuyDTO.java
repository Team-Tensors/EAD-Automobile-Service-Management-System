package com.ead.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryBuyDTO {

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Buy quantity must be at least 1")
    private Integer quantity;
}
