package com.ead.backend.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ead.backend.dto.AppointmentDTO;
import com.ead.backend.dto.TimeLogRequestDto;
import com.ead.backend.dto.TimeLogResponseDTO;
import com.ead.backend.entity.Appointment;
import com.ead.backend.entity.ServiceOrModification;
import com.ead.backend.entity.TimeLog;
import com.ead.backend.entity.User;
import com.ead.backend.entity.Vehicle;
import com.ead.backend.enums.AppointmentType;
import com.ead.backend.repository.AppointmentRepository;
import com.ead.backend.repository.TimeLogRepository;
import com.ead.backend.repository.UserRepository;
import com.ead.backend.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {
    @Mock
    private TimeLogRepository timeLogRepository;
    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private VehicleRepository vehicleRepository;
    @InjectMocks
    private EmployeeService employeeService;

    private UUID appointmentId;
    private UUID employeeId;
    private String employeeEmail;
    private Appointment appointment;
    private User employee;
    private Vehicle vehicle;
    private ServiceOrModification serviceOrModification;

    @BeforeEach
    void setUp() {
        appointmentId = UUID.randomUUID();
        employeeId = UUID.randomUUID();
        employeeEmail = "employee@test.com";
        employee = new User();
        employee.setId(employeeId);
        employee.setEmail(employeeEmail);
        employee.setFullName("John Doe");
        employee.setPhoneNumber("1234567890");
        vehicle = new Vehicle();
        vehicle.setBrand("Toyota");
        vehicle.setModel("Corolla");
        vehicle.setColor("Red");
        vehicle.setLastServiceDate(LocalDateTime.now().minusDays(30));
        vehicle.setLicensePlate("ABC-123");
        serviceOrModification = new ServiceOrModification();
        serviceOrModification.setName("Oil Change");
        serviceOrModification.setDescription("Change engine oil");
        serviceOrModification.setEstimatedTimeMinutes(60);
        serviceOrModification.setType(AppointmentType.SERVICE);
        appointment = new Appointment();
        appointment.setUser(employee);
        appointment.setVehicle(vehicle);
        appointment.setAppointmentType(AppointmentType.SERVICE);
        appointment.setServiceOrModification(serviceOrModification);
        appointment.setAppointmentDate(LocalDateTime.now().plusDays(1));
        appointment.setStatus("CONFIRMED");
        appointment.setDescription("Service appointment");
    }

    @Test
    void testGetTimeLogsByAppointmentAndEmployee_ReturnsTimeLogs() {
        TimeLog timeLog = new TimeLog();
        timeLog.setId(1L); 
        timeLog.setStartTime(LocalDateTime.now().minusHours(2));
        timeLog.setEndTime(LocalDateTime.now().minusHours(1));
        timeLog.setHoursLogged(1.0);
        timeLog.setNotes("Worked on engine");
        when(timeLogRepository.findByAppointmentIdAndUserId(appointmentId, employeeId)).thenReturn(List.of(timeLog));
        List<TimeLogResponseDTO> result = employeeService.getTimeLogsByAppointmentAndEmployee(appointmentId, employeeId);
        assertEquals(1, result.size());
        assertEquals(timeLog.getNotes(), result.get(0).getNotes());
    }

    @Test
    void testGetTimeLogsByAppointmentAndEmployee_ThrowsIfNotFound() {
        when(timeLogRepository.findByAppointmentIdAndUserId(appointmentId, employeeId)).thenReturn(Collections.emptyList());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> employeeService.getTimeLogsByAppointmentAndEmployee(appointmentId, employeeId));
        assertEquals("NOT_FOUND", ex.getMessage());
    }

    @Test
    void testGetAppointmentsByEmployee_ReturnsAppointments() {
        when(userRepository.findByEmail(employeeEmail)).thenReturn(Optional.of(employee));
        when(appointmentRepository.findByAssignedEmployees(anySet())).thenReturn(List.of(appointment));
        List<AppointmentDTO> result = employeeService.getAppointmentsByEmployee(employeeEmail);
        assertEquals(1, result.size());
        assertEquals(appointment.getUser().getFullName(), result.get(0).getUserFullName());
    }

    @Test
    void testGetAppointmentsByEmployee_EmployeeNotFound_ReturnsEmptyList() {
        when(userRepository.findByEmail(employeeEmail)).thenReturn(Optional.empty());
        List<AppointmentDTO> result = employeeService.getAppointmentsByEmployee(employeeEmail);
        assertEquals(0, result.size());
    }

    @Test
    void testUpdateAppointmentStatus_ToInProgress_SetsStartTime() {
        appointment.setStatus("CONFIRMED");
        appointment.setStartTime(null);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        employeeService.updateAppointmentStatus(appointmentId, "IN_PROGRESS");
        assertEquals("IN_PROGRESS", appointment.getStatus());
        assertNotNull(appointment.getStartTime());
        verify(appointmentRepository).save(appointment);
    }

    @Test
    void testUpdateAppointmentStatus_ToCompleted_SetsEndTimeAndVehicleLastServiceDate() {
        appointment.setStatus("IN_PROGRESS");
        appointment.setEndTime(null);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);
        employeeService.updateAppointmentStatus(appointmentId, "COMPLETED");
        assertEquals("COMPLETED", appointment.getStatus());
        assertNotNull(appointment.getEndTime());
        verify(vehicleRepository).save(vehicle);
        verify(appointmentRepository).save(appointment);
    }

    @Test
    void testUpdateAppointmentStatus_ToConfirmed_ResetsTimes() {
        appointment.setStatus("IN_PROGRESS");
        appointment.setStartTime(LocalDateTime.now());
        appointment.setEndTime(LocalDateTime.now());
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        employeeService.updateAppointmentStatus(appointmentId, "CONFIRMED");
        assertNull(appointment.getStartTime());
        assertNull(appointment.getEndTime());
        assertEquals("CONFIRMED", appointment.getStatus());
        verify(appointmentRepository).save(appointment);
    }

    @Test
    void testUpdateAppointmentStatus_InvalidStatus_Throws() {
        RuntimeException ex = assertThrows(RuntimeException.class, () -> employeeService.updateAppointmentStatus(appointmentId, "INVALID"));
        assertEquals("INVALID_STATUS", ex.getMessage());
        verify(appointmentRepository, never()).findById(any());
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void testUpdateAppointmentStatus_SameStatus_NoUpdate() {
        appointment.setStatus("CONFIRMED");
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        employeeService.updateAppointmentStatus(appointmentId, "CONFIRMED");
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void testAddTimeLog_Success() {
        TimeLogRequestDto dto = new TimeLogRequestDto();
        dto.setEmployeeId(employeeId);
        LocalDateTime start = LocalDateTime.now().minusHours(2);
        LocalDateTime end = LocalDateTime.now().minusHours(1);
        dto.setStartTime(start);
        dto.setEndTime(end);
        dto.setNotes("Worked on brakes");
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(userRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        employeeService.addTimeLog(appointmentId, dto);
        verify(timeLogRepository).save(any(TimeLog.class));
    }

    @Test
    void testAddTimeLog_AppointmentNotFound_Throws() {
        TimeLogRequestDto dto = new TimeLogRequestDto();
        dto.setEmployeeId(employeeId);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> employeeService.addTimeLog(appointmentId, dto));
        assertEquals("APPOINTMENT_NOT_FOUND", ex.getMessage());
    }

    @Test
    void testAddTimeLog_EmployeeNotFound_Throws() {
        TimeLogRequestDto dto = new TimeLogRequestDto();
        dto.setEmployeeId(employeeId);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(userRepository.findById(employeeId)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> employeeService.addTimeLog(appointmentId, dto));
        assertEquals("EMPLOYEE_NOT_FOUND", ex.getMessage());
    }
}
