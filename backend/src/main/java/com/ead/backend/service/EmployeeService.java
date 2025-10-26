package com.ead.backend.service;

import com.ead.backend.dto.TimeLogRequestDto;
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
    public List<TimeLog> getTimeLogsByAppointmentAndEmployee(Long appointmentId, Long employeeId) {
        logger.info("=== EMPLOYEE SERVICE - GET TIME LOGS BY APPOINTMENT AND EMPLOYEE METHOD STARTED ===");
        return timeLogRepository.findByAppointmentIdAndUserId(appointmentId, employeeId);
    }

    /**
     * Retrieves all appointments assigned to an employee.
     *
     * @param employeeId the employee ID
     * @return list of appointments
     */
    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByEmployee(Long employeeId) {
        logger.info("=== EMPLOYEE SERVICE - GET APPOINTMENTS BY EMPLOYEE METHOD STARTED ===");
        return appointmentRepository.findByAssignedEmployeesId(employeeId);
    }

    /**
     * Updates the status of an appointment.
     *
     * @param appointmentId the appointment ID
     * @param newStatus     the new status (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
     * @return updated appointment
     */
    @Transactional
    public Appointment updateAppointmentStatus(Long appointmentId, String newStatus) {
        logger.info("=== EMPLOYEE SERVICE - UPDATE APPOINTMENT STATUS METHOD STARTED ===");
        if (!VALID_APPOINTMENT_STATUSES.contains(newStatus)) {
            throw new RuntimeException("INVALID_STATUS: " + newStatus);
        }
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("NOT_FOUND"));
        appointment.setStatus(newStatus);
        return appointmentRepository.save(appointment);
    }

    /**
     * Adds a new time log entry.
     *
     * @param appointmentId the appointment ID
     * @param timeLogDto    the time log request DTO
     * @return saved time log
     */
    @Transactional
    public TimeLog addTimeLog(Long appointmentId, TimeLogRequestDto timeLogDto) {
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

        // Save and return
        return timeLogRepository.save(timeLog);
    }
}

