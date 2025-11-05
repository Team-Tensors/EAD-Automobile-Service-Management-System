package com.ead.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class InventoryItemDTO {
    private UUID id;
    private String itemName;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalValue;
    private String category;
    private Integer minStock;
    private String createdByName;
    private UUID createdById;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
    private boolean lowStock;
}
