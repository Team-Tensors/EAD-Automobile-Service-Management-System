package com.ead.backend.controller;

import com.ead.backend.dto.AdminAppointmentDTO;
import com.ead.backend.dto.AdminEmployeeCenterDTO;
import com.ead.backend.entity.Appointment;
import com.ead.backend.entity.ServiceCenter;
import com.ead.backend.entity.ServiceOrModification;
import com.ead.backend.entity.User;
import com.ead.backend.entity.Vehicle;
import com.ead.backend.service.AdminService;
import com.ead.backend.service.AppointmentService;
import com.ead.backend.enums.AppointmentType;
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

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Admin Appointment Controller Unit Tests")
class AdminAppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AppointmentService appointmentService;

    @MockitoBean
    private AdminService adminService;

    private UUID appointmentId;
    private UUID employeeId;
    private UUID serviceCenterId;
    private AdminAppointmentDTO adminAppointmentDTO;
    private AdminEmployeeCenterDTO adminEmployeeCenterDTO;
    private Set<UUID> employeeIds;

    @BeforeEach
    void setUp() {
        appointmentId = UUID.randomUUID();
        employeeId = UUID.randomUUID();
        serviceCenterId = UUID.randomUUID();

        // Setup AdminAppointmentDTO
        adminAppointmentDTO = new AdminAppointmentDTO();
        adminAppointmentDTO.setId(appointmentId);
        adminAppointmentDTO.setVehicleId(UUID.randomUUID());
        adminAppointmentDTO.setVehicleName("Toyota Camry");
        adminAppointmentDTO.setLicensePlate("ABC123");
        adminAppointmentDTO.setCustomerName("John Doe");
        adminAppointmentDTO.setCustomerEmail("john@example.com");
        adminAppointmentDTO.setService("Oil Change");
        adminAppointmentDTO.setType(AppointmentType.SERVICE);
        adminAppointmentDTO.setDate("2025-11-08T10:00:00");
        adminAppointmentDTO.setStatus("PENDING");
        adminAppointmentDTO.setServiceCenter("Main Service Center");
        adminAppointmentDTO.setAssignedEmployees("Jane Smith");
        adminAppointmentDTO.setAssignedEmployeeCount(1);

        // Setup AdminEmployeeCenterDTO
        adminEmployeeCenterDTO = new AdminEmployeeCenterDTO();
        adminEmployeeCenterDTO.setEmployeeId(employeeId);
        adminEmployeeCenterDTO.setFullName("Jane Smith");
        adminEmployeeCenterDTO.setEmail("jane@example.com");
        adminEmployeeCenterDTO.setPhoneNumber("123-456-7890");
        adminEmployeeCenterDTO.setServiceCenterId(serviceCenterId);
        adminEmployeeCenterDTO.setServiceCenterName("Main Service Center");

        // Setup employee IDs set
        employeeIds = new HashSet<>();
        employeeIds.add(employeeId);
    }

    // ===================================================================
    // GET UPCOMING APPOINTMENTS TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get all upcoming appointments")
    void testGetUpcomingAppointments_AsAdmin_Success() throws Exception {
        // Arrange
        List<AdminAppointmentDTO> appointments = Arrays.asList(adminAppointmentDTO);
        when(appointmentService.getAllUpcomingAppointments()).thenReturn(appointments);

        // Act & Assert
        mockMvc.perform(get("/admin/appointments/upcoming")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(appointmentId.toString()))
                .andExpect(jsonPath("$[0].customerName").value("John Doe"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));

        verify(appointmentService, times(1)).getAllUpcomingAppointments();
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Should return empty list when no upcoming appointments")
    void testGetUpcomingAppointments_EmptyList() throws Exception {
        // Arrange
        when(appointmentService.getAllUpcomingAppointments()).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/admin/appointments/upcoming")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        verify(appointmentService, times(1)).getAllUpcomingAppointments();
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should be forbidden from accessing upcoming appointments")
    void testGetUpcomingAppointments_AsEmployee_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/admin/appointments/upcoming")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden()); // App returns 403 for insufficient privileges

        verify(appointmentService, never()).getAllUpcomingAppointments();
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = { "CUSTOMER" })
    @DisplayName("Customer: Should be forbidden from accessing upcoming appointments")
    void testGetUpcomingAppointments_AsCustomer_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/admin/appointments/upcoming")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden()); // App returns 403 for insufficient privileges

        verify(appointmentService, never()).getAllUpcomingAppointments();
    }

    // ===================================================================
    // GET ONGOING APPOINTMENTS TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get all ongoing appointments")
    void testGetOngoingAppointments_AsAdmin_Success() throws Exception {
        // Arrange
        AdminAppointmentDTO ongoingAppointment = new AdminAppointmentDTO();
        ongoingAppointment.setId(appointmentId);
        ongoingAppointment.setStatus("IN_PROGRESS");
        ongoingAppointment.setCustomerName("John Doe");

        List<AdminAppointmentDTO> appointments = Arrays.asList(ongoingAppointment);
        when(appointmentService.getAllOngoingAppointments()).thenReturn(appointments);

        // Act & Assert
        mockMvc.perform(get("/admin/appointments/ongoing")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("IN_PROGRESS"));

        verify(appointmentService, times(1)).getAllOngoingAppointments();
    }

    // ===================================================================
    // GET UNASSIGNED APPOINTMENTS TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get all unassigned appointments")
    void testGetUnassignedAppointments_AsAdmin_Success() throws Exception {
        // Arrange
        AdminAppointmentDTO unassignedAppointment = new AdminAppointmentDTO();
        unassignedAppointment.setId(appointmentId);
        unassignedAppointment.setAssignedEmployees("");
        unassignedAppointment.setAssignedEmployeeCount(0);

        List<AdminAppointmentDTO> appointments = Arrays.asList(unassignedAppointment);
        when(appointmentService.getAllUnassignedAppointments()).thenReturn(appointments);

        // Act & Assert
        mockMvc.perform(get("/admin/appointments/unassigned")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].assignedEmployeeCount").value(0));

        verify(appointmentService, times(1)).getAllUnassignedAppointments();
    }

    // ===================================================================
    // ASSIGN EMPLOYEES TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully assign employees to appointment")
    void testAssignEmployees_AsAdmin_Success() throws Exception {
        // Arrange
        Appointment mockAppointment = new Appointment();
        mockAppointment.setId(appointmentId);
        mockAppointment.setAppointmentDate(LocalDateTime.now());
        Vehicle mockVehicle = new Vehicle();
        mockVehicle.setId(UUID.randomUUID());
        mockAppointment.setVehicle(mockVehicle);
        User mockUser = new User();
        mockUser.setFullName("John Doe");
        mockAppointment.setUser(mockUser);
        ServiceOrModification mockService = new ServiceOrModification();
        mockService.setName("Oil Change");
        mockAppointment.setServiceOrModification(mockService);
        ServiceCenter mockServiceCenter = new ServiceCenter();
        mockServiceCenter.setName("Main Service Center");
        mockAppointment.setServiceCenter(mockServiceCenter);
        when(appointmentService.assignEmployees(eq(appointmentId), anySet())).thenReturn(mockAppointment);

        // Act & Assert
        mockMvc.perform(post("/admin/appointments/{appointmentId}/assign-employees", appointmentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employeeIds)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(appointmentId.toString()));

        verify(appointmentService, times(1)).assignEmployees(eq(appointmentId), anySet());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle appointment not found when assigning employees")
    void testAssignEmployees_AppointmentNotFound() throws Exception {
        // Arrange
        when(appointmentService.assignEmployees(eq(appointmentId), anySet()))
                .thenThrow(new RuntimeException("Appointment not found"));

        // Act & Assert
        mockMvc.perform(post("/admin/appointments/{appointmentId}/assign-employees", appointmentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employeeIds)))
                .andExpect(status().isBadRequest());

        verify(appointmentService, times(1)).assignEmployees(eq(appointmentId), anySet());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle invalid employee ID when assigning")
    void testAssignEmployees_InvalidEmployee() throws Exception {
        // Arrange
        when(appointmentService.assignEmployees(eq(appointmentId), anySet()))
                .thenThrow(new RuntimeException("Employee not found: " + employeeId));

        // Act & Assert
        mockMvc.perform(post("/admin/appointments/{appointmentId}/assign-employees", appointmentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employeeIds)))
                .andExpect(status().isBadRequest());

        verify(appointmentService, times(1)).assignEmployees(eq(appointmentId), anySet());
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = { "EMPLOYEE" })
    @DisplayName("Employee: Should be forbidden from assigning employees")
    void testAssignEmployees_AsEmployee_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/admin/appointments/{appointmentId}/assign-employees", appointmentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employeeIds)))
                .andExpect(status().isForbidden()); // App returns 403 for insufficient privileges

        verify(appointmentService, never()).assignEmployees(any(UUID.class), anySet());
    }

    // ===================================================================
    // GET ALL EMPLOYEES TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get all employees with service centers")
    void testGetAllEmployees_AsAdmin_Success() throws Exception {
        // Arrange
        List<AdminEmployeeCenterDTO> employees = Arrays.asList(adminEmployeeCenterDTO);
        when(adminService.getAllEmployeesWithServiceCenter()).thenReturn(employees);

        // Act & Assert
        mockMvc.perform(get("/admin/appointments/employees")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].employeeId").value(employeeId.toString()))
                .andExpect(jsonPath("$[0].fullName").value("Jane Smith"))
                .andExpect(jsonPath("$[0].serviceCenterName").value("Main Service Center"));

        verify(adminService, times(1)).getAllEmployeesWithServiceCenter();
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Should return empty list when no employees")
    void testGetAllEmployees_EmptyList() throws Exception {
        // Arrange
        when(adminService.getAllEmployeesWithServiceCenter()).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/admin/appointments/employees")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        verify(adminService, times(1)).getAllEmployeesWithServiceCenter();
    }

    // ===================================================================
    // ASSIGN EMPLOYEE TO SERVICE CENTER TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully assign employee to service center")
    void testAssignEmployeeToServiceCenter_AsAdmin_Success() throws Exception {
        // Arrange
        doNothing().when(adminService).assignEmployeeToServiceCenter(employeeId, serviceCenterId);

        // Act & Assert
        mockMvc.perform(post("/admin/appointments/assign-employee")
                .param("employeeId", employeeId.toString())
                .param("serviceCenterId", serviceCenterId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Employee assigned to Service Center successfully."));

        verify(adminService, times(1)).assignEmployeeToServiceCenter(employeeId, serviceCenterId);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle employee not found when assigning to service center")
    void testAssignEmployeeToServiceCenter_EmployeeNotFound() throws Exception {
        // Arrange
        doThrow(new RuntimeException("Employee not found"))
                .when(adminService).assignEmployeeToServiceCenter(employeeId, serviceCenterId);

        // Act & Assert
        mockMvc.perform(post("/admin/appointments/assign-employee")
                .param("employeeId", employeeId.toString())
                .param("serviceCenterId", serviceCenterId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        verify(adminService, times(1)).assignEmployeeToServiceCenter(employeeId, serviceCenterId);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle service center not found when assigning employee")
    void testAssignEmployeeToServiceCenter_ServiceCenterNotFound() throws Exception {
        // Arrange
        doThrow(new RuntimeException("Service Center not found"))
                .when(adminService).assignEmployeeToServiceCenter(employeeId, serviceCenterId);

        // Act & Assert
        mockMvc.perform(post("/admin/appointments/assign-employee")
                .param("employeeId", employeeId.toString())
                .param("serviceCenterId", serviceCenterId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        verify(adminService, times(1)).assignEmployeeToServiceCenter(employeeId, serviceCenterId);
    }

    // ===================================================================
    // UNAUTHORIZED ACCESS TESTS
    // ===================================================================

    @Test
    @DisplayName("Should return 401 for all endpoints when not authenticated")
    void testAllEndpoints_Unauthorized() throws Exception {
        // GET upcoming appointments
        mockMvc.perform(get("/admin/appointments/upcoming"))
                .andExpect(status().isUnauthorized());

        // GET ongoing appointments
        mockMvc.perform(get("/admin/appointments/ongoing"))
                .andExpect(status().isUnauthorized());

        // GET unassigned appointments
        mockMvc.perform(get("/admin/appointments/unassigned"))
                .andExpect(status().isUnauthorized());

        // POST assign employees
        mockMvc.perform(post("/admin/appointments/{appointmentId}/assign-employees", appointmentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employeeIds)))
                .andExpect(status().isUnauthorized());

        // GET employees
        mockMvc.perform(get("/admin/appointments/employees"))
                .andExpect(status().isUnauthorized());

        // POST assign employee to service center
        mockMvc.perform(post("/admin/appointments/assign-employee")
                .param("employeeId", employeeId.toString())
                .param("serviceCenterId", serviceCenterId.toString()))
                .andExpect(status().isUnauthorized());

        // Verify services were never called
        verify(appointmentService, never()).getAllUpcomingAppointments();
        verify(appointmentService, never()).getAllOngoingAppointments();
        verify(appointmentService, never()).getAllUnassignedAppointments();
        verify(appointmentService, never()).assignEmployees(any(UUID.class), anySet());
        verify(adminService, never()).getAllEmployeesWithServiceCenter();
        verify(adminService, never()).assignEmployeeToServiceCenter(any(UUID.class), any(UUID.class));
    }
}
