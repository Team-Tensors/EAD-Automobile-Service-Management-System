package com.ead.backend.controller;

import com.ead.backend.dto.*;
import com.ead.backend.enums.AppointmentType;
import com.ead.backend.enums.PeriodType;
import com.ead.backend.service.AnalyticsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * Get service type distribution analytics
     * GET /analytics/service-distribution
     */
    @GetMapping("/service-distribution")
    public ResponseEntity<AnalyticsResponseDTO<ServiceDistributionResponseDTO>> getServiceDistribution(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) UUID serviceCenterId,
            @RequestParam(required = false) AppointmentType appointmentType,
            @RequestParam(required = false) String status) {

        try {
            AnalyticsFilterRequestDTO filter = createFilter(startDate, endDate, serviceCenterId, appointmentType, status, PeriodType.DAILY);
            ServiceDistributionResponseDTO data = analyticsService.getServiceTypeDistribution(filter);
            return ResponseEntity.ok(AnalyticsResponseDTO.success("Service distribution retrieved successfully", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AnalyticsResponseDTO.error("Error retrieving service distribution: " + e.getMessage()));
        }
    }

    /**
     * Get revenue trend analytics
     * GET /analytics/revenue-trend
     */
    @GetMapping("/revenue-trend")
    public ResponseEntity<AnalyticsResponseDTO<RevenueTrendResponseDTO>> getRevenueTrend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) UUID serviceCenterId,
            @RequestParam(required = false, defaultValue = "DAILY") PeriodType periodType) {

        try {
            AnalyticsFilterRequestDTO filter = createFilter(startDate, endDate, serviceCenterId, null, null, periodType);
            RevenueTrendResponseDTO data = analyticsService.getRevenueTrend(filter);
            return ResponseEntity.ok(AnalyticsResponseDTO.success("Revenue trend retrieved successfully", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AnalyticsResponseDTO.error("Error retrieving revenue trend: " + e.getMessage()));
        }
    }

    /**
     * Get employee performance analytics
     * GET /analytics/employee-performance
     */
    @GetMapping("/employee-performance")
    public ResponseEntity<AnalyticsResponseDTO<EmployeePerformanceResponseDTO>> getEmployeePerformance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) UUID serviceCenterId) {

        try {
            AnalyticsFilterRequestDTO filter = createFilter(startDate, endDate, serviceCenterId, null, null, PeriodType.DAILY);
            EmployeePerformanceResponseDTO data = analyticsService.getEmployeePerformance(filter);
            return ResponseEntity.ok(AnalyticsResponseDTO.success("Employee performance retrieved successfully", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AnalyticsResponseDTO.error("Error retrieving employee performance: " + e.getMessage()));
        }
    }

    /**
     * Get customer insights analytics
     * GET /analytics/customer-insights
     */
    @GetMapping("/customer-insights")
    public ResponseEntity<AnalyticsResponseDTO<CustomerInsightsResponseDTO>> getCustomerInsights(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        try {
            AnalyticsFilterRequestDTO filter = createFilter(startDate, endDate, null, null, null, PeriodType.DAILY);
            CustomerInsightsResponseDTO data = analyticsService.getCustomerInsights(filter);
            return ResponseEntity.ok(AnalyticsResponseDTO.success("Customer insights retrieved successfully", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AnalyticsResponseDTO.error("Error retrieving customer insights: " + e.getMessage()));
        }
    }

    /**
     * Get dashboard summary analytics
     * GET /analytics/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsResponseDTO<AnalyticsDashboardDTO>> getDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) UUID serviceCenterId) {

        try {
            AnalyticsFilterRequestDTO filter = createFilter(startDate, endDate, serviceCenterId, null, null, PeriodType.DAILY);
            AnalyticsDashboardDTO data = analyticsService.getDashboardSummary(filter);
            return ResponseEntity.ok(AnalyticsResponseDTO.success("Dashboard summary retrieved successfully", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AnalyticsResponseDTO.error("Error retrieving dashboard: " + e.getMessage()));
        }
    }

    /**
     * POST endpoint for complex analytics filters
     * POST /analytics/custom
     */
    @PostMapping("/custom")
    public ResponseEntity<AnalyticsResponseDTO<AnalyticsDashboardDTO>> getCustomAnalytics(
            @Valid @RequestBody AnalyticsFilterRequestDTO filter) {

        try {
            AnalyticsDashboardDTO data = analyticsService.getDashboardSummary(filter);
            return ResponseEntity.ok(AnalyticsResponseDTO.success("Custom analytics retrieved successfully", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AnalyticsResponseDTO.error("Error retrieving custom analytics: " + e.getMessage()));
        }
    }

    // ===================================================================
    // HELPER METHODS
    // ===================================================================

    /**
     * Create filter with defaults
     */
    private AnalyticsFilterRequestDTO createFilter(
            LocalDateTime startDate,
            LocalDateTime endDate,
            UUID serviceCenterId,
            AppointmentType appointmentType,
            String status,
            PeriodType periodType) {

        AnalyticsFilterRequestDTO filter = new AnalyticsFilterRequestDTO();

        // Default to last 30 days if not provided
        if (startDate == null || endDate == null) {
            AnalyticsFilterRequestDTO defaults = AnalyticsFilterRequestDTO.defaultLast30Days();
            filter.setStartDate(startDate != null ? startDate : defaults.getStartDate());
            filter.setEndDate(endDate != null ? endDate : defaults.getEndDate());
        } else {
            filter.setStartDate(startDate);
            filter.setEndDate(endDate);
        }

        // Normalize start date to beginning of day
        if (filter.getStartDate() != null) {
            filter.setStartDate(filter.getStartDate().toLocalDate().atStartOfDay());
        }

        // Normalize end date to end of day (23:59:59.999) to include all appointments on that day
        if (filter.getEndDate() != null) {
            filter.setEndDate(filter.getEndDate().toLocalDate().atTime(23, 59, 59, 999999999));
        }

        filter.setServiceCenterId(serviceCenterId);
        filter.setAppointmentType(appointmentType);
        filter.setStatus(status);
        filter.setPeriodType(periodType != null ? periodType : PeriodType.DAILY);

        return filter;
    }
}

