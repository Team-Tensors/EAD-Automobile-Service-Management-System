package com.ead.backend.repository;

import com.ead.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Find all users with a specific role name (e.g., "ADMIN")
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);
    // void deleteByExpiryDateBefore(Instant date);

    // ===================================================================
    // ANALYTICS QUERIES
    // ===================================================================

    /**
     * Get customer insights with appointment statistics
     */
    @Query("SELECT u.id, u.fullName, u.email, u.phoneNumber, " +
            "COUNT(a), " +
            "COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END), " +
            "COUNT(CASE WHEN a.status = 'CANCELLED' THEN 1 END), " +
            "MIN(a.appointmentDate), " +
            "MAX(a.appointmentDate) " +
            "FROM User u " +
            "JOIN Appointment a ON a.user.id = u.id " +
            "WHERE a.appointmentDate BETWEEN :startDate AND :endDate " +
            "GROUP BY u.id, u.fullName, u.email, u.phoneNumber " +
            "ORDER BY COUNT(a) DESC")
    List<Object[]> getCustomerInsights(
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate
    );

    /**
     * Count customers with multiple appointments (repeat customers)
     */
    @Query("SELECT COUNT(DISTINCT u.id) " +
            "FROM User u " +
            "JOIN Appointment a ON a.user.id = u.id " +
            "WHERE a.appointmentDate BETWEEN :startDate AND :endDate " +
            "GROUP BY u.id " +
            "HAVING COUNT(a) > 1")
    Long countRepeatCustomers(
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate
    );

    /**
     * Get vehicle count per customer
     */
    @Query("SELECT u.id, COUNT(v) " +
            "FROM User u " +
            "LEFT JOIN Vehicle v ON v.user.id = u.id " +
            "WHERE u.id IN :userIds " +
            "GROUP BY u.id")
    List<Object[]> getVehicleCountByCustomers(@Param("userIds") List<UUID> userIds);
}