package com.ead.backend.controller;

import com.ead.backend.dto.AdminAppointmentDTO;
import com.ead.backend.dto.AdminEmployeeCenterDTO;
import com.ead.backend.dto.EmployeeDTO;
import com.ead.backend.entity.Appointment;
import com.ead.backend.entity.ServiceCenter;
import com.ead.backend.entity.User;
import com.ead.backend.service.AdminService;
import com.ead.backend.service.AppointmentService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/appointments")
@AllArgsConstructor
public class AdminAppointmentController {

    @Autowired
    private AppointmentService appointmentService;
    private final AdminService adminService;

    // ===================================================================
    // 1. ADMIN: Get all upcoming appointments
    // ===================================================================
    @GetMapping("/upcoming")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminAppointmentDTO>> getUpcomingAppointments() {
        List<AdminAppointmentDTO> dtos = appointmentService.getAllUpcomingAppointments();
        return ResponseEntity.ok(dtos);
    }

    // ===================================================================
    // 2. ADMIN: Get all ongoing appointments
    // ===================================================================
    @GetMapping("/ongoing")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminAppointmentDTO>> getOngoingAppointments() {
        List<AdminAppointmentDTO> dtos = appointmentService.getAllOngoingAppointments();
        return ResponseEntity.ok(dtos);
    }

    // ===================================================================
    // 3. ADMIN: Get all unassigned appointments
    // ===================================================================
    @GetMapping("/unassigned")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminAppointmentDTO>> getUnassignedAppointments() {
        List<AdminAppointmentDTO> dtos = appointmentService.getAllUnassignedAppointments();
        return ResponseEntity.ok(dtos);
    }

    // ===================================================================
    // 4. ADMIN: Assign employees to appointment
    // ===================================================================
    @PostMapping("/{appointmentId}/assign-employees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignEmployees(
            @PathVariable UUID appointmentId,
            @RequestBody Set<UUID> employeeIds) {
        try {
            Appointment updatedAppointment = appointmentService.assignEmployees(appointmentId, employeeIds);
            AdminAppointmentDTO dto = toAdminAppointmentDTO(updatedAppointment);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ===================================================================
    // 5. ADMIN: Get all employees (for dropdown)
    // ===================================================================
    @GetMapping("/employees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminEmployeeCenterDTO>> getAllEmployees() {
        List<AdminEmployeeCenterDTO> employees = adminService.getAllEmployeesWithServiceCenter();
        return ResponseEntity.ok(employees);
    }

    @PostMapping("/assign-employee")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignEmployeeToServiceCenter(
            @RequestParam UUID employeeId,
            @RequestParam UUID serviceCenterId) {
        try {
            adminService.assignEmployeeToServiceCenter(employeeId, serviceCenterId);
            return ResponseEntity.ok("Employee assigned to Service Center successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // ===================================================================
    // HELPER: Convert Appointment to AdminAppointmentDTO
    // ===================================================================
    private AdminAppointmentDTO toAdminAppointmentDTO(Appointment appointment) {
        AdminAppointmentDTO dto = new AdminAppointmentDTO();
        dto.setId(appointment.getId());
        dto.setVehicleId(appointment.getVehicle().getId());
        dto.setVehicleName(appointment.getVehicle().getBrand() + " " + appointment.getVehicle().getModel());
        dto.setLicensePlate(appointment.getVehicle().getLicensePlate());
        dto.setCustomerName(appointment.getUser().getFullName());
        dto.setCustomerEmail(appointment.getUser().getEmail());
        dto.setService(appointment.getServiceOrModification().getName());
        dto.setType(appointment.getAppointmentType());
        dto.setDate(appointment.getAppointmentDate().toString());
        dto.setStatus(appointment.getStatus());
        dto.setServiceCenter(appointment.getServiceCenter().getName());
        dto.setAssignedEmployees(appointment.getAssignedEmployees().stream()
                .map(User::getFullName)
                .collect(Collectors.joining(", ")));
        dto.setAssignedEmployeeCount(appointment.getAssignedEmployees().size());
        return dto;
    }
}
