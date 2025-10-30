package com.ead.backend.service;

import com.ead.backend.dto.AppointmentDTO;
import com.ead.backend.dto.TimeLogRequestDto;
import com.ead.backend.dto.TimeLogResponseDTO;
import com.ead.backend.entity.Appointment;
import com.ead.backend.entity.TimeLog;
import com.ead.backend.entity.User;
import com.ead.backend.repository.AppointmentRepository;
import com.ead.backend.repository.TimeLogRepository;
import com.ead.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeService.class);
    private static final Set<String> VALID_APPOINTMENT_STATUSES = Set.of(
            "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"
    );
    private final TimeLogRepository timeLogRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    /**
     * Retrieves all time logs for a given appointment and employee.
     *
     * @param appointmentId the appointment ID
     * @param employeeId the employee (user) ID
     * @return list of time logs
     * @throws RuntimeException if no logs are found
     */
    @Transactional(readOnly = true)
    public List<TimeLogResponseDTO> getTimeLogsByAppointmentAndEmployee(Long appointmentId, Long employeeId) {
        logger.info("=== EMPLOYEE SERVICE - GET TIME LOGS BY APPOINTMENT AND EMPLOYEE METHOD STARTED ===");
        List<TimeLog> timeLogs = timeLogRepository.findByAppointmentIdAndUserId(appointmentId, employeeId);
        if (timeLogs.isEmpty()) {
            throw new RuntimeException("NOT_FOUND");
        }
        return timeLogs.stream()
                .map(t -> new TimeLogResponseDTO(
                        t.getId(),
                        t.getStartTime(),
                        t.getEndTime(),
                        t.getHoursLogged(),
                        t.getNotes()
                ))
                .toList();
    }

    /**
     * Retrieves all appointments assigned to an employee.
     *
     * @param employeeId the employee ID
     * @param status the appointment status
     * @return list of appointments
     */
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByEmployee(Long employeeId, String status) {
        logger.info("=== EMPLOYEE SERVICE - GET APPOINTMENTS BY EMPLOYEE METHOD STARTED ===");
        List<String> allowedStatuses = List.of("CONFIRMED", "IN_PROGRESS", "COMPLETED");
        List<Appointment> appointments;
        if (status == null) {
            appointments = appointmentRepository.findByAssignedEmployeesIdAndStatusIn(employeeId, allowedStatuses);
        } else {
            if (!allowedStatuses.contains(status)) {
                throw new RuntimeException("INVALID_STATUS");
            }
            appointments = appointmentRepository.findByAssignedEmployeesIdAndStatus(employeeId, status);
        }
        return appointments.stream()
                .map(a -> new AppointmentDTO(
                        a.getId(),
                        a.getUser() != null ? a.getUser().getId() : null,
                        a.getVehicle() != null ? a.getVehicle().getId() : null,
                        a.getAppointmentType() != null ? a.getAppointmentType().name() : null,
                        a.getServiceType() != null ? a.getServiceType().getId() : null,
                        a.getModificationType() != null ? a.getModificationType().getId() : null,
                        a.getAppointmentDate(),
                        a.getStatus(),
                        a.getDescription(),
                        a.getAssignedEmployees()
                                .stream()
                                .map(User::getId)
                                .collect(Collectors.toSet())
                ))
                .toList();
    }

    /**
     * Updates the status of an appointment.
     *
     * @param appointmentId the appointment ID
     * @param newStatus     the new status (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
     */
    @Transactional
    public void updateAppointmentStatus(Long appointmentId, String newStatus) {
        logger.info("=== EMPLOYEE SERVICE - UPDATE APPOINTMENT STATUS METHOD STARTED ===");
        if (!VALID_APPOINTMENT_STATUSES.contains(newStatus)) {
            throw new RuntimeException("INVALID_STATUS");
        }
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("NOT_FOUND"));
        appointment.setStatus(newStatus);
        appointmentRepository.save(appointment);
    }

    /**
     * Adds a new time log entry.
     *
     * @param appointmentId the appointment ID
     * @param timeLogDto    the time log request DTO
     */
    @Transactional
    public void addTimeLog(Long appointmentId, TimeLogRequestDto timeLogDto) {
        logger.info("=== EMPLOYEE SERVICE - ADD TIME LOG METHOD STARTED ===");

        // Fetch appointment
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("APPOINTMENT_NOT_FOUND"));

        // Fetch user (employee)
        User employee = userRepository.findById(timeLogDto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("EMPLOYEE_NOT_FOUND"));

        // Calculate hours logged (if endTime is provided)
        Double hoursLogged = null;
        if (timeLogDto.getEndTime() != null && timeLogDto.getStartTime() != null) {
            hoursLogged = (double) java.time.Duration.between(timeLogDto.getStartTime(), timeLogDto.getEndTime()).toMinutes() / 60;
        }

        // Map DTO to entity
        TimeLog timeLog = new TimeLog();
        timeLog.setAppointment(appointment);
        timeLog.setUser(employee);
        timeLog.setStartTime(timeLogDto.getStartTime());
        timeLog.setEndTime(timeLogDto.getEndTime());
        timeLog.setHoursLogged(hoursLogged);
        timeLog.setNotes(timeLogDto.getNotes());

        timeLogRepository.save(timeLog);
    }
}

