package com.ead.backend.mappers;

import com.ead.backend.dto.InventoryItemDTO;
import com.ead.backend.entity.InventoryItem;
import org.springframework.stereotype.Component;

@Component
public class InventoryItemMapper {

    public InventoryItemDTO toDTO(InventoryItem item) {
        if (item == null) {
            return null;
        }

        InventoryItemDTO dto = new InventoryItemDTO();
        dto.setId(item.getId());
        dto.setItemName(item.getItemName());
        dto.setDescription(item.getDescription());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalValue(item.getTotalValue());
        dto.setCategory(item.getCategory());
        dto.setMinStock(item.getMinStock());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setLastUpdated(item.getLastUpdated());
        dto.setLowStock(item.isLowStock());

        // Map creator information
        if (item.getCreatedBy() != null) {
            dto.setCreatedById(item.getCreatedBy().getId());
            dto.setCreatedByName(item.getCreatedBy().getFullName() != null
                    ? item.getCreatedBy().getFullName()
                    : item.getCreatedBy().getEmail());
        }

        return dto;
    }
}
