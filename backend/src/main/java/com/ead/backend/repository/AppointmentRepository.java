package com.ead.backend.repository;

import com.ead.backend.entity.Appointment;
import com.ead.backend.entity.ServiceCenter;
import com.ead.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    // Find all appointments for a customer (by userId)
    List<Appointment> findByUserId(UUID userId);

    // Find all appointments assigned to an employee with specific status
    List<Appointment> findByAssignedEmployeesIdAndStatus(UUID employeeId, String status);

    List<Appointment> findByAssignedEmployees(Set<User> assignedEmployees);

    // Find all appointments assigned to an employee with multiple statuses
    List<Appointment> findByAssignedEmployeesIdAndStatusIn(UUID employeeId, List<String> statuses);

    // Check if there's an existing appointment for the same vehicle, date, and time (excluding cancelled)
    List<Appointment> findByVehicleIdAndAppointmentDateAndStatusNot(
            UUID vehicleId,
            LocalDateTime appointmentDate,
            String status
    );

    // Count appointments for a service center at a specific date/time (excluding cancelled)
    Long countByServiceCenterIdAndAppointmentDateAndStatusNot(
            UUID serviceCenterId,
            LocalDateTime appointmentDate,
            String status
    );
    List<Appointment> findByStatusAndServiceCenter(String pending, ServiceCenter serviceCenter);

    List<Appointment> findByStatus(String status);

    // Check if vehicle has any active appointments (non-cancelled)
    boolean existsByVehicleIdAndStatusNot(UUID vehicleId, String status);

    // Check if vehicle has confirmed or in-progress appointments
    @Query("SELECT COUNT(a) > 0 FROM Appointment a " +
            "WHERE a.vehicle.id = :vehicleId " +
            "AND (a.status = 'PENDING' OR a.status = 'IN_PROGRESS')")
    boolean hasActiveAppointments(@Param("vehicleId") UUID vehicleId);

    // Find pending appointments for a vehicle with a specific appointment type
    @Query("SELECT a FROM Appointment a " +
            "WHERE a.vehicle.id = :vehicleId " +
            "AND a.appointmentType = :appointmentType " +
            "AND a.status = 'PENDING' " +
            "AND a.appointmentDate >= :currentDate")
    List<Appointment> findPendingAppointmentsByVehicleAndType(
            @Param("vehicleId") UUID vehicleId,
            @Param("appointmentType") com.ead.backend.enums.AppointmentType appointmentType,
            @Param("currentDate") LocalDateTime currentDate
    );

    // Count active appointments for a customer on a specific day (excluding cancelled)
    @Query("SELECT COUNT(a) FROM Appointment a " +
            "WHERE a.user.id = :userId " +
            "AND DATE(a.appointmentDate) = DATE(:appointmentDate) " +
            "AND a.status != 'CANCELLED'")
    Long countCustomerAppointmentsForDay(
            @Param("userId") UUID userId,
            @Param("appointmentDate") LocalDateTime appointmentDate
    );

    // Find overlapping appointments for a vehicle (to prevent cross-service conflicts)
    @Query("SELECT a FROM Appointment a " +
            "JOIN a.serviceOrModification som " +
            "WHERE a.vehicle.id = :vehicleId " +
            "AND a.status NOT IN ('CANCELLED', 'COMPLETED') " +
            "AND (" +
            "  (a.appointmentDate < :endTime AND " +
            "   FUNCTION('TIMESTAMPADD', MINUTE, som.estimatedTimeMinutes, a.appointmentDate) > :startTime)" +
            ")")
    List<Appointment> findOverlappingAppointments(
            @Param("vehicleId") UUID vehicleId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    // Find all appointments for a service center on a specific date (for slot availability display)
    @Query("SELECT a FROM Appointment a WHERE a.serviceCenter.id = :serviceCenterId " +
            "AND DATE(a.appointmentDate) = DATE(:date) " +
            "AND a.status != 'CANCELLED'")
    List<Appointment> findByServiceCenterAndDate(
            @Param("serviceCenterId") UUID serviceCenterId,
            @Param("date") LocalDateTime date
    );

    // Get available slots for a specific date range
    @Query("SELECT a.appointmentDate, COUNT(a) FROM Appointment a " +
            "WHERE a.serviceCenter.id = :serviceCenterId " +
            "AND a.appointmentDate BETWEEN :startDate AND :endDate " +
            "AND a.status != 'CANCELLED' " +
            "GROUP BY a.appointmentDate")
    List<Object[]> getSlotUsageByDateRange(
            @Param("serviceCenterId") UUID serviceCenterId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // ===================================================================
    // ANALYTICS QUERIES
    // ===================================================================

    /**
     * Find appointments by status and date range
     */
    List<Appointment> findByStatusAndAppointmentDateBetween(
            String status,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * Find appointments by date range
     */
    List<Appointment> findByAppointmentDateBetween(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * Find appointments by date range and service center
     */
    List<Appointment> findByAppointmentDateBetweenAndServiceCenterId(
            LocalDateTime startDate,
            LocalDateTime endDate,
            UUID serviceCenterId
    );

    /**
     * Count appointments by status
     */
    Long countByStatus(String status);

    /**
     * Count appointments by status and date range
     */
    Long countByStatusAndAppointmentDateBetween(
            String status,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * Get service type distribution with revenue
     */
    @Query("SELECT som.id, som.name, som.type, COUNT(a), SUM(som.estimatedCost), AVG(som.estimatedCost) " +
            "FROM Appointment a " +
            "JOIN a.serviceOrModification som " +
            "WHERE a.appointmentDate BETWEEN :startDate AND :endDate " +
            "AND (:serviceCenterId IS NULL OR a.serviceCenter.id = :serviceCenterId) " +
            "AND (:status IS NULL OR a.status = :status) " +
            "GROUP BY som.id, som.name, som.type " +
            "ORDER BY COUNT(a) DESC")
    List<Object[]> getServiceTypeDistribution(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("serviceCenterId") UUID serviceCenterId,
            @Param("status") String status
    );

    /**
     * Get service type distribution with revenue (all time)
     */
    @Query("SELECT som.id, som.name, som.type, COUNT(a), SUM(som.estimatedCost), AVG(som.estimatedCost) " +
            "FROM Appointment a " +
            "JOIN a.serviceOrModification som " +
            "WHERE (:serviceCenterId IS NULL OR a.serviceCenter.id = :serviceCenterId) " +
            "AND (:status IS NULL OR a.status = :status) " +
            "GROUP BY som.id, som.name, som.type " +
            "ORDER BY COUNT(a) DESC")
    List<Object[]> getServiceTypeDistributionAllTime(
            @Param("serviceCenterId") UUID serviceCenterId,
            @Param("status") String status
    );

    /**
     * Get revenue and appointment count grouped by date
     */
    @Query(value = "SELECT CAST(a.appointment_date AS DATE), " +
            "SUM(som.estimated_cost), " +
            "COUNT(a.id), " +
            "SUM(CASE WHEN som.type = 'SERVICE' THEN som.estimated_cost ELSE 0 END), " +
            "SUM(CASE WHEN som.type = 'MODIFICATION' THEN som.estimated_cost ELSE 0 END), " +
            "COUNT(CASE WHEN som.type = 'SERVICE' THEN 1 END), " +
            "COUNT(CASE WHEN som.type = 'MODIFICATION' THEN 1 END) " +
            "FROM appointment a " +
            "JOIN service_or_modification som ON a.service_or_modification_id = som.id " +
            "WHERE a.appointment_date BETWEEN :startDate AND :endDate " +
            "AND (:serviceCenterId IS NULL OR a.service_center_id = CAST(:serviceCenterId AS UUID)) " +
            "AND a.status = 'COMPLETED' " +
            "GROUP BY CAST(a.appointment_date AS DATE) " +
            "ORDER BY CAST(a.appointment_date AS DATE)",
            nativeQuery = true)
    List<Object[]> getRevenueByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("serviceCenterId") UUID serviceCenterId
    );

    /**
     * Get revenue and appointment count grouped by date (all time)
     */
    @Query(value = "SELECT CAST(a.appointment_date AS DATE), " +
            "SUM(som.estimated_cost), " +
            "COUNT(a.id), " +
            "SUM(CASE WHEN som.type = 'SERVICE' THEN som.estimated_cost ELSE 0 END), " +
            "SUM(CASE WHEN som.type = 'MODIFICATION' THEN som.estimated_cost ELSE 0 END), " +
            "COUNT(CASE WHEN som.type = 'SERVICE' THEN 1 END), " +
            "COUNT(CASE WHEN som.type = 'MODIFICATION' THEN 1 END) " +
            "FROM appointment a " +
            "JOIN service_or_modification som ON a.service_or_modification_id = som.id " +
            "WHERE (:serviceCenterId IS NULL OR a.service_center_id = CAST(:serviceCenterId AS UUID)) " +
            "AND a.status = 'COMPLETED' " +
            "GROUP BY CAST(a.appointment_date AS DATE) " +
            "ORDER BY CAST(a.appointment_date AS DATE)",
            nativeQuery = true)
    List<Object[]> getRevenueByDateRangeAllTime(
            @Param("serviceCenterId") UUID serviceCenterId
    );

    /**
     * Get appointments for employees (for performance metrics)
     */
    @Query("SELECT ae.id, u.id, u.fullName, u.email, COUNT(a), " +
            "COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END), " +
            "COUNT(CASE WHEN a.status = 'IN_PROGRESS' THEN 1 END), " +
            "COUNT(CASE WHEN a.status = 'PENDING' THEN 1 END) " +
            "FROM Appointment a " +
            "JOIN a.assignedEmployees ae " +
            "JOIN User u ON u.id = ae.id " +
            "WHERE a.appointmentDate BETWEEN :startDate AND :endDate " +
            "AND (:serviceCenterId IS NULL OR a.serviceCenter.id = :serviceCenterId) " +
            "GROUP BY ae.id, u.id, u.fullName, u.email " +
            "ORDER BY COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END) DESC")
    List<Object[]> getEmployeeAppointmentMetrics(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("serviceCenterId") UUID serviceCenterId
    );

    /**
     * Get appointments for employees (all time)
     */
    @Query("SELECT ae.id, u.id, u.fullName, u.email, COUNT(a), " +
            "COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END), " +
            "COUNT(CASE WHEN a.status = 'IN_PROGRESS' THEN 1 END), " +
            "COUNT(CASE WHEN a.status = 'PENDING' THEN 1 END) " +
            "FROM Appointment a " +
            "JOIN a.assignedEmployees ae " +
            "JOIN User u ON u.id = ae.id " +
            "WHERE (:serviceCenterId IS NULL OR a.serviceCenter.id = :serviceCenterId) " +
            "GROUP BY ae.id, u.id, u.fullName, u.email " +
            "ORDER BY COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END) DESC")
    List<Object[]> getEmployeeAppointmentMetricsAllTime(
            @Param("serviceCenterId") UUID serviceCenterId
    );

    /**
     * Count distinct customers
     */
    @Query("SELECT COUNT(DISTINCT a.user.id) FROM Appointment a " +
            "WHERE a.appointmentDate BETWEEN :startDate AND :endDate")
    Long countDistinctCustomers(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Count distinct customers (all time)
     */
    @Query("SELECT COUNT(DISTINCT a.user.id) FROM Appointment a")
    Long countDistinctCustomersAllTime();
}