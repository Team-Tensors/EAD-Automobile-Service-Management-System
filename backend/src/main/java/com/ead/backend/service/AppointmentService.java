package com.ead.backend.service;

import com.ead.backend.entity.*;
import com.ead.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AppointmentService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private ServiceOrModificationRepository serviceOrModificationRepository;
    @Autowired private ServiceCenterRepository serviceCenterRepository;

    // ===================================================================
    // 1. CUSTOMER: Book appointment
    // ===================================================================
    public Appointment createAppointment(Appointment appointment) {
        User customer = getCurrentUser();

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

        // Validate and set ServiceOrModification
        if (appointment.getServiceOrModification() == null || appointment.getServiceOrModification().getId() == null) {
            throw new RuntimeException("Service or Modification must be selected");
        }

        ServiceOrModification som = serviceOrModificationRepository
                .findById(appointment.getServiceOrModification().getId())
                .orElseThrow(() -> new RuntimeException("Service/Modification not found"));

        // Ensure type consistency
        if (!som.getType().equals(appointment.getAppointmentType())) {
            throw new RuntimeException(
                    String.format("Selected %s does not match appointment type %s",
                            som.getType(), appointment.getAppointmentType())
            );
        }

        appointment.setServiceOrModification(som);

        // Validate and set ServiceCenter
        if (appointment.getServiceCenter() == null || appointment.getServiceCenter().getId() == null) {
            throw new RuntimeException("Service center must be selected");
        }

        ServiceCenter serviceCenter = serviceCenterRepository
                .findById(appointment.getServiceCenter().getId())
                .orElseThrow(() -> new RuntimeException("Service center not found"));

        if (!serviceCenter.getIsActive()) {
            throw new RuntimeException("Selected service center is not currently available");
        }

        appointment.setServiceCenter(serviceCenter);

        // Validate appointment date
        if (appointment.getAppointmentDate() == null) {
            throw new RuntimeException("Please select your preferred appointment date and time");
        }
        if (appointment.getAppointmentDate().isBefore(LocalDateTime.now().plusHours(1))) {
            throw new RuntimeException("Appointment date must be at least 1 hour from now");
        }

        // Finalize
        appointment.setUser(customer);
        appointment.setVehicle(vehicle);
        appointment.setStatus("PENDING");

        return appointmentRepository.save(appointment);
    }

    // ===================================================================
    // 2. CUSTOMER: Get own appointments
    // ===================================================================
    public List<Appointment> getUserAppointments() {
        User customer = getCurrentUser();
        return appointmentRepository.findByUserId(customer.getId());
    }

    // ===================================================================
    // 3. ADMIN/MANAGER: Assign employees
    // ===================================================================
    public Appointment assignEmployees(UUID appointmentId, Set<Long> employeeIds) {
        User currentUser = getCurrentUser();

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
    // 5. EMPLOYEE: Start work
    // ===================================================================
    public Appointment startAppointment(UUID appointmentId) {
        User employee = getCurrentUser();

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
    // 6. EMPLOYEE: Complete work
    // ===================================================================
    public Appointment completeAppointment(UUID appointmentId) {
        User employee = getCurrentUser();

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
    // HELPER: Get current authenticated user
    // ===================================================================
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}