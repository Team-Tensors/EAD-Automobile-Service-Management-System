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

    // ===================================================================
    // 1. CUSTOMER: Book appointment with preferred date/time
    // ===================================================================
    public Appointment createAppointment(Appointment appointment) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Validate vehicle ownership
        Vehicle vehicle = vehicleRepository.findById(appointment.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        if (!vehicle.getUser().getId().equals(customer.getId())) {
            throw new RuntimeException("You can only book for your own vehicle");
        }

        // Validate appointment type
        if (appointment.getAppointmentType() == null) {
            throw new RuntimeException("Appointment type is required");
        }

        // Resolve service or modification
        if (appointment.getAppointmentType() == AppointmentType.SERVICE) {
            ServiceType st = serviceTypeRepository.findById(appointment.getServiceType().getId())
                    .orElseThrow(() -> new RuntimeException("Service type not found"));
            appointment.setServiceType(st);
            appointment.setModificationType(null);
        } else {
            ModificationType mt = modificationTypeRepository.findById(appointment.getModificationType().getId())
                    .orElseThrow(() -> new RuntimeException("Modification type not found"));
            appointment.setModificationType(mt);
            appointment.setServiceType(null);
        }

        // CUSTOMER MUST SELECT appointmentDate
        if (appointment.getAppointmentDate() == null) {
            throw new RuntimeException("Please select your preferred appointment date and time");
        }
        if (appointment.getAppointmentDate().isBefore(LocalDateTime.now().plusHours(1))) {
            throw new RuntimeException("Appointment date must be at least 1 hour from now");
        }

        appointment.setUser(customer);
        appointment.setVehicle(vehicle);
        appointment.setStatus("PENDING");
        // startTime and endTime remain NULL — set by employee later

        return appointmentRepository.save(appointment);
    }

    // ===================================================================
    // 2. CUSTOMER: Get their own appointments
    // ===================================================================
    public List<Appointment> getUserAppointments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        return appointmentRepository.findByUserId(customer.getId());
    }

    // ===================================================================
    // 3. ADMIN/MANAGER: Assign employees
    // ===================================================================
    public Appointment assignEmployees(Long appointmentId, Set<Long> employeeIds) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isManagerOrAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> "MANAGER".equals(r.getName()) || "ADMIN".equals(r.getName()));
        if (!isManagerOrAdmin) {
            throw new RuntimeException("Only MANAGER or ADMIN can assign employees");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        for (Long empId : employeeIds) {
            User employee = userRepository.findById(empId)
                    .orElseThrow(() -> new RuntimeException("Employee not found: " + empId));

            boolean hasEmployeeRole = employee.getRoles().stream()
                    .anyMatch(r -> "EMPLOYEE".equals(r.getName()));
            if (!hasEmployeeRole) {
                throw new RuntimeException("User ID " + empId + " is not an EMPLOYEE");
            }

            appointment.getAssignedEmployees().add(employee);
        }

        return appointmentRepository.save(appointment);
    }

    // ===================================================================
    // 4. Get all employees (for dropdown)
    // ===================================================================
    public List<User> getAllEmployees() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream()
                        .anyMatch(r -> "EMPLOYEE".equals(r.getName())))
                .toList();
    }

    // ===================================================================
    // 5. EMPLOYEE: Start work (set startTime)
    // ===================================================================
    public Appointment startAppointment(Long appointmentId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User employee = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getRoles().stream().anyMatch(r -> "EMPLOYEE".equals(r.getName()))) {
            throw new RuntimeException("Only EMPLOYEE can start work");
        }

        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appt.getAssignedEmployees().contains(employee)) {
            throw new RuntimeException("You are not assigned to this appointment");
        }

        if (appt.getStartTime() != null) {
            throw new RuntimeException("Work already started");
        }

        appt.setStartTime(LocalDateTime.now());
        appt.setStatus("IN_PROGRESS");
        return appointmentRepository.save(appt);
    }

    // ===================================================================
    // 6. EMPLOYEE: Complete work (set endTime)
    // ===================================================================
    public Appointment completeAppointment guarding(Long appointmentId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User employee = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getRoles().stream().anyMatch(r -> "EMPLOYEE".equals(r.getName()))) {
            throw new RuntimeException("Only EMPLOYEE can complete work");
        }

        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appt.getAssignedEmployees().contains(employee)) {
            throw new RuntimeException("You are not assigned to this appointment");
        }

        if (appt.getStartTime() == null) {
            throw new RuntimeException("Work has not started yet");
        }
        if (appt.getEndTime() != null) {
            throw new RuntimeException("Work already completed");
        }

        appt.setEndTime(LocalDateTime.now());
        appt.setStatus("COMPLETED");
        return appointmentRepository.save(appt);
    }

    // ===================================================================
    // 7. Helper: Get current user
    // ===================================================================
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}