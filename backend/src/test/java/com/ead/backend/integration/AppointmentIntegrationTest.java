package com.ead.backend.integration;

import com.ead.backend.dto.AppointmentBookingRequestDTO;
import com.ead.backend.entity.*;
import com.ead.backend.enums.AppointmentType;
import com.ead.backend.repository.*;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Appointment Integration Tests")
class AppointmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceOrModificationRepository serviceOrModificationRepository;

    @Autowired
    private ServiceCenterRepository serviceCenterRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testCustomer;
    private Vehicle testVehicle;
    private ServiceOrModification testService;
    private ServiceCenter testServiceCenter;
    private AppointmentBookingRequestDTO bookingRequest;

    @BeforeEach
    void setUp() {
        // Clean up
        appointmentRepository.deleteAll();
        vehicleRepository.deleteAll();
        
        // Create test customer
        testCustomer = userRepository.findByEmail("appointment-test@example.com")
                .orElseGet(() -> {
                    User user = new User();
                    user.setEmail("appointment-test@example.com");
                    user.setPassword(passwordEncoder.encode("password123"));
                    user.setFullName("Appointment Test User");
                    user.setPhoneNumber("1234567890");
                    return userRepository.save(user);
                });

        // Create test vehicle
        testVehicle = new Vehicle();
        testVehicle.setBrand("Toyota");
        testVehicle.setModel("Camry");
        testVehicle.setYear(2023);
        testVehicle.setColor("White");
        testVehicle.setLicensePlate("APPT123");
        testVehicle.setUser(testCustomer);
        testVehicle = vehicleRepository.save(testVehicle);

        // Create test service
        testService = serviceOrModificationRepository.findAll().stream()
                .filter(s -> s.getType().equals(AppointmentType.SERVICE))
                .findFirst()
                .orElseGet(() -> {
                    ServiceOrModification service = new ServiceOrModification();
                    service.setName("Integration Test Service");
                    service.setType(AppointmentType.SERVICE);
                    service.setEstimatedCost(100.0);
                    service.setEstimatedTimeMinutes(60);
                    service.setDescription("Test service for integration");
                    return serviceOrModificationRepository.save(service);
                });

        // Create test service center
        testServiceCenter = serviceCenterRepository.findAll().stream()
                .filter(ServiceCenter::getIsActive)
                .findFirst()
                .orElseGet(() -> {
                    ServiceCenter center = new ServiceCenter();
                    center.setName("Integration Test Center");
                    center.setAddress("123 Test Street");
                    center.setCity("Test City");
                    center.setPhone("1234567890");
                    center.setEmail("test@center.com");
                    center.setIsActive(true);
                    center.setCenterSlot(5);
                    return serviceCenterRepository.save(center);
                });

        // Setup booking request
        bookingRequest = new AppointmentBookingRequestDTO();
        bookingRequest.setVehicleId(testVehicle.getId());
        bookingRequest.setServiceOrModificationId(testService.getId());
        bookingRequest.setServiceCenterId(testServiceCenter.getId());
        bookingRequest.setAppointmentType(AppointmentType.SERVICE);
        bookingRequest.setAppointmentDate(LocalDateTime.now().plusDays(3).withHour(10).withMinute(0).withSecond(0).withNano(0));
        bookingRequest.setDescription("Integration test appointment");
    }

    // ===================================================================
    // CREATE APPOINTMENT INTEGRATION TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "appointment-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should book appointment end-to-end")
    void testBookAppointment_EndToEnd() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.serviceName").value(testService.getName()));

        // Verify in database
        List<Appointment> appointments = appointmentRepository.findByUserId(testCustomer.getId());
        assertEquals(1, appointments.size());
        assertEquals("PENDING", appointments.get(0).getStatus());
        assertEquals(testVehicle.getId(), appointments.get(0).getVehicle().getId());
    }

    @Test
    @WithMockUser(username = "appointment-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should prevent duplicate appointments")
    void testBookAppointment_PreventDuplicate() throws Exception {
        // Book first appointment
        mockMvc.perform(post("/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isCreated());

        // Try to book same slot again
        mockMvc.perform(post("/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("already has an appointment")));

        // Verify only one appointment exists
        List<Appointment> appointments = appointmentRepository.findByUserId(testCustomer.getId());
        assertEquals(1, appointments.size());
    }

    @Test
    @WithMockUser(username = "appointment-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should reject past appointment dates")
    void testBookAppointment_RejectPastDate() throws Exception {
        // Set past date
        bookingRequest.setAppointmentDate(LocalDateTime.now().minusDays(1).withHour(10).withMinute(0));

        // Act & Assert
        mockMvc.perform(post("/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isBadRequest());

        // Verify no appointment was created
        List<Appointment> appointments = appointmentRepository.findByUserId(testCustomer.getId());
        assertEquals(0, appointments.size());
    }

    // ===================================================================
    // GET APPOINTMENTS INTEGRATION TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "appointment-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should retrieve user appointments")
    void testGetMyAppointments_EndToEnd() throws Exception {
        // Create appointment in database
        Appointment appointment = new Appointment();
        appointment.setUser(testCustomer);
        appointment.setVehicle(testVehicle);
        appointment.setServiceOrModification(testService);
        appointment.setServiceCenter(testServiceCenter);
        appointment.setAppointmentType(AppointmentType.SERVICE);
        appointment.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(14).withMinute(0));
        appointment.setStatus("PENDING");
        appointmentRepository.save(appointment);

        // Act & Assert
        mockMvc.perform(get("/appointments/my-appointments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].service").value(testService.getName()))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].type").value("SERVICE"));
    }

    @Test
    @WithMockUser(username = "appointment-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should return empty list for new user")
    void testGetMyAppointments_EmptyForNewUser() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/appointments/my-appointments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    // ===================================================================
    // CANCEL APPOINTMENT INTEGRATION TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "appointment-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should cancel appointment end-to-end")
    void testCancelAppointment_EndToEnd() throws Exception {
        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setUser(testCustomer);
        appointment.setVehicle(testVehicle);
        appointment.setServiceOrModification(testService);
        appointment.setServiceCenter(testServiceCenter);
        appointment.setAppointmentType(AppointmentType.SERVICE);
        appointment.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(11).withMinute(0));
        appointment.setStatus("PENDING");
        Appointment saved = appointmentRepository.save(appointment);

        // Act & Assert
        mockMvc.perform(put("/appointments/{appointmentId}/cancel", saved.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Appointment cancelled successfully"))
                .andExpect(jsonPath("$.success").value(true));

        // Verify status changed in database
        Appointment cancelled = appointmentRepository.findById(saved.getId()).orElseThrow();
        assertEquals("CANCELLED", cancelled.getStatus());
    }

    @Test
    @WithMockUser(username = "appointment-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should not allow cancelling non-existent appointment")
    void testCancelAppointment_NotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(put("/appointments/{appointmentId}/cancel", java.util.UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    // ===================================================================
    // BUSINESS LOGIC INTEGRATION TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "appointment-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should enforce service center capacity")
    void testBookAppointment_ServiceCenterCapacity() throws Exception {
        // Book appointments up to capacity
        int capacity = testServiceCenter.getCenterSlot();
        
        for (int i = 0; i < capacity; i++) {
            // Create unique vehicle for each appointment
            Vehicle vehicle = new Vehicle();
            vehicle.setBrand("Brand" + i);
            vehicle.setModel("Model" + i);
            vehicle.setYear(2023);
            vehicle.setColor("Color" + i);
            vehicle.setLicensePlate("CAP" + i);
            vehicle.setUser(testCustomer);
            vehicle = vehicleRepository.save(vehicle);

            AppointmentBookingRequestDTO request = new AppointmentBookingRequestDTO();
            request.setVehicleId(vehicle.getId());
            request.setServiceOrModificationId(testService.getId());
            request.setServiceCenterId(testServiceCenter.getId());
            request.setAppointmentType(AppointmentType.SERVICE);
            request.setAppointmentDate(bookingRequest.getAppointmentDate());
            request.setDescription("Capacity test " + i);

            mockMvc.perform(post("/appointments/book")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        // Try to book one more - should fail
        Vehicle extraVehicle = new Vehicle();
        extraVehicle.setBrand("Extra");
        extraVehicle.setModel("Extra");
        extraVehicle.setYear(2023);
        extraVehicle.setColor("Extra");
        extraVehicle.setLicensePlate("EXTRA");
        extraVehicle.setUser(testCustomer);
        extraVehicle = vehicleRepository.save(extraVehicle);

        AppointmentBookingRequestDTO extraRequest = new AppointmentBookingRequestDTO();
        extraRequest.setVehicleId(extraVehicle.getId());
        extraRequest.setServiceOrModificationId(testService.getId());
        extraRequest.setServiceCenterId(testServiceCenter.getId());
        extraRequest.setAppointmentType(AppointmentType.SERVICE);
        extraRequest.setAppointmentDate(bookingRequest.getAppointmentDate());

        mockMvc.perform(post("/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(extraRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("fully booked")));
    }

    @Test
    @WithMockUser(username = "appointment-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Complete appointment workflow")
    void testCompleteAppointmentWorkflow() throws Exception {
        // 1. BOOK APPOINTMENT
        String bookResponse = mockMvc.perform(post("/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String appointmentId = objectMapper.readTree(bookResponse).get("id").asText();

        // 2. GET MY APPOINTMENTS (should include the new one)
        mockMvc.perform(get("/appointments/my-appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(appointmentId))
                .andExpect(jsonPath("$[0].status").value("PENDING"));

        // 3. CANCEL APPOINTMENT
        mockMvc.perform(put("/appointments/{appointmentId}/cancel", appointmentId))
                .andExpect(status().isOk());

        // 4. VERIFY CANCELLATION
        mockMvc.perform(get("/appointments/my-appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("CANCELLED"));

        // 5. VERIFY IN DATABASE
        Appointment appointment = appointmentRepository.findById(java.util.UUID.fromString(appointmentId)).orElseThrow();
        assertEquals("CANCELLED", appointment.getStatus());
    }

    @Test
    @WithMockUser(username = "appointment-test@example.com", roles = {"CUSTOMER"})
    @DisplayName("Integration: Should allow booking different time slots")
    void testBookAppointment_DifferentTimeSlots() throws Exception {
        // Book first appointment at 10:00
        AppointmentBookingRequestDTO request1 = new AppointmentBookingRequestDTO();
        request1.setVehicleId(testVehicle.getId());
        request1.setServiceOrModificationId(testService.getId());
        request1.setServiceCenterId(testServiceCenter.getId());
        request1.setAppointmentType(AppointmentType.SERVICE);
        request1.setAppointmentDate(LocalDateTime.now().plusDays(3).withHour(10).withMinute(0).withSecond(0).withNano(0));

        mockMvc.perform(post("/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());

        // Create another vehicle
        Vehicle vehicle2 = new Vehicle();
        vehicle2.setBrand("Honda");
        vehicle2.setModel("Civic");
        vehicle2.setYear(2024);
        vehicle2.setColor("Black");
        vehicle2.setLicensePlate("SLOT2");
        vehicle2.setUser(testCustomer);
        vehicle2 = vehicleRepository.save(vehicle2);

        // Book second appointment at 14:00 (different time)
        AppointmentBookingRequestDTO request2 = new AppointmentBookingRequestDTO();
        request2.setVehicleId(vehicle2.getId());
        request2.setServiceOrModificationId(testService.getId());
        request2.setServiceCenterId(testServiceCenter.getId());
        request2.setAppointmentType(AppointmentType.SERVICE);
        request2.setAppointmentDate(LocalDateTime.now().plusDays(3).withHour(14).withMinute(0).withSecond(0).withNano(0));

        mockMvc.perform(post("/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isCreated());

        // Verify both appointments exist
        List<Appointment> appointments = appointmentRepository.findByUserId(testCustomer.getId());
        assertEquals(2, appointments.size());
    }
}
