package com.ead.backend.service;

import com.ead.backend.dto.*;
import com.ead.backend.entity.Appointment;
import com.ead.backend.enums.AppointmentType;
import com.ead.backend.enums.PeriodType;
import com.ead.backend.repository.AppointmentRepository;
import com.ead.backend.repository.TimeLogRepository;
import com.ead.backend.repository.UserRepository;
import com.ead.backend.util.AnalyticsHelper;
import com.ead.backend.util.DatePeriodGrouper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private TimeLogRepository timeLogRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get service type distribution analytics
     */
    public ServiceDistributionResponseDTO getServiceTypeDistribution(AnalyticsFilterRequestDTO filter) {
        List<Object[]> rawData = appointmentRepository.getServiceTypeDistribution(
                filter.getStartDate(),
                filter.getEndDate(),
                filter.getServiceCenterId(),
                filter.getStatus()
        );

        List<ServiceTypeDistributionDTO> distributions = new ArrayList<>();
        long totalAppointments = 0;
        long serviceCount = 0;
        long modificationCount = 0;

        for (Object[] row : rawData) {
            UUID serviceId = (UUID) row[0];
            String serviceName = (String) row[1];
            AppointmentType serviceType = (AppointmentType) row[2];
            Long count = AnalyticsHelper.toSafeLong(row[3]);
            Double totalRevenue = AnalyticsHelper.toSafeDouble(row[4]);
            Double avgCost = AnalyticsHelper.toSafeDouble(row[5]);

            totalAppointments += count;
            if (serviceType == AppointmentType.SERVICE) {
                serviceCount += count;
            } else {
                modificationCount += count;
            }

            ServiceTypeDistributionDTO dto = new ServiceTypeDistributionDTO(
                    serviceId,
                    serviceName,
                    serviceType,
                    count,
                    0.0, // Will calculate percentage later
                    totalRevenue,
                    avgCost
            );
            distributions.add(dto);
        }

        // Calculate percentages
        final long total = totalAppointments;
        distributions.forEach(dto -> {
            dto.setPercentage(AnalyticsHelper.calculatePercentage(dto.getCount(), total));
        });

        ServiceDistributionResponseDTO response = new ServiceDistributionResponseDTO();
        response.setTotalAppointments(totalAppointments);
        response.setServiceCount(serviceCount);
        response.setModificationCount(modificationCount);
        response.setServicePercentage(AnalyticsHelper.calculatePercentage(serviceCount, totalAppointments));
        response.setModificationPercentage(AnalyticsHelper.calculatePercentage(modificationCount, totalAppointments));
        response.setServiceBreakdown(distributions);

        return response;
    }

    /**
     * Get revenue trend analytics
     */
    public RevenueTrendResponseDTO getRevenueTrend(AnalyticsFilterRequestDTO filter) {
        List<Object[]> rawData = appointmentRepository.getRevenueByDateRange(
                filter.getStartDate(),
                filter.getEndDate(),
                filter.getServiceCenterId()
        );

        Map<LocalDate, RevenueTrendDTO> trendMap = new HashMap<>();

        for (Object[] row : rawData) {
            // Convert java.sql.Date to LocalDate
            LocalDate date;
            if (row[0] instanceof java.sql.Date) {
                date = ((java.sql.Date) row[0]).toLocalDate();
            } else if (row[0] instanceof LocalDate) {
                date = (LocalDate) row[0];
            } else {
                continue; // Skip invalid data
            }

            Double revenue = AnalyticsHelper.toSafeDouble(row[1]);
            Long count = AnalyticsHelper.toSafeLong(row[2]);
            Double serviceRevenue = AnalyticsHelper.toSafeDouble(row[3]);
            Double modificationRevenue = AnalyticsHelper.toSafeDouble(row[4]);
            Long serviceCount = AnalyticsHelper.toSafeLong(row[5]);
            Long modificationCount = AnalyticsHelper.toSafeLong(row[6]);

            RevenueTrendDTO dto = new RevenueTrendDTO(
                    date,
                    DatePeriodGrouper.formatPeriodLabel(date, PeriodType.DAILY),
                    revenue,
                    count,
                    serviceRevenue,
                    modificationRevenue,
                    serviceCount,
                    modificationCount
            );
            trendMap.put(date, dto);
        }

        // Group by period if needed
        List<RevenueTrendDTO> trends;
        if (filter.getPeriodType() != PeriodType.DAILY) {
            trends = groupTrendsByPeriod(trendMap, filter.getPeriodType(), filter.getStartDate(), filter.getEndDate());
        } else {
            trends = new ArrayList<>(trendMap.values());
            trends.sort(Comparator.comparing(RevenueTrendDTO::getPeriod));
        }

        // Calculate summary statistics
        Double totalRevenue = trends.stream()
                .mapToDouble(t -> t.getRevenue() != null ? t.getRevenue() : 0.0)
                .sum();
        Double avgRevenue = trends.isEmpty() ? 0.0 : totalRevenue / trends.size();
        Double maxRevenue = trends.stream()
                .mapToDouble(t -> t.getRevenue() != null ? t.getRevenue() : 0.0)
                .max().orElse(0.0);
        Double minRevenue = trends.stream()
                .mapToDouble(t -> t.getRevenue() != null ? t.getRevenue() : 0.0)
                .min().orElse(0.0);
        Long totalAppointments = trends.stream()
                .mapToLong(t -> t.getAppointmentCount() != null ? t.getAppointmentCount() : 0L)
                .sum();

        RevenueTrendResponseDTO response = new RevenueTrendResponseDTO();
        response.setTotalRevenue(AnalyticsHelper.roundToTwoDecimals(totalRevenue));
        response.setAverageRevenue(AnalyticsHelper.roundToTwoDecimals(avgRevenue));
        response.setMaxRevenue(AnalyticsHelper.roundToTwoDecimals(maxRevenue));
        response.setMinRevenue(AnalyticsHelper.roundToTwoDecimals(minRevenue));
        response.setTotalAppointments(totalAppointments);
        response.setPeriodType(filter.getPeriodType());
        response.setTrends(trends);

        return response;
    }

    /**
     * Get employee performance analytics
     */
    public EmployeePerformanceResponseDTO getEmployeePerformance(AnalyticsFilterRequestDTO filter) {
        // Get appointment metrics
        List<Object[]> appointmentMetrics = appointmentRepository.getEmployeeAppointmentMetrics(
                filter.getStartDate(),
                filter.getEndDate(),
                filter.getServiceCenterId()
        );

        // Get time log metrics
        List<Object[]> timeMetrics = timeLogRepository.getEmployeeTimeMetrics(
                filter.getStartDate(),
                filter.getEndDate()
        );

        Map<UUID, Double> hoursMap = new HashMap<>();
        for (Object[] row : timeMetrics) {
            UUID employeeId = (UUID) row[0];
            Double totalHours = AnalyticsHelper.toSafeDouble(row[2]);
            hoursMap.put(employeeId, totalHours);
        }

        List<EmployeePerformanceDTO> employees = new ArrayList<>();
        long totalAppointments = 0;
        double totalHoursLogged = 0.0;

        for (Object[] row : appointmentMetrics) {
            UUID employeeId = (UUID) row[1];
            String employeeName = (String) row[2];
            String email = (String) row[3];
            Long totalAppts = AnalyticsHelper.toSafeLong(row[4]);
            Long completed = AnalyticsHelper.toSafeLong(row[5]);
            Long inProgress = AnalyticsHelper.toSafeLong(row[6]);
            Long pending = AnalyticsHelper.toSafeLong(row[7]);

            Double completionRate = AnalyticsHelper.calculatePercentage(completed, totalAppts);
            Double hours = hoursMap.getOrDefault(employeeId, 0.0);
            Double avgHours = AnalyticsHelper.safeDivide(hours, totalAppts.doubleValue());

            totalAppointments += totalAppts;
            totalHoursLogged += hours;

            EmployeePerformanceDTO dto = new EmployeePerformanceDTO(
                    employeeId,
                    employeeName,
                    email,
                    totalAppts,
                    completed,
                    inProgress,
                    pending,
                    completionRate,
                    AnalyticsHelper.roundToTwoDecimals(hours),
                    avgHours,
                    0 // Will set rank later
            );
            employees.add(dto);
        }

        // Sort by completion rate and assign ranks
        employees.sort((a, b) -> Double.compare(b.getCompletionRate(), a.getCompletionRate()));
        for (int i = 0; i < employees.size(); i++) {
            employees.get(i).setRank(i + 1);
        }

        // Get top 5 performers
        List<EmployeePerformanceDTO> topPerformers = employees.stream()
                .limit(5)
                .collect(Collectors.toList());

        Double avgCompletionRate = employees.isEmpty() ? 0.0 :
                employees.stream()
                        .mapToDouble(EmployeePerformanceDTO::getCompletionRate)
                        .average()
                        .orElse(0.0);

        EmployeePerformanceResponseDTO response = new EmployeePerformanceResponseDTO();
        response.setTotalEmployees(employees.size());
        response.setTotalAppointments(totalAppointments);
        response.setAverageCompletionRate(AnalyticsHelper.roundToTwoDecimals(avgCompletionRate));
        response.setTotalHoursLogged(AnalyticsHelper.roundToTwoDecimals(totalHoursLogged));
        response.setEmployees(employees);
        response.setTopPerformers(topPerformers);

        return response;
    }

    /**
     * Get customer insights analytics
     */
    public CustomerInsightsResponseDTO getCustomerInsights(AnalyticsFilterRequestDTO filter) {
        List<Object[]> rawData = userRepository.getCustomerInsights(
                filter.getStartDate(),
                filter.getEndDate()
        );

        List<CustomerInsightDTO> insights = new ArrayList<>();
        List<UUID> customerIds = new ArrayList<>();

        for (Object[] row : rawData) {
            UUID customerId = (UUID) row[0];
            String customerName = (String) row[1];
            String email = (String) row[2];
            String phoneNumber = (String) row[3];
            Long totalAppts = AnalyticsHelper.toSafeLong(row[4]);
            Long completed = AnalyticsHelper.toSafeLong(row[5]);
            Long cancelled = AnalyticsHelper.toSafeLong(row[6]);
            LocalDateTime firstAppt = (LocalDateTime) row[7];
            LocalDateTime lastAppt = (LocalDateTime) row[8];

            customerIds.add(customerId);

            // Calculate total spent (based on completed appointments)
            Double totalSpent = calculateCustomerSpending(customerId, filter.getStartDate(), filter.getEndDate());

            // Calculate days since last appointment
            Integer daysSinceLast = (int) ChronoUnit.DAYS.between(lastAppt.toLocalDate(), LocalDate.now());

            CustomerInsightDTO dto = new CustomerInsightDTO(
                    customerId,
                    customerName,
                    email,
                    phoneNumber,
                    totalAppts,
                    completed,
                    cancelled,
                    totalSpent,
                    firstAppt,
                    lastAppt,
                    totalAppts > 1, // isRepeatCustomer
                    0, // Will set vehicle count later
                    daysSinceLast
            );
            insights.add(dto);
        }

        // Get vehicle counts
        if (!customerIds.isEmpty()) {
            List<Object[]> vehicleCounts = userRepository.getVehicleCountByCustomers(customerIds);
            Map<UUID, Long> vehicleMap = new HashMap<>();
            for (Object[] row : vehicleCounts) {
                vehicleMap.put((UUID) row[0], AnalyticsHelper.toSafeLong(row[1]));
            }
            insights.forEach(dto -> dto.setVehicleCount(vehicleMap.getOrDefault(dto.getCustomerId(), 0L).intValue()));
        }

        // Calculate summary statistics
        Long totalCustomers = (long) insights.size();
        Long repeatCustomers = insights.stream().filter(CustomerInsightDTO::getIsRepeatCustomer).count();
        Long newCustomers = totalCustomers - repeatCustomers;
        Double repeatRate = AnalyticsHelper.calculatePercentage(repeatCustomers, totalCustomers);

        Long totalAppointments = insights.stream()
                .mapToLong(CustomerInsightDTO::getTotalAppointments)
                .sum();
        Double avgAppointments = AnalyticsHelper.safeDivide(totalAppointments, totalCustomers);

        Double totalSpent = insights.stream()
                .mapToDouble(dto -> dto.getTotalSpent() != null ? dto.getTotalSpent() : 0.0)
                .sum();
        Double avgSpent = AnalyticsHelper.safeDivide(totalSpent, totalCustomers.doubleValue());

        // Get top 10 customers
        List<CustomerInsightDTO> topCustomers = insights.stream()
                .sorted((a, b) -> Long.compare(b.getTotalAppointments(), a.getTotalAppointments()))
                .limit(10)
                .collect(Collectors.toList());

        CustomerInsightsResponseDTO response = new CustomerInsightsResponseDTO();
        response.setTotalCustomers(totalCustomers);
        response.setRepeatCustomers(repeatCustomers);
        response.setNewCustomers(newCustomers);
        response.setRepeatCustomerRate(repeatRate);
        response.setAverageAppointmentsPerCustomer(avgAppointments);
        response.setAverageSpendPerCustomer(avgSpent);
        response.setTotalAppointments(totalAppointments);
        response.setCustomerInsights(insights);
        response.setTopCustomers(topCustomers);

        return response;
    }

    /**
     * Get dashboard summary analytics
     */
    public AnalyticsDashboardDTO getDashboardSummary(AnalyticsFilterRequestDTO filter) {
        // Get all appointments in range
        List<Appointment> appointments = appointmentRepository.findByAppointmentDateBetween(
                filter.getStartDate(),
                filter.getEndDate()
        );

        // Calculate metrics
        Long totalAppointments = (long) appointments.size();
        Long completed = appointments.stream().filter(a -> "COMPLETED".equals(a.getStatus())).count();
        Long confirmed = appointments.stream().filter(a -> "CONFIRMED".equals(a.getStatus())).count();
        Long pending = appointments.stream().filter(a -> "PENDING".equals(a.getStatus())).count();
        Long inProgress = appointments.stream().filter(a -> "IN_PROGRESS".equals(a.getStatus())).count();
        Long cancelled = appointments.stream().filter(a -> "CANCELLED".equals(a.getStatus())).count();

        Double completionRate = AnalyticsHelper.calculatePercentage(completed, totalAppointments);

        // Calculate revenue
        Double totalRevenue = appointments.stream()
                .filter(a -> "COMPLETED".equals(a.getStatus()))
                .mapToDouble(a -> a.getServiceOrModification().getEstimatedCost() != null ?
                        a.getServiceOrModification().getEstimatedCost() : 0.0)
                .sum();

        Double avgServiceCost = AnalyticsHelper.safeDivide(totalRevenue, completed.doubleValue());

        // Get customer count
        Long totalCustomers = appointmentRepository.countDistinctCustomers(
                filter.getStartDate(),
                filter.getEndDate()
        );

        // Get employee count
        Long totalEmployees = (long) userRepository.findByRoleName("EMPLOYEE").size();

        // Get popular services
        ServiceDistributionResponseDTO serviceDistribution = getServiceTypeDistribution(filter);
        List<ServiceTypeDistributionDTO> popularServices = serviceDistribution.getServiceBreakdown().stream()
                .limit(5)
                .collect(Collectors.toList());

        // Get top employees
        EmployeePerformanceResponseDTO employeePerformance = getEmployeePerformance(filter);
        List<EmployeePerformanceDTO> topEmployees = employeePerformance.getTopPerformers();

        // Get repeat customer rate
        CustomerInsightsResponseDTO customerInsights = getCustomerInsights(filter);
        Double repeatCustomerRate = customerInsights.getRepeatCustomerRate();

        AnalyticsDashboardDTO dashboard = new AnalyticsDashboardDTO();
        dashboard.setTotalRevenue(AnalyticsHelper.roundToTwoDecimals(totalRevenue));
        dashboard.setTotalAppointments(totalAppointments);
        dashboard.setCompletedAppointments(completed);
        dashboard.setConfirmedAppointments(confirmed);
        dashboard.setPendingAppointments(pending);
        dashboard.setInProgressAppointments(inProgress);
        dashboard.setCancelledAppointments(cancelled);
        dashboard.setTotalCustomers(totalCustomers);
        dashboard.setTotalEmployees(totalEmployees);
        dashboard.setCompletionRate(completionRate);
        dashboard.setAverageServiceCost(avgServiceCost);
        dashboard.setRepeatCustomerRate(repeatCustomerRate);
        dashboard.setPopularServices(popularServices);
        dashboard.setTopEmployees(topEmployees);
        dashboard.setPeriodStart(filter.getStartDate());
        dashboard.setPeriodEnd(filter.getEndDate());

        return dashboard;
    }

    // ===================================================================
    // PRIVATE HELPER METHODS
    // ===================================================================

    /**
     * Group revenue trends by period
     */
    private List<RevenueTrendDTO> groupTrendsByPeriod(
            Map<LocalDate, RevenueTrendDTO> dailyData,
            PeriodType periodType,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        Map<LocalDate, List<RevenueTrendDTO>> grouped = new LinkedHashMap<>();

        for (RevenueTrendDTO trend : dailyData.values()) {
            LocalDate periodKey = DatePeriodGrouper.getPeriodKey(
                    trend.getPeriod().atStartOfDay(),
                    periodType
            );
            grouped.computeIfAbsent(periodKey, k -> new ArrayList<>()).add(trend);
        }

        List<RevenueTrendDTO> result = new ArrayList<>();
        for (Map.Entry<LocalDate, List<RevenueTrendDTO>> entry : grouped.entrySet()) {
            LocalDate period = entry.getKey();
            List<RevenueTrendDTO> trends = entry.getValue();

            Double totalRevenue = trends.stream()
                    .mapToDouble(t -> t.getRevenue() != null ? t.getRevenue() : 0.0)
                    .sum();
            Long totalCount = trends.stream()
                    .mapToLong(t -> t.getAppointmentCount() != null ? t.getAppointmentCount() : 0L)
                    .sum();
            Double serviceRevenue = trends.stream()
                    .mapToDouble(t -> t.getServiceRevenue() != null ? t.getServiceRevenue() : 0.0)
                    .sum();
            Double modRevenue = trends.stream()
                    .mapToDouble(t -> t.getModificationRevenue() != null ? t.getModificationRevenue() : 0.0)
                    .sum();
            Long serviceCount = trends.stream()
                    .mapToLong(t -> t.getServiceCount() != null ? t.getServiceCount() : 0L)
                    .sum();
            Long modCount = trends.stream()
                    .mapToLong(t -> t.getModificationCount() != null ? t.getModificationCount() : 0L)
                    .sum();

            RevenueTrendDTO groupedTrend = new RevenueTrendDTO(
                    period,
                    DatePeriodGrouper.formatPeriodLabel(period, periodType),
                    AnalyticsHelper.roundToTwoDecimals(totalRevenue),
                    totalCount,
                    AnalyticsHelper.roundToTwoDecimals(serviceRevenue),
                    AnalyticsHelper.roundToTwoDecimals(modRevenue),
                    serviceCount,
                    modCount
            );
            result.add(groupedTrend);
        }

        result.sort(Comparator.comparing(RevenueTrendDTO::getPeriod));
        return result;
    }

    /**
     * Calculate total spending for a customer
     */
    private Double calculateCustomerSpending(UUID customerId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Appointment> appointments = appointmentRepository.findByUserId(customerId);
        return appointments.stream()
                .filter(a -> a.getAppointmentDate().isAfter(startDate) &&
                        a.getAppointmentDate().isBefore(endDate) &&
                        "COMPLETED".equals(a.getStatus()))
                .mapToDouble(a -> a.getServiceOrModification().getEstimatedCost() != null ?
                        a.getServiceOrModification().getEstimatedCost() : 0.0)
                .sum();
    }
}

