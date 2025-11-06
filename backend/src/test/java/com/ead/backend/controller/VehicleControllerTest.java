package com.ead.backend.controller;

import com.ead.backend.dto.VehicleCreateDTO;
import com.ead.backend.dto.VehicleResponseDTO;
import com.ead.backend.service.VehicleService;
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

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Vehicle Controller Unit Tests")
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private VehicleService vehicleService;

    private VehicleResponseDTO responseDTO;
    private VehicleCreateDTO createDTO;
    private UUID vehicleId;

    @BeforeEach
    void setUp() {
        vehicleId = UUID.randomUUID();

        createDTO = new VehicleCreateDTO();
        createDTO.setBrand("Toyota");
        createDTO.setModel("Camry");
        createDTO.setYear(2023);
        createDTO.setColor("White");
        createDTO.setLicensePlate("ABC123");

        responseDTO = new VehicleResponseDTO();
        responseDTO.setId(vehicleId.toString());
        responseDTO.setBrand("Toyota");
        responseDTO.setModel("Camry");
        responseDTO.setYear(2023);
        responseDTO.setColor("White");
        responseDTO.setLicensePlate("ABC123");
    }

    // ===================================================================
    // GET USER VEHICLES TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should successfully get user vehicles")
    void testGetUserVehicles_Success() throws Exception {
        // Arrange
        List<VehicleResponseDTO> vehicles = Arrays.asList(responseDTO);
        when(vehicleService.getUserVehicles()).thenReturn(vehicles);

        // Act & Assert
        mockMvc.perform(get("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].brand").value("Toyota"))
                .andExpect(jsonPath("$[0].model").value("Camry"))
                .andExpect(jsonPath("$[0].licensePlate").value("ABC123"));

        verify(vehicleService, times(1)).getUserVehicles();
    }

    @Test
    @DisplayName("Should return 401 when not authenticated")
    void testGetUserVehicles_Unauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verify(vehicleService, never()).getUserVehicles();
    }

    // ===================================================================
    // GET VEHICLE BY ID TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should successfully get vehicle by ID")
    void testGetVehicleById_Success() throws Exception {
        // Arrange
        when(vehicleService.getVehicleById(vehicleId)).thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(get("/vehicles/{id}", vehicleId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(vehicleId.toString()))
                .andExpect(jsonPath("$.brand").value("Toyota"))
                .andExpect(jsonPath("$.model").value("Camry"));

        verify(vehicleService, times(1)).getVehicleById(vehicleId);
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should return 500 when vehicle not found")
    void testGetVehicleById_NotFound() throws Exception {
        // Arrange
        when(vehicleService.getVehicleById(vehicleId))
                .thenThrow(new RuntimeException("Vehicle not found or access denied"));

        // Act & Assert
        mockMvc.perform(get("/vehicles/{id}", vehicleId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());

        verify(vehicleService, times(1)).getVehicleById(vehicleId);
    }

    // ===================================================================
    // ADD VEHICLE TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should successfully add vehicle")
    void testAddVehicle_Success() throws Exception {
        // Arrange
        when(vehicleService.addVehicle(any(VehicleCreateDTO.class))).thenReturn(responseDTO);

        // Act & Assert
        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.brand").value("Toyota"))
                .andExpect(jsonPath("$.model").value("Camry"))
                .andExpect(jsonPath("$.licensePlate").value("ABC123"));

        verify(vehicleService, times(1)).addVehicle(any(VehicleCreateDTO.class));
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should return 400 when validation fails")
    void testAddVehicle_ValidationError() throws Exception {
        // Arrange - Invalid DTO
        VehicleCreateDTO invalidDTO = new VehicleCreateDTO();
        // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());

        verify(vehicleService, never()).addVehicle(any(VehicleCreateDTO.class));
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should handle duplicate license plate")
    void testAddVehicle_DuplicateLicensePlate() throws Exception {
        // Arrange
        when(vehicleService.addVehicle(any(VehicleCreateDTO.class)))
                .thenThrow(new RuntimeException("A vehicle with this license plate already exists"));

        // Act & Assert
        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isInternalServerError());

        verify(vehicleService, times(1)).addVehicle(any(VehicleCreateDTO.class));
    }

    // ===================================================================
    // UPDATE VEHICLE TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should successfully update vehicle")
    void testUpdateVehicle_Success() throws Exception {
        // Arrange
        VehicleCreateDTO updateDTO = new VehicleCreateDTO();
        updateDTO.setBrand("Honda");
        updateDTO.setModel("Accord");
        updateDTO.setYear(2024);
        updateDTO.setColor("Black");
        updateDTO.setLicensePlate("ABC123");

        VehicleResponseDTO updatedResponse = new VehicleResponseDTO();
        updatedResponse.setId(vehicleId.toString());
        updatedResponse.setBrand("Honda");
        updatedResponse.setModel("Accord");
        updatedResponse.setYear(2024);
        updatedResponse.setColor("Black");
        updatedResponse.setLicensePlate("ABC123");

        when(vehicleService.updateVehicle(eq(vehicleId), any(VehicleCreateDTO.class)))
                .thenReturn(updatedResponse);

        // Act & Assert
        mockMvc.perform(put("/vehicles/{id}", vehicleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brand").value("Honda"))
                .andExpect(jsonPath("$.model").value("Accord"));

        verify(vehicleService, times(1)).updateVehicle(eq(vehicleId), any(VehicleCreateDTO.class));
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should return 400 when updating with invalid data")
    void testUpdateVehicle_ValidationError() throws Exception {
        // Arrange - Invalid DTO
        VehicleCreateDTO invalidDTO = new VehicleCreateDTO();
        // Missing required fields

        // Act & Assert
        mockMvc.perform(put("/vehicles/{id}", vehicleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());

        verify(vehicleService, never()).updateVehicle(any(UUID.class), any(VehicleCreateDTO.class));
    }

    // ===================================================================
    // DELETE VEHICLE TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should successfully delete vehicle")
    void testDeleteVehicle_Success() throws Exception {
        // Arrange
        doNothing().when(vehicleService).deleteVehicle(vehicleId);

        // Act & Assert
        mockMvc.perform(delete("/vehicles/{id}", vehicleId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(vehicleService, times(1)).deleteVehicle(vehicleId);
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should return error when deleting non-existent vehicle")
    void testDeleteVehicle_NotFound() throws Exception {
        // Arrange
        doThrow(new RuntimeException("Vehicle not found or access denied"))
                .when(vehicleService).deleteVehicle(vehicleId);

        // Act & Assert
        mockMvc.perform(delete("/vehicles/{id}", vehicleId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());

        verify(vehicleService, times(1)).deleteVehicle(vehicleId);
    }

    @Test
    @DisplayName("Should return 401 for all endpoints when not authenticated")
    void testEndpoints_Unauthorized() throws Exception {
        // GET all vehicles
        mockMvc.perform(get("/vehicles"))
                .andExpect(status().isUnauthorized());

        // GET vehicle by ID
        mockMvc.perform(get("/vehicles/{id}", vehicleId))
                .andExpect(status().isUnauthorized());

        // POST new vehicle
        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isUnauthorized());

        // PUT update vehicle
        mockMvc.perform(put("/vehicles/{id}", vehicleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isUnauthorized());

        // DELETE vehicle
        mockMvc.perform(delete("/vehicles/{id}", vehicleId))
                .andExpect(status().isUnauthorized());

        verify(vehicleService, never()).getUserVehicles();
        verify(vehicleService, never()).getVehicleById(any());
        verify(vehicleService, never()).addVehicle(any());
        verify(vehicleService, never()).updateVehicle(any(), any());
        verify(vehicleService, never()).deleteVehicle(any());
    }
}
