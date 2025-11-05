package com.ead.backend.controller;

import com.ead.backend.dto.DetailedAppointmentDTO;
import com.ead.backend.service.CustomerAppointmentService;
import com.ead.backend.entity.Appointment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/appointments")
@CrossOrigin(origins = "*")
public class CustomerAppointmentController {

    @Autowired
    private CustomerAppointmentService customerAppointmentService;

    // ──────────────────────────────────────────────────────
    //  GET /appointments/my-detailed-appointments
    // ──────────────────────────────────────────────────────
    @GetMapping("/my-detailed-appointments")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<DetailedAppointmentDTO>> getMyDetailedAppointments() {

        List<DetailedAppointmentDTO> dtos = customerAppointmentService
                .getCurrentUserDetailedAppointments()
                .stream()
                .map(this::toDetailedDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // ──────────────────────────────────────────────────────
    //  Helper – Appointment → Detailed DTO
    // ──────────────────────────────────────────────────────
    private DetailedAppointmentDTO toDetailedDTO(Appointment a) {
        DetailedAppointmentDTO dto = new DetailedAppointmentDTO();

        dto.setId(a.getId());
        dto.setVehicleId(a.getVehicle().getId());
        dto.setVehicleName(a.getVehicle().getBrand() + " " + a.getVehicle().getModel());
        dto.setLicensePlate(a.getVehicle().getLicensePlate());

        dto.setService(a.getServiceOrModification().getName());
        dto.setType(a.getAppointmentType());
        dto.setDate(a.getAppointmentDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        dto.setStatus(a.getStatus());

        // canStart – same logic you already use for the summary endpoint
        dto.setCanStart("CONFIRMED".equals(a.getStatus()) && !a.getAssignedEmployees().isEmpty());

        dto.setServiceCenter(a.getServiceCenter().getName());

        // First assigned employee (or "Not Assigned")
        String employee = a.getAssignedEmployees().stream()
                .map(e -> e.getFullName())
                .findFirst()
                .orElse("Not Assigned");
        dto.setAssignedEmployee(employee);

        // Estimated completion = appointment date + service duration (hours)
        Integer durationHours = a.getServiceOrModification().getEstimatedTimeMinutes();
        String est = (durationHours != null)
                ? a.getAppointmentDate()
                        .plusHours(durationHours)
                        .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : "TBD";
        dto.setEstimatedCompletion(est);

        return dto;
    }
}