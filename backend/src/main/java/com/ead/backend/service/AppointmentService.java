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
            // 1. Get current user (must be MANAGER or ADMIN)
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            boolean isManagerOrAdmin = currentUser.getRoles().stream()
                    .anyMatch(r -> "MANAGER".equals(r.getName()) || "ADMIN".equals(r.getName()));
            if (!isManagerOrAdmin) {
                throw new RuntimeException("Only MANAGER or ADMIN can assign employees");
            }

            // 2. Load appointment
            Appointment appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            // 3. Validate and add each employee
            for (Long empId : employeeIds) {
                User employee = userRepository.findById(empId)
                        .orElseThrow(() -> new RuntimeException("Employee not found: " + empId));

                // Must have EMPLOYEE role
                boolean hasEmployeeRole = employee.getRoles().stream()
                        .anyMatch(r -> "EMPLOYEE".equals(r.getName()));
                if (!hasEmployeeRole) {
                    throw new RuntimeException("User ID " + empId + " is not an EMPLOYEE");
                }

                appointment.getAssignedEmployees().add(employee);
            }

            return appointmentRepository.save(appointment);
        }

        // Get all employees (for dropdown)
        public List<User> getAllEmployees() {
            return userRepository.findAll().stream()
                    .filter(u -> u.getRoles().stream()
                            .anyMatch(r -> "EMPLOYEE".equals(r.getName())))
                    .toList();
        }
    }
