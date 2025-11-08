package com.ead.backend.service;

import com.ead.backend.entity.*;
import com.ead.backend.enums.AppointmentType;
import com.ead.backend.repository.*;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Appointment Service Unit Tests")
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private ServiceOrModificationRepository serviceOrModificationRepository;

    @Mock
    private ServiceCenterRepository serviceCenterRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AppointmentService appointmentService;

    private User testUser;
    private Vehicle testVehicle;
    private ServiceOrModification testService;
    private ServiceCenter testServiceCenter;
    private Appointment testAppointment;
    private UUID userId;
    private UUID vehicleId;
    private UUID serviceId;
    private UUID serviceCenterId;
    private UUID appointmentId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        vehicleId = UUID.randomUUID();
        serviceId = UUID.randomUUID();
        serviceCenterId = UUID.randomUUID();
        appointmentId = UUID.randomUUID();

        // Setup test user
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("customer@example.com");
        testUser.setFullName("Test Customer");

        // Setup test vehicle
        testVehicle = new Vehicle();
        testVehicle.setId(vehicleId);
        testVehicle.setBrand("Toyota");
        testVehicle.setModel("Camry");
        testVehicle.setYear(2023);
        testVehicle.setLicensePlate("ABC123");
        testVehicle.setUser(testUser);

        // Setup test service
        testService = new ServiceOrModification();
        testService.setId(serviceId);
        testService.setName("Oil Change");
        testService.setType(AppointmentType.SERVICE);
        testService.setEstimatedCost(50.0);
        testService.setEstimatedTimeMinutes(60);

        // Setup test service center
        testServiceCenter = new ServiceCenter();
        testServiceCenter.setId(serviceCenterId);
        testServiceCenter.setName("Main Service Center");
        testServiceCenter.setIsActive(true);
        testServiceCenter.setCenterSlot(5);

        // Setup test appointment
        testAppointment = new Appointment();
        testAppointment.setId(appointmentId);
        testAppointment.setUser(testUser);
        testAppointment.setVehicle(testVehicle);
        testAppointment.setServiceOrModification(testService);
        testAppointment.setServiceCenter(testServiceCenter);
        testAppointment.setAppointmentType(AppointmentType.SERVICE);
        testAppointment.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0).withSecond(0));
        testAppointment.setStatus("PENDING");

        // Mock security context
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(authentication.getName()).thenReturn("customer@example.com");
    }

    // ===================================================================
    // CREATE APPOINTMENT TESTS
    // ===================================================================

    @Test
    @DisplayName("Should successfully create appointment")
    void testCreateAppointment_Success() {
        // Arrange
        Appointment newAppointment = new Appointment();
        newAppointment.setAppointmentType(AppointmentType.SERVICE);
        newAppointment.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0).withSecond(0));
        
        Vehicle vehicleRef = new Vehicle();
        vehicleRef.setId(vehicleId);
        newAppointment.setVehicle(vehicleRef);
        
        ServiceOrModification somRef = new ServiceOrModification();
        somRef.setId(serviceId);
        newAppointment.setServiceOrModification(somRef);
        
        ServiceCenter scRef = new ServiceCenter();
        scRef.setId(serviceCenterId);
        newAppointment.setServiceCenter(scRef);

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));
        when(serviceOrModificationRepository.findById(serviceId)).thenReturn(Optional.of(testService));
        when(serviceCenterRepository.findById(serviceCenterId)).thenReturn(Optional.of(testServiceCenter));
        when(appointmentRepository.findByVehicleIdAndAppointmentDateAndStatusNot(any(), any(), eq("CANCELLED")))
                .thenReturn(Collections.emptyList());
        when(appointmentRepository.countByServiceCenterIdAndAppointmentDateAndStatusNot(any(), any(), eq("CANCELLED")))
                .thenReturn(2L);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);
        doNothing().when(notificationService).sendNotification(any(), any(), any(), any());

        // Act
        Appointment result = appointmentService.createAppointment(newAppointment);

        // Assert
        assertNotNull(result);
        assertEquals("PENDING", result.getStatus());
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
        verify(notificationService, times(1)).sendNotification(any(), eq("APPOINTMENT_CREATED"), any(), any());
        verify(emailService, times(1)).sendAppointmentConfirmationEmail(any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should throw exception when vehicle not found")
    void testCreateAppointment_VehicleNotFound() {
        // Arrange
        Appointment newAppointment = new Appointment();
        Vehicle vehicleRef = new Vehicle();
        vehicleRef.setId(vehicleId);
        newAppointment.setVehicle(vehicleRef);

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.createAppointment(newAppointment);
        });
        assertEquals("Vehicle not found", exception.getMessage());
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when booking for someone else's vehicle")
    void testCreateAppointment_NotOwnVehicle() {
        // Arrange
        User anotherUser = new User();
        anotherUser.setId(UUID.randomUUID());
        testVehicle.setUser(anotherUser);

        Appointment newAppointment = new Appointment();
        Vehicle vehicleRef = new Vehicle();
        vehicleRef.setId(vehicleId);
        newAppointment.setVehicle(vehicleRef);

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.createAppointment(newAppointment);
        });
        assertEquals("You can only book for your own vehicle", exception.getMessage());
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when appointment type is null")
    void testCreateAppointment_NullAppointmentType() {
        // Arrange
        Appointment newAppointment = new Appointment();
        Vehicle vehicleRef = new Vehicle();
        vehicleRef.setId(vehicleId);
        newAppointment.setVehicle(vehicleRef);
        newAppointment.setAppointmentType(null);

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.createAppointment(newAppointment);
        });
        assertEquals("Appointment type is required", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when service center is inactive")
    void testCreateAppointment_InactiveServiceCenter() {
        // Arrange
        testServiceCenter.setIsActive(false);
        
        Appointment newAppointment = new Appointment();
        newAppointment.setAppointmentType(AppointmentType.SERVICE);
        newAppointment.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0));
        
        Vehicle vehicleRef = new Vehicle();
        vehicleRef.setId(vehicleId);
        newAppointment.setVehicle(vehicleRef);
        
        ServiceOrModification somRef = new ServiceOrModification();
        somRef.setId(serviceId);
        newAppointment.setServiceOrModification(somRef);
        
        ServiceCenter scRef = new ServiceCenter();
        scRef.setId(serviceCenterId);
        newAppointment.setServiceCenter(scRef);

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));
        when(serviceOrModificationRepository.findById(serviceId)).thenReturn(Optional.of(testService));
        when(serviceCenterRepository.findById(serviceCenterId)).thenReturn(Optional.of(testServiceCenter));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.createAppointment(newAppointment);
        });
        assertEquals("Selected service center is not currently available", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when appointment date is in the past")
    void testCreateAppointment_PastDate() {
        // Arrange
        Appointment newAppointment = new Appointment();
        newAppointment.setAppointmentType(AppointmentType.SERVICE);
        newAppointment.setAppointmentDate(LocalDateTime.now().minusDays(1).withHour(10).withMinute(0));
        
        Vehicle vehicleRef = new Vehicle();
        vehicleRef.setId(vehicleId);
        newAppointment.setVehicle(vehicleRef);
        
        ServiceOrModification somRef = new ServiceOrModification();
        somRef.setId(serviceId);
        newAppointment.setServiceOrModification(somRef);
        
        ServiceCenter scRef = new ServiceCenter();
        scRef.setId(serviceCenterId);
        newAppointment.setServiceCenter(scRef);

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));
        when(serviceOrModificationRepository.findById(serviceId)).thenReturn(Optional.of(testService));
        when(serviceCenterRepository.findById(serviceCenterId)).thenReturn(Optional.of(testServiceCenter));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.createAppointment(newAppointment);
        });
        assertEquals("Appointment date cannot be in the past", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when time slot is fully booked")
    void testCreateAppointment_FullyBooked() {
        // Arrange
        Appointment newAppointment = new Appointment();
        newAppointment.setAppointmentType(AppointmentType.SERVICE);
        newAppointment.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0));
        
        Vehicle vehicleRef = new Vehicle();
        vehicleRef.setId(vehicleId);
        newAppointment.setVehicle(vehicleRef);
        
        ServiceOrModification somRef = new ServiceOrModification();
        somRef.setId(serviceId);
        newAppointment.setServiceOrModification(somRef);
        
        ServiceCenter scRef = new ServiceCenter();
        scRef.setId(serviceCenterId);
        newAppointment.setServiceCenter(scRef);

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));
        when(serviceOrModificationRepository.findById(serviceId)).thenReturn(Optional.of(testService));
        when(serviceCenterRepository.findById(serviceCenterId)).thenReturn(Optional.of(testServiceCenter));
        when(appointmentRepository.findByVehicleIdAndAppointmentDateAndStatusNot(any(), any(), eq("CANCELLED")))
                .thenReturn(Collections.emptyList());
        when(appointmentRepository.countByServiceCenterIdAndAppointmentDateAndStatusNot(any(), any(), eq("CANCELLED")))
                .thenReturn(5L); // Fully booked (centerSlot = 5)

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.createAppointment(newAppointment);
        });
        assertTrue(exception.getMessage().contains("Service center is fully booked"));
    }

    @Test
    @DisplayName("Should throw exception for duplicate appointment")
    void testCreateAppointment_DuplicateAppointment() {
        // Arrange
        Appointment newAppointment = new Appointment();
        newAppointment.setAppointmentType(AppointmentType.SERVICE);
        newAppointment.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0));
        
        Vehicle vehicleRef = new Vehicle();
        vehicleRef.setId(vehicleId);
        newAppointment.setVehicle(vehicleRef);
        
        ServiceOrModification somRef = new ServiceOrModification();
        somRef.setId(serviceId);
        newAppointment.setServiceOrModification(somRef);
        
        ServiceCenter scRef = new ServiceCenter();
        scRef.setId(serviceCenterId);
        newAppointment.setServiceCenter(scRef);

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));
        when(serviceOrModificationRepository.findById(serviceId)).thenReturn(Optional.of(testService));
        when(serviceCenterRepository.findById(serviceCenterId)).thenReturn(Optional.of(testServiceCenter));
        when(appointmentRepository.findByVehicleIdAndAppointmentDateAndStatusNot(any(), any(), eq("CANCELLED")))
                .thenReturn(Arrays.asList(testAppointment));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.createAppointment(newAppointment);
        });
        assertTrue(exception.getMessage().contains("already has an appointment scheduled"));
    }

    // ===================================================================
    // GET APPOINTMENTS TESTS
    // ===================================================================

    @Test
    @DisplayName("Should successfully get user appointments")
    void testGetUserAppointments_Success() {
        // Arrange
        List<Appointment> appointments = Arrays.asList(testAppointment);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(appointmentRepository.findByUserId(userId)).thenReturn(appointments);

        // Act
        List<Appointment> result = appointmentService.getUserAppointments();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(appointmentId, result.get(0).getId());
        verify(appointmentRepository, times(1)).findByUserId(userId);
    }

    @Test
    @DisplayName("Should return empty list when user has no appointments")
    void testGetUserAppointments_EmptyList() {
        // Arrange
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(appointmentRepository.findByUserId(userId)).thenReturn(Collections.emptyList());

        // Act
        List<Appointment> result = appointmentService.getUserAppointments();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(appointmentRepository, times(1)).findByUserId(userId);
    }

    // ===================================================================
    // CANCEL APPOINTMENT TESTS
    // ===================================================================

    @Test
    @DisplayName("Should successfully cancel appointment")
    void testCancelAppointment_Success() {
        // Arrange
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(testAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);
        doNothing().when(notificationService).sendNotification(any(), any(), any(), any());

        // Act
        appointmentService.cancelAppointment(appointmentId);

        // Assert
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
        verify(notificationService, times(1)).sendNotification(any(), eq("APPOINTMENT_CANCELLED"), any(), any());
    }

    @Test
    @DisplayName("Should throw exception when cancelling non-existent appointment")
    void testCancelAppointment_NotFound() {
        // Arrange
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.cancelAppointment(appointmentId);
        });
        assertTrue(exception.getMessage().contains("not found"));
        verify(appointmentRepository, never()).save(any());
    }
}
