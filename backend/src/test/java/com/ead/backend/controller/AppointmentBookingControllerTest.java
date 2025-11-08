package com.ead.backend.controller;

import com.ead.backend.dto.AppointmentBookingRequestDTO;
import com.ead.backend.entity.*;
import com.ead.backend.enums.AppointmentType;
import com.ead.backend.service.AppointmentService;
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

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Appointment Controller Unit Tests")
class AppointmentBookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AppointmentService appointmentService;

    private UUID userId;
    private UUID vehicleId;
    private UUID serviceId;
    private UUID serviceCenterId;
    private UUID appointmentId;
    private User testUser;
    private Vehicle testVehicle;
    private ServiceOrModification testService;
    private ServiceCenter testServiceCenter;
    private Appointment testAppointment;
    private AppointmentBookingRequestDTO bookingRequest;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        vehicleId = UUID.randomUUID();
        serviceId = UUID.randomUUID();
        serviceCenterId = UUID.randomUUID();
        appointmentId = UUID.randomUUID();

        // Setup test entities
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("customer@example.com");
        testUser.setFullName("Test Customer");

        testVehicle = new Vehicle();
        testVehicle.setId(vehicleId);
        testVehicle.setBrand("Toyota");
        testVehicle.setModel("Camry");
        testVehicle.setYear(2023);

        testService = new ServiceOrModification();
        testService.setId(serviceId);
        testService.setName("Oil Change");
        testService.setType(AppointmentType.SERVICE);

        testServiceCenter = new ServiceCenter();
        testServiceCenter.setId(serviceCenterId);
        testServiceCenter.setName("Main Service Center");

        testAppointment = new Appointment();
        testAppointment.setId(appointmentId);
        testAppointment.setUser(testUser);
        testAppointment.setVehicle(testVehicle);
        testAppointment.setServiceOrModification(testService);
        testAppointment.setServiceCenter(testServiceCenter);
        testAppointment.setAppointmentType(AppointmentType.SERVICE);
        testAppointment.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0));
        testAppointment.setStatus("PENDING");

        // Setup booking request DTO
        bookingRequest = new AppointmentBookingRequestDTO();
        bookingRequest.setVehicleId(vehicleId);
        bookingRequest.setServiceOrModificationId(serviceId);
        bookingRequest.setServiceCenterId(serviceCenterId);
        bookingRequest.setAppointmentType(AppointmentType.SERVICE);
        bookingRequest.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0));
        bookingRequest.setDescription("Regular service");
    }

    // ===================================================================
    // BOOK APPOINTMENT TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should successfully book appointment")
    void testBookAppointment_Success() throws Exception {
        // Arrange
        when(appointmentService.createAppointment(any(Appointment.class))).thenReturn(testAppointment);

        // Act & Assert
        mockMvc.perform(post("/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(appointmentId.toString()))
                .andExpect(jsonPath("$.vehicleId").value(vehicleId.toString()))
                .andExpect(jsonPath("$.serviceName").value("Oil Change"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.message").exists());

        verify(appointmentService, times(1)).createAppointment(any(Appointment.class));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should return 400 when validation fails")
    void testBookAppointment_ValidationError() throws Exception {
        // Arrange - Invalid request (missing required fields)
        AppointmentBookingRequestDTO invalidRequest = new AppointmentBookingRequestDTO();

        // Act & Assert
        mockMvc.perform(post("/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(appointmentService, never()).createAppointment(any(Appointment.class));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should handle service errors gracefully")
    void testBookAppointment_ServiceError() throws Exception {
        // Arrange
        when(appointmentService.createAppointment(any(Appointment.class)))
                .thenThrow(new RuntimeException("Service center is fully booked"));

        // Act & Assert
        mockMvc.perform(post("/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Service center is fully booked"))
                .andExpect(jsonPath("$.success").value(false));

        verify(appointmentService, times(1)).createAppointment(any(Appointment.class));
    }


    @Test
    @DisplayName("Should return 401 when not authenticated")
    void testBookAppointment_Unauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isUnauthorized());

        verify(appointmentService, never()).createAppointment(any(Appointment.class));
    }

    // ===================================================================
    // GET MY APPOINTMENTS TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should successfully get user appointments")
    void testGetMyAppointments_Success() throws Exception {
        // Arrange
        List<Appointment> appointments = Arrays.asList(testAppointment);
        when(appointmentService.getUserAppointments()).thenReturn(appointments);

        // Act & Assert
        mockMvc.perform(get("/appointments/my-appointments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(appointmentId.toString()))
                .andExpect(jsonPath("$[0].vehicle").exists())
                .andExpect(jsonPath("$[0].service").value("Oil Change"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));

        verify(appointmentService, times(1)).getUserAppointments();
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should return empty list when no appointments")
    void testGetMyAppointments_EmptyList() throws Exception {
        // Arrange
        when(appointmentService.getUserAppointments()).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/appointments/my-appointments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        verify(appointmentService, times(1)).getUserAppointments();
    }

    @Test
    @DisplayName("Should return 401 when not authenticated for getting appointments")
    void testGetMyAppointments_Unauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/appointments/my-appointments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verify(appointmentService, never()).getUserAppointments();
    }

    // ===================================================================
    // CANCEL APPOINTMENT TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("Should handle cancellation errors")
    void testCancelAppointment_Error() throws Exception {
        // Arrange
        doThrow(new RuntimeException("Appointment not found"))
                .when(appointmentService).cancelAppointment(appointmentId);

        // Act & Assert
        mockMvc.perform(put("/appointments/{appointmentId}/cancel", appointmentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Appointment not found"))
                .andExpect(jsonPath("$.success").value(false));

        verify(appointmentService, times(1)).cancelAppointment(appointmentId);
    }

    @Test
    @DisplayName("Should return 401 when not authenticated for cancelling")
    void testCancelAppointment_Unauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(put("/appointments/{appointmentId}/cancel", appointmentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verify(appointmentService, never()).cancelAppointment(any());
    }

    // ===================================================================
    // GET AVAILABLE SLOTS TESTS
    // ===================================================================

    @Test
    @DisplayName("Should return 401 when not authenticated for getting slots")
    void testGetAvailableSlots_Unauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/appointments/available-slots")
                        .param("serviceCenterId", serviceCenterId.toString())
                        .param("date", "2024-12-15")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verify(appointmentService, never()).getAvailableSlotsByHour(any(), any());
    }
}
