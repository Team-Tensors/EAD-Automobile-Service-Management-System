package com.ead.backend.controller;

import com.ead.backend.dto.*;
import com.ead.backend.enums.AppointmentType;
import com.ead.backend.enums.PeriodType;
import com.ead.backend.service.AnalyticsService;
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
@DisplayName("Analytics Controller Unit Tests")
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AnalyticsService analyticsService;

    private UUID serviceCenterId;
    private ServiceDistributionResponseDTO serviceDistributionDTO;
    private RevenueTrendResponseDTO revenueTrendDTO;
    private EmployeePerformanceResponseDTO employeePerformanceDTO;
    private CustomerInsightsResponseDTO customerInsightsDTO;
    private AnalyticsDashboardDTO dashboardDTO;
    private AnalyticsFilterRequestDTO filterDTO;

    @BeforeEach
    void setUp() {
        serviceCenterId = UUID.randomUUID();

        // Setup ServiceDistributionResponseDTO
        serviceDistributionDTO = new ServiceDistributionResponseDTO();
        serviceDistributionDTO.setTotalAppointments(100L);
        serviceDistributionDTO.setServiceCount(70L);
        serviceDistributionDTO.setModificationCount(30L);
        serviceDistributionDTO.setServicePercentage(70.0);
        serviceDistributionDTO.setModificationPercentage(30.0);

        List<ServiceTypeDistributionDTO> serviceBreakdown = new ArrayList<>();
        ServiceTypeDistributionDTO serviceDTO = new ServiceTypeDistributionDTO();
        serviceDTO.setServiceId(UUID.randomUUID());
        serviceDTO.setServiceName("Oil Change");
        serviceDTO.setServiceType(AppointmentType.SERVICE);
        serviceDTO.setCount(50L);
        serviceDTO.setPercentage(50.0);
        serviceDTO.setTotalRevenue(2500.0);
        serviceDTO.setAverageCost(50.0);
        serviceBreakdown.add(serviceDTO);
        serviceDistributionDTO.setServiceBreakdown(serviceBreakdown);

        // Setup RevenueTrendResponseDTO
        revenueTrendDTO = new RevenueTrendResponseDTO();
        revenueTrendDTO.setTotalRevenue(5000.0);
        revenueTrendDTO.setAverageRevenue(500.0);
        revenueTrendDTO.setMaxRevenue(800.0);
        revenueTrendDTO.setMinRevenue(200.0);
        revenueTrendDTO.setTotalAppointments(100L);
        revenueTrendDTO.setPeriodType(PeriodType.DAILY);

        // Setup EmployeePerformanceResponseDTO
        employeePerformanceDTO = new EmployeePerformanceResponseDTO();
        employeePerformanceDTO.setTotalEmployees(5);
        employeePerformanceDTO.setTotalAppointments(100L);
        employeePerformanceDTO.setAverageCompletionRate(85.0);
        employeePerformanceDTO.setTotalHoursLogged(200.0);

        // Setup CustomerInsightsResponseDTO
        customerInsightsDTO = new CustomerInsightsResponseDTO();
        customerInsightsDTO.setTotalCustomers(50L);
        customerInsightsDTO.setRepeatCustomers(30L);
        customerInsightsDTO.setNewCustomers(20L);
        customerInsightsDTO.setRepeatCustomerRate(60.0);
        customerInsightsDTO.setAverageAppointmentsPerCustomer(2.0);
        customerInsightsDTO.setAverageSpendPerCustomer(150.0);
        customerInsightsDTO.setTotalAppointments(100L);

        // Setup AnalyticsDashboardDTO
        dashboardDTO = new AnalyticsDashboardDTO();
        dashboardDTO.setTotalRevenue(5000.0);
        dashboardDTO.setTotalAppointments(100L);
        dashboardDTO.setCompletedAppointments(80L);
        dashboardDTO.setTotalCustomers(50L);
        dashboardDTO.setTotalEmployees(10L);
        dashboardDTO.setCompletionRate(80.0);

        // Setup AnalyticsFilterRequestDTO
        filterDTO = new AnalyticsFilterRequestDTO();
        filterDTO.setStartDate(LocalDateTime.now().minusDays(30));
        filterDTO.setEndDate(LocalDateTime.now());
        filterDTO.setServiceCenterId(serviceCenterId);
        filterDTO.setAppointmentType(AppointmentType.SERVICE);
        filterDTO.setStatus("COMPLETED");
        filterDTO.setPeriodType(PeriodType.DAILY);
        filterDTO.setAllTime(false);
    }

    // ===================================================================
    // SERVICE DISTRIBUTION TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get service distribution analytics")
    void testGetServiceDistribution_AsAdmin_Success() throws Exception {
        // Arrange
        when(analyticsService.getServiceTypeDistribution(any(AnalyticsFilterRequestDTO.class))).thenReturn(serviceDistributionDTO);

        // Act & Assert
        mockMvc.perform(get("/analytics/service-distribution")
                .param("startDate", "2025-10-01T00:00:00")
                .param("endDate", "2025-11-01T00:00:00")
                .param("serviceCenterId", serviceCenterId.toString())
                .param("appointmentType", "SERVICE")
                .param("status", "COMPLETED")
                .param("allTime", "false")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Service distribution retrieved successfully"))
                .andExpect(jsonPath("$.data.totalAppointments").value(100))
                .andExpect(jsonPath("$.data.serviceCount").value(70));

        verify(analyticsService, times(1)).getServiceTypeDistribution(any(AnalyticsFilterRequestDTO.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should get service distribution with all time filter")
    void testGetServiceDistribution_AllTime() throws Exception {
        // Arrange
        when(analyticsService.getServiceTypeDistribution(any(AnalyticsFilterRequestDTO.class))).thenReturn(serviceDistributionDTO);

        // Act & Assert
        mockMvc.perform(get("/analytics/service-distribution")
                .param("allTime", "true")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalAppointments").value(100));

        verify(analyticsService, times(1)).getServiceTypeDistribution(any(AnalyticsFilterRequestDTO.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle error when getting service distribution")
    void testGetServiceDistribution_Error() throws Exception {
        // Arrange
        when(analyticsService.getServiceTypeDistribution(any(AnalyticsFilterRequestDTO.class)))
                .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        mockMvc.perform(get("/analytics/service-distribution")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Error retrieving service distribution: Database error"));

        verify(analyticsService, times(1)).getServiceTypeDistribution(any(AnalyticsFilterRequestDTO.class));
    }

    // ===================================================================
    // REVENUE TREND TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get revenue trend analytics")
    void testGetRevenueTrend_AsAdmin_Success() throws Exception {
        // Arrange
        when(analyticsService.getRevenueTrend(any(AnalyticsFilterRequestDTO.class))).thenReturn(revenueTrendDTO);

        // Act & Assert
        mockMvc.perform(get("/analytics/revenue-trend")
                .param("startDate", "2025-10-01T00:00:00")
                .param("endDate", "2025-11-01T00:00:00")
                .param("serviceCenterId", serviceCenterId.toString())
                .param("periodType", "DAILY")
                .param("allTime", "false")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalRevenue").value(5000.0))
                .andExpect(jsonPath("$.data.totalAppointments").value(100));

        verify(analyticsService, times(1)).getRevenueTrend(any(AnalyticsFilterRequestDTO.class));
    }

    // ===================================================================
    // EMPLOYEE PERFORMANCE TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get employee performance analytics")
    void testGetEmployeePerformance_AsAdmin_Success() throws Exception {
        // Arrange
        when(analyticsService.getEmployeePerformance(any(AnalyticsFilterRequestDTO.class))).thenReturn(employeePerformanceDTO);

        // Act & Assert
        mockMvc.perform(get("/analytics/employee-performance")
                .param("startDate", "2025-10-01T00:00:00")
                .param("endDate", "2025-11-01T00:00:00")
                .param("serviceCenterId", serviceCenterId.toString())
                .param("allTime", "false")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalEmployees").value(5))
                .andExpect(jsonPath("$.data.averageCompletionRate").value(85.0));

        verify(analyticsService, times(1)).getEmployeePerformance(any(AnalyticsFilterRequestDTO.class));
    }

    // ===================================================================
    // CUSTOMER INSIGHTS TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get customer insights analytics")
    void testGetCustomerInsights_AsAdmin_Success() throws Exception {
        // Arrange
        when(analyticsService.getCustomerInsights(any(AnalyticsFilterRequestDTO.class))).thenReturn(customerInsightsDTO);

        // Act & Assert
        mockMvc.perform(get("/analytics/customer-insights")
                .param("startDate", "2025-10-01T00:00:00")
                .param("endDate", "2025-11-01T00:00:00")
                .param("allTime", "false")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalCustomers").value(50))
                .andExpect(jsonPath("$.data.repeatCustomerRate").value(60.0));

        verify(analyticsService, times(1)).getCustomerInsights(any(AnalyticsFilterRequestDTO.class));
    }

    // ===================================================================
    // DASHBOARD TESTS
    // ===================================================================

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should successfully get dashboard analytics")
    void testGetDashboard_AsAdmin_Success() throws Exception {
        // Arrange
        when(analyticsService.getDashboardSummary(any(AnalyticsFilterRequestDTO.class))).thenReturn(dashboardDTO);

        // Act & Assert
        mockMvc.perform(get("/analytics/dashboard")
                .param("startDate", "2025-10-01T00:00:00")
                .param("endDate", "2025-11-01T00:00:00")
                .param("serviceCenterId", serviceCenterId.toString())
                .param("allTime", "false")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalRevenue").value(5000.0))
                .andExpect(jsonPath("$.data.totalAppointments").value(100));

        verify(analyticsService, times(1)).getDashboardSummary(any(AnalyticsFilterRequestDTO.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    @DisplayName("Admin: Should handle error when getting dashboard analytics")
    void testGetDashboard_Error() throws Exception {
        // Arrange
        when(analyticsService.getDashboardSummary(any(AnalyticsFilterRequestDTO.class)))
                .thenThrow(new RuntimeException("Service unavailable"));

        // Act & Assert
        mockMvc.perform(get("/analytics/dashboard")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Error retrieving dashboard: Service unavailable"));

        verify(analyticsService, times(1)).getDashboardSummary(any(AnalyticsFilterRequestDTO.class));
    }

}
