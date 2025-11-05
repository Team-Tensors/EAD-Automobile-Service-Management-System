package com.ead.backend.controller;

import com.ead.backend.dto.*;
import com.ead.backend.service.EmployeeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployeeControllerTest {
    @Mock
    private EmployeeService employeeService;

    @InjectMocks
    private EmployeeController employeeController;

    private UUID appointmentId;
    private UUID employeeId;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        appointmentId = UUID.randomUUID();
        employeeId = UUID.randomUUID();
    }

    @Test
    void getTimeLogs_success() {
        List<TimeLogResponseDTO> logs = List.of(
            new TimeLogResponseDTO(1L, LocalDateTime.now(), LocalDateTime.now().plusHours(1), 1.0, "Worked on engine")
        );
            when(employeeService.getTimeLogsByAppointmentAndEmployee(appointmentId, employeeId)).thenReturn(logs);
            ResponseEntity<?> response = employeeController.getTimeLogs(appointmentId, employeeId);
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(logs, response.getBody());
    }

    @Test
    void getTimeLogs_notFound() {
        when(employeeService.getTimeLogsByAppointmentAndEmployee(appointmentId, employeeId)).thenThrow(new RuntimeException("NOT_FOUND"));
        ResponseEntity<?> response = employeeController.getTimeLogs(appointmentId, employeeId);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponseDTO body = (MessageResponseDTO) response.getBody();
        assertNotNull(body);
        assertEquals("No records found.", body.getMessage());
        assertFalse(body.isSuccess());
    }

    @Test
    void getTimeLogs_otherError() {
        when(employeeService.getTimeLogsByAppointmentAndEmployee(appointmentId, employeeId)).thenThrow(new RuntimeException("SOME_ERROR"));
        ResponseEntity<?> response = employeeController.getTimeLogs(appointmentId, employeeId);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponseDTO body = (MessageResponseDTO) response.getBody();
        assertNotNull(body);
        assertEquals("SOME_ERROR", body.getMessage());
        assertFalse(body.isSuccess());
    }

    @Test
    void getAppointmentsByEmployee_success() {
        List<AppointmentDTO> appointments = List.of(
                new AppointmentDTO(UUID.randomUUID(), employeeId, "John Doe", "1234567890", UUID.randomUUID(), "Toyota", "Corolla", "Red", LocalDateTime.now(), "ABC-123", "SERVICE", UUID.randomUUID(), "Oil Change", "Change engine oil", 60, LocalDateTime.now(), "CONFIRMED", "Routine service")
        );
        when(employeeService.getAppointmentsByEmployee(employeeId, null)).thenReturn(appointments);
        ResponseEntity<?> response = employeeController.getAppointmentsByEmployee(employeeId, null);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(appointments, response.getBody());
    }

    @Test
    void getAppointmentsByEmployee_invalidStatus() {
        when(employeeService.getAppointmentsByEmployee(employeeId, "INVALID")).thenThrow(new RuntimeException("INVALID_STATUS"));
        ResponseEntity<?> response = employeeController.getAppointmentsByEmployee(employeeId, "INVALID");
        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponseDTO body = (MessageResponseDTO) response.getBody();
        assertNotNull(body);
        assertEquals("Invalid appointment status.", body.getMessage());
        assertFalse(body.isSuccess());
    }

    @Test
    void getAppointmentsByEmployee_otherError() {
        when(employeeService.getAppointmentsByEmployee(employeeId, null)).thenThrow(new RuntimeException("SOME_ERROR"));
        ResponseEntity<?> response = employeeController.getAppointmentsByEmployee(employeeId, null);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponseDTO body = (MessageResponseDTO) response.getBody();
        assertNotNull(body);
        assertEquals("SOME_ERROR", body.getMessage());
        assertFalse(body.isSuccess());
    }

    @Test
    void updateAppointmentStatus_success() {
        doNothing().when(employeeService).updateAppointmentStatus(appointmentId, "CONFIRMED");
        ResponseEntity<?> response = employeeController.updateAppointmentStatus(appointmentId, "CONFIRMED");
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    void updateAppointmentStatus_notFound() {
        doThrow(new RuntimeException("NOT_FOUND")).when(employeeService).updateAppointmentStatus(appointmentId, "CONFIRMED");
        ResponseEntity<?> response = employeeController.updateAppointmentStatus(appointmentId, "CONFIRMED");
        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponseDTO body = (MessageResponseDTO) response.getBody();
        assertNotNull(body);
        assertEquals("Unable to retrieve appointment in order to update status.", body.getMessage());
        assertFalse(body.isSuccess());
    }

    @Test
    void updateAppointmentStatus_invalidStatus() {
        doThrow(new RuntimeException("INVALID_STATUS")).when(employeeService).updateAppointmentStatus(appointmentId, "INVALID");
        ResponseEntity<?> response = employeeController.updateAppointmentStatus(appointmentId, "INVALID");
        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponseDTO body = (MessageResponseDTO) response.getBody();
        assertNotNull(body);
        assertEquals("Invalid appointment status.", body.getMessage());
        assertFalse(body.isSuccess());
    }

    @Test
    void updateAppointmentStatus_otherError() {
        doThrow(new RuntimeException("SOME_ERROR")).when(employeeService).updateAppointmentStatus(appointmentId, "CONFIRMED");
        ResponseEntity<?> response = employeeController.updateAppointmentStatus(appointmentId, "CONFIRMED");
        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponseDTO body = (MessageResponseDTO) response.getBody();
        assertNotNull(body);
        assertEquals("SOME_ERROR", body.getMessage());
        assertFalse(body.isSuccess());
    }

    @Test
    void addTimeLog_success() {
        TimeLogRequestDto dto = new TimeLogRequestDto();
        dto.setEmployeeId(employeeId);
        dto.setStartTime(LocalDateTime.now());
        dto.setEndTime(LocalDateTime.now().plusHours(1));
        dto.setNotes("Notes");
        doNothing().when(employeeService).addTimeLog(appointmentId, dto);
        ResponseEntity<?> response = employeeController.addTimeLog(appointmentId, dto);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    void addTimeLog_appointmentNotFound() {
        TimeLogRequestDto dto = new TimeLogRequestDto();
        dto.setEmployeeId(employeeId);
        dto.setStartTime(LocalDateTime.now());
        dto.setEndTime(LocalDateTime.now().plusHours(1));
        dto.setNotes("Notes");
        doThrow(new RuntimeException("APPOINTMENT_NOT_FOUND")).when(employeeService).addTimeLog(appointmentId, dto);
        ResponseEntity<?> response = employeeController.addTimeLog(appointmentId, dto);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponseDTO body = (MessageResponseDTO) response.getBody();
        assertNotNull(body);
        assertEquals("Invalid appointment id.", body.getMessage());
        assertFalse(body.isSuccess());
    }

    @Test
    void addTimeLog_employeeNotFound() {
        TimeLogRequestDto dto = new TimeLogRequestDto();
        dto.setEmployeeId(employeeId);
        dto.setStartTime(LocalDateTime.now());
        dto.setEndTime(LocalDateTime.now().plusHours(1));
        dto.setNotes("Notes");
        doThrow(new RuntimeException("EMPLOYEE_NOT_FOUND")).when(employeeService).addTimeLog(appointmentId, dto);
        ResponseEntity<?> response = employeeController.addTimeLog(appointmentId, dto);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponseDTO body = (MessageResponseDTO) response.getBody();
        assertNotNull(body);
        assertEquals("Invalid employee id.", body.getMessage());
        assertFalse(body.isSuccess());
    }

    @Test
    void addTimeLog_otherError() {
        TimeLogRequestDto dto = new TimeLogRequestDto();
        dto.setEmployeeId(employeeId);
        dto.setStartTime(LocalDateTime.now());
        dto.setEndTime(LocalDateTime.now().plusHours(1));
        dto.setNotes("Notes");
        doThrow(new RuntimeException("SOME_ERROR")).when(employeeService).addTimeLog(appointmentId, dto);
        ResponseEntity<?> response = employeeController.addTimeLog(appointmentId, dto);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponseDTO body = (MessageResponseDTO) response.getBody();
        assertNotNull(body);
        assertEquals("SOME_ERROR", body.getMessage());
        assertFalse(body.isSuccess());
    }
}
