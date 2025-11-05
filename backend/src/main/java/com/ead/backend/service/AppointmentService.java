package com.ead.backend.service;

import com.ead.backend.entity.*;
import com.ead.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ead.backend.enums.AppointmentType;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class AppointmentService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private ServiceOrModificationRepository serviceOrModificationRepository;
    @Autowired private ServiceCenterRepository serviceCenterRepository;
    @Autowired private EmailService emailService;
    @Autowired private NotificationService notificationService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

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

        // Check if appointment date is in the past
        LocalDateTime now = LocalDateTime.now();
        if (appointment.getAppointmentDate().isBefore(now)) {
            throw new RuntimeException("Appointment date cannot be in the past");
        }

        // Check if appointment is at least 1 hour from now
        if (appointment.getAppointmentDate().isBefore(now.plusHours(1))) {
            throw new RuntimeException("Appointment must be scheduled at least 1 hour from now");
        }

        // Check if appointment is not more than 1 month from now
        if (appointment.getAppointmentDate().isAfter(now.plusDays(30))) {
            throw new RuntimeException("Appointment cannot be scheduled more than 1 month in advance");
        }

        // Validate appointment time - must be on the full hour (no minutes)
        int minute = appointment.getAppointmentDate().getMinute();
        if (minute != 0) {
            throw new RuntimeException("Appointment time must be on the hour (e.g., 8:00, 9:00, etc.)");
        }

        // Validate appointment time is within business hours
        int hour = appointment.getAppointmentDate().getHour();
        int dayOfWeek = appointment.getAppointmentDate().getDayOfWeek().getValue(); // 1=Monday, 7=Sunday
        
        // Weekend hours: Saturday(6) and Sunday(7) are 9 AM - 4 PM
        if (dayOfWeek == 6 || dayOfWeek == 7) {
            if (hour < 9 || hour >= 17) {
                throw new RuntimeException("Weekend appointments must be between 9:00 AM and 4:00 PM");
            }
        } 
        // Weekday hours: Monday-Friday are 8 AM - 7 PM
        else {
            if (hour < 8 || hour >= 20) {
                throw new RuntimeException("Weekday appointments must be between 8:00 AM and 7:00 PM");
            }
        }

        // Check for duplicate appointment (same vehicle, same date/time, not cancelled)
        List<Appointment> existingAppointments = appointmentRepository
                .findByVehicleIdAndAppointmentDateAndStatusNot(
                        vehicle.getId(),
                        appointment.getAppointmentDate(),
                        "CANCELLED"
                );
        
        if (!existingAppointments.isEmpty()) {
            throw new RuntimeException("This vehicle already has an appointment scheduled for the selected date and time");
        }

        // Check if service center has available slots for the selected date/time
        Long bookedSlots = appointmentRepository
                .countByServiceCenterIdAndAppointmentDateAndStatusNot(
                        serviceCenter.getId(),
                        appointment.getAppointmentDate(),
                        "CANCELLED"
                );
        
        if (bookedSlots >= serviceCenter.getCenterSlot()) {
            throw new RuntimeException(
                String.format("Service center is fully booked for this time slot. Please select a different time or service center.")
            );
        }

        // Finalize
        appointment.setUser(customer);
        appointment.setVehicle(vehicle);
        appointment.setStatus("PENDING");

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Send notification to customer
        notificationService.sendNotification(
                customer.getId(),
                "APPOINTMENT_CREATED",
                String.format("Your appointment for %s has been scheduled", som.getName()),
                Map.of(
                        "appointmentId", savedAppointment.getId().toString(),
                        "service", som.getName(),
                        "vehicle", vehicle.getBrand() + " " + vehicle.getModel(),
                        "date", savedAppointment.getAppointmentDate().format(DATE_FORMATTER),
                        "time", savedAppointment.getAppointmentDate().format(TIME_FORMATTER),
                        "serviceCenter", serviceCenter.getName()
                )
        );

        // Send confirmation email
        try {
            emailService.sendAppointmentConfirmationEmail(
                    customer.getEmail(),
                    customer.getFullName(),
                    savedAppointment.getId().toString(),
                    savedAppointment.getAppointmentDate().format(DATE_FORMATTER),
                    savedAppointment.getAppointmentDate().format(TIME_FORMATTER),
                    som.getName(),
                    vehicle.getBrand() + " " + vehicle.getModel(),
                    serviceCenter.getName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send appointment confirmation email: " + e.getMessage());
        }

        return savedAppointment;
    }

    // ===================================================================
    // 2. CUSTOMER: Get own appointments
    // ===================================================================
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Appointment> getUserAppointments() {
        User customer = getCurrentUser();
        return appointmentRepository.findByUserId(customer.getId());
    }

    // ===================================================================
    // 2.1 CUSTOMER: Cancel appointment
    // ===================================================================
    @Transactional
    public Appointment cancelAppointment(UUID appointmentId) {
        User customer = getCurrentUser();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Verify ownership
        if (!appointment.getUser().getId().equals(customer.getId())) {
            throw new RuntimeException("You can only cancel your own appointments");
        }

        // Only allow cancellation of PENDING appointments
        if (!"PENDING".equals(appointment.getStatus())) {
            throw new RuntimeException("Only pending appointments can be cancelled");
        }

        appointment.setStatus("CANCELLED");
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Try to send notification to customer (don't fail if notification fails)
        try {
            notificationService.sendNotification(
                    customer.getId(),
                    "APPOINTMENT_CANCELLED",
                    String.format("Your appointment for %s has been cancelled", 
                            savedAppointment.getServiceOrModification().getName()),
                    Map.of(
                            "appointmentId", savedAppointment.getId().toString(),
                            "service", savedAppointment.getServiceOrModification().getName(),
                            "vehicle", savedAppointment.getVehicle().getBrand() + " " + 
                                    savedAppointment.getVehicle().getModel(),
                            "date", savedAppointment.getAppointmentDate().format(DATE_FORMATTER)
                    )
            );
        } catch (Exception e) {
            // Log the error but don't fail the cancellation
            System.err.println("Failed to send cancellation notification: " + e.getMessage());
        }

        return savedAppointment;
    }

    // ===================================================================
    // 3. ADMIN/MANAGER: Assign employees
    // ===================================================================
    public Appointment assignEmployees(UUID appointmentId, Set<UUID> employeeIds) {
        User currentUser = getCurrentUser();

        boolean isManagerOrAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> "MANAGER".equals(r.getName()) || "ADMIN".equals(r.getName()));
        if (!isManagerOrAdmin) {
            throw new RuntimeException("Only MANAGER or ADMIN can assign employees");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        for (UUID empId : employeeIds) {
            User employee = userRepository.findById(empId)
                    .orElseThrow(() -> new RuntimeException("Employee not found: " + empId));

            boolean hasEmployeeRole = employee.getRoles().stream()
                    .anyMatch(r -> "EMPLOYEE".equals(r.getName()));
            if (!hasEmployeeRole) {
                throw new RuntimeException("User ID " + empId + " is not an EMPLOYEE");
            }

            appointment.getAssignedEmployees().add(employee);
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Send notification to customer about assignment
        notificationService.sendNotification(
                savedAppointment.getUser().getId(),
                "APPOINTMENT_ASSIGNED",
                "Technicians have been assigned to your appointment",
                Map.of(
                        "appointmentId", savedAppointment.getId().toString(),
                        "service", savedAppointment.getServiceOrModification().getName(),
                        "employeeCount", employeeIds.size()
                )
        );

        // Send notifications to assigned employees
        try {
            for (UUID empId : employeeIds) {
                User employee = userRepository.findById(empId).orElse(null);
                if (employee != null) {
                    // Send notification
                    notificationService.sendNotification(
                            employee.getId(),
                            "TASK_ASSIGNED",
                            String.format("You've been assigned to %s appointment",
                                    savedAppointment.getServiceOrModification().getName()),
                            Map.of(
                                    "appointmentId", savedAppointment.getId().toString(),
                                    "service", savedAppointment.getServiceOrModification().getName(),
                                    "vehicle", savedAppointment.getVehicle().getBrand() + " " +
                                            savedAppointment.getVehicle().getModel(),
                                    "date", savedAppointment.getAppointmentDate().format(DATE_FORMATTER),
                                    "time", savedAppointment.getAppointmentDate().format(TIME_FORMATTER),
                                    "customer", savedAppointment.getUser().getFullName()
                            )
                    );

                    // Send email
                    emailService.sendEmployeeAssignmentEmail(
                            employee.getEmail(),
                            employee.getFullName(),
                            savedAppointment.getId().toString(),
                            savedAppointment.getAppointmentDate().format(DATE_FORMATTER),
                            savedAppointment.getAppointmentDate().format(TIME_FORMATTER),
                            savedAppointment.getServiceOrModification().getName(),
                            savedAppointment.getVehicle().getBrand() + " " + savedAppointment.getVehicle().getModel(),
                            savedAppointment.getUser().getFullName()
                    );
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send employee assignment notifications: " + e.getMessage());
        }

        return savedAppointment;
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

        Appointment savedAppointment = appointmentRepository.save(appt);

        // Send notification to customer
        notificationService.sendNotification(
                savedAppointment.getUser().getId(),
                "APPOINTMENT_STARTED",
                String.format("Work has started on your %s", savedAppointment.getVehicle().getModel()),
                Map.of(
                        "appointmentId", savedAppointment.getId().toString(),
                        "service", savedAppointment.getServiceOrModification().getName(),
                        "vehicle", savedAppointment.getVehicle().getBrand() + " " +
                                savedAppointment.getVehicle().getModel(),
                        "technician", employee.getFullName(),
                        "startTime", savedAppointment.getStartTime().format(TIME_FORMATTER)
                )
        );

        // Send work started email to customer
        try {
            emailService.sendAppointmentStartedEmail(
                    savedAppointment.getUser().getEmail(),
                    savedAppointment.getUser().getFullName(),
                    savedAppointment.getId().toString(),
                    savedAppointment.getServiceOrModification().getName(),
                    savedAppointment.getVehicle().getBrand() + " " + savedAppointment.getVehicle().getModel(),
                    employee.getFullName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send work started email: " + e.getMessage());
        }

        return savedAppointment;
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

        Appointment savedAppointment = appointmentRepository.save(appt);

        // Update vehicle's last service date if this is a SERVICE appointment
        if (savedAppointment.getAppointmentType() == AppointmentType.SERVICE) {
            Vehicle vehicle = savedAppointment.getVehicle();
            vehicle.setLastServiceDate(LocalDateTime.now());
            vehicleRepository.save(vehicle);
        }

        // Send notification to customer
        notificationService.sendNotification(
                savedAppointment.getUser().getId(),
                "APPOINTMENT_COMPLETED",
                String.format("Your %s service has been completed!",
                        savedAppointment.getServiceOrModification().getName()),
                Map.of(
                        "appointmentId", savedAppointment.getId().toString(),
                        "service", savedAppointment.getServiceOrModification().getName(),
                        "vehicle", savedAppointment.getVehicle().getBrand() + " " +
                                savedAppointment.getVehicle().getModel(),
                        "startTime", savedAppointment.getStartTime().format(TIME_FORMATTER),
                        "endTime", savedAppointment.getEndTime().format(TIME_FORMATTER)
                )
        );

        // Send completion email to customer
        try {
            emailService.sendAppointmentCompletedEmail(
                    savedAppointment.getUser().getEmail(),
                    savedAppointment.getUser().getFullName(),
                    savedAppointment.getId().toString(),
                    savedAppointment.getServiceOrModification().getName(),
                    savedAppointment.getVehicle().getBrand() + " " + savedAppointment.getVehicle().getModel(),
                    savedAppointment.getStartTime().format(TIME_FORMATTER),
                    savedAppointment.getEndTime().format(TIME_FORMATTER)
            );
        } catch (Exception e) {
            System.err.println("Failed to send completion email: " + e.getMessage());
        }

        return savedAppointment;
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