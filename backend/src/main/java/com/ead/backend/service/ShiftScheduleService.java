package com.ead.backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ead.backend.dto.EmployeeCenterDTO;
import com.ead.backend.dto.SelfShiftScheduleRequestDTO;
import com.ead.backend.dto.ShiftScheduleAppointmentsDTO;
import com.ead.backend.entity.Appointment;
import com.ead.backend.entity.EmployeeCenter;
import com.ead.backend.entity.ServiceCenter;
import com.ead.backend.entity.ShiftSchedules;
import com.ead.backend.entity.User;
import com.ead.backend.enums.ShiftAssignmentType;
import com.ead.backend.mappers.ShiftScheduleMapper;
import com.ead.backend.repository.AppointmentRepository;
import com.ead.backend.repository.EmployeeCenterRepository;
import com.ead.backend.repository.ShiftSchedulesRepository;
import com.ead.backend.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ShiftScheduleService {
    private final AppointmentRepository appointmentRepository;
    private final ShiftSchedulesRepository shiftSchedulesRepository;
    private final UserRepository userRepository;
    private final EmployeeCenterRepository employeeCenterRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final EmployeeCenterRepository empCenterRepository;


    public List<ShiftScheduleAppointmentsDTO> getPendingAppointments() {

        List<Appointment> pendingAppointment = appointmentRepository.findByStatus("PENDING");

        return pendingAppointment.stream().map(ShiftScheduleMapper::toDTO).toList();
    }

    public List<ShiftScheduleAppointmentsDTO> getAvailableAppointmentsForEmployee(String employeeEmail) {
        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new RuntimeException("EMPLOYEE_NOT_FOUND"));
        UUID employeeId = employee.getId();
        Optional<EmployeeCenter> employeeCenter = employeeCenterRepository.findByEmployeeId(employeeId);
        ServiceCenter serviceCenter = employeeCenter.map(EmployeeCenter::getServiceCenter).orElse(null);
        List<Appointment> pendingAppointments = appointmentRepository.findByStatusAndServiceCenter("PENDING", serviceCenter);
        return pendingAppointments.stream()
                .filter(apt -> canEmployeeTakeAppointment(employeeId, apt))
                .map(ShiftScheduleMapper::toDTO)
                .toList();
    }


    private boolean canEmployeeTakeAppointment(UUID employeeId, Appointment appointment) {

        LocalDateTime startTime = appointment.getAppointmentDate();
        int estimatedDurationMinutes = appointment.getServiceOrModification().getEstimatedTimeMinutes();
        LocalDateTime endTime = startTime.plusMinutes(estimatedDurationMinutes);

        List<ShiftSchedules> conflicts = shiftSchedulesRepository.findConflictingShifts(employeeId, startTime, endTime);
        return conflicts.isEmpty();

    }
    /**
     * Returns employees who can be assigned to the given appointment (no conflicting shifts,
     * has EMPLOYEE role and is active, and not already assigned to the appointment).
     */
    public List<EmployeeCenterDTO> getPossibleEmployeesForAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("APPOINTMENT_NOT_FOUND"));

        LocalDateTime startTime = appointment.getAppointmentDate();
        int estimatedDurationMinutes = appointment.getServiceOrModification().getEstimatedTimeMinutes();
        LocalDateTime endTime = startTime.plusMinutes(estimatedDurationMinutes);

        ServiceCenter serviceCenterForAppointment = appointment.getServiceCenter();

        // Find all users, filter by role EMPLOYEE, active, not already assigned, and no shift conflicts
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles() != null && user.getRoles().stream().anyMatch(r -> "EMPLOYEE".equals(r.getName())))
                .filter(user -> Boolean.TRUE.equals(user.getActive()))
                .filter(user -> appointment.getAssignedEmployees() == null || appointment.getAssignedEmployees().stream()
                                .noneMatch(ae -> ae.getId().equals(user.getId())))
                .filter(user -> shiftSchedulesRepository.findConflictingShifts(user.getId(), startTime, endTime).isEmpty())
                .map(user -> {
                    Optional<EmployeeCenter> employeeCenter = employeeCenterRepository.findByEmployeeId(user.getId());
                    return employeeCenter.map(ec -> new Object[]{user, ec}).orElse(null);
                })
                .filter(Objects::nonNull)
                .filter(arr -> {
                    EmployeeCenter ec = (EmployeeCenter) arr[1];
                    return ec.getServiceCenter() != null &&
                            ec.getServiceCenter().equals(serviceCenterForAppointment);
                })
                .map(arr -> {
                    User user = (User) arr[0];
                    EmployeeCenter ec = (EmployeeCenter) arr[1];
                    String serviceCenter = ec.getServiceCenter().getName();
                    return new EmployeeCenterDTO(user.getId(), user.getEmail(),
                            user.getFullName(), user.getPhoneNumber(), serviceCenter);
                })
                .collect(Collectors.toList());
    }

    // TODO: Need to send Notification to Employee when assigned by Admin
    /**
     * Assign an employee to an appointment (self-assignment by an employee).
     * Validates caller identity, role, and shift conflicts. Creates a ShiftSchedules record
     * and adds the employee to appointment.assignedEmployees.
     * Sends notification and email to the employee after successful assignment.
     */
    @Transactional
    public void selfAssignEmployeeToAppointment(SelfShiftScheduleRequestDTO dto, String callerEmail) {
        if (dto == null) throw new RuntimeException("INVALID_REQUEST");

        UUID appointmentId = dto.getAppointmentId();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("APPOINTMENT_NOT_FOUND"));

        User employee = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new RuntimeException("EMPLOYEE_NOT_FOUND"));

        // Check role
        boolean isEmployee = employee.getRoles().stream().anyMatch(r -> "EMPLOYEE".equals(r.getName()));
        if (!isEmployee) {
            throw new RuntimeException("USER_IS_NOT_EMPLOYEE");
        }

        // Time window
        LocalDateTime startTime = appointment.getAppointmentDate();
        int estimatedDurationMinutes = appointment.getServiceOrModification().getEstimatedTimeMinutes();
        LocalDateTime endTime = startTime.plusMinutes(estimatedDurationMinutes);

        // Check conflicts
        List<ShiftSchedules> conflicts = shiftSchedulesRepository.findConflictingShifts(employee.getId(), startTime, endTime);
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("EMPLOYEE_HAS_CONFLICTING_SHIFT");
        }

        // Create ShiftSchedules
        ShiftSchedules shift = new ShiftSchedules();
        shift.setEmployee(employee);
        shift.setAppointment(appointment);
        shift.setStartTime(startTime);
        shift.setEndTime(endTime);
        shift.setAssignedBy(ShiftAssignmentType.BY_SELF);

        shiftSchedulesRepository.save(shift);
        appointment.setStatus("CONFIRMED");

        boolean alreadyAssigned = appointment.getAssignedEmployees().stream().anyMatch(u -> u.getId().equals(employee.getId()));
        if (!alreadyAssigned) {
            appointment.getAssignedEmployees().add(employee);
        }
        appointmentRepository.save(appointment);

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        String formattedDate = startTime.format(dateFormatter);
        String formattedTime = startTime.format(timeFormatter);
        String serviceName = appointment.getServiceOrModification().getName();
        String customerName = appointment.getUser().getFullName();
        String bookingId = appointment.getId().toString();
        String vehicleInfo = String.format("%s %s (%s)",
            appointment.getVehicle().getBrand(),
            appointment.getVehicle().getModel(),
            appointment.getVehicle().getLicensePlate()
        );

        String notificationMessage = String.format(
                "You have successfully self-assigned to appointment on %s at %s for %s (Customer: %s)",
                formattedDate,
                formattedTime,
                serviceName,
                customerName
        );

        notificationService.sendNotification(
                employee.getId(),
                "APPOINTMENT_SELF_ASSIGNED",
                notificationMessage,
                new java.util.HashMap<String, Object>() {{
                    put("appointmentId", appointmentId.toString());
                    put("serviceName", serviceName);
                    put("appointmentDate", formattedDate);
                    put("appointmentTime", formattedTime);
                    put("customerName", customerName);
                    put("estimatedDuration", estimatedDurationMinutes);
                    put("vehicleInfo", vehicleInfo);
                    put("bookingId", bookingId);
                }}
        );

        emailService.sendEmployeeAssignmentEmail(
                employee.getEmail(),
                employee.getFullName(),
                bookingId,
                formattedDate,
                formattedTime,
                serviceName,
                vehicleInfo,
                customerName
        );
    }
}