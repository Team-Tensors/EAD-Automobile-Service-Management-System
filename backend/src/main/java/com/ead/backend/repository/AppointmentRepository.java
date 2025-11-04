package com.ead.backend.repository;

import com.ead.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    // Find all appointments for a customer (by userId)
    List<Appointment> findByUserId(UUID userId);

    // Find all appointments assigned to an employee with specific status
    List<Appointment> findByAssignedEmployeesIdAndStatus(UUID employeeId, String status);

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
    List<Appointment> findByStatus(String pending);
}