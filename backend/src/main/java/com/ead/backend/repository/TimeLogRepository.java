package com.ead.backend.repository;

import com.ead.backend.entity.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    // Retrieve all time logs for a given appointment and user
    List<TimeLog> findByAppointmentIdAndUserId(UUID appointmentId, UUID userId);

    // ===================================================================
    // ANALYTICS QUERIES
    // ===================================================================

    /**
     * Get total hours logged by each employee within date range
     */
    @Query("SELECT tl.user.id, SUM(tl.hoursLogged) " +
            "FROM TimeLog tl " +
            "WHERE tl.startTime BETWEEN :startDate AND :endDate " +
            "GROUP BY tl.user.id")
    List<Object[]> getTotalHoursByEmployee(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get detailed employee performance from time logs
     */
    @Query("SELECT tl.user.id, COUNT(DISTINCT tl.appointment.id), SUM(tl.hoursLogged), AVG(tl.hoursLogged) " +
            "FROM TimeLog tl " +
            "WHERE tl.startTime BETWEEN :startDate AND :endDate " +
            "GROUP BY tl.user.id")
    List<Object[]> getEmployeeTimeMetrics(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
