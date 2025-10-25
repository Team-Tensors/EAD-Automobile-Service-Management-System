package com.ead.backend.repository;

import com.ead.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Find all appointments for a customer (by userId)
    List<Appointment> findByUserId(Long userId);

    // Find all appointments assigned to an employee
    List<Appointment> findByAssignedEmployeesId(Long employeeId);
}