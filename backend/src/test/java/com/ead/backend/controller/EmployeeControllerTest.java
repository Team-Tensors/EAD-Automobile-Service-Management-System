package com.ead.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.ead.backend.dto.AppointmentDTO;
import com.ead.backend.dto.MessageResponseDTO;
import com.ead.backend.dto.TimeLogRequestDto;
import com.ead.backend.dto.TimeLogResponseDTO;
import com.ead.backend.service.EmployeeService;

class EmployeeControllerTest {
    @Mock
    private EmployeeService employeeService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private EmployeeController employeeController;

    private UUID appointmentId;
    private UUID employeeId;
    private String employeeEmail;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        appointmentId = UUID.randomUUID();
        employeeId = UUID.randomUUID();
        employeeEmail = "employee@test.com";
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
                new AppointmentDTO(UUID.randomUUID(), "John Doe", "Toyota", "Corolla", "Red", LocalDateTime.now(), "ABC-123", "SERVICE", UUID.randomUUID(), "Oil Change", "Change engine oil", 60, LocalDateTime.now(), "CONFIRMED", "Routine service")
        );
        when(authentication.getName()).thenReturn(employeeEmail);
        when(employeeService.getAppointmentsByEmployee(employeeEmail)).thenReturn(appointments);
        ResponseEntity<?> response = employeeController.getAppointmentsByEmployee(authentication);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(appointments, response.getBody());
    }

    @Test
    void getAppointmentsByEmployee_invalidStatus() {
        when(authentication.getName()).thenReturn(employeeEmail);
        when(employeeService.getAppointmentsByEmployee(employeeEmail)).thenThrow(new RuntimeException("INVALID_STATUS"));
        ResponseEntity<?> response = employeeController.getAppointmentsByEmployee(authentication);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponseDTO body = (MessageResponseDTO) response.getBody();
        assertNotNull(body);
        assertEquals("Invalid appointment status.", body.getMessage());
        assertFalse(body.isSuccess());
    }

    @Test
    void getAppointmentsByEmployee_otherError() {
        when(authentication.getName()).thenReturn(employeeEmail);
        when(employeeService.getAppointmentsByEmployee(employeeEmail)).thenThrow(new RuntimeException("SOME_ERROR"));
        ResponseEntity<?> response = employeeController.getAppointmentsByEmployee(authentication);
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
