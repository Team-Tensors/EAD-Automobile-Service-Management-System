package com.ead.backend.service;

import com.ead.backend.dto.*;
import com.ead.backend.entity.*;
import com.ead.backend.exception.ResourceNotFoundException;
import com.ead.backend.mappers.InventoryItemMapper;
import com.ead.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("Inventory Service Unit Tests")
class InventoryServiceTest {

    @Mock
    private InventoryItemRepository inventoryItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ServiceCenterRepository serviceCenterRepository;

    @Mock
    private EmployeeCenterRepository employeeCenterRepository;

    @Mock
    private InventoryItemMapper inventoryItemMapper;

    @Mock
    private EmailService emailService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private InventoryService inventoryService;

    private User adminUser;
    private User employeeUser;
    private ServiceCenter serviceCenter1;
    private ServiceCenter serviceCenter2;
    private InventoryItem inventoryItem1;
    private InventoryItem inventoryItem2;
    private InventoryItemDTO inventoryItemDTO1;
    private InventoryItemDTO inventoryItemDTO2;
    private EmployeeCenter employeeCenter;
    private Role adminRole;
    private Role employeeRole;
    private UUID serviceCenterId1;
    private UUID serviceCenterId2;
    private UUID itemId1;
    private UUID itemId2;
    private UUID adminUserId;
    private UUID employeeUserId;

    @BeforeEach
    void setUp() {
        // Initialize UUIDs
        serviceCenterId1 = UUID.randomUUID();
        serviceCenterId2 = UUID.randomUUID();
        itemId1 = UUID.randomUUID();
        itemId2 = UUID.randomUUID();
        adminUserId = UUID.randomUUID();
        employeeUserId = UUID.randomUUID();

        // Setup roles
        adminRole = new Role();
        adminRole.setName("ADMIN");

        employeeRole = new Role();
        employeeRole.setName("EMPLOYEE");

        // Setup admin user
        adminUser = new User();
        adminUser.setId(adminUserId);
        adminUser.setEmail("admin@example.com");
        adminUser.setFullName("Admin User");
        adminUser.setRoles(new HashSet<>(Collections.singletonList(adminRole)));

        // Setup employee user
        employeeUser = new User();
        employeeUser.setId(employeeUserId);
        employeeUser.setEmail("employee@example.com");
        employeeUser.setFullName("Employee User");
        employeeUser.setRoles(new HashSet<>(Collections.singletonList(employeeRole)));

        // Setup service centers
        serviceCenter1 = new ServiceCenter();
        serviceCenter1.setId(serviceCenterId1);
        serviceCenter1.setName("Service Center 1");
        serviceCenter1.setAddress("Address 1");
        serviceCenter1.setCity("City 1");
        serviceCenter1.setLatitude(new BigDecimal("40.7128"));
        serviceCenter1.setLongitude(new BigDecimal("-74.0060"));

        serviceCenter2 = new ServiceCenter();
        serviceCenter2.setId(serviceCenterId2);
        serviceCenter2.setName("Service Center 2");
        serviceCenter2.setAddress("Address 2");
        serviceCenter2.setCity("City 2");
        serviceCenter2.setLatitude(new BigDecimal("34.0522"));
        serviceCenter2.setLongitude(new BigDecimal("-118.2437"));

        // Setup employee center
        employeeCenter = new EmployeeCenter();
        employeeCenter.setEmployee(employeeUser);
        employeeCenter.setServiceCenter(serviceCenter1);

        // Setup inventory items
        inventoryItem1 = new InventoryItem();
        inventoryItem1.setId(itemId1);
        inventoryItem1.setItemName("Engine Oil");
        inventoryItem1.setDescription("Premium synthetic oil");
        inventoryItem1.setQuantity(50);
        inventoryItem1.setUnitPrice(new BigDecimal("25.99"));
        inventoryItem1.setCategory("Lubricant");
        inventoryItem1.setMinStock(20);
        inventoryItem1.setServiceCenter(serviceCenter1);
        inventoryItem1.setCreatedBy(adminUser);
        inventoryItem1.setCreatedAt(LocalDateTime.now());
        inventoryItem1.setLastUpdated(LocalDateTime.now());

        inventoryItem2 = new InventoryItem();
        inventoryItem2.setId(itemId2);
        inventoryItem2.setItemName("Air Filter");
        inventoryItem2.setDescription("High-efficiency air filter");
        inventoryItem2.setQuantity(5);
        inventoryItem2.setUnitPrice(new BigDecimal("15.50"));
        inventoryItem2.setCategory("Filter");
        inventoryItem2.setMinStock(10);
        inventoryItem2.setServiceCenter(serviceCenter2);
        inventoryItem2.setCreatedBy(adminUser);
        inventoryItem2.setCreatedAt(LocalDateTime.now());
        inventoryItem2.setLastUpdated(LocalDateTime.now());

        // Setup DTOs
        inventoryItemDTO1 = new InventoryItemDTO();
        inventoryItemDTO1.setId(itemId1);
        inventoryItemDTO1.setItemName("Engine Oil");
        inventoryItemDTO1.setDescription("Premium synthetic oil");
        inventoryItemDTO1.setQuantity(50);
        inventoryItemDTO1.setUnitPrice(new BigDecimal("25.99"));
        inventoryItemDTO1.setCategory("Lubricant");
        inventoryItemDTO1.setMinStock(20);
        inventoryItemDTO1.setServiceCenterId(serviceCenterId1);
        inventoryItemDTO1.setServiceCenterName("Service Center 1");
        inventoryItemDTO1.setCreatedByName("Admin User");
        inventoryItemDTO1.setLowStock(false);

        inventoryItemDTO2 = new InventoryItemDTO();
        inventoryItemDTO2.setId(itemId2);
        inventoryItemDTO2.setItemName("Air Filter");
        inventoryItemDTO2.setDescription("High-efficiency air filter");
        inventoryItemDTO2.setQuantity(5);
        inventoryItemDTO2.setUnitPrice(new BigDecimal("15.50"));
        inventoryItemDTO2.setCategory("Filter");
        inventoryItemDTO2.setMinStock(10);
        inventoryItemDTO2.setServiceCenterId(serviceCenterId2);
        inventoryItemDTO2.setServiceCenterName("Service Center 2");
        inventoryItemDTO2.setCreatedByName("Admin User");
        inventoryItemDTO2.setLowStock(true);

        // Mock security context
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    // ===================================================================
    // GET ALL ITEMS TESTS
    // ===================================================================

    @Nested
    @DisplayName("Get All Items Tests")
    class GetAllItemsTests {

        @Test
        @DisplayName("Admin should get all items from all service centers")
        void testGetAllItems_Admin_Success() {
            // Arrange
            when(authentication.getName()).thenReturn("admin@example.com");
            when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
            when(inventoryItemRepository.findAll()).thenReturn(Arrays.asList(inventoryItem1, inventoryItem2));
            when(inventoryItemMapper.toDTO(inventoryItem1)).thenReturn(inventoryItemDTO1);
            when(inventoryItemMapper.toDTO(inventoryItem2)).thenReturn(inventoryItemDTO2);

            // Act
            List<InventoryItemDTO> result = inventoryService.getAllItems();

            // Assert
            assertNotNull(result);
            assertEquals(2, result.size());
            verify(inventoryItemRepository, times(1)).findAll();
            verify(inventoryItemRepository, never()).findByServiceCenterId(any());
        }

        @Test
        @DisplayName("Employee should get only items from their service center")
        void testGetAllItems_Employee_Success() {
            // Arrange
            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findByServiceCenterId(serviceCenterId1))
                    .thenReturn(Collections.singletonList(inventoryItem1));
            when(inventoryItemMapper.toDTO(inventoryItem1)).thenReturn(inventoryItemDTO1);

            // Act
            List<InventoryItemDTO> result = inventoryService.getAllItems();

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Engine Oil", result.get(0).getItemName());
            verify(inventoryItemRepository, times(1)).findByServiceCenterId(serviceCenterId1);
            verify(inventoryItemRepository, never()).findAll();
        }

        @Test
        @DisplayName("Should throw exception when employee not assigned to service center")
        void testGetAllItems_Employee_NotAssigned() {
            // Arrange
            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.empty());

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
                inventoryService.getAllItems();
            });
            assertEquals("Employee is not assigned to any service center. Please contact administrator.",
                    exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void testGetAllItems_UserNotFound() {
            // Arrange
            when(authentication.getName()).thenReturn("unknown@example.com");
            when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
                inventoryService.getAllItems();
            });
            assertEquals("User not found", exception.getMessage());
        }
    }

    // ===================================================================
    // GET ITEM BY ID TESTS
    // ===================================================================

    @Nested
    @DisplayName("Get Item By ID Tests")
    class GetItemByIdTests {

        @Test
        @DisplayName("Admin should get any item by ID")
        void testGetItemById_Admin_Success() {
            // Arrange
            when(authentication.getName()).thenReturn("admin@example.com");
            when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));
            when(inventoryItemMapper.toDTO(inventoryItem1)).thenReturn(inventoryItemDTO1);

            // Act
            InventoryItemDTO result = inventoryService.getItemById(itemId1);

            // Assert
            assertNotNull(result);
            assertEquals("Engine Oil", result.getItemName());
            verify(inventoryItemRepository, times(1)).findById(itemId1);
        }

        @Test
        @DisplayName("Employee should get item from their service center")
        void testGetItemById_Employee_Success() {
            // Arrange
            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));
            when(inventoryItemMapper.toDTO(inventoryItem1)).thenReturn(inventoryItemDTO1);

            // Act
            InventoryItemDTO result = inventoryService.getItemById(itemId1);

            // Assert
            assertNotNull(result);
            assertEquals("Engine Oil", result.getItemName());
            verify(inventoryItemRepository, times(1)).findById(itemId1);
        }

        @Test
        @DisplayName("Employee should not get item from different service center")
        void testGetItemById_Employee_DifferentServiceCenter() {
            // Arrange
            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findById(itemId2)).thenReturn(Optional.of(inventoryItem2));

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
                inventoryService.getItemById(itemId2);
            });
            assertEquals("Inventory item not found with id: " + itemId2, exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when item not found")
        void testGetItemById_NotFound() {
            // Arrange
            UUID nonExistentId = UUID.randomUUID();
            when(inventoryItemRepository.findById(nonExistentId)).thenReturn(Optional.empty());

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
                inventoryService.getItemById(nonExistentId);
            });
            assertEquals("Inventory item not found with id: " + nonExistentId, exception.getMessage());
        }
    }

    // ===================================================================
    // GET LOW STOCK ITEMS TESTS
    // ===================================================================

    @Nested
    @DisplayName("Get Low Stock Items Tests")
    class GetLowStockItemsTests {

        @Test
        @DisplayName("Admin should get all low stock items")
        void testGetLowStockItems_Admin_Success() {
            // Arrange
            when(authentication.getName()).thenReturn("admin@example.com");
            when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
            when(inventoryItemRepository.findLowStockItems())
                    .thenReturn(Collections.singletonList(inventoryItem2));
            when(inventoryItemMapper.toDTO(inventoryItem2)).thenReturn(inventoryItemDTO2);

            // Act
            List<InventoryItemDTO> result = inventoryService.getLowStockItems();

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertTrue(result.get(0).isLowStock());
            verify(inventoryItemRepository, times(1)).findLowStockItems();
        }

        @Test
        @DisplayName("Employee should get low stock items from their service center")
        void testGetLowStockItems_Employee_Success() {
            // Arrange
            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findLowStockItemsByServiceCenterId(serviceCenterId1))
                    .thenReturn(Collections.emptyList());

            // Act
            List<InventoryItemDTO> result = inventoryService.getLowStockItems();

            // Assert
            assertNotNull(result);
            assertEquals(0, result.size());
            verify(inventoryItemRepository, times(1))
                    .findLowStockItemsByServiceCenterId(serviceCenterId1);
        }
    }

    // ===================================================================
    // GET ITEMS BY CATEGORY TESTS
    // ===================================================================

    @Nested
    @DisplayName("Get Items By Category Tests")
    class GetItemsByCategoryTests {

        @Test
        @DisplayName("Admin should get all items by category")
        void testGetItemsByCategory_Admin_Success() {
            // Arrange
            when(authentication.getName()).thenReturn("admin@example.com");
            when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
            when(inventoryItemRepository.findByCategory("Lubricant"))
                    .thenReturn(Collections.singletonList(inventoryItem1));
            when(inventoryItemMapper.toDTO(inventoryItem1)).thenReturn(inventoryItemDTO1);

            // Act
            List<InventoryItemDTO> result = inventoryService.getItemsByCategory("Lubricant");

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Lubricant", result.get(0).getCategory());
            verify(inventoryItemRepository, times(1)).findByCategory("Lubricant");
        }

        @Test
        @DisplayName("Employee should get items by category from their service center")
        void testGetItemsByCategory_Employee_Success() {
            // Arrange
            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findByCategoryAndServiceCenterId("Lubricant", serviceCenterId1))
                    .thenReturn(Collections.singletonList(inventoryItem1));
            when(inventoryItemMapper.toDTO(inventoryItem1)).thenReturn(inventoryItemDTO1);

            // Act
            List<InventoryItemDTO> result = inventoryService.getItemsByCategory("Lubricant");

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Lubricant", result.get(0).getCategory());
            verify(inventoryItemRepository, times(1))
                    .findByCategoryAndServiceCenterId("Lubricant", serviceCenterId1);
        }
    }

    // ===================================================================
    // SEARCH ITEMS BY NAME TESTS
    // ===================================================================

    @Nested
    @DisplayName("Search Items By Name Tests")
    class SearchItemsByNameTests {

        @Test
        @DisplayName("Admin should search all items by name")
        void testSearchItemsByName_Admin_Success() {
            // Arrange
            when(authentication.getName()).thenReturn("admin@example.com");
            when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
            when(inventoryItemRepository.findByItemNameContainingIgnoreCase("oil"))
                    .thenReturn(Collections.singletonList(inventoryItem1));
            when(inventoryItemMapper.toDTO(inventoryItem1)).thenReturn(inventoryItemDTO1);

            // Act
            List<InventoryItemDTO> result = inventoryService.searchItemsByName("oil");

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertTrue(result.get(0).getItemName().toLowerCase().contains("oil"));
            verify(inventoryItemRepository, times(1))
                    .findByItemNameContainingIgnoreCase("oil");
        }

        @Test
        @DisplayName("Employee should search items from their service center")
        void testSearchItemsByName_Employee_Success() {
            // Arrange
            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findByItemNameContainingIgnoreCaseAndServiceCenterId("oil", serviceCenterId1))
                    .thenReturn(Collections.singletonList(inventoryItem1));
            when(inventoryItemMapper.toDTO(inventoryItem1)).thenReturn(inventoryItemDTO1);

            // Act
            List<InventoryItemDTO> result = inventoryService.searchItemsByName("oil");

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            verify(inventoryItemRepository, times(1))
                    .findByItemNameContainingIgnoreCaseAndServiceCenterId("oil", serviceCenterId1);
        }
    }

    // ===================================================================
    // CREATE ITEM TESTS
    // ===================================================================

    @Nested
    @DisplayName("Create Item Tests")
    class CreateItemTests {

        private InventoryItemCreateDTO createDTO;

        @BeforeEach
        void setUp() {
            createDTO = new InventoryItemCreateDTO();
            createDTO.setItemName("Brake Pad");
            createDTO.setDescription("High-quality brake pad");
            createDTO.setQuantity(30);
            createDTO.setUnitPrice(new BigDecimal("45.00"));
            createDTO.setCategory("Brake Component");
            createDTO.setMinStock(15);
            createDTO.setServiceCenterId(serviceCenterId1);
        }

        @Test
        @DisplayName("Should successfully create inventory item")
        void testCreateItem_Success() {
            // Arrange
            when(authentication.getName()).thenReturn("admin@example.com");
            when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
            when(serviceCenterRepository.findById(serviceCenterId1))
                    .thenReturn(Optional.of(serviceCenter1));
            when(inventoryItemRepository.existsByItemNameIgnoreCaseAndServiceCenterId("Brake Pad", serviceCenterId1))
                    .thenReturn(false);
            when(inventoryItemRepository.save(any(InventoryItem.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(inventoryItemMapper.toDTO(any(InventoryItem.class))).thenReturn(inventoryItemDTO1);

            // Act
            InventoryItemDTO result = inventoryService.createItem(createDTO);

            // Assert
            assertNotNull(result);
            verify(inventoryItemRepository, times(1)).save(any(InventoryItem.class));
            verify(serviceCenterRepository, times(1)).findById(serviceCenterId1);
        }

        @Test
        @DisplayName("Should throw exception when service center not found")
        void testCreateItem_ServiceCenterNotFound() {
            // Arrange
            when(serviceCenterRepository.findById(serviceCenterId1)).thenReturn(Optional.empty());

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
                inventoryService.createItem(createDTO);
            });
            assertEquals("Service center not found with id: " + serviceCenterId1, exception.getMessage());
            verify(inventoryItemRepository, never()).save(any(InventoryItem.class));
        }

        @Test
        @DisplayName("Should throw exception when duplicate item name in same service center")
        void testCreateItem_DuplicateName() {
            // Arrange
            when(serviceCenterRepository.findById(serviceCenterId1))
                    .thenReturn(Optional.of(serviceCenter1));
            when(inventoryItemRepository.existsByItemNameIgnoreCaseAndServiceCenterId("Brake Pad", serviceCenterId1))
                    .thenReturn(true);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
                inventoryService.createItem(createDTO);
            });
            assertEquals("An item with this name already exists in Service Center 1", exception.getMessage());
            verify(inventoryItemRepository, never()).save(any(InventoryItem.class));
        }
    }

    // ===================================================================
    // UPDATE ITEM TESTS
    // ===================================================================

    @Nested
    @DisplayName("Update Item Tests")
    class UpdateItemTests {

        private InventoryItemUpdateDTO updateDTO;

        @BeforeEach
        void setUp() {
            updateDTO = new InventoryItemUpdateDTO();
            updateDTO.setItemName("Premium Engine Oil");
            updateDTO.setDescription("Ultra premium synthetic oil");
            updateDTO.setQuantity(60);
            updateDTO.setUnitPrice(new BigDecimal("29.99"));
            updateDTO.setCategory("Lubricant");
        }

        @Test
        @DisplayName("Should successfully update inventory item")
        void testUpdateItem_Success() {
            // Arrange
            when(authentication.getName()).thenReturn("admin@example.com");
            when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));
            when(inventoryItemRepository.existsByItemNameIgnoreCaseAndServiceCenterId(
                    "Premium Engine Oil", serviceCenterId1)).thenReturn(false);
            when(inventoryItemRepository.save(any(InventoryItem.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(inventoryItemMapper.toDTO(any(InventoryItem.class))).thenReturn(inventoryItemDTO1);

            // Act
            InventoryItemDTO result = inventoryService.updateItem(itemId1, updateDTO);

            // Assert
            assertNotNull(result);
            verify(inventoryItemRepository, times(1)).save(any(InventoryItem.class));
        }

        @Test
        @DisplayName("Should throw exception when item not found")
        void testUpdateItem_NotFound() {
            // Arrange
            UUID nonExistentId = UUID.randomUUID();
            when(inventoryItemRepository.findById(nonExistentId)).thenReturn(Optional.empty());

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
                inventoryService.updateItem(nonExistentId, updateDTO);
            });
            assertEquals("Inventory item not found with id: " + nonExistentId, exception.getMessage());
            verify(inventoryItemRepository, never()).save(any(InventoryItem.class));
        }

        @Test
        @DisplayName("Should throw exception when updating to duplicate name")
        void testUpdateItem_DuplicateName() {
            // Arrange
            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));
            when(inventoryItemRepository.existsByItemNameIgnoreCaseAndServiceCenterId(
                    "Premium Engine Oil", serviceCenterId1)).thenReturn(true);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
                inventoryService.updateItem(itemId1, updateDTO);
            });
            assertEquals("An item with this name already exists in Service Center 1", exception.getMessage());
            verify(inventoryItemRepository, never()).save(any(InventoryItem.class));
        }

        @Test
        @DisplayName("Should update only provided fields")
        void testUpdateItem_PartialUpdate() {
            // Arrange
            InventoryItemUpdateDTO partialDTO = new InventoryItemUpdateDTO();
            partialDTO.setQuantity(100);

            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));
            when(inventoryItemRepository.save(any(InventoryItem.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(inventoryItemMapper.toDTO(any(InventoryItem.class))).thenReturn(inventoryItemDTO1);

            // Act
            InventoryItemDTO result = inventoryService.updateItem(itemId1, partialDTO);

            // Assert
            assertNotNull(result);
            verify(inventoryItemRepository, times(1)).save(any(InventoryItem.class));
        }

        @Test
        @DisplayName("Should send low stock alert when quantity reduced below minimum")
        void testUpdateItem_LowStockAlert() {
            // Arrange
            InventoryItemUpdateDTO lowStockDTO = new InventoryItemUpdateDTO();
            lowStockDTO.setQuantity(5); // Below minStock of 20

            // Create a copy of inventoryItem1 with low stock
            InventoryItem lowStockItem = new InventoryItem();
            lowStockItem.setId(itemId1);
            lowStockItem.setItemName("Engine Oil");
            lowStockItem.setQuantity(5);
            lowStockItem.setMinStock(20);
            lowStockItem.setCategory("Lubricant");
            lowStockItem.setServiceCenter(serviceCenter1);

            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));
            when(inventoryItemRepository.save(any(InventoryItem.class))).thenAnswer(invocation -> {
                InventoryItem item = invocation.getArgument(0);
                item.setQuantity(5);
                return item;
            });
            when(inventoryItemMapper.toDTO(any(InventoryItem.class))).thenReturn(inventoryItemDTO1);
            when(userRepository.findByRoleName("ADMIN")).thenReturn(Collections.singletonList(adminUser));
            doNothing().when(emailService).sendLowStockAlert(any(), any(), any(), anyInt(), anyInt(), any());

            // Act
            inventoryService.updateItem(itemId1, lowStockDTO);

            // Assert
            verify(emailService, times(1)).sendLowStockAlert(
                    eq("admin@example.com"),
                    eq("Admin User"),
                    eq("Engine Oil"),
                    eq(5),
                    eq(20),
                    eq("Lubricant"));
        }
    }

    // ===================================================================
    // RESTOCK ITEM TESTS
    // ===================================================================

    @Nested
    @DisplayName("Restock Item Tests")
    class RestockItemTests {

        private InventoryRestockDTO restockDTO;

        @BeforeEach
        void setUp() {
            restockDTO = new InventoryRestockDTO();
            restockDTO.setQuantity(50);
        }

        @Test
        @DisplayName("Should successfully restock inventory item")
        void testRestockItem_Success() {
            // Arrange
            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));
            when(inventoryItemRepository.save(any(InventoryItem.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(inventoryItemMapper.toDTO(any(InventoryItem.class))).thenReturn(inventoryItemDTO1);

            int originalQuantity = inventoryItem1.getQuantity();

            // Act
            InventoryItemDTO result = inventoryService.restockItem(itemId1, restockDTO);

            // Assert
            assertNotNull(result);
            assertEquals(originalQuantity + 50, inventoryItem1.getQuantity());
            verify(inventoryItemRepository, times(1)).save(any(InventoryItem.class));
        }

        @Test
        @DisplayName("Should throw exception when item not found for restock")
        void testRestockItem_NotFound() {
            // Arrange
            UUID nonExistentId = UUID.randomUUID();
            when(inventoryItemRepository.findById(nonExistentId)).thenReturn(Optional.empty());

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
                inventoryService.restockItem(nonExistentId, restockDTO);
            });
            assertEquals("Inventory item not found with id: " + nonExistentId, exception.getMessage());
            verify(inventoryItemRepository, never()).save(any(InventoryItem.class));
        }
    }

    // ===================================================================
    // BUY ITEM TESTS
    // ===================================================================

    @Nested
    @DisplayName("Buy Item Tests")
    class BuyItemTests {

        private InventoryBuyDTO buyDTO;

        @BeforeEach
        void setUp() {
            buyDTO = new InventoryBuyDTO();
            buyDTO.setQuantity(10);
        }

        @Test
        @DisplayName("Employee should successfully buy item from their service center")
        void testBuyItem_Employee_Success() {
            // Arrange
            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));
            when(inventoryItemRepository.save(any(InventoryItem.class))).thenReturn(inventoryItem1);
            when(inventoryItemMapper.toDTO(inventoryItem1)).thenReturn(inventoryItemDTO1);

            int originalQuantity = inventoryItem1.getQuantity();

            // Act
            InventoryItemDTO result = inventoryService.buyItem(itemId1, buyDTO);

            // Assert
            assertNotNull(result);
            assertEquals(originalQuantity - 10, inventoryItem1.getQuantity());
            verify(inventoryItemRepository, times(1)).save(any(InventoryItem.class));
        }

        @Test
        @DisplayName("Should throw exception when insufficient stock")
        void testBuyItem_InsufficientStock() {
            // Arrange
            InventoryBuyDTO largeOrderDTO = new InventoryBuyDTO();
            largeOrderDTO.setQuantity(100); // More than available

            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
                inventoryService.buyItem(itemId1, largeOrderDTO);
            });
            assertTrue(exception.getMessage().contains("Insufficient stock"));
            verify(inventoryItemRepository, never()).save(any(InventoryItem.class));
        }

        @Test
        @DisplayName("Employee should not buy item from different service center")
        void testBuyItem_Employee_DifferentServiceCenter() {
            // Arrange
            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findById(itemId2)).thenReturn(Optional.of(inventoryItem2));

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
                inventoryService.buyItem(itemId2, buyDTO);
            });
            assertEquals("Inventory item not found with id: " + itemId2, exception.getMessage());
        }

        @Test
        @DisplayName("Should send low stock alert when buying reduces stock below minimum")
        void testBuyItem_LowStockAlert() {
            // Arrange
            InventoryBuyDTO smallBuyDTO = new InventoryBuyDTO();
            smallBuyDTO.setQuantity(35); // Will bring stock from 50 to 15, below minStock of 20

            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));
            when(inventoryItemRepository.save(any(InventoryItem.class))).thenAnswer(invocation -> {
                InventoryItem item = invocation.getArgument(0);
                return item;
            });
            when(inventoryItemMapper.toDTO(any(InventoryItem.class))).thenReturn(inventoryItemDTO1);
            when(userRepository.findByRoleName("ADMIN")).thenReturn(Collections.singletonList(adminUser));
            doNothing().when(emailService).sendLowStockAlert(any(), any(), any(), anyInt(), anyInt(), any());

            // Act
            inventoryService.buyItem(itemId1, smallBuyDTO);

            // Assert
            verify(emailService, times(1)).sendLowStockAlert(
                    eq("admin@example.com"),
                    any(),
                    eq("Engine Oil"),
                    eq(15),
                    eq(20),
                    eq("Lubricant"));
        }

        @Test
        @DisplayName("Should handle email service failure gracefully during low stock alert")
        void testBuyItem_EmailFailure() {
            // Arrange
            InventoryBuyDTO smallBuyDTO = new InventoryBuyDTO();
            smallBuyDTO.setQuantity(35); // Will bring stock from 50 to 15, below minStock of 20

            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));
            when(inventoryItemRepository.save(any(InventoryItem.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(inventoryItemMapper.toDTO(any(InventoryItem.class))).thenReturn(inventoryItemDTO1);
            when(userRepository.findByRoleName("ADMIN")).thenReturn(Collections.singletonList(adminUser));
            doThrow(new RuntimeException("Email service down")).when(emailService)
                    .sendLowStockAlert(any(), any(), any(), anyInt(), anyInt(), any());

            // Act - Should not throw exception
            InventoryItemDTO result = inventoryService.buyItem(itemId1, smallBuyDTO);

            // Assert
            assertNotNull(result);
            verify(inventoryItemRepository, times(1)).save(any(InventoryItem.class));
        }
    }

    // ===================================================================
    // DELETE ITEM TESTS
    // ===================================================================

    @Nested
    @DisplayName("Delete Item Tests")
    class DeleteItemTests {

        @Test
        @DisplayName("Should successfully delete inventory item")
        void testDeleteItem_Success() {
            // Arrange
            when(inventoryItemRepository.existsById(itemId1)).thenReturn(true);
            doNothing().when(inventoryItemRepository).deleteById(itemId1);

            // Act
            inventoryService.deleteItem(itemId1);

            // Assert
            verify(inventoryItemRepository, times(1)).deleteById(itemId1);
        }

        @Test
        @DisplayName("Should throw exception when deleting non-existent item")
        void testDeleteItem_NotFound() {
            // Arrange
            UUID nonExistentId = UUID.randomUUID();
            when(inventoryItemRepository.existsById(nonExistentId)).thenReturn(false);

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
                inventoryService.deleteItem(nonExistentId);
            });
            assertEquals("Inventory item not found with id: " + nonExistentId, exception.getMessage());
            verify(inventoryItemRepository, never()).deleteById(any());
        }
    }

    // ===================================================================
    // LOW STOCK ALERT TESTS
    // ===================================================================

    @Nested
    @DisplayName("Low Stock Alert Tests")
    class LowStockAlertTests {

        @Test
        @DisplayName("Should send low stock alert to multiple admins")
        void testLowStockAlert_MultipleAdmins() {
            // Arrange
            User admin2 = new User();
            admin2.setId(UUID.randomUUID());
            admin2.setEmail("admin2@example.com");
            admin2.setFullName("Admin User 2");
            admin2.setRoles(new HashSet<>(Collections.singletonList(adminRole)));

            InventoryBuyDTO buyDTO = new InventoryBuyDTO();
            buyDTO.setQuantity(35); // Will bring stock from 50 to 15, below minStock of 20

            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));
            when(inventoryItemRepository.save(any(InventoryItem.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(inventoryItemMapper.toDTO(any(InventoryItem.class))).thenReturn(inventoryItemDTO1);
            when(userRepository.findByRoleName("ADMIN")).thenReturn(Arrays.asList(adminUser, admin2));
            doNothing().when(emailService).sendLowStockAlert(any(), any(), any(), anyInt(), anyInt(), any());

            // Act
            inventoryService.buyItem(itemId1, buyDTO);

            // Assert
            verify(emailService, times(2)).sendLowStockAlert(any(), any(), any(), anyInt(), anyInt(), any());
        }

        @Test
        @DisplayName("Should not send alert when stock is above minimum")
        void testNoLowStockAlert_StockAboveMinimum() {
            // Arrange
            InventoryBuyDTO buyDTO = new InventoryBuyDTO();
            buyDTO.setQuantity(5); // Will keep stock at 45, above minStock of 20

            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));
            when(inventoryItemRepository.save(any(InventoryItem.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(inventoryItemMapper.toDTO(any(InventoryItem.class))).thenReturn(inventoryItemDTO1);

            // Act
            inventoryService.buyItem(itemId1, buyDTO);

            // Assert
            verify(emailService, never()).sendLowStockAlert(any(), any(), any(), anyInt(), anyInt(), any());
        }

        @Test
        @DisplayName("Should handle case when no admin users exist")
        void testLowStockAlert_NoAdmins() {
            // Arrange
            InventoryBuyDTO buyDTO = new InventoryBuyDTO();
            buyDTO.setQuantity(35); // Will bring stock from 50 to 15, below minStock of 20

            when(authentication.getName()).thenReturn("employee@example.com");
            when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employeeUser));
            when(employeeCenterRepository.findByEmployeeId(employeeUserId))
                    .thenReturn(Optional.of(employeeCenter));
            when(inventoryItemRepository.findById(itemId1)).thenReturn(Optional.of(inventoryItem1));
            when(inventoryItemRepository.save(any(InventoryItem.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(inventoryItemMapper.toDTO(any(InventoryItem.class))).thenReturn(inventoryItemDTO1);
            when(userRepository.findByRoleName("ADMIN")).thenReturn(Collections.emptyList());

            // Act - Should not throw exception
            InventoryItemDTO result = inventoryService.buyItem(itemId1, buyDTO);

            // Assert
            assertNotNull(result);
            verify(emailService, never()).sendLowStockAlert(any(), any(), any(), anyInt(), anyInt(), any());
        }
    }
}
