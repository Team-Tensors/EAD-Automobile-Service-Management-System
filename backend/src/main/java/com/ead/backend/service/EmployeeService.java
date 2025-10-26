package com.ead.backend.service;

import com.ead.backend.entity.TimeLog;
import com.ead.backend.repository.TimeLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeService.class);
    private final TimeLogRepository timeLogRepository;

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
        List<TimeLog> timeLogs = timeLogRepository.findByAppointmentIdAndUserId(appointmentId, employeeId);

        if (timeLogs.isEmpty()) {
            logger.warn("No recorded time logs found matching the given appointment id and the employee id.");
            throw new RuntimeException("NOT_FOUND");
        }

        return timeLogs;
    }
}

