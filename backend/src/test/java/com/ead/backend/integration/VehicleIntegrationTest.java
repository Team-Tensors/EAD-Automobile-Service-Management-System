package com.ead.backend.integration;

import com.ead.backend.dto.VehicleCreateDTO;
import com.ead.backend.dto.VehicleResponseDTO;
import com.ead.backend.entity.User;
import com.ead.backend.entity.Vehicle;
import com.ead.backend.repository.UserRepository;
import com.ead.backend.repository.VehicleRepository;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Vehicle Integration Tests")
class VehicleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testCustomer;
    private VehicleCreateDTO vehicleDTO;

    @BeforeEach
    void setUp() {
        // Clean up
        vehicleRepository.deleteAll();
        
        // Create test customer if doesn't exist
        testCustomer = userRepository.findByEmail("integration-test@example.com")
                .orElseGet(() -> {
                    User user = new User();
                    user.setEmail("integration-test@example.com");
                    user.setPassword(passwordEncoder.encode("password123"));
                    user.setFullName("Integration Test User");
                    user.setPhoneNumber("1234567890");
                    return userRepository.save(user);
                });

        // Setup test vehicle DTO
        vehicleDTO = new VehicleCreateDTO();
        vehicleDTO.setBrand("Toyota");
        vehicleDTO.setModel("Camry");
        vehicleDTO.setYear(2023);
        vehicleDTO.setColor("White");
        vehicleDTO.setLicensePlate("TEST123");
    }

    // ===================================================================
    // CREATE VEHICLE INTEGRATION TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "integration-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should create vehicle end-to-end")
    void testCreateVehicle_EndToEnd() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.brand").value("Toyota"))
                .andExpect(jsonPath("$.model").value("Camry"))
                .andExpect(jsonPath("$.licensePlate").value("TEST123"));

        // Verify in database
        List<Vehicle> vehicles = vehicleRepository.findByUserId(testCustomer.getId());
        assertEquals(1, vehicles.size());
        assertEquals("Toyota", vehicles.get(0).getBrand());
        assertEquals("TEST123", vehicles.get(0).getLicensePlate());
    }

    @Test
    @WithMockUser(username = "integration-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should prevent duplicate license plates")
    void testCreateVehicle_DuplicateLicensePlate() throws Exception {
        // Create first vehicle
        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleDTO)))
                .andExpect(status().isCreated());

        // Try to create second vehicle with same license plate
        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleDTO)))
                .andExpect(status().isInternalServerError());

        // Verify only one vehicle exists
        List<Vehicle> vehicles = vehicleRepository.findByUserId(testCustomer.getId());
        assertEquals(1, vehicles.size());
    }

    // ===================================================================
    // READ VEHICLE INTEGRATION TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "integration-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should retrieve user vehicles")
    void testGetUserVehicles_EndToEnd() throws Exception {
        // Create vehicle in database
        Vehicle vehicle = new Vehicle();
        vehicle.setBrand("Honda");
        vehicle.setModel("Civic");
        vehicle.setYear(2024);
        vehicle.setColor("Black");
        vehicle.setLicensePlate("HONDA123");
        vehicle.setUser(testCustomer);
        vehicleRepository.save(vehicle);

        // Act & Assert
        mockMvc.perform(get("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].brand").value("Honda"))
                .andExpect(jsonPath("$[0].model").value("Civic"))
                .andExpect(jsonPath("$[0].licensePlate").value("HONDA123"));
    }

    @Test
    @WithMockUser(username = "integration-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should retrieve specific vehicle by ID")
    void testGetVehicleById_EndToEnd() throws Exception {
        // Create vehicle in database
        Vehicle vehicle = new Vehicle();
        vehicle.setBrand("Ford");
        vehicle.setModel("Mustang");
        vehicle.setYear(2024);
        vehicle.setColor("Red");
        vehicle.setLicensePlate("FORD123");
        vehicle.setUser(testCustomer);
        Vehicle saved = vehicleRepository.save(vehicle);

        // Act & Assert
        mockMvc.perform(get("/vehicles/{id}", saved.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brand").value("Ford"))
                .andExpect(jsonPath("$.model").value("Mustang"));
    }

    // ===================================================================
    // UPDATE VEHICLE INTEGRATION TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "integration-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should update vehicle end-to-end")
    void testUpdateVehicle_EndToEnd() throws Exception {
        // Create vehicle in database
        Vehicle vehicle = new Vehicle();
        vehicle.setBrand("BMW");
        vehicle.setModel("X5");
        vehicle.setYear(2023);
        vehicle.setColor("Blue");
        vehicle.setLicensePlate("BMW123");
        vehicle.setUser(testCustomer);
        Vehicle saved = vehicleRepository.save(vehicle);

        // Update DTO
        VehicleCreateDTO updateDTO = new VehicleCreateDTO();
        updateDTO.setBrand("BMW");
        updateDTO.setModel("X7");
        updateDTO.setYear(2024);
        updateDTO.setColor("Black");
        updateDTO.setLicensePlate("BMW123");

        // Act & Assert
        mockMvc.perform(put("/vehicles/{id}", saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.model").value("X7"))
                .andExpect(jsonPath("$.year").value(2024))
                .andExpect(jsonPath("$.color").value("Black"));

        // Verify in database
        Vehicle updated = vehicleRepository.findById(saved.getId()).orElseThrow();
        assertEquals("X7", updated.getModel());
        assertEquals(2024, updated.getYear());
        assertEquals("Black", updated.getColor());
    }

    // ===================================================================
    // DELETE VEHICLE INTEGRATION TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "integration-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should delete vehicle end-to-end")
    void testDeleteVehicle_EndToEnd() throws Exception {
        // Create vehicle in database
        Vehicle vehicle = new Vehicle();
        vehicle.setBrand("Audi");
        vehicle.setModel("A4");
        vehicle.setYear(2023);
        vehicle.setColor("Silver");
        vehicle.setLicensePlate("AUDI123");
        vehicle.setUser(testCustomer);
        Vehicle saved = vehicleRepository.save(vehicle);

        // Act & Assert
        mockMvc.perform(delete("/vehicles/{id}", saved.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        // Verify vehicle is deleted
        assertFalse(vehicleRepository.findById(saved.getId()).isPresent());
    }

    // ===================================================================
    // BUSINESS LOGIC INTEGRATION TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "integration-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should enforce license plate uniqueness across all users")
    void testLicensePlateUniqueness_AcrossUsers() throws Exception {
        // Create first vehicle
        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleDTO)))
                .andExpect(status().isCreated());

        // Create another user
        User anotherUser = new User();
        anotherUser.setEmail("another@example.com");
        anotherUser.setPassword(passwordEncoder.encode("password123"));
        anotherUser.setFullName("Another User");
        anotherUser.setPhoneNumber("9876543210");
        userRepository.save(anotherUser);

        // Try to create vehicle with same license plate for different user
        VehicleCreateDTO duplicateDTO = new VehicleCreateDTO();
        duplicateDTO.setBrand("Honda");
        duplicateDTO.setModel("Accord");
        duplicateDTO.setYear(2024);
        duplicateDTO.setColor("Black");
        duplicateDTO.setLicensePlate("TEST123"); // Same license plate

        // Should fail even for different user
        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateDTO)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(username = "integration-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should allow multiple vehicles per user")
    void testMultipleVehiclesPerUser() throws Exception {
        // Create first vehicle
        VehicleCreateDTO vehicle1 = new VehicleCreateDTO();
        vehicle1.setBrand("Toyota");
        vehicle1.setModel("Camry");
        vehicle1.setYear(2023);
        vehicle1.setColor("White");
        vehicle1.setLicensePlate("CAR001");

        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicle1)))
                .andExpect(status().isCreated());

        // Create second vehicle
        VehicleCreateDTO vehicle2 = new VehicleCreateDTO();
        vehicle2.setBrand("Honda");
        vehicle2.setModel("Civic");
        vehicle2.setYear(2024);
        vehicle2.setColor("Black");
        vehicle2.setLicensePlate("CAR002");

        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicle2)))
                .andExpect(status().isCreated());

        // Verify both vehicles exist
        List<Vehicle> vehicles = vehicleRepository.findByUserId(testCustomer.getId());
        assertEquals(2, vehicles.size());
    }

    @Test
    @WithMockUser(username = "integration-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Complete CRUD workflow")
    void testCompleteCrudWorkflow() throws Exception {
        // 1. CREATE
        String createResponse = mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleDTO)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        VehicleResponseDTO created = objectMapper.readValue(createResponse, VehicleResponseDTO.class);
        String vehicleId = created.getId();

        // 2. READ
        mockMvc.perform(get("/vehicles/{id}", vehicleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brand").value("Toyota"));

        // 3. UPDATE
        VehicleCreateDTO updateDTO = new VehicleCreateDTO();
        updateDTO.setBrand("Toyota");
        updateDTO.setModel("Corolla");
        updateDTO.setYear(2024);
        updateDTO.setColor("Red");
        updateDTO.setLicensePlate("TEST123");

        mockMvc.perform(put("/vehicles/{id}", vehicleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.model").value("Corolla"));

        // 4. DELETE
        mockMvc.perform(delete("/vehicles/{id}", vehicleId))
                .andExpect(status().isNoContent());

        // 5. VERIFY DELETION
        mockMvc.perform(get("/vehicles/{id}", vehicleId))
                .andExpect(status().isInternalServerError());
    }
}
