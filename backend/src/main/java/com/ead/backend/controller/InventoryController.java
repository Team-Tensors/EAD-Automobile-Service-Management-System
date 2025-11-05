package com.ead.backend.controller;

import com.ead.backend.dto.*;
import com.ead.backend.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Slf4j
public class InventoryController {

    private final InventoryService inventoryService;

    /**
     * GET /inventory - Get all inventory items
     * Accessible by: ADMIN, EMPLOYEE
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<InventoryItemDTO>> getAllItems() {
        log.info("GET /inventory - Fetching all inventory items");
        List<InventoryItemDTO> items = inventoryService.getAllItems();
        return ResponseEntity.ok(items);
    }

    /**
     * GET /inventory/{id} - Get specific inventory item
     * Accessible by: ADMIN, EMPLOYEE
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<InventoryItemDTO> getItemById(@PathVariable UUID id) {
        log.info("GET /inventory/{} - Fetching item", id);
        InventoryItemDTO item = inventoryService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    /**
     * GET /inventory/low-stock - Get items with low stock
     * Accessible by: ADMIN, EMPLOYEE
     */
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<InventoryItemDTO>> getLowStockItems() {
        log.info("GET /inventory/low-stock - Fetching low stock items");
        List<InventoryItemDTO> items = inventoryService.getLowStockItems();
        return ResponseEntity.ok(items);
    }

    /**
     * GET /inventory/category/{category} - Get items by category
     * Accessible by: ADMIN, EMPLOYEE
     */
    @GetMapping("/category/{category}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<InventoryItemDTO>> getItemsByCategory(@PathVariable String category) {
        log.info("GET /inventory/category/{} - Fetching items", category);
        List<InventoryItemDTO> items = inventoryService.getItemsByCategory(category);
        return ResponseEntity.ok(items);
    }

    /**
     * GET /inventory/search - Search items by name
     * Accessible by: ADMIN, EMPLOYEE
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<InventoryItemDTO>> searchItems(@RequestParam String name) {
        log.info("GET /inventory/search?name={} - Searching items", name);
        List<InventoryItemDTO> items = inventoryService.searchItemsByName(name);
        return ResponseEntity.ok(items);
    }

    /**
     * POST /inventory - Create new inventory item
     * Accessible by: ADMIN only
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItemDTO> createItem(@Valid @RequestBody InventoryItemCreateDTO dto) {
        log.info("POST /inventory - Creating new item: {}", dto.getItemName());
        InventoryItemDTO createdItem = inventoryService.createItem(dto);
        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
    }

    /**
     * PUT /inventory/{id} - Update inventory item
     * Accessible by: ADMIN only
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItemDTO> updateItem(
            @PathVariable UUID id,
            @Valid @RequestBody InventoryItemUpdateDTO dto) {
        log.info("PUT /inventory/{} - Updating item", id);
        InventoryItemDTO updatedItem = inventoryService.updateItem(id, dto);
        return ResponseEntity.ok(updatedItem);
    }

    /**
     * PATCH /inventory/{id}/restock - Restock item (add quantity)
     * Accessible by: ADMIN only
     */
    @PatchMapping("/{id}/restock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItemDTO> restockItem(
            @PathVariable UUID id,
            @Valid @RequestBody InventoryRestockDTO dto) {
        log.info("PATCH /inventory/{}/restock - Restocking item with quantity: {}", id, dto.getQuantity());
        InventoryItemDTO restockedItem = inventoryService.restockItem(id, dto);
        return ResponseEntity.ok(restockedItem);
    }

    /**
     * PATCH /inventory/{id}/buy - Buy/Use item (reduce quantity)
     * Accessible by: EMPLOYEE only
     */
    @PatchMapping("/{id}/buy")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<InventoryItemDTO> buyItem(
            @PathVariable UUID id,
            @Valid @RequestBody InventoryBuyDTO dto) {
        log.info("PATCH /inventory/{}/buy - Employee buying item with quantity: {}", id, dto.getQuantity());
        InventoryItemDTO boughtItem = inventoryService.buyItem(id, dto);
        return ResponseEntity.ok(boughtItem);
    }

    /**
     * DELETE /inventory/{id} - Delete inventory item
     * Accessible by: ADMIN only
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponseDTO> deleteItem(@PathVariable UUID id) {
        log.info("DELETE /inventory/{} - Deleting item", id);
        inventoryService.deleteItem(id);
        return ResponseEntity.ok(new MessageResponseDTO("Inventory item deleted successfully", true));
    }
}
