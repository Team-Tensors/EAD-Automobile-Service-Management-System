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

    // Check if item name already exists in a specific service center
    boolean existsByItemNameIgnoreCaseAndServiceCenterId(String itemName, UUID serviceCenterId);

    // Find all items by service center ID
    List<InventoryItem> findByServiceCenterId(UUID serviceCenterId);

    // Find low stock items by service center ID
    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.minStock AND i.serviceCenter.id = :serviceCenterId")
    List<InventoryItem> findLowStockItemsByServiceCenterId(UUID serviceCenterId);

    // Find items by category and service center ID
    List<InventoryItem> findByCategoryAndServiceCenterId(String category, UUID serviceCenterId);

    // Find items by name and service center ID (case-insensitive search)
    List<InventoryItem> findByItemNameContainingIgnoreCaseAndServiceCenterId(String itemName, UUID serviceCenterId);
}
