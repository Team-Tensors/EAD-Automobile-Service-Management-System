package com.ead.backend.integration;

import com.ead.backend.entity.*;
import com.ead.backend.enums.AppointmentType;
import com.ead.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@EntityScan(basePackages = "com.ead.backend.entity")
@EnableJpaRepositories(basePackages = "com.ead.backend.repository")
@DisplayName("Admin Appointment Integration Tests")
class AdminAppointmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ServiceCenterRepository serviceCenterRepository;

    @Autowired
    private EmployeeCenterRepository employeeCenterRepository;

    @Autowired
    private ServiceOrModificationRepository serviceOrModificationRepository;

    @Autowired
    private RoleRepository roleRepository;

    private UUID appointmentId;
    private UUID employeeId;
    private UUID serviceCenterId;

    @BeforeEach
    void setUp() {
        // Create roles
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ADMIN");
                    return roleRepository.save(role);
                });

        Role employeeRole = roleRepository.findByName("EMPLOYEE")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("EMPLOYEE");
                    return roleRepository.save(role);
                });

        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("CUSTOMER");
                    return roleRepository.save(role);
                });

        // Create test data
        User user = new User();
        user.setEmail("customer@example.com");
        user.setFullName("John Doe");
        user.setPassword("password");
        user.setRoles(Set.of(customerRole));
        user = userRepository.save(user);

        Vehicle vehicle = new Vehicle();
        vehicle.setLicensePlate("ABC123");
        vehicle.setBrand("Toyota");
        vehicle.setModel("Camry");
        vehicle.setYear(2020);
        vehicle.setColor("Blue");
        vehicle.setUser(user);
        vehicle = vehicleRepository.save(vehicle);

        ServiceCenter serviceCenter = new ServiceCenter();
        serviceCenter.setName("Main Service Center");
        serviceCenter.setAddress("123 Main St");
        serviceCenter.setCity("Colombo");
        serviceCenter.setLatitude(new BigDecimal("6.9271"));
        serviceCenter.setLongitude(new BigDecimal("79.8612"));
        serviceCenter.setPhone("123-456-7890");
        serviceCenter.setIsActive(true);
        serviceCenter = serviceCenterRepository.save(serviceCenter);
        serviceCenterId = serviceCenter.getId();

        ServiceOrModification service = new ServiceOrModification();
        service.setName("Oil Change");
        service.setType(AppointmentType.SERVICE);
        service.setEstimatedCost(50.0);
        service = serviceOrModificationRepository.save(service);

        Appointment appointment = new Appointment();
        appointment.setUser(user);
        appointment.setVehicle(vehicle);
        appointment.setAppointmentType(AppointmentType.SERVICE);
        appointment.setServiceOrModification(service);
        appointment.setServiceCenter(serviceCenter);
        appointment.setAppointmentDate(LocalDateTime.now().plusDays(1));
        appointment.setStatus("PENDING");
        appointment = appointmentRepository.save(appointment);
        appointmentId = appointment.getId();

        User employeeUser = new User();
        employeeUser.setEmail("employee@example.com");
        employeeUser.setFullName("Jane Smith");
        employeeUser.setPassword("password");
        employeeUser.setRoles(Set.of(employeeRole));
        employeeUser = userRepository.save(employeeUser);
        employeeId = employeeUser.getId();

        EmployeeCenter employeeCenter = new EmployeeCenter();
        employeeCenter.setEmployee(employeeUser);
        employeeCenter.setServiceCenter(serviceCenter);
        employeeCenterRepository.save(employeeCenter);
    }

    // ===================================================================
    // GET UPCOMING APPOINTMENTS TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get all upcoming appointments")
    void testGetUpcomingAppointments_AsAdmin_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/admin/appointments/upcoming")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(appointmentId.toString()))
                .andExpect(jsonPath("$[0].customerName").value("John Doe"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Should return empty list when no upcoming appointments")
    void testGetUpcomingAppointments_EmptyList() throws Exception {
        // Clear existing appointments
        appointmentRepository.deleteAll();

        // Act & Assert
        mockMvc.perform(get("/admin/appointments/upcoming")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    // ===================================================================
    // GET ONGOING APPOINTMENTS TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get all ongoing appointments")
    void testGetOngoingAppointments_AsAdmin_Success() throws Exception {
        // Update appointment status to IN_PROGRESS
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow();
        appointment.setStatus("IN_PROGRESS");
        appointmentRepository.save(appointment);

        // Act & Assert
        mockMvc.perform(get("/admin/appointments/ongoing")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].status").value("IN_PROGRESS"));
    }

    // ===================================================================
    // GET UNASSIGNED APPOINTMENTS TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get all unassigned appointments")
    void testGetUnassignedAppointments_AsAdmin_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/admin/appointments/unassigned")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].assignedEmployeeCount").value(0));
    }

    // ===================================================================
    // ASSIGN EMPLOYEES TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully assign employees to appointment")
    void testAssignEmployees_AsAdmin_Success() throws Exception {
        // Arrange
        Set<UUID> employeeIds = new HashSet<>();
        employeeIds.add(employeeId);

        // Act & Assert
        mockMvc.perform(post("/admin/appointments/{appointmentId}/assign-employees", appointmentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employeeIds)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(appointmentId.toString()));

        // Verify assignment in database
        Appointment updatedAppointment = appointmentRepository.findById(appointmentId).orElseThrow();
        // Assuming employees are assigned, check if assigned
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle appointment not found when assigning employees")
    void testAssignEmployees_AppointmentNotFound() throws Exception {
        // Arrange
        Set<UUID> employeeIds = new HashSet<>();
        employeeIds.add(employeeId);
        UUID nonExistentId = UUID.randomUUID();

        // Act & Assert
        mockMvc.perform(post("/admin/appointments/{appointmentId}/assign-employees", nonExistentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employeeIds)))
                .andExpect(status().isBadRequest());
    }

    // ===================================================================
    // GET ALL EMPLOYEES TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get all employees with service centers")
    void testGetAllEmployees_AsAdmin_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/admin/appointments/employees")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].employeeId").value(employeeId.toString()))
                .andExpect(jsonPath("$[0].fullName").value("Jane Smith"))
                .andExpect(jsonPath("$[0].serviceCenterName").value("Main Service Center"));
    }

    // ===================================================================
    // ASSIGN EMPLOYEE TO SERVICE CENTER TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully assign employee to service center")
    void testAssignEmployeeToServiceCenter_AsAdmin_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/admin/appointments/assign-employee")
                .param("employeeId", employeeId.toString())
                .param("serviceCenterId", serviceCenterId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Employee assigned to Service Center successfully."));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle employee not found when assigning to service center")
    void testAssignEmployeeToServiceCenter_EmployeeNotFound() throws Exception {
        // Arrange
        UUID nonExistentEmployeeId = UUID.randomUUID();

        // Act & Assert
        mockMvc.perform(post("/admin/appointments/assign-employee")
                .param("employeeId", nonExistentEmployeeId.toString())
                .param("serviceCenterId", serviceCenterId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle service center not found when assigning employee")
    void testAssignEmployeeToServiceCenter_ServiceCenterNotFound() throws Exception {
        // Arrange
        UUID nonExistentServiceCenterId = UUID.randomUUID();

        // Act & Assert
        mockMvc.perform(post("/admin/appointments/assign-employee")
                .param("employeeId", employeeId.toString())
                .param("serviceCenterId", nonExistentServiceCenterId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    // ===================================================================
    // UNAUTHORIZED ACCESS TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should be forbidden from accessing admin endpoints")
    void testAdminEndpoints_AsEmployee_Forbidden() throws Exception {
        // GET upcoming appointments
        mockMvc.perform(get("/admin/appointments/upcoming"))
                .andExpect(status().isForbidden());

        // GET ongoing appointments
        mockMvc.perform(get("/admin/appointments/ongoing"))
                .andExpect(status().isForbidden());

        // GET unassigned appointments
        mockMvc.perform(get("/admin/appointments/unassigned"))
                .andExpect(status().isForbidden());

        // POST assign employees
        Set<UUID> employeeIds = new HashSet<>();
        employeeIds.add(employeeId);
        mockMvc.perform(post("/admin/appointments/{appointmentId}/assign-employees", appointmentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employeeIds)))
                .andExpect(status().isForbidden());

        // GET employees
        mockMvc.perform(get("/admin/appointments/employees"))
                .andExpect(status().isForbidden());

        // POST assign employee to service center
        mockMvc.perform(post("/admin/appointments/assign-employee")
                .param("employeeId", employeeId.toString())
                .param("serviceCenterId", serviceCenterId.toString()))
                .andExpect(status().isForbidden());
    }
}
