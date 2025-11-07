package com.ead.backend.service;

import com.ead.backend.dto.*;
import com.ead.backend.entity.EmployeeCenter;
import com.ead.backend.entity.InventoryItem;
import com.ead.backend.entity.ServiceCenter;
import com.ead.backend.entity.User;
import com.ead.backend.exception.ResourceNotFoundException;
import com.ead.backend.mappers.InventoryItemMapper;
import com.ead.backend.repository.EmployeeCenterRepository;
import com.ead.backend.repository.InventoryItemRepository;
import com.ead.backend.repository.ServiceCenterRepository;
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
    private final ServiceCenterRepository serviceCenterRepository;
    private final EmployeeCenterRepository employeeCenterRepository;
    private final InventoryItemMapper inventoryItemMapper;
    private final EmailService emailService;

    /**
     * Get all inventory items
     * For EMPLOYEE role: return only items from their assigned service center
     * For ADMIN role: return all items
     */
    @Transactional(readOnly = true)
    public List<InventoryItemDTO> getAllItems() {
        log.info("Fetching all inventory items");

        User currentUser = getCurrentUser();

        // If user is an employee, filter by their service center
        if (isEmployee(currentUser)) {
            UUID serviceCenterId = getEmployeeServiceCenterId(currentUser.getId());
            log.info("Employee detected. Filtering items for service center ID: {}", serviceCenterId);
            return inventoryItemRepository.findByServiceCenterId(serviceCenterId).stream()
                    .map(inventoryItemMapper::toDTO)
                    .collect(Collectors.toList());
        }

        // Admin gets all items
        return inventoryItemRepository.findAll().stream()
                .map(inventoryItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get inventory item by ID
     * For EMPLOYEE role: only if item belongs to their service center
     * For ADMIN role: any item
     */
    @Transactional(readOnly = true)
    public InventoryItemDTO getItemById(UUID id) {
        log.info("Fetching inventory item with id: {}", id);
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        // If employee, verify item belongs to their service center
        User currentUser = getCurrentUser();
        if (isEmployee(currentUser)) {
            UUID serviceCenterId = getEmployeeServiceCenterId(currentUser.getId());
            if (!item.getServiceCenter().getId().equals(serviceCenterId)) {
                throw new ResourceNotFoundException("Inventory item not found with id: " + id);
            }
        }

        return inventoryItemMapper.toDTO(item);
    }

    /**
     * Get all low stock items
     * For EMPLOYEE role: only from their service center
     * For ADMIN role: all low stock items
     */
    @Transactional(readOnly = true)
    public List<InventoryItemDTO> getLowStockItems() {
        log.info("Fetching low stock items");

        User currentUser = getCurrentUser();

        // If employee, filter by their service center
        if (isEmployee(currentUser)) {
            UUID serviceCenterId = getEmployeeServiceCenterId(currentUser.getId());
            log.info("Employee detected. Filtering low stock items for service center ID: {}", serviceCenterId);
            return inventoryItemRepository.findLowStockItemsByServiceCenterId(serviceCenterId).stream()
                    .map(inventoryItemMapper::toDTO)
                    .collect(Collectors.toList());
        }

        return inventoryItemRepository.findLowStockItems().stream()
                .map(inventoryItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get items by category
     * For EMPLOYEE role: only from their service center
     * For ADMIN role: all items in category
     */
    @Transactional(readOnly = true)
    public List<InventoryItemDTO> getItemsByCategory(String category) {
        log.info("Fetching items by category: {}", category);

        User currentUser = getCurrentUser();

        // If employee, filter by their service center
        if (isEmployee(currentUser)) {
            UUID serviceCenterId = getEmployeeServiceCenterId(currentUser.getId());
            log.info("Employee detected. Filtering category items for service center ID: {}", serviceCenterId);
            return inventoryItemRepository.findByCategoryAndServiceCenterId(category, serviceCenterId).stream()
                    .map(inventoryItemMapper::toDTO)
                    .collect(Collectors.toList());
        }

        return inventoryItemRepository.findByCategory(category).stream()
                .map(inventoryItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search items by name
     * For EMPLOYEE role: only from their service center
     * For ADMIN role: all matching items
     */
    @Transactional(readOnly = true)
    public List<InventoryItemDTO> searchItemsByName(String name) {
        log.info("Searching items with name containing: {}", name);

        User currentUser = getCurrentUser();

        // If employee, filter by their service center
        if (isEmployee(currentUser)) {
            UUID serviceCenterId = getEmployeeServiceCenterId(currentUser.getId());
            log.info("Employee detected. Searching items for service center ID: {}", serviceCenterId);
            return inventoryItemRepository.findByItemNameContainingIgnoreCaseAndServiceCenterId(name, serviceCenterId)
                    .stream()
                    .map(inventoryItemMapper::toDTO)
                    .collect(Collectors.toList());
        }

        return inventoryItemRepository.findByItemNameContainingIgnoreCase(name).stream()
                .map(inventoryItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create new inventory item (Admin only)
     */
    public InventoryItemDTO createItem(InventoryItemCreateDTO dto) {
        log.info("Creating new inventory item: {}", dto.getItemName());

        // Get service center first
        ServiceCenter serviceCenter = serviceCenterRepository.findById(dto.getServiceCenterId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service center not found with id: " + dto.getServiceCenterId()));

        // Check if item name already exists in this service center
        if (inventoryItemRepository.existsByItemNameIgnoreCaseAndServiceCenterId(
                dto.getItemName(), dto.getServiceCenterId())) {
            throw new IllegalArgumentException(
                    "An item with this name already exists in " + serviceCenter.getName());
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
        item.setServiceCenter(serviceCenter);
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
            // Check if new name conflicts with another item in the same service center
            if (!item.getItemName().equalsIgnoreCase(dto.getItemName())
                    && inventoryItemRepository.existsByItemNameIgnoreCaseAndServiceCenterId(
                            dto.getItemName(), item.getServiceCenter().getId())) {
                throw new IllegalArgumentException(
                        "An item with this name already exists in " + item.getServiceCenter().getName());
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
     * Employees can only buy from their assigned service center
     */
    public InventoryItemDTO buyItem(UUID id, InventoryBuyDTO dto) {
        log.info("Employee buying inventory item with id: {} with quantity: {}", id, dto.getQuantity());

        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        // Verify employee has access to this item (from their service center)
        User currentUser = getCurrentUser();
        if (isEmployee(currentUser)) {
            UUID serviceCenterId = getEmployeeServiceCenterId(currentUser.getId());
            if (!item.getServiceCenter().getId().equals(serviceCenterId)) {
                throw new ResourceNotFoundException("Inventory item not found with id: " + id);
            }
        }

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
     * Check if user has EMPLOYEE role
     */
    private boolean isEmployee(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> "EMPLOYEE".equals(role.getName()));
    }

    /**
     * Get the service center ID for an employee
     */
    private UUID getEmployeeServiceCenterId(UUID employeeId) {
        EmployeeCenter employeeCenter = employeeCenterRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee is not assigned to any service center. Please contact administrator."));

        if (employeeCenter.getServiceCenter() == null) {
            throw new ResourceNotFoundException(
                    "Employee is not assigned to any service center. Please contact administrator.");
        }

        return employeeCenter.getServiceCenter().getId();
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
