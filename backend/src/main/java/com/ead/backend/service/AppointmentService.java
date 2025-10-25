package com.ead.backend.service;

import com.ead.backend.entity.*;
import com.ead.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class AppointmentService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private ModificationTypeRepository modificationTypeRepository;

    // ... existing createAppointment() and getUserAppointments() ...

    /**
     * Assign one or more employees to an appointment
     * @param appointmentId the appointment
     * @param employeeIds list of employee user IDs
     * @return updated appointment
     */
    public Appointment assignEmployees(Long appointmentId, Set<Long> employeeIds) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        for (Long empId : employeeIds) {
            User employee = userRepository.findById(empId)
                    .orElseThrow(() -> new RuntimeException("Employee not found: " + empId));

            // Validate: must have EMPLOYEE role
            boolean isEmployee = employee.getRoles().stream()
                    .anyMatch(role -> "EMPLOYEE".equals(role.getName()));
            if (!isEmployee) {
                throw new RuntimeException("User ID " + empId + " is not an employee");
            }

            appointment.getAssignedEmployees().add(employee);
        }

        return appointmentRepository.save(appointment);
    }

    /**
     * Get all appointments assigned to the current logged-in employee
     */
    public List<Appointment> getEmployeeAppointments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User employee = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        return appointmentRepository.findByAssignedEmployeesId(employee.getId());
    }

    /**
     * Remove employee from appointment (optional)
     */
    public Appointment removeEmployee(Long appointmentId, Long employeeId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        appointment.getAssignedEmployees().remove(employee);
        return appointmentRepository.save(appointment);
    }
}
