package com.ead.backend.service;

import com.ead.backend.dto.VehicleCreateDTO;
import com.ead.backend.dto.VehicleResponseDTO;
import com.ead.backend.entity.User;
import com.ead.backend.entity.Vehicle;
import com.ead.backend.repository.UserRepository;
import com.ead.backend.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Vehicle Service Unit Tests")
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private VehicleService vehicleService;

    private User testUser;
    private Vehicle testVehicle;
    private VehicleCreateDTO createDTO;
    private UUID testUserId;
    private UUID testVehicleId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testVehicleId = UUID.randomUUID();

        // Setup test user
        testUser = new User();
        testUser.setId(testUserId);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");

        // Setup test vehicle
        testVehicle = new Vehicle();
        testVehicle.setId(testVehicleId);
        testVehicle.setBrand("Toyota");
        testVehicle.setModel("Camry");
        testVehicle.setYear(2023);
        testVehicle.setColor("White");
        testVehicle.setLicensePlate("ABC123");
        testVehicle.setUser(testUser);
        testVehicle.setCreatedAt(LocalDateTime.now());
        testVehicle.setUpdatedAt(LocalDateTime.now());

        // Setup create DTO
        createDTO = new VehicleCreateDTO();
        createDTO.setBrand("Toyota");
        createDTO.setModel("Camry");
        createDTO.setYear(2023);
        createDTO.setColor("White");
        createDTO.setLicensePlate("ABC123");

        // Mock security context
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(authentication.getName()).thenReturn("test@example.com");
    }

    // ===================================================================
    // CREATE TESTS
    // ===================================================================

    @Test
    @DisplayName("Should successfully add a vehicle")
    void testAddVehicle_Success() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findByLicensePlate("ABC123")).thenReturn(Optional.empty());
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);
        doNothing().when(notificationService).sendNotification(any(), any(), any(), any());

        // Act
        VehicleResponseDTO result = vehicleService.addVehicle(createDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Toyota", result.getBrand());
        assertEquals("Camry", result.getModel());
        assertEquals(2023, result.getYear());
        assertEquals("ABC123", result.getLicensePlate());
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
        verify(notificationService, times(1)).sendNotification(any(), eq("VEHICLE_ADDED"), any(), any());
        verify(emailService, times(1)).sendVehicleAddedEmail(any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should throw exception when license plate already exists")
    void testAddVehicle_DuplicateLicensePlate() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findByLicensePlate("ABC123")).thenReturn(Optional.of(testVehicle));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            vehicleService.addVehicle(createDTO);
        });
        assertEquals("A vehicle with this license plate already exists", exception.getMessage());
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void testAddVehicle_UserNotFound() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            vehicleService.addVehicle(createDTO);
        });
        assertEquals("User not found", exception.getMessage());
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    // ===================================================================
    // READ TESTS
    // ===================================================================

    @Test
    @DisplayName("Should successfully get user vehicles")
    void testGetUserVehicles_Success() {
        // Arrange
        List<Vehicle> vehicles = Arrays.asList(testVehicle);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findByUserId(testUserId)).thenReturn(vehicles);

        // Act
        List<VehicleResponseDTO> result = vehicleService.getUserVehicles();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Toyota", result.get(0).getBrand());
        assertEquals("Camry", result.get(0).getModel());
        verify(vehicleRepository, times(1)).findByUserId(testUserId);
    }

    @Test
    @DisplayName("Should return empty list when user has no vehicles")
    void testGetUserVehicles_EmptyList() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findByUserId(testUserId)).thenReturn(Collections.emptyList());

        // Act
        List<VehicleResponseDTO> result = vehicleService.getUserVehicles();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(vehicleRepository, times(1)).findByUserId(testUserId);
    }

    @Test
    @DisplayName("Should successfully get vehicle by ID")
    void testGetVehicleById_Success() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findByIdAndUserId(testVehicleId, testUserId))
                .thenReturn(Optional.of(testVehicle));

        // Act
        VehicleResponseDTO result = vehicleService.getVehicleById(testVehicleId);

        // Assert
        assertNotNull(result);
        assertEquals("Toyota", result.getBrand());
        assertEquals("Camry", result.getModel());
        assertEquals("ABC123", result.getLicensePlate());
        verify(vehicleRepository, times(1)).findByIdAndUserId(testVehicleId, testUserId);
    }

    @Test
    @DisplayName("Should throw exception when vehicle not found")
    void testGetVehicleById_NotFound() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findByIdAndUserId(testVehicleId, testUserId))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            vehicleService.getVehicleById(testVehicleId);
        });
        assertEquals("Vehicle not found or access denied", exception.getMessage());
    }

    // ===================================================================
    // UPDATE TESTS
    // ===================================================================

    @Test
    @DisplayName("Should successfully update vehicle")
    void testUpdateVehicle_Success() {
        // Arrange
        VehicleCreateDTO updateDTO = new VehicleCreateDTO();
        updateDTO.setBrand("Honda");
        updateDTO.setModel("Accord");
        updateDTO.setYear(2024);
        updateDTO.setColor("Black");
        updateDTO.setLicensePlate("ABC123");

        Vehicle updatedVehicle = new Vehicle();
        updatedVehicle.setId(testVehicleId);
        updatedVehicle.setBrand("Honda");
        updatedVehicle.setModel("Accord");
        updatedVehicle.setYear(2024);
        updatedVehicle.setColor("Black");
        updatedVehicle.setLicensePlate("ABC123");
        updatedVehicle.setUser(testUser);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findByIdAndUserId(testVehicleId, testUserId))
                .thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.findByLicensePlate("ABC123")).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(updatedVehicle);
        doNothing().when(notificationService).sendNotification(any(), any(), any(), any());

        // Act
        VehicleResponseDTO result = vehicleService.updateVehicle(testVehicleId, updateDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Honda", result.getBrand());
        assertEquals("Accord", result.getModel());
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
        verify(notificationService, times(1)).sendNotification(any(), eq("VEHICLE_UPDATED"), any(), any());
    }

    @Test
    @DisplayName("Should throw exception when updating to duplicate license plate")
    void testUpdateVehicle_DuplicateLicensePlate() {
        // Arrange
        VehicleCreateDTO updateDTO = new VehicleCreateDTO();
        updateDTO.setBrand("Honda");
        updateDTO.setModel("Accord");
        updateDTO.setYear(2024);
        updateDTO.setColor("Black");
        updateDTO.setLicensePlate("XYZ789");

        Vehicle anotherVehicle = new Vehicle();
        anotherVehicle.setId(UUID.randomUUID());
        anotherVehicle.setLicensePlate("XYZ789");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findByIdAndUserId(testVehicleId, testUserId))
                .thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.findByLicensePlate("XYZ789")).thenReturn(Optional.of(anotherVehicle));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            vehicleService.updateVehicle(testVehicleId, updateDTO);
        });
        assertEquals("A vehicle with this license plate already exists", exception.getMessage());
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("Should not send notification for non-critical updates")
    void testUpdateVehicle_NonCriticalChange() {
        // Arrange
        VehicleCreateDTO updateDTO = new VehicleCreateDTO();
        updateDTO.setBrand("Toyota");
        updateDTO.setModel("Camry");
        updateDTO.setYear(2023);
        updateDTO.setColor("Red"); // Only color changed
        updateDTO.setLicensePlate("ABC123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findByIdAndUserId(testVehicleId, testUserId))
                .thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.findByLicensePlate("ABC123")).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        vehicleService.updateVehicle(testVehicleId, updateDTO);

        // Assert
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
        verify(notificationService, never()).sendNotification(any(), any(), any(), any());
        verify(emailService, never()).sendVehicleUpdatedEmail(any(), any(), any(), any(), any());
    }

    // ===================================================================
    // DELETE TESTS
    // ===================================================================

    @Test
    @DisplayName("Should throw exception when deleting non-existent vehicle")
    void testDeleteVehicle_NotFound() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findByIdAndUserId(testVehicleId, testUserId))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            vehicleService.deleteVehicle(testVehicleId);
        });
        assertEquals("Vehicle not found or access denied", exception.getMessage());
        verify(vehicleRepository, never()).delete(any(Vehicle.class));
    }

    @Test
    @DisplayName("Should handle email service failure gracefully during add")
    void testAddVehicle_EmailFailure() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findByLicensePlate("ABC123")).thenReturn(Optional.empty());
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);
        doNothing().when(notificationService).sendNotification(any(), any(), any(), any());
        doThrow(new RuntimeException("Email service down")).when(emailService)
                .sendVehicleAddedEmail(any(), any(), any(), any(), any(), any(), any());

        // Act
        VehicleResponseDTO result = vehicleService.addVehicle(createDTO);

        // Assert - Should still succeed even if email fails
        assertNotNull(result);
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
        verify(notificationService, times(1)).sendNotification(any(), any(), any(), any());
    }
}
