package com.ead.backend.service;

import com.ead.backend.dto.AppointmentDTO;
import com.ead.backend.dto.TimeLogRequestDto;
import com.ead.backend.dto.TimeLogResponseDTO;
import com.ead.backend.entity.*;
import com.ead.backend.repository.AppointmentRepository;
import com.ead.backend.repository.TimeLogRepository;
import com.ead.backend.repository.UserRepository;
import com.ead.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
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
    private final VehicleRepository vehicleRepository;

    /**
     * Retrieves all time logs for a given appointment and employee.
     *
     * @param appointmentId the appointment ID
     * @param employeeId the employee (user) ID
     * @return list of time logs
     * @throws RuntimeException if no logs are found
     */
    @Transactional(readOnly = true)
    public List<TimeLogResponseDTO> getTimeLogsByAppointmentAndEmployee(UUID appointmentId, UUID employeeId) {
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
    public List<AppointmentDTO> getAppointmentsByEmployee(UUID employeeId, String status) {
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
        return appointments.stream().map(a -> {
            // User details
            User user = a.getUser();
            UUID userId = user != null ? user.getId() : null;
            String userFullName = user != null ? user.getFullName() : null;
            String phoneNumber = user != null ? user.getPhoneNumber() : null;

            // Vehicle details
            Vehicle vehicle = a.getVehicle();
            UUID vehicleId = vehicle != null ? vehicle.getId() : null;
            String brand = vehicle != null ? vehicle.getBrand() : null;
            String model = vehicle != null ? vehicle.getModel() : null;
            String color = vehicle != null ? vehicle.getColor() : null;
            LocalDateTime lastServiceDate = vehicle != null ? vehicle.getLastServiceDate() : null;
            String licensePlate = vehicle != null ? vehicle.getLicensePlate() : null;

            // Appointment type info
            String appointmentType = a.getAppointmentType() != null ? a.getAppointmentType().name() : null;
            ServiceOrModification serviceOrModificationType = a.getServiceOrModification();
            Long serviceOrModificationId = serviceOrModificationType != null ? serviceOrModificationType.getId() : null;
            String serviceOrModificationName = serviceOrModificationType != null ? serviceOrModificationType.getName() : null;
            String serviceOrModificationDescription = serviceOrModificationType != null ? serviceOrModificationType.getDescription() : null;
            Integer estimatedTimeMinutes = serviceOrModificationType != null ? serviceOrModificationType.getEstimatedTimeMinutes() : null;

            return new AppointmentDTO(
                    a.getId(),
                    userId,
                    userFullName,
                    phoneNumber,
                    vehicleId,
                    brand,
                    model,
                    color,
                    lastServiceDate,
                    licensePlate,
                    appointmentType,
                    serviceOrModificationId,
                    serviceOrModificationName,
                    serviceOrModificationDescription,
                    estimatedTimeMinutes,
                    a.getAppointmentDate(),
                    a.getStatus(),
                    a.getDescription()
            );
        }).toList();
    }

    /**
     * Updates the status of an appointment.
     *
     * @param appointmentId the appointment ID
     * @param newStatus     the new status (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
     */
    @Transactional
    public void updateAppointmentStatus(UUID appointmentId, String newStatus) {
        logger.info("=== EMPLOYEE SERVICE - UPDATE APPOINTMENT STATUS METHOD STARTED ===");
        if (!VALID_APPOINTMENT_STATUSES.contains(newStatus)) {
            throw new RuntimeException("INVALID_STATUS");
        }
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("NOT_FOUND"));
        String currentStatus = appointment.getStatus();
        if (currentStatus.equals(newStatus)) {
            logger.info("Status is already '{}'. No update performed.", newStatus);
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        switch (newStatus) {
            case "IN_PROGRESS":
                if (appointment.getStartTime() == null) {
                    appointment.setStartTime(now);
                    logger.info("Start time set to {}", now);
                }
                break;
            case "COMPLETED":
                if (appointment.getEndTime() == null) {
                    appointment.setEndTime(now);
                    logger.info("End time set to {}", now);
                }
                // Update vehicle's last service date if this is a SERVICE appointment
                if (appointment.getAppointmentType() == AppointmentType.SERVICE) {
                    Vehicle vehicle = appointment.getVehicle();
                    vehicle.setLastServiceDate(now);
                    vehicleRepository.save(vehicle);
                    logger.info("Updated last service date for vehicle: {}", vehicle.getId());
                }
                break;
            case "CONFIRMED":
                appointment.setStartTime(null);
                appointment.setEndTime(null);
                logger.info("Reset start time and end time of the appointment");
                break;
            default:
                break;
        }
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
    public void addTimeLog(UUID appointmentId, TimeLogRequestDto timeLogDto) {
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
