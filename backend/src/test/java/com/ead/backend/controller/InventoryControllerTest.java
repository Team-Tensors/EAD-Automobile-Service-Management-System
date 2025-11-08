package com.ead.backend.controller;

import com.ead.backend.dto.*;
import com.ead.backend.service.InventoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Inventory Controller Unit Tests")
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private InventoryService inventoryService;

    private UUID itemId;
    private UUID serviceCenterId;
    private InventoryItemDTO itemDTO;
    private InventoryItemCreateDTO createDTO;
    private InventoryItemUpdateDTO updateDTO;
    private InventoryRestockDTO restockDTO;
    private InventoryBuyDTO buyDTO;

    @BeforeEach
    void setUp() {
        itemId = UUID.randomUUID();
        serviceCenterId = UUID.randomUUID();

        // Setup InventoryItemDTO
        itemDTO = new InventoryItemDTO();
        itemDTO.setId(itemId);
        itemDTO.setItemName("Brake Pads");
        itemDTO.setDescription("High quality ceramic brake pads");
        itemDTO.setQuantity(50);
        itemDTO.setUnitPrice(new BigDecimal("75.50"));
        itemDTO.setTotalValue(new BigDecimal("3775.00"));
        itemDTO.setCategory("Parts");
        itemDTO.setMinStock(10);
        itemDTO.setCreatedByName("Admin User");
        itemDTO.setCreatedById(UUID.randomUUID());
        itemDTO.setServiceCenterId(serviceCenterId);
        itemDTO.setServiceCenterName("Main Service Center");
        itemDTO.setCreatedAt(LocalDateTime.now());
        itemDTO.setLastUpdated(LocalDateTime.now());
        itemDTO.setLowStock(false);

        // Setup InventoryItemCreateDTO
        createDTO = new InventoryItemCreateDTO();
        createDTO.setItemName("Engine Oil");
        createDTO.setDescription("Synthetic engine oil 5W-30");
        createDTO.setQuantity(100);
        createDTO.setUnitPrice(new BigDecimal("25.99"));
        createDTO.setCategory("Fluids");
        createDTO.setMinStock(20);
        createDTO.setServiceCenterId(serviceCenterId);

        // Setup InventoryItemUpdateDTO
        updateDTO = new InventoryItemUpdateDTO();
        updateDTO.setItemName("Updated Brake Pads");
        updateDTO.setDescription("Premium ceramic brake pads");
        updateDTO.setQuantity(60);
        updateDTO.setUnitPrice(new BigDecimal("80.00"));
        updateDTO.setCategory("Parts");

        // Setup InventoryRestockDTO
        restockDTO = new InventoryRestockDTO();
        restockDTO.setQuantity(50);

        // Setup InventoryBuyDTO
        buyDTO = new InventoryBuyDTO();
        buyDTO.setQuantity(5);
    }

    // ===================================================================
    // GET ALL ITEMS TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get all inventory items")
    void testGetAllItems_AsAdmin_Success() throws Exception {
        // Arrange
        List<InventoryItemDTO> items = Arrays.asList(itemDTO);
        when(inventoryService.getAllItems()).thenReturn(items);

        // Act & Assert
        mockMvc.perform(get("/inventory")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].itemName").value("Brake Pads"))
                .andExpect(jsonPath("$[0].quantity").value(50))
                .andExpect(jsonPath("$[0].category").value("Parts"));

        verify(inventoryService, times(1)).getAllItems();
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should successfully get inventory items from their service center")
    void testGetAllItems_AsEmployee_Success() throws Exception {
        // Arrange
        List<InventoryItemDTO> items = Arrays.asList(itemDTO);
        when(inventoryService.getAllItems()).thenReturn(items);

        // Act & Assert
        mockMvc.perform(get("/inventory")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].serviceCenterName").value("Main Service Center"));

        verify(inventoryService, times(1)).getAllItems();
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Should return empty list when no items exist")
    void testGetAllItems_EmptyList() throws Exception {
        // Arrange
        when(inventoryService.getAllItems()).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/inventory")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        verify(inventoryService, times(1)).getAllItems();
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = { "CUSTOMER" })
    @DisplayName("Customer: Should be forbidden from accessing inventory")
    void testGetAllItems_AsCustomer_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/inventory")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError()); // App returns 500 for auth denied

        verify(inventoryService, never()).getAllItems();
    }

    @Test
    @DisplayName("Should return 401 when not authenticated")
    void testGetAllItems_Unauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/inventory")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verify(inventoryService, never()).getAllItems();
    }

    // ===================================================================
    // GET ITEM BY ID TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get item by ID")
    void testGetItemById_AsAdmin_Success() throws Exception {
        // Arrange
        when(inventoryService.getItemById(itemId)).thenReturn(itemDTO);

        // Act & Assert
        mockMvc.perform(get("/inventory/{id}", itemId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(itemId.toString()))
                .andExpect(jsonPath("$.itemName").value("Brake Pads"))
                .andExpect(jsonPath("$.quantity").value(50));

        verify(inventoryService, times(1)).getItemById(itemId);
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should successfully get item from their service center")
    void testGetItemById_AsEmployee_Success() throws Exception {
        // Arrange
        when(inventoryService.getItemById(itemId)).thenReturn(itemDTO);

        // Act & Assert
        mockMvc.perform(get("/inventory/{id}", itemId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemName").value("Brake Pads"));

        verify(inventoryService, times(1)).getItemById(itemId);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Should return error when item not found")
    void testGetItemById_NotFound() throws Exception {
        // Arrange
        when(inventoryService.getItemById(itemId))
                .thenThrow(new RuntimeException("Inventory item not found with id: " + itemId));

        // Act & Assert
        mockMvc.perform(get("/inventory/{id}", itemId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());

        verify(inventoryService, times(1)).getItemById(itemId);
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = { "CUSTOMER" })
    @DisplayName("Customer: Should be forbidden from accessing item details")
    void testGetItemById_AsCustomer_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/inventory/{id}", itemId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError()); // App returns 500 for auth denied

        verify(inventoryService, never()).getItemById(any());
    }

    // ===================================================================
    // GET LOW STOCK ITEMS TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get low stock items")
    void testGetLowStockItems_AsAdmin_Success() throws Exception {
        // Arrange
        InventoryItemDTO lowStockItem = new InventoryItemDTO();
        lowStockItem.setId(itemId);
        lowStockItem.setItemName("Low Stock Item");
        lowStockItem.setQuantity(5);
        lowStockItem.setMinStock(10);
        lowStockItem.setLowStock(true);

        List<InventoryItemDTO> items = Arrays.asList(lowStockItem);
        when(inventoryService.getLowStockItems()).thenReturn(items);

        // Act & Assert
        mockMvc.perform(get("/inventory/low-stock")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].lowStock").value(true))
                .andExpect(jsonPath("$[0].quantity").value(5))
                .andExpect(jsonPath("$[0].minStock").value(10));

        verify(inventoryService, times(1)).getLowStockItems();
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should get low stock items from their service center")
    void testGetLowStockItems_AsEmployee_Success() throws Exception {
        // Arrange
        when(inventoryService.getLowStockItems()).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/inventory/low-stock")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        verify(inventoryService, times(1)).getLowStockItems();
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = { "CUSTOMER" })
    @DisplayName("Customer: Should be forbidden from accessing low stock items")
    void testGetLowStockItems_AsCustomer_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/inventory/low-stock")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError()); // App returns 500 for auth denied

        verify(inventoryService, never()).getLowStockItems();
    }

    // ===================================================================
    // GET ITEMS BY CATEGORY TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get items by category")
    void testGetItemsByCategory_AsAdmin_Success() throws Exception {
        // Arrange
        List<InventoryItemDTO> items = Arrays.asList(itemDTO);
        when(inventoryService.getItemsByCategory("Parts")).thenReturn(items);

        // Act & Assert
        mockMvc.perform(get("/inventory/category/{category}", "Parts")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").value("Parts"))
                .andExpect(jsonPath("$[0].itemName").value("Brake Pads"));

        verify(inventoryService, times(1)).getItemsByCategory("Parts");
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should get items by category from their service center")
    void testGetItemsByCategory_AsEmployee_Success() throws Exception {
        // Arrange
        List<InventoryItemDTO> items = Arrays.asList(itemDTO);
        when(inventoryService.getItemsByCategory("Parts")).thenReturn(items);

        // Act & Assert
        mockMvc.perform(get("/inventory/category/{category}", "Parts")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").value("Parts"));

        verify(inventoryService, times(1)).getItemsByCategory("Parts");
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Should return empty list when category has no items")
    void testGetItemsByCategory_EmptyCategory() throws Exception {
        // Arrange
        when(inventoryService.getItemsByCategory("NonExistent")).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/inventory/category/{category}", "NonExistent")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        verify(inventoryService, times(1)).getItemsByCategory("NonExistent");
    }

    // ===================================================================
    // SEARCH ITEMS TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully search items by name")
    void testSearchItems_AsAdmin_Success() throws Exception {
        // Arrange
        List<InventoryItemDTO> items = Arrays.asList(itemDTO);
        when(inventoryService.searchItemsByName("Brake")).thenReturn(items);

        // Act & Assert
        mockMvc.perform(get("/inventory/search")
                .param("name", "Brake")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].itemName").value("Brake Pads"));

        verify(inventoryService, times(1)).searchItemsByName("Brake");
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should search items from their service center")
    void testSearchItems_AsEmployee_Success() throws Exception {
        // Arrange
        List<InventoryItemDTO> items = Arrays.asList(itemDTO);
        when(inventoryService.searchItemsByName("Brake")).thenReturn(items);

        // Act & Assert
        mockMvc.perform(get("/inventory/search")
                .param("name", "Brake")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(inventoryService, times(1)).searchItemsByName("Brake");
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Should return empty list when search finds no matches")
    void testSearchItems_NoMatches() throws Exception {
        // Arrange
        when(inventoryService.searchItemsByName("NonExistent")).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/inventory/search")
                .param("name", "NonExistent")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        verify(inventoryService, times(1)).searchItemsByName("NonExistent");
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = { "CUSTOMER" })
    @DisplayName("Customer: Should be forbidden from searching items")
    void testSearchItems_AsCustomer_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/inventory/search")
                .param("name", "Brake")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError()); // App returns 500 for auth denied

        verify(inventoryService, never()).searchItemsByName(any());
    }

    // ===================================================================
    // CREATE ITEM TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully create new inventory item")
    void testCreateItem_AsAdmin_Success() throws Exception {
        // Arrange
        when(inventoryService.createItem(any(InventoryItemCreateDTO.class))).thenReturn(itemDTO);

        // Act & Assert
        mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.itemName").value("Brake Pads"))
                .andExpect(jsonPath("$.quantity").value(50));

        verify(inventoryService, times(1)).createItem(any(InventoryItemCreateDTO.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should return 400 when validation fails on create")
    void testCreateItem_ValidationError() throws Exception {
        // Arrange - Invalid DTO (missing required fields)
        InventoryItemCreateDTO invalidDTO = new InventoryItemCreateDTO();
        invalidDTO.setItemName(""); // Invalid - blank
        // Missing other required fields

        // Act & Assert
        mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());

        verify(inventoryService, never()).createItem(any(InventoryItemCreateDTO.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle duplicate item name in same service center")
    void testCreateItem_DuplicateItemName() throws Exception {
        // Arrange
        when(inventoryService.createItem(any(InventoryItemCreateDTO.class)))
                .thenThrow(
                        new IllegalArgumentException("An item with this name already exists in Main Service Center"));

        // Act & Assert
        mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isBadRequest()); // IllegalArgumentException returns 400

        verify(inventoryService, times(1)).createItem(any(InventoryItemCreateDTO.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle invalid service center ID")
    void testCreateItem_InvalidServiceCenter() throws Exception {
        // Arrange
        when(inventoryService.createItem(any(InventoryItemCreateDTO.class)))
                .thenThrow(new RuntimeException("Service center not found with id: " + serviceCenterId));

        // Act & Assert
        mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isInternalServerError());

        verify(inventoryService, times(1)).createItem(any(InventoryItemCreateDTO.class));
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should be forbidden from creating items")
    void testCreateItem_AsEmployee_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isInternalServerError()); // App returns 500 for auth denied

        verify(inventoryService, never()).createItem(any(InventoryItemCreateDTO.class));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = { "CUSTOMER" })
    @DisplayName("Customer: Should be forbidden from creating items")
    void testCreateItem_AsCustomer_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isInternalServerError()); // App returns 500 for auth denied

        verify(inventoryService, never()).createItem(any(InventoryItemCreateDTO.class));
    }

    // ===================================================================
    // UPDATE ITEM TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully update inventory item")
    void testUpdateItem_AsAdmin_Success() throws Exception {
        // Arrange
        InventoryItemDTO updatedItem = new InventoryItemDTO();
        updatedItem.setId(itemId);
        updatedItem.setItemName("Updated Brake Pads");
        updatedItem.setQuantity(60);
        updatedItem.setUnitPrice(new BigDecimal("80.00"));

        when(inventoryService.updateItem(eq(itemId), any(InventoryItemUpdateDTO.class)))
                .thenReturn(updatedItem);

        // Act & Assert
        mockMvc.perform(put("/inventory/{id}", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemName").value("Updated Brake Pads"))
                .andExpect(jsonPath("$.quantity").value(60));

        verify(inventoryService, times(1)).updateItem(eq(itemId), any(InventoryItemUpdateDTO.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle item not found on update")
    void testUpdateItem_NotFound() throws Exception {
        // Arrange
        when(inventoryService.updateItem(eq(itemId), any(InventoryItemUpdateDTO.class)))
                .thenThrow(new RuntimeException("Inventory item not found with id: " + itemId));

        // Act & Assert
        mockMvc.perform(put("/inventory/{id}", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isInternalServerError());

        verify(inventoryService, times(1)).updateItem(eq(itemId), any(InventoryItemUpdateDTO.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle duplicate name when updating")
    void testUpdateItem_DuplicateName() throws Exception {
        // Arrange
        when(inventoryService.updateItem(eq(itemId), any(InventoryItemUpdateDTO.class)))
                .thenThrow(
                        new IllegalArgumentException("An item with this name already exists in Main Service Center"));

        // Act & Assert
        mockMvc.perform(put("/inventory/{id}", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isBadRequest()); // IllegalArgumentException returns 400

        verify(inventoryService, times(1)).updateItem(eq(itemId), any(InventoryItemUpdateDTO.class));
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should be forbidden from updating items")
    void testUpdateItem_AsEmployee_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(put("/inventory/{id}", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isInternalServerError()); // App returns 500 for auth denied

        verify(inventoryService, never()).updateItem(any(UUID.class), any(InventoryItemUpdateDTO.class));
    }

    // ===================================================================
    // RESTOCK ITEM TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully restock item")
    void testRestockItem_AsAdmin_Success() throws Exception {
        // Arrange
        InventoryItemDTO restockedItem = new InventoryItemDTO();
        restockedItem.setId(itemId);
        restockedItem.setItemName("Brake Pads");
        restockedItem.setQuantity(100); // Original 50 + 50

        when(inventoryService.restockItem(eq(itemId), any(InventoryRestockDTO.class)))
                .thenReturn(restockedItem);

        // Act & Assert
        mockMvc.perform(put("/inventory/{id}/restock", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(restockDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(100));

        verify(inventoryService, times(1)).restockItem(eq(itemId), any(InventoryRestockDTO.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should return 400 when restocking with invalid quantity")
    void testRestockItem_InvalidQuantity() throws Exception {
        // Arrange - Invalid quantity (0 or negative)
        InventoryRestockDTO invalidDTO = new InventoryRestockDTO();
        invalidDTO.setQuantity(0); // Invalid

        // Act & Assert
        mockMvc.perform(put("/inventory/{id}/restock", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());

        verify(inventoryService, never()).restockItem(any(UUID.class), any(InventoryRestockDTO.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle item not found when restocking")
    void testRestockItem_NotFound() throws Exception {
        // Arrange
        when(inventoryService.restockItem(eq(itemId), any(InventoryRestockDTO.class)))
                .thenThrow(new RuntimeException("Inventory item not found with id: " + itemId));

        // Act & Assert
        mockMvc.perform(put("/inventory/{id}/restock", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(restockDTO)))
                .andExpect(status().isInternalServerError());

        verify(inventoryService, times(1)).restockItem(eq(itemId), any(InventoryRestockDTO.class));
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should be forbidden from restocking items")
    void testRestockItem_AsEmployee_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(put("/inventory/{id}/restock", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(restockDTO)))
                .andExpect(status().isInternalServerError()); // App returns 500 for auth denied

        verify(inventoryService, never()).restockItem(any(UUID.class), any(InventoryRestockDTO.class));
    }

    // ===================================================================
    // BUY ITEM TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should successfully buy/use item")
    void testBuyItem_AsEmployee_Success() throws Exception {
        // Arrange
        InventoryItemDTO boughtItem = new InventoryItemDTO();
        boughtItem.setId(itemId);
        boughtItem.setItemName("Brake Pads");
        boughtItem.setQuantity(45); // Original 50 - 5

        when(inventoryService.buyItem(eq(itemId), any(InventoryBuyDTO.class)))
                .thenReturn(boughtItem);

        // Act & Assert
        mockMvc.perform(put("/inventory/{id}/buy", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buyDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(45));

        verify(inventoryService, times(1)).buyItem(eq(itemId), any(InventoryBuyDTO.class));
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should handle insufficient stock when buying")
    void testBuyItem_InsufficientStock() throws Exception {
        // Arrange
        when(inventoryService.buyItem(eq(itemId), any(InventoryBuyDTO.class)))
                .thenThrow(new IllegalArgumentException("Insufficient stock. Available: 3, Requested: 5"));

        // Act & Assert
        mockMvc.perform(put("/inventory/{id}/buy", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buyDTO)))
                .andExpect(status().isBadRequest()); // IllegalArgumentException returns 400

        verify(inventoryService, times(1)).buyItem(eq(itemId), any(InventoryBuyDTO.class));
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should return 400 when buying with invalid quantity")
    void testBuyItem_InvalidQuantity() throws Exception {
        // Arrange - Invalid quantity
        InventoryBuyDTO invalidDTO = new InventoryBuyDTO();
        invalidDTO.setQuantity(0); // Invalid

        // Act & Assert
        mockMvc.perform(put("/inventory/{id}/buy", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());

        verify(inventoryService, never()).buyItem(any(UUID.class), any(InventoryBuyDTO.class));
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should handle item not found when buying")
    void testBuyItem_NotFound() throws Exception {
        // Arrange
        when(inventoryService.buyItem(eq(itemId), any(InventoryBuyDTO.class)))
                .thenThrow(new RuntimeException("Inventory item not found with id: " + itemId));

        // Act & Assert
        mockMvc.perform(put("/inventory/{id}/buy", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buyDTO)))
                .andExpect(status().isInternalServerError());

        verify(inventoryService, times(1)).buyItem(eq(itemId), any(InventoryBuyDTO.class));
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should handle item from different service center")
    void testBuyItem_DifferentServiceCenter() throws Exception {
        // Arrange
        when(inventoryService.buyItem(eq(itemId), any(InventoryBuyDTO.class)))
                .thenThrow(new RuntimeException("Inventory item not found with id: " + itemId));

        // Act & Assert
        mockMvc.perform(put("/inventory/{id}/buy", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buyDTO)))
                .andExpect(status().isInternalServerError());

        verify(inventoryService, times(1)).buyItem(eq(itemId), any(InventoryBuyDTO.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should be forbidden from buying items")
    void testBuyItem_AsAdmin_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(put("/inventory/{id}/buy", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buyDTO)))
                .andExpect(status().isInternalServerError()); // App returns 500 for auth denied

        verify(inventoryService, never()).buyItem(any(UUID.class), any(InventoryBuyDTO.class));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = { "CUSTOMER" })
    @DisplayName("Customer: Should be forbidden from buying items")
    void testBuyItem_AsCustomer_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(put("/inventory/{id}/buy", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buyDTO)))
                .andExpect(status().isInternalServerError()); // App returns 500 for auth denied

        verify(inventoryService, never()).buyItem(any(UUID.class), any(InventoryBuyDTO.class));
    }

    // ===================================================================
    // DELETE ITEM TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully delete inventory item")
    void testDeleteItem_AsAdmin_Success() throws Exception {
        // Arrange
        doNothing().when(inventoryService).deleteItem(itemId);

        // Act & Assert
        mockMvc.perform(delete("/inventory/{id}", itemId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Inventory item deleted successfully"))
                .andExpect(jsonPath("$.success").value(true));

        verify(inventoryService, times(1)).deleteItem(itemId);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle item not found when deleting")
    void testDeleteItem_NotFound() throws Exception {
        // Arrange
        doThrow(new RuntimeException("Inventory item not found with id: " + itemId))
                .when(inventoryService).deleteItem(itemId);

        // Act & Assert
        mockMvc.perform(delete("/inventory/{id}", itemId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());

        verify(inventoryService, times(1)).deleteItem(itemId);
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should be forbidden from deleting items")
    void testDeleteItem_AsEmployee_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/inventory/{id}", itemId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError()); // App returns 500 for auth denied

        verify(inventoryService, never()).deleteItem(any(UUID.class));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = { "CUSTOMER" })
    @DisplayName("Customer: Should be forbidden from deleting items")
    void testDeleteItem_AsCustomer_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/inventory/{id}", itemId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError()); // App returns 500 for auth denied

        verify(inventoryService, never()).deleteItem(any(UUID.class));
    }

    // ===================================================================
    // COMPREHENSIVE AUTHORIZATION TESTS
    // ===================================================================

    @Test
    @DisplayName("Should return 401 for all endpoints when not authenticated")
    void testAllEndpoints_Unauthorized() throws Exception {
        // GET all items
        mockMvc.perform(get("/inventory"))
                .andExpect(status().isUnauthorized());

        // GET item by ID
        mockMvc.perform(get("/inventory/{id}", itemId))
                .andExpect(status().isUnauthorized());

        // GET low stock items
        mockMvc.perform(get("/inventory/low-stock"))
                .andExpect(status().isUnauthorized());

        // GET items by category
        mockMvc.perform(get("/inventory/category/Parts"))
                .andExpect(status().isUnauthorized());

        // GET search items
        mockMvc.perform(get("/inventory/search").param("name", "test"))
                .andExpect(status().isUnauthorized());

        // POST create item
        mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isUnauthorized());

        // PUT update item
        mockMvc.perform(put("/inventory/{id}", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isUnauthorized());

        // PUT restock item
        mockMvc.perform(put("/inventory/{id}/restock", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(restockDTO)))
                .andExpect(status().isUnauthorized());

        // PUT buy item
        mockMvc.perform(put("/inventory/{id}/buy", itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buyDTO)))
                .andExpect(status().isUnauthorized());

        // DELETE item
        mockMvc.perform(delete("/inventory/{id}", itemId))
                .andExpect(status().isUnauthorized());

        // Verify service was never called
        verify(inventoryService, never()).getAllItems();
        verify(inventoryService, never()).getItemById(any());
        verify(inventoryService, never()).getLowStockItems();
        verify(inventoryService, never()).getItemsByCategory(any());
        verify(inventoryService, never()).searchItemsByName(any());
        verify(inventoryService, never()).createItem(any());
        verify(inventoryService, never()).updateItem(any(), any());
        verify(inventoryService, never()).restockItem(any(), any());
        verify(inventoryService, never()).buyItem(any(), any());
        verify(inventoryService, never()).deleteItem(any());
    }
}
