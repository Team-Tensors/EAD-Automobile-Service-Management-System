package com.ead.backend.controller;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ead.backend.dto.AppointmentDTO;
import com.ead.backend.dto.EmployeeCenterDTO;
import com.ead.backend.dto.MessageResponseDTO;
import com.ead.backend.dto.TimeLogRequestDto;
import com.ead.backend.dto.TimeLogResponseDTO;
import com.ead.backend.service.EmployeeService;

@RestController
@RequestMapping("/employee")
public class EmployeeController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeController.class);

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
        logger.info("EmployeeController initialized successfully with JWT-based role authorization");
    }

    @GetMapping("/appointments/{appointmentId}/employees/{employeeId}/timelogs")
    public ResponseEntity<?> getTimeLogs(@PathVariable UUID appointmentId, @PathVariable UUID employeeId)  {
        logger.info("=== RETRIEVE TIME LOGS REQUEST RECEIVED ===");
        logger.info("Appointment Id: {}", appointmentId);
        logger.info("Employee Id: {}", employeeId);

        try {
            List<TimeLogResponseDTO> timeLogs = employeeService.getTimeLogsByAppointmentAndEmployee(appointmentId, employeeId);
            return ResponseEntity.ok(timeLogs);
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();

            // Check for specific error types
            if ("NOT_FOUND".equals(errorMessage)) {
                return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDTO("No records found.", false));
            } else {
                return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDTO(errorMessage, false));
            }
        } catch (Exception e) {
            logger.error("Retrieve time logs by appointment id and employee id - Unexpected error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDTO("Unexcepted error occurred retrieving time logs.", false));
        }
    }

    /**
     * Retrieve all appointments assigned to an employee.
     */
    @GetMapping("/appointments/{employeeId}")
    public ResponseEntity<?> getAppointmentsByEmployee(@PathVariable UUID employeeId, @RequestParam(required = false) String status) {
        logger.info("=== RETRIEVE APPOINTMENTS FOR EMPLOYEE REQUEST RECEIVED ===");
        try {
            List<AppointmentDTO> appointments = employeeService.getAppointmentsByEmployee(employeeId, status);
            return ResponseEntity.ok(appointments);
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            logger.error("Error retrieving appointment by employee id: {}", errorMessage);
            // Check for specific error types
            if ("INVALID_STATUS".equals(errorMessage))  {
                return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDTO("Invalid appointment status.", false));
            }
            else {
                return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDTO(errorMessage, false));
            }
        } catch (Exception e) {
            logger.error("Error retrieving appointments for employee {}: {}", employeeId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDTO("Unexpected error occurred retrieving appointments.", false));
        }
    }

    /**
     * Update the status of an appointment.
     */
    @PutMapping("/appointments/{appointmentId}/status")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable UUID appointmentId,
                                                     @RequestParam String status) {
        logger.info("=== UPDATE APPOINTMENT STATUS REQUEST RECEIVED ===");
        logger.info("Appointment Id: {}, New Status: {}", appointmentId, status);

        try {
            employeeService.updateAppointmentStatus(appointmentId, status);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            logger.error("Error updating appointment status: {}", errorMessage);
            // Check for specific error types
            if ("NOT_FOUND".equals(errorMessage)) {
                return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDTO("Unable to retrieve appointment in order to update status.", false));
            } else if ("INVALID_STATUS".equals(errorMessage))  {
                return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDTO("Invalid appointment status.", false));
            }
            else {
                return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDTO(errorMessage, false));
            }
        } catch (Exception e) {
            logger.error("Unexpected error updating appointment status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDTO("Unexpected error occurred updating appointment status.", false));
        }
    }

    /**
     * Add a new time log entry.
     */
    @PostMapping("/appointments/{appointmentId}/timelog")
    public ResponseEntity<?> addTimeLog(@PathVariable UUID appointmentId, @RequestBody TimeLogRequestDto timeLog) {
        logger.info("=== ADD TIME LOG REQUEST RECEIVED ===");
        logger.info("Appointment Id: {}", appointmentId);

        try {
            employeeService.addTimeLog(appointmentId, timeLog);
            return ResponseEntity.status(HttpStatus.CREATED). build();
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            logger.error("Error inserting new time log: {}", errorMessage);
            // Check for specific error types
            if ("APPOINTMENT_NOT_FOUND".equals(errorMessage)) {
                return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDTO("Invalid appointment id.", false));
            } else if ("EMPLOYEE_NOT_FOUND".equals(errorMessage)) {
                return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDTO("Invalid employee id.", false));
            }
            else {
                return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDTO(errorMessage, false));
            }
        }
        catch (Exception e) {
            logger.error("Unexpected error adding time log: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDTO("Unexpected error occurred adding time log.", false));
        }
    }

    @GetMapping("/details")
    public ResponseEntity<EmployeeCenterDTO> getEmployeeDetails(Authentication authentication) {
        String email = authentication.getName();
        EmployeeCenterDTO employeeDetails = employeeService.getEmployeeDetails(email);
        return ResponseEntity.ok(employeeDetails);
    }
}
