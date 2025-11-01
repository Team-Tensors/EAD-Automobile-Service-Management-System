package com.ead.backend.repository;

import com.ead.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    // Find all appointments for a customer (by userId)
    List<Appointment> findByUserId(Long userId);

    // Find all appointments assigned to an employee with specific status
    List<Appointment> findByAssignedEmployeesIdAndStatus(Long employeeId, String status);

    // Find all appointments assigned to an employee with multiple statuses
    List<Appointment> findByAssignedEmployeesIdAndStatusIn(Long employeeId, List<String> statuses);

    List<Appointment> findByStatus(String pending);
}