package com.ead.backend.repository;

import com.ead.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    // Find all appointments for a customer (by userId)
    @Query("SELECT DISTINCT a FROM Appointment a " +
           "LEFT JOIN FETCH a.vehicle " +
           "LEFT JOIN FETCH a.serviceOrModification " +
           "LEFT JOIN FETCH a.assignedEmployees " +
           "WHERE a.user.id = :userId")
    List<Appointment> findByUserId(@Param("userId") UUID userId);

    // Find all appointments assigned to an employee with specific status
    List<Appointment> findByAssignedEmployeesIdAndStatus(UUID employeeId, String status);

    // Find all appointments assigned to an employee with multiple statuses
    List<Appointment> findByAssignedEmployeesIdAndStatusIn(UUID employeeId, List<String> statuses);

    // Check if there's an existing appointment for the same vehicle, date, and time (excluding cancelled)
    @Query("SELECT a FROM Appointment a WHERE a.vehicle.id = :vehicleId " +
           "AND a.appointmentDate = :appointmentDate " +
           "AND a.status != 'CANCELLED'")
    List<Appointment> findByVehicleIdAndAppointmentDateAndStatusNotCancelled(
            @Param("vehicleId") UUID vehicleId,
            @Param("appointmentDate") LocalDateTime appointmentDate
    );
}