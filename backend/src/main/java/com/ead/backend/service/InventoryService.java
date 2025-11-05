package com.ead.backend.service;

import com.ead.backend.dto.*;
import com.ead.backend.entity.InventoryItem;
import com.ead.backend.entity.User;
import com.ead.backend.exception.ResourceNotFoundException;
import com.ead.backend.mappers.InventoryItemMapper;
import com.ead.backend.repository.InventoryItemRepository;
import com.ead.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final UserRepository userRepository;
    private final InventoryItemMapper inventoryItemMapper;
    private final EmailService emailService;

    /**
     * Get all inventory items
     */
    @Transactional(readOnly = true)
    public List<InventoryItemDTO> getAllItems() {
        log.info("Fetching all inventory items");
        return inventoryItemRepository.findAll().stream()
                .map(inventoryItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get inventory item by ID
     */
    @Transactional(readOnly = true)
    public InventoryItemDTO getItemById(UUID id) {
        log.info("Fetching inventory item with id: {}", id);
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        return inventoryItemMapper.toDTO(item);
    }

    /**
     * Get all low stock items
     */
    @Transactional(readOnly = true)
    public List<InventoryItemDTO> getLowStockItems() {
        log.info("Fetching low stock items");
        return inventoryItemRepository.findLowStockItems().stream()
                .map(inventoryItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get items by category
     */
    @Transactional(readOnly = true)
    public List<InventoryItemDTO> getItemsByCategory(String category) {
        log.info("Fetching items by category: {}", category);
        return inventoryItemRepository.findByCategory(category).stream()
                .map(inventoryItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search items by name
     */
    @Transactional(readOnly = true)
    public List<InventoryItemDTO> searchItemsByName(String name) {
        log.info("Searching items with name containing: {}", name);
        return inventoryItemRepository.findByItemNameContainingIgnoreCase(name).stream()
                .map(inventoryItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create new inventory item (Admin only)
     */
    public InventoryItemDTO createItem(InventoryItemCreateDTO dto) {
        log.info("Creating new inventory item: {}", dto.getItemName());

        // Check if item name already exists
        if (inventoryItemRepository.existsByItemNameIgnoreCase(dto.getItemName())) {
            throw new IllegalArgumentException("An item with this name already exists");
        }

        // Get current authenticated user
        User currentUser = getCurrentUser();

        // Create new inventory item
        InventoryItem item = new InventoryItem();
        item.setItemName(dto.getItemName());
        item.setDescription(dto.getDescription());
        item.setQuantity(dto.getQuantity());
        item.setUnitPrice(dto.getUnitPrice());
        item.setCategory(dto.getCategory());
        item.setMinStock(dto.getMinStock());
        item.setCreatedBy(currentUser);

        InventoryItem savedItem = inventoryItemRepository.save(item);
        log.info("Successfully created inventory item with id: {}", savedItem.getId());

        return inventoryItemMapper.toDTO(savedItem);
    }

    /**
     * Update inventory item (Admin only)
     */
    public InventoryItemDTO updateItem(UUID id, InventoryItemUpdateDTO dto) {
        log.info("Updating inventory item with id: {}", id);

        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        // Update only provided fields
        if (dto.getItemName() != null && !dto.getItemName().isBlank()) {
            // Check if new name conflicts with another item
            if (!item.getItemName().equalsIgnoreCase(dto.getItemName())
                    && inventoryItemRepository.existsByItemNameIgnoreCase(dto.getItemName())) {
                throw new IllegalArgumentException("An item with this name already exists");
            }
            item.setItemName(dto.getItemName());
        }

        if (dto.getDescription() != null) {
            item.setDescription(dto.getDescription());
        }

        if (dto.getQuantity() != null) {
            item.setQuantity(dto.getQuantity());
        }

        if (dto.getUnitPrice() != null) {
            item.setUnitPrice(dto.getUnitPrice());
        }

        if (dto.getCategory() != null && !dto.getCategory().isBlank()) {
            item.setCategory(dto.getCategory());
        }

        // Note: minStock cannot be updated after item creation for business consistency

        InventoryItem updatedItem = inventoryItemRepository.save(item);
        log.info("Successfully updated inventory item with id: {}", id);

        // Check for low stock and send alert if needed (in case quantity was reduced)
        checkAndSendLowStockAlert(updatedItem);

        return inventoryItemMapper.toDTO(updatedItem);
    }

    /**
     * Restock inventory item (Admin only) - Add to existing quantity
     */
    public InventoryItemDTO restockItem(UUID id, InventoryRestockDTO dto) {
        log.info("Restocking inventory item with id: {} by quantity: {}", id, dto.getQuantity());

        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        // Add to existing quantity
        item.setQuantity(item.getQuantity() + dto.getQuantity());

        InventoryItem updatedItem = inventoryItemRepository.save(item);
        log.info("Successfully restocked item. New quantity: {}", updatedItem.getQuantity());

        return inventoryItemMapper.toDTO(updatedItem);
    }

    /**
     * Buy/Use inventory item (Employee) - Reduce quantity
     */
    public InventoryItemDTO buyItem(UUID id, InventoryBuyDTO dto) {
        log.info("Employee buying inventory item with id: {} with quantity: {}", id, dto.getQuantity());

        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        // Check if sufficient quantity available
        if (item.getQuantity() < dto.getQuantity()) {
            throw new IllegalArgumentException(
                    String.format("Insufficient stock. Available: %d, Requested: %d",
                            item.getQuantity(), dto.getQuantity()));
        }

        // Reduce quantity
        item.setQuantity(item.getQuantity() - dto.getQuantity());

        InventoryItem updatedItem = inventoryItemRepository.save(item);
        log.info("Successfully reduced item quantity. New quantity: {}", updatedItem.getQuantity());

        // Check for low stock and send alert if needed
        checkAndSendLowStockAlert(updatedItem);

        return inventoryItemMapper.toDTO(updatedItem);
    }

    /**
     * Delete inventory item (Admin only)
     */
    public void deleteItem(UUID id) {
        log.info("Deleting inventory item with id: {}", id);

        if (!inventoryItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Inventory item not found with id: " + id);
        }

        inventoryItemRepository.deleteById(id);
        log.info("Successfully deleted inventory item with id: {}", id);
    }

    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /**
     * Check if item is low on stock and send alert emails to all admins
     */
    private void checkAndSendLowStockAlert(InventoryItem item) {
        log.info("=== LOW STOCK CHECK START ===");
        log.info("Item: {}", item.getItemName());
        log.info("Current Quantity: {}", item.getQuantity());
        log.info("Minimum Stock: {}", item.getMinStock());
        log.info("Is Low Stock? {}", item.getQuantity() < item.getMinStock());

        if (item.getQuantity() < item.getMinStock()) {
            log.warn("⚠️ LOW STOCK DETECTED for item: {} (Current: {}, Min: {})",
                    item.getItemName(), item.getQuantity(), item.getMinStock());

            // Get all admin users
            List<User> admins = userRepository.findByRoleName("ADMIN");
            log.info("Found {} admin users", admins.size());

            if (admins.isEmpty()) {
                log.error("❌ NO ADMIN USERS FOUND! Cannot send low stock alert for item: {}", item.getItemName());
                log.error("Please verify that admin users exist in database with role name 'ADMIN'");
                return;
            }

            // Send email to each admin
            for (User admin : admins) {
                try {
                    log.info("Attempting to send low stock alert to admin: {}", admin.getEmail());
                    String adminName = admin.getFullName() != null ? admin.getFullName() : admin.getEmail();

                    emailService.sendLowStockAlert(
                            admin.getEmail(),
                            adminName,
                            item.getItemName(),
                            item.getQuantity(),
                            item.getMinStock(),
                            item.getCategory());

                    log.info("✅ Low stock alert email sent successfully to: {}", admin.getEmail());
                } catch (Exception e) {
                    log.error("❌ FAILED to send low stock alert to admin: {} for item: {}",
                            admin.getEmail(), item.getItemName(), e);
                    log.error("Exception details: ", e);
                }
            }
        } else {
            log.info("Stock level is OK - No alert needed (Current: {} >= Min: {})",
                    item.getQuantity(), item.getMinStock());
        }
        log.info("=== LOW STOCK CHECK END ===");
    }
}
