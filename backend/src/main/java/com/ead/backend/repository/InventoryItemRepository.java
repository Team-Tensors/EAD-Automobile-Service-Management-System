package com.ead.backend.repository;

import com.ead.backend.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {

    // Find all items with low stock
    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.minStock")
    List<InventoryItem> findLowStockItems();

    // Find items by category
    List<InventoryItem> findByCategory(String category);

    // Find items by name (case-insensitive search)
    List<InventoryItem> findByItemNameContainingIgnoreCase(String itemName);

    // Check if item name already exists
    boolean existsByItemNameIgnoreCase(String itemName);
}
