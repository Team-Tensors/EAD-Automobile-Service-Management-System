package com.ead.backend.service;

import com.ead.backend.dto.EmployeeOptionDTO;
import com.ead.backend.dto.ShiftScheduleAppointmentsDTO;
import com.ead.backend.dto.ShiftScheduleRequestDTO;
import com.ead.backend.entity.Appointment;
import com.ead.backend.entity.ShiftSchedules;
import com.ead.backend.entity.User;
import com.ead.backend.enums.ShiftAssignmentType;
import com.ead.backend.mappers.ShiftScheduleMapper;
import com.ead.backend.repository.AppointmentRepository;
import com.ead.backend.repository.ShiftSchedulesRepository;
import com.ead.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShiftScheduleService {
    private final AppointmentRepository appointmentRepository;
    private final ShiftSchedulesRepository shiftSchedulesRepository;
    private final UserRepository userRepository;

    public ShiftScheduleService(AppointmentRepository appointmentRepository, ShiftSchedulesRepository shiftSchedulesRepository, UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.shiftSchedulesRepository = shiftSchedulesRepository;
        this.userRepository = userRepository;
    }

    public List<ShiftScheduleAppointmentsDTO> getPendingAppointments() {

        List<Appointment> pendingAppointment = appointmentRepository.findByStatus("PENDING");

        return pendingAppointment.stream().map(ShiftScheduleMapper::toDTO).toList();
    }

    public List<ShiftScheduleAppointmentsDTO> getAvailableAppointmentsForEmployee(String employeeEmail) {
        List<Appointment> pendingAppointments = appointmentRepository.findByStatus("PENDING");
        return pendingAppointments.stream()
                .filter(apt -> canEmployeeTakeAppointment(employeeEmail, apt))
                .map(ShiftScheduleMapper::toDTO)
                .toList();
    }


    private boolean canEmployeeTakeAppointment(String employeeEmail, Appointment appointment) {

        LocalDateTime startTime = appointment.getAppointmentDate();
        int estimatedDurationMinutes = appointment.getServiceOrModification().getEstimatedTimeMinutes();
        LocalDateTime endTime = startTime.plusMinutes(estimatedDurationMinutes);

        List<ShiftSchedules> conflicts = shiftSchedulesRepository.findConflictingShifts(employeeEmail, startTime, endTime);
        return conflicts.isEmpty();

    }
    /**
     * Returns employees who can be assigned to the given appointment (no conflicting shifts,
     * has EMPLOYEE role and is active, and not already assigned to the appointment).
     */
    public List<EmployeeOptionDTO> getPossibleEmployeesForAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("APPOINTMENT_NOT_FOUND"));

        LocalDateTime startTime = appointment.getAppointmentDate();
        int estimatedDurationMinutes = appointment.getServiceOrModification().getEstimatedTimeMinutes();
        LocalDateTime endTime = startTime.plusMinutes(estimatedDurationMinutes);

        // Find all users, filter by role EMPLOYEE, active, not already assigned, and no shift conflicts
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles() != null && user.getRoles().stream().anyMatch(r -> "EMPLOYEE".equals(r.getName())))
                .filter(user -> Boolean.TRUE.equals(user.getActive()))
                .filter(user -> appointment.getAssignedEmployees().stream().noneMatch(ae -> ae.getId().equals(user.getId())))
                .filter(user -> shiftSchedulesRepository.findConflictingShifts(user.getEmail(), startTime, endTime).isEmpty())
                .map(u -> new EmployeeOptionDTO(u.getId(), u.getEmail(), u.getFullName(), u.getPhoneNumber()))
                .collect(Collectors.toList());
    }

    // TODO: Add transactional annotation to make sure ACID properties are maintained
    // TODO: Need to send Notification to Employee when assigned by Admin
    // TODO: Need to send Notification to Employee when self-assigned by Employee
    /**
     * Assign an employee to an appointment (self-assignment by an employee).
     * Validates caller identity, role, and shift conflicts. Creates a ShiftSchedules record
     * and adds the employee to appointment.assignedEmployees.
     */
    public void assignEmployeeToAppointment(ShiftScheduleRequestDTO dto, String callerEmail) {
        if (dto == null) throw new RuntimeException("INVALID_REQUEST");

        UUID appointmentId = dto.getAppointmentId();
        UUID employeeId = dto.getEmployeeId();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("APPOINTMENT_NOT_FOUND"));

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("EMPLOYEE_NOT_FOUND"));

        // Caller must be the same employee (self-assignment)
        if (!employee.getEmail().equals(callerEmail)) {
            throw new RuntimeException("UNAUTHORIZED");
        }

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
        List<ShiftSchedules> conflicts = shiftSchedulesRepository.findConflictingShifts(employee.getEmail(), startTime, endTime);
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

        // Add employee to appointment assignedEmployees if not already present
        boolean alreadyAssigned = appointment.getAssignedEmployees().stream().anyMatch(u -> u.getId().equals(employee.getId()));
        if (!alreadyAssigned) {
            appointment.getAssignedEmployees().add(employee);
        }
        appointmentRepository.save(appointment);
    }
}
