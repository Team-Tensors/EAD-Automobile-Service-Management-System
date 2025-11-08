package com.ead.backend.integration;

import com.ead.backend.dto.*;
import com.ead.backend.entity.*;
import com.ead.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@DisplayName("Inventory System Integration Tests")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class InventoryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private ServiceCenterRepository serviceCenterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EmployeeCenterRepository employeeCenterRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private ServiceCenter testServiceCenter1;
    private ServiceCenter testServiceCenter2;
    private User adminUser;
    private User employeeUser;
    private Role adminRole;
    private Role employeeRole;
    private InventoryItem testItem;

    @BeforeEach
    void setUp() {
        // Clean up database
        employeeCenterRepository.deleteAll();
        inventoryItemRepository.deleteAll();
        userRepository.deleteAll();
        serviceCenterRepository.deleteAll();

        // Create roles
        adminRole = roleRepository.findByName("ADMIN")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ADMIN");
                    return roleRepository.save(role);
                });

        employeeRole = roleRepository.findByName("EMPLOYEE")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("EMPLOYEE");
                    return roleRepository.save(role);
                });

        // Create service centers
        testServiceCenter1 = new ServiceCenter();
        testServiceCenter1.setName("Downtown Service Center");
        testServiceCenter1.setAddress("123 Main St");
        testServiceCenter1.setCity("Colombo");
        testServiceCenter1.setLatitude(new BigDecimal("6.9271"));
        testServiceCenter1.setLongitude(new BigDecimal("79.8612"));
        testServiceCenter1.setPhone("111-222-3333");
        testServiceCenter1.setEmail("downtown@service.com");
        testServiceCenter1.setIsActive(true);
        testServiceCenter1.setCenterSlot(2);
        testServiceCenter1 = serviceCenterRepository.save(testServiceCenter1);

        testServiceCenter2 = new ServiceCenter();
        testServiceCenter2.setName("Uptown Service Center");
        testServiceCenter2.setAddress("456 Oak Ave");
        testServiceCenter2.setCity("Kandy");
        testServiceCenter2.setLatitude(new BigDecimal("7.2906"));
        testServiceCenter2.setLongitude(new BigDecimal("80.6337"));
        testServiceCenter2.setPhone("444-555-6666");
        testServiceCenter2.setEmail("uptown@service.com");
        testServiceCenter2.setIsActive(true);
        testServiceCenter2.setCenterSlot(2);
        testServiceCenter2 = serviceCenterRepository.save(testServiceCenter2);

        // Create admin user
        adminUser = new User();
        adminUser.setEmail("admin@test.com");
        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setFullName("Admin User");
        adminUser.setPhoneNumber("1234567890");
        adminUser.setActive(true);
        adminUser.setRoles(Set.of(adminRole));
        adminUser = userRepository.save(adminUser);

        // Create employee user
        employeeUser = new User();
        employeeUser.setEmail("employee@test.com");
        employeeUser.setPassword(passwordEncoder.encode("employee123"));
        employeeUser.setFullName("Employee User");
        employeeUser.setPhoneNumber("0987654321");
        employeeUser.setActive(true);
        employeeUser.setRoles(Set.of(employeeRole));
        employeeUser = userRepository.save(employeeUser);

        // Assign employee to service center 1
        EmployeeCenter employeeCenter = new EmployeeCenter();
        employeeCenter.setEmployee(employeeUser);
        employeeCenter.setServiceCenter(testServiceCenter1);
        employeeCenterRepository.save(employeeCenter);

        // Create test inventory item
        testItem = new InventoryItem();
        testItem.setItemName("Engine Oil 5W-30");
        testItem.setDescription("Premium synthetic engine oil");
        testItem.setQuantity(50);
        testItem.setUnitPrice(new BigDecimal("25.99"));
        testItem.setCategory("Lubricant");
        testItem.setMinStock(10);
        testItem.setServiceCenter(testServiceCenter1);
        testItem.setCreatedBy(adminUser);
        testItem = inventoryItemRepository.save(testItem);
    }

    // ==================== CREATE ITEM TESTS ====================

    @Test
    @Order(1)
    @DisplayName("Integration: Admin creates new inventory item successfully")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testAdminCreateInventoryItem() throws Exception {
        InventoryItemCreateDTO createDTO = new InventoryItemCreateDTO();
        createDTO.setItemName("Air Filter");
        createDTO.setDescription("High-performance air filter");
        createDTO.setQuantity(100);
        createDTO.setUnitPrice(new BigDecimal("15.50"));
        createDTO.setCategory("Filter");
        createDTO.setMinStock(20);
        createDTO.setServiceCenterId(testServiceCenter1.getId());

        MvcResult result = mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.itemName").value("Air Filter"))
                .andExpect(jsonPath("$.description").value("High-performance air filter"))
                .andExpect(jsonPath("$.quantity").value(100))
                .andExpect(jsonPath("$.unitPrice").value(15.50))
                .andExpect(jsonPath("$.category").value("Filter"))
                .andExpect(jsonPath("$.minStock").value(20))
                .andExpect(jsonPath("$.serviceCenterName").value("Downtown Service Center"))
                .andExpect(jsonPath("$.id").exists())
                .andReturn();

        // Verify in database
        String responseContent = result.getResponse().getContentAsString();
        InventoryItemDTO responseDTO = objectMapper.readValue(responseContent, InventoryItemDTO.class);

        InventoryItem savedItem = inventoryItemRepository.findById(responseDTO.getId()).orElse(null);
        assertNotNull(savedItem);
        assertEquals("Air Filter", savedItem.getItemName());
        assertEquals(100, savedItem.getQuantity());
    }

    @Test
    @Order(2)
    @DisplayName("Integration: Prevent duplicate item name in same service center")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testPreventDuplicateItemNameInSameServiceCenter() throws Exception {
        // Try to create item with existing name in same service center
        InventoryItemCreateDTO createDTO = new InventoryItemCreateDTO();
        createDTO.setItemName("Engine Oil 5W-30"); // Already exists
        createDTO.setDescription("Another engine oil");
        createDTO.setQuantity(30);
        createDTO.setUnitPrice(new BigDecimal("22.99"));
        createDTO.setCategory("Lubricant");
        createDTO.setMinStock(5);
        createDTO.setServiceCenterId(testServiceCenter1.getId());

        mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("already exists")));
    }

    @Test
    @Order(3)
    @DisplayName("Integration: Allow same item name in different service centers")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testAllowSameItemNameInDifferentServiceCenters() throws Exception {
        // Create item with same name in different service center
        InventoryItemCreateDTO createDTO = new InventoryItemCreateDTO();
        createDTO.setItemName("Engine Oil 5W-30"); // Same name but different service center
        createDTO.setDescription("Engine oil for uptown center");
        createDTO.setQuantity(40);
        createDTO.setUnitPrice(new BigDecimal("26.99"));
        createDTO.setCategory("Lubricant");
        createDTO.setMinStock(8);
        createDTO.setServiceCenterId(testServiceCenter2.getId());

        mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.itemName").value("Engine Oil 5W-30"))
                .andExpect(jsonPath("$.serviceCenterName").value("Uptown Service Center"));
    }

    @Test
    @Order(4)
    @DisplayName("Integration: Validate required fields when creating item")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testCreateItemValidation() throws Exception {
        InventoryItemCreateDTO createDTO = new InventoryItemCreateDTO();
        // Missing required fields

        mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isBadRequest());
    }

    // ==================== GET ALL ITEMS TESTS ====================

    @Test
    @Order(5)
    @DisplayName("Integration: Admin gets all inventory items across all service centers")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testAdminGetAllItems() throws Exception {
        // Create items in different service centers
        InventoryItem item2 = new InventoryItem();
        item2.setItemName("Brake Pads");
        item2.setDescription("High-quality brake pads");
        item2.setQuantity(30);
        item2.setUnitPrice(new BigDecimal("45.00"));
        item2.setCategory("Brake Component");
        item2.setMinStock(5);
        item2.setServiceCenter(testServiceCenter2);
        item2.setCreatedBy(adminUser);
        inventoryItemRepository.save(item2);

        mockMvc.perform(get("/inventory")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[*].itemName", hasItem("Engine Oil 5W-30")))
                .andExpect(jsonPath("$[*].itemName", hasItem("Brake Pads")));
    }

    @Test
    @Order(6)
    @DisplayName("Integration: Employee gets only items from their service center")
    @WithMockUser(username = "employee@test.com", roles = { "EMPLOYEE" })
    void testEmployeeGetItemsFromTheirServiceCenter() throws Exception {
        // Create item in another service center
        InventoryItem item2 = new InventoryItem();
        item2.setItemName("Windshield Wipers");
        item2.setDescription("All-season wipers");
        item2.setQuantity(20);
        item2.setUnitPrice(new BigDecimal("12.99"));
        item2.setCategory("Spare Part");
        item2.setMinStock(10);
        item2.setServiceCenter(testServiceCenter2);
        item2.setCreatedBy(adminUser);
        inventoryItemRepository.save(item2);

        mockMvc.perform(get("/inventory")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].itemName", hasItem("Engine Oil 5W-30")))
                .andExpect(jsonPath("$[*].itemName", not(hasItem("Windshield Wipers"))))
                .andExpect(jsonPath("$[*].serviceCenterName", everyItem(is("Downtown Service Center"))));
    }

    // ==================== GET ITEM BY ID TESTS ====================

    @Test
    @Order(7)
    @DisplayName("Integration: Admin gets any item by ID")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testAdminGetItemById() throws Exception {
        mockMvc.perform(get("/inventory/" + testItem.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testItem.getId().toString()))
                .andExpect(jsonPath("$.itemName").value("Engine Oil 5W-30"))
                .andExpect(jsonPath("$.quantity").value(50));
    }

    @Test
    @Order(8)
    @DisplayName("Integration: Employee gets item from their service center")
    @WithMockUser(username = "employee@test.com", roles = { "EMPLOYEE" })
    void testEmployeeGetItemFromTheirServiceCenter() throws Exception {
        mockMvc.perform(get("/inventory/" + testItem.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemName").value("Engine Oil 5W-30"));
    }

    @Test
    @Order(9)
    @DisplayName("Integration: Employee cannot access item from other service center")
    @WithMockUser(username = "employee@test.com", roles = { "EMPLOYEE" })
    void testEmployeeCannotAccessItemFromOtherServiceCenter() throws Exception {
        // Create item in different service center
        InventoryItem otherItem = new InventoryItem();
        otherItem.setItemName("Transmission Fluid");
        otherItem.setDescription("ATF for automatic transmissions");
        otherItem.setQuantity(25);
        otherItem.setUnitPrice(new BigDecimal("18.99"));
        otherItem.setCategory("Lubricant");
        otherItem.setMinStock(5);
        otherItem.setServiceCenter(testServiceCenter2);
        otherItem.setCreatedBy(adminUser);
        otherItem = inventoryItemRepository.save(otherItem);

        mockMvc.perform(get("/inventory/" + otherItem.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(10)
    @DisplayName("Integration: Get non-existent item returns 404")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testGetNonExistentItem() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(get("/inventory/" + nonExistentId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    // ==================== UPDATE ITEM TESTS ====================

    @Test
    @Order(11)
    @DisplayName("Integration: Admin updates inventory item successfully")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testAdminUpdateItem() throws Exception {
        InventoryItemUpdateDTO updateDTO = new InventoryItemUpdateDTO();
        updateDTO.setItemName("Engine Oil 5W-30 Fully Synthetic");
        updateDTO.setDescription("Premium fully synthetic engine oil");
        updateDTO.setUnitPrice(new BigDecimal("29.99"));

        mockMvc.perform(put("/inventory/" + testItem.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemName").value("Engine Oil 5W-30 Fully Synthetic"))
                .andExpect(jsonPath("$.description").value("Premium fully synthetic engine oil"))
                .andExpect(jsonPath("$.unitPrice").value(29.99))
                .andExpect(jsonPath("$.quantity").value(50)); // Should remain unchanged

        // Verify in database
        InventoryItem updatedItem = inventoryItemRepository.findById(testItem.getId()).orElse(null);
        assertNotNull(updatedItem);
        assertEquals("Engine Oil 5W-30 Fully Synthetic", updatedItem.getItemName());
        assertEquals(new BigDecimal("29.99"), updatedItem.getUnitPrice());
    }

    @Test
    @Order(12)
    @DisplayName("Integration: Prevent updating item name to duplicate in same service center")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testPreventUpdatingToDuplicateName() throws Exception {
        // Create another item
        InventoryItem anotherItem = new InventoryItem();
        anotherItem.setItemName("Coolant");
        anotherItem.setDescription("Engine coolant");
        anotherItem.setQuantity(40);
        anotherItem.setUnitPrice(new BigDecimal("12.99"));
        anotherItem.setCategory("Lubricant");
        anotherItem.setMinStock(10);
        anotherItem.setServiceCenter(testServiceCenter1);
        anotherItem.setCreatedBy(adminUser);
        anotherItem = inventoryItemRepository.save(anotherItem);

        // Try to update to existing name
        InventoryItemUpdateDTO updateDTO = new InventoryItemUpdateDTO();
        updateDTO.setItemName("Engine Oil 5W-30"); // Already exists

        mockMvc.perform(put("/inventory/" + anotherItem.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("already exists")));
    }

    // ==================== RESTOCK ITEM TESTS ====================

    @Test
    @Order(13)
    @DisplayName("Integration: Admin restocks inventory item")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testAdminRestockItem() throws Exception {
        int initialQuantity = testItem.getQuantity();

        InventoryRestockDTO restockDTO = new InventoryRestockDTO();
        restockDTO.setQuantity(25);

        mockMvc.perform(put("/inventory/" + testItem.getId() + "/restock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(restockDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(initialQuantity + 25));

        // Verify in database
        InventoryItem restockedItem = inventoryItemRepository.findById(testItem.getId()).orElse(null);
        assertNotNull(restockedItem);
        assertEquals(initialQuantity + 25, restockedItem.getQuantity());
    }

    @Test
    @Order(14)
    @DisplayName("Integration: Multiple restock operations accumulate quantity")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testMultipleRestockOperations() throws Exception {
        int initialQuantity = testItem.getQuantity();

        // First restock
        InventoryRestockDTO restock1 = new InventoryRestockDTO();
        restock1.setQuantity(10);
        mockMvc.perform(put("/inventory/" + testItem.getId() + "/restock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(restock1)))
                .andExpect(status().isOk());

        // Second restock
        InventoryRestockDTO restock2 = new InventoryRestockDTO();
        restock2.setQuantity(15);
        mockMvc.perform(put("/inventory/" + testItem.getId() + "/restock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(restock2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(initialQuantity + 10 + 15));
    }

    // ==================== BUY ITEM TESTS ====================

    @Test
    @Order(15)
    @DisplayName("Integration: Employee buys item from their service center")
    @WithMockUser(username = "employee@test.com", roles = { "EMPLOYEE" })
    void testEmployeeBuyItem() throws Exception {
        int initialQuantity = testItem.getQuantity();

        InventoryBuyDTO buyDTO = new InventoryBuyDTO();
        buyDTO.setQuantity(5);

        mockMvc.perform(put("/inventory/" + testItem.getId() + "/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buyDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(initialQuantity - 5));

        // Verify in database
        InventoryItem updatedItem = inventoryItemRepository.findById(testItem.getId()).orElse(null);
        assertNotNull(updatedItem);
        assertEquals(initialQuantity - 5, updatedItem.getQuantity());
    }

    @Test
    @Order(16)
    @DisplayName("Integration: Employee cannot buy more than available quantity")
    @WithMockUser(username = "employee@test.com", roles = { "EMPLOYEE" })
    void testEmployeeCannotBuyMoreThanAvailable() throws Exception {
        InventoryBuyDTO buyDTO = new InventoryBuyDTO();
        buyDTO.setQuantity(1000); // More than available

        mockMvc.perform(put("/inventory/" + testItem.getId() + "/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buyDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Insufficient stock")));
    }

    @Test
    @Order(17)
    @DisplayName("Integration: Employee cannot buy from other service center")
    @WithMockUser(username = "employee@test.com", roles = { "EMPLOYEE" })
    void testEmployeeCannotBuyFromOtherServiceCenter() throws Exception {
        // Create item in different service center
        InventoryItem otherItem = new InventoryItem();
        otherItem.setItemName("Spark Plugs");
        otherItem.setDescription("Iridium spark plugs");
        otherItem.setQuantity(50);
        otherItem.setUnitPrice(new BigDecimal("8.99"));
        otherItem.setCategory("Spare Part");
        otherItem.setMinStock(10);
        otherItem.setServiceCenter(testServiceCenter2);
        otherItem.setCreatedBy(adminUser);
        otherItem = inventoryItemRepository.save(otherItem);

        InventoryBuyDTO buyDTO = new InventoryBuyDTO();
        buyDTO.setQuantity(5);

        mockMvc.perform(put("/inventory/" + otherItem.getId() + "/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buyDTO)))
                .andExpect(status().isNotFound());
    }

    // ==================== DELETE ITEM TESTS ====================

    @Test
    @Order(18)
    @DisplayName("Integration: Admin deletes inventory item")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testAdminDeleteItem() throws Exception {
        // Create item to delete
        InventoryItem itemToDelete = new InventoryItem();
        itemToDelete.setItemName("Old Battery");
        itemToDelete.setDescription("Discontinued battery");
        itemToDelete.setQuantity(5);
        itemToDelete.setUnitPrice(new BigDecimal("99.99"));
        itemToDelete.setCategory("Battery");
        itemToDelete.setMinStock(0);
        itemToDelete.setServiceCenter(testServiceCenter1);
        itemToDelete.setCreatedBy(adminUser);
        itemToDelete = inventoryItemRepository.save(itemToDelete);

        UUID itemId = itemToDelete.getId();

        mockMvc.perform(delete("/inventory/" + itemId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Inventory item deleted successfully"))
                .andExpect(jsonPath("$.success").value(true));

        // Verify deletion in database
        assertFalse(inventoryItemRepository.existsById(itemId));
    }

    @Test
    @Order(19)
    @DisplayName("Integration: Delete non-existent item returns 404")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testDeleteNonExistentItem() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(delete("/inventory/" + nonExistentId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    // ==================== LOW STOCK TESTS ====================

    @Test
    @Order(20)
    @DisplayName("Integration: Get low stock items")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testGetLowStockItems() throws Exception {
        // Create low stock item
        InventoryItem lowStockItem = new InventoryItem();
        lowStockItem.setItemName("Low Stock Filter");
        lowStockItem.setDescription("Running low");
        lowStockItem.setQuantity(5); // Below minStock
        lowStockItem.setUnitPrice(new BigDecimal("10.00"));
        lowStockItem.setCategory("Filter");
        lowStockItem.setMinStock(10);
        lowStockItem.setServiceCenter(testServiceCenter1);
        lowStockItem.setCreatedBy(adminUser);
        inventoryItemRepository.save(lowStockItem);

        mockMvc.perform(get("/inventory/low-stock")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].itemName", hasItem("Low Stock Filter")))
                .andExpect(jsonPath("$[*].lowStock", hasItem(true)));
    }

    @Test
    @Order(21)
    @DisplayName("Integration: Employee gets low stock items from their service center only")
    @WithMockUser(username = "employee@test.com", roles = { "EMPLOYEE" })
    void testEmployeeGetLowStockItemsFromTheirServiceCenter() throws Exception {
        // Create low stock item in employee's service center
        InventoryItem lowStockItem1 = new InventoryItem();
        lowStockItem1.setItemName("Low Stock Item SC1");
        lowStockItem1.setDescription("Low stock in SC1");
        lowStockItem1.setQuantity(3);
        lowStockItem1.setUnitPrice(new BigDecimal("10.00"));
        lowStockItem1.setCategory("Filter");
        lowStockItem1.setMinStock(10);
        lowStockItem1.setServiceCenter(testServiceCenter1);
        lowStockItem1.setCreatedBy(adminUser);
        inventoryItemRepository.save(lowStockItem1);

        // Create low stock item in different service center
        InventoryItem lowStockItem2 = new InventoryItem();
        lowStockItem2.setItemName("Low Stock Item SC2");
        lowStockItem2.setDescription("Low stock in SC2");
        lowStockItem2.setQuantity(2);
        lowStockItem2.setUnitPrice(new BigDecimal("10.00"));
        lowStockItem2.setCategory("Filter");
        lowStockItem2.setMinStock(10);
        lowStockItem2.setServiceCenter(testServiceCenter2);
        lowStockItem2.setCreatedBy(adminUser);
        inventoryItemRepository.save(lowStockItem2);

        mockMvc.perform(get("/inventory/low-stock")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].itemName", hasItem("Low Stock Item SC1")))
                .andExpect(jsonPath("$[*].itemName", not(hasItem("Low Stock Item SC2"))))
                .andExpect(jsonPath("$[*].serviceCenterName", everyItem(is("Downtown Service Center"))));
    }

    // ==================== CATEGORY TESTS ====================

    @Test
    @Order(22)
    @DisplayName("Integration: Get items by category")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testGetItemsByCategory() throws Exception {
        // Create items in different categories
        InventoryItem filterItem = new InventoryItem();
        filterItem.setItemName("Cabin Air Filter");
        filterItem.setDescription("Clean air filter");
        filterItem.setQuantity(30);
        filterItem.setUnitPrice(new BigDecimal("14.99"));
        filterItem.setCategory("Filter");
        filterItem.setMinStock(5);
        filterItem.setServiceCenter(testServiceCenter1);
        filterItem.setCreatedBy(adminUser);
        inventoryItemRepository.save(filterItem);

        mockMvc.perform(get("/inventory/category/Filter")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].category", everyItem(is("Filter"))))
                .andExpect(jsonPath("$[*].itemName", hasItem("Cabin Air Filter")));
    }

    @Test
    @Order(23)
    @DisplayName("Integration: Employee gets items by category from their service center only")
    @WithMockUser(username = "employee@test.com", roles = { "EMPLOYEE" })
    void testEmployeeGetItemsByCategoryFromTheirServiceCenter() throws Exception {
        // Create lubricant in employee's service center
        InventoryItem item1 = new InventoryItem();
        item1.setItemName("Lubricant SC1");
        item1.setDescription("Lubricant in SC1");
        item1.setQuantity(20);
        item1.setUnitPrice(new BigDecimal("15.00"));
        item1.setCategory("Lubricant");
        item1.setMinStock(5);
        item1.setServiceCenter(testServiceCenter1);
        item1.setCreatedBy(adminUser);
        inventoryItemRepository.save(item1);

        // Create lubricant in different service center
        InventoryItem item2 = new InventoryItem();
        item2.setItemName("Lubricant SC2");
        item2.setDescription("Lubricant in SC2");
        item2.setQuantity(25);
        item2.setUnitPrice(new BigDecimal("16.00"));
        item2.setCategory("Lubricant");
        item2.setMinStock(5);
        item2.setServiceCenter(testServiceCenter2);
        item2.setCreatedBy(adminUser);
        inventoryItemRepository.save(item2);

        mockMvc.perform(get("/inventory/category/Lubricant")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].itemName", hasItem("Lubricant SC1")))
                .andExpect(jsonPath("$[*].itemName", hasItem("Engine Oil 5W-30")))
                .andExpect(jsonPath("$[*].itemName", not(hasItem("Lubricant SC2"))));
    }

    // ==================== SEARCH TESTS ====================

    @Test
    @Order(24)
    @DisplayName("Integration: Search items by name")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testSearchItemsByName() throws Exception {
        // Create items with similar names
        InventoryItem item1 = new InventoryItem();
        item1.setItemName("Premium Oil Filter");
        item1.setDescription("High quality");
        item1.setQuantity(20);
        item1.setUnitPrice(new BigDecimal("12.00"));
        item1.setCategory("Filter");
        item1.setMinStock(5);
        item1.setServiceCenter(testServiceCenter1);
        item1.setCreatedBy(adminUser);
        inventoryItemRepository.save(item1);

        mockMvc.perform(get("/inventory/search")
                .param("name", "Oil")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].itemName", hasItem(containsString("Oil"))));
    }

    @Test
    @Order(25)
    @DisplayName("Integration: Search is case-insensitive")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testSearchIsCaseInsensitive() throws Exception {
        mockMvc.perform(get("/inventory/search")
                .param("name", "engine")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].itemName", hasItem("Engine Oil 5W-30")));

        mockMvc.perform(get("/inventory/search")
                .param("name", "ENGINE")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].itemName", hasItem("Engine Oil 5W-30")));
    }

    @Test
    @Order(26)
    @DisplayName("Integration: Employee searches items only from their service center")
    @WithMockUser(username = "employee@test.com", roles = { "EMPLOYEE" })
    void testEmployeeSearchOnlyFromTheirServiceCenter() throws Exception {
        // Create item in another service center
        InventoryItem otherItem = new InventoryItem();
        otherItem.setItemName("Engine Cleaner SC2");
        otherItem.setDescription("For SC2");
        otherItem.setQuantity(15);
        otherItem.setUnitPrice(new BigDecimal("9.99"));
        otherItem.setCategory("Lubricant");
        otherItem.setMinStock(5);
        otherItem.setServiceCenter(testServiceCenter2);
        otherItem.setCreatedBy(adminUser);
        inventoryItemRepository.save(otherItem);

        mockMvc.perform(get("/inventory/search")
                .param("name", "Engine")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].itemName", hasItem("Engine Oil 5W-30")))
                .andExpect(jsonPath("$[*].itemName", not(hasItem("Engine Cleaner SC2"))));
    }

    // ==================== COMPLETE WORKFLOW TESTS ====================

    @Test
    @Order(27)
    @DisplayName("Integration: Complete inventory management workflow")
    @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
    void testCompleteInventoryWorkflow() throws Exception {
        // Step 1: Create new item
        InventoryItemCreateDTO createDTO = new InventoryItemCreateDTO();
        createDTO.setItemName("Workflow Test Item");
        createDTO.setDescription("Testing complete workflow");
        createDTO.setQuantity(15);
        createDTO.setUnitPrice(new BigDecimal("20.00"));
        createDTO.setCategory("Test Category");
        createDTO.setMinStock(10);
        createDTO.setServiceCenterId(testServiceCenter1.getId());

        MvcResult createResult = mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponse = createResult.getResponse().getContentAsString();
        InventoryItemDTO createdItem = objectMapper.readValue(createResponse, InventoryItemDTO.class);
        UUID itemId = createdItem.getId();

        // Step 2: Get the item
        mockMvc.perform(get("/inventory/" + itemId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemName").value("Workflow Test Item"));

        // Step 3: Update the item
        InventoryItemUpdateDTO updateDTO = new InventoryItemUpdateDTO();
        updateDTO.setDescription("Updated description");
        updateDTO.setUnitPrice(new BigDecimal("22.50"));

        mockMvc.perform(put("/inventory/" + itemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated description"))
                .andExpect(jsonPath("$.unitPrice").value(22.50));

        // Step 4: Restock the item
        InventoryRestockDTO restockDTO = new InventoryRestockDTO();
        restockDTO.setQuantity(10);

        mockMvc.perform(put("/inventory/" + itemId + "/restock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(restockDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(25));

        // Step 5: Verify in all items list
        mockMvc.perform(get("/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].itemName", hasItem("Workflow Test Item")));

        // Step 6: Search for the item
        mockMvc.perform(get("/inventory/search")
                .param("name", "Workflow"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].itemName", hasItem("Workflow Test Item")));

        // Step 7: Delete the item
        mockMvc.perform(delete("/inventory/" + itemId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Step 8: Verify deletion
        mockMvc.perform(get("/inventory/" + itemId))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(28)
    @DisplayName("Integration: Employee buy triggers low stock when quantity drops below minimum")
    @WithMockUser(username = "employee@test.com", roles = { "EMPLOYEE" })
    void testEmployeeBuyTriggersLowStock() throws Exception {
        // Create item with quantity just above minStock
        InventoryItem item = new InventoryItem();
        item.setItemName("Almost Low Stock Item");
        item.setDescription("Will be low stock soon");
        item.setQuantity(12);
        item.setUnitPrice(new BigDecimal("10.00"));
        item.setCategory("Test");
        item.setMinStock(10);
        item.setServiceCenter(testServiceCenter1);
        item.setCreatedBy(adminUser);
        item = inventoryItemRepository.save(item);

        // Buy enough to trigger low stock
        InventoryBuyDTO buyDTO = new InventoryBuyDTO();
        buyDTO.setQuantity(3);

        mockMvc.perform(put("/inventory/" + item.getId() + "/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buyDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(9))
                .andExpect(jsonPath("$.lowStock").value(true));

        // Verify item appears in low stock list
        mockMvc.perform(get("/inventory/low-stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].itemName", hasItem("Almost Low Stock Item")));
    }

    @Test
    @Order(29)
    @DisplayName("Integration: Unauthorized access without authentication")
    void testUnauthorizedAccessWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/inventory"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(30)
    @DisplayName("Integration: Employee cannot access admin-only endpoints")
    @WithMockUser(username = "employee@test.com", roles = { "EMPLOYEE" })
    void testEmployeeCannotAccessAdminEndpoints() throws Exception {
        InventoryItemCreateDTO createDTO = new InventoryItemCreateDTO();
        createDTO.setItemName("Test Item");
        createDTO.setDescription("Test description");
        createDTO.setQuantity(10);
        createDTO.setUnitPrice(new BigDecimal("10.00"));
        createDTO.setCategory("Test");
        createDTO.setMinStock(5);
        createDTO.setServiceCenterId(testServiceCenter1.getId());

        // Try to create (admin only) - Authorization exceptions are caught by
        // GlobalExceptionHandler
        mockMvc.perform(post("/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("An error occurred: Access Denied"));

        // Try to update (admin only)
        InventoryItemUpdateDTO updateDTO = new InventoryItemUpdateDTO();
        updateDTO.setDescription("Updated description");
        mockMvc.perform(put("/inventory/" + testItem.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("An error occurred: Access Denied"));

        // Try to delete (admin only)
        mockMvc.perform(delete("/inventory/" + testItem.getId()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("An error occurred: Access Denied"));

        // Try to restock (admin only)
        InventoryRestockDTO restockDTO = new InventoryRestockDTO();
        restockDTO.setQuantity(10);
        mockMvc.perform(put("/inventory/" + testItem.getId() + "/restock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(restockDTO)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("An error occurred: Access Denied"));
    }
}
