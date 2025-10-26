package com.ead.backend.controller;

import com.ead.backend.dto.MessageResponseDTO;
import com.ead.backend.entity.TimeLog;
import com.ead.backend.service.EmployeeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/employee")
@CrossOrigin(origins = "http://localhost:3000") // For React frontend
public class EmployeeController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeController.class);

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
        logger.info("EmployeeController initialized successfully with JWT-based role authorization");
    }

    @PostMapping("/timelogs")
    public ResponseEntity<?> timeLogs(@RequestParam Long appointmentId, @RequestParam Long employeeId) {
        logger.info("=== RETRIEVE TIME LOGS REQUEST RECEIVED ===");
        logger.info("Appointment Id: {}", appointmentId);
        logger.info("Employee Id: {}", employeeId);

        try {
            List<TimeLog> timeLogs = employeeService.getTimeLogsByAppointmentAndEmployee(appointmentId, employeeId);
            return ResponseEntity.ok(timeLogs);
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();

            // Check for specific error types
            if ("NOT_FOUND".equals(errorMessage)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDTO("No records found.", false));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDTO(errorMessage, false));
            }
        } catch (Exception e) {
            logger.error("Retrieve time logs by appointment id and employee id - Unexpected error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDTO("Unexcepted error occurred retrieving time logs.", false));
        }
    }
}
