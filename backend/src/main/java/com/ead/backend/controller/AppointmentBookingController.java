package com.ead.backend.controller;

import com.ead.backend.dto.*;
import com.ead.backend.entity.*;
import com.ead.backend.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/appointments")
@CrossOrigin(origins = "*") // Configure properly in production
public class AppointmentBookingController {

    @Autowired
    private AppointmentService appointmentService;

    // ===================================================================
    // 1. BOOK APPOINTMENT (Customer only)
    // ===================================================================
    @PostMapping("/book")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> bookAppointment(
            @Valid @RequestBody AppointmentBookingRequestDTO request,
            Principal principal) {  // principal gives logged-in user

        try {
            // Map DTO → Entity
            Appointment appointment = new Appointment();
            
            // Set vehicle by ID (service will fetch it)
            Vehicle vehicle = new Vehicle();
            vehicle.setId(request.getVehicleId());
            appointment.setVehicle(vehicle);
            
            ServiceOrModification som = new ServiceOrModification();
            som.setId(request.getServiceOrModificationId());
            appointment.setServiceOrModification(som);
            
            ServiceCenter serviceCenter = new ServiceCenter();
            serviceCenter.setId(request.getServiceCenterId());
            appointment.setServiceCenter(serviceCenter);
            
            appointment.setAppointmentType(request.getAppointmentType());
            appointment.setAppointmentDate(request.getAppointmentDate());
            appointment.setDescription(request.getDescription());

            // Save via service
            Appointment saved = appointmentService.createAppointment(appointment);

            // Build response
            AppointmentBookingResponseDTO response = new AppointmentBookingResponseDTO();
            response.setId(saved.getId());
            response.setVehicleId(saved.getVehicle().getId());
            response.setVehicleInfo(saved.getVehicle().getBrand() + " " + saved.getVehicle().getModel() + " " + saved.getVehicle().getYear());
            response.setServiceName(saved.getServiceOrModification().getName());
            response.setAppointmentType(saved.getAppointmentType());
            response.setAppointmentDate(saved.getAppointmentDate());
            response.setStatus(saved.getStatus());
            response.setMessage("Appointment booked successfully! Awaiting confirmation.");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponseDTO(e.getMessage()));
        }
    }

    // ===================================================================
    // 2. GET MY APPOINTMENTS (Customer)
    // ===================================================================
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<AppointmentSummaryDTO>> getMyAppointments() {
        List<AppointmentSummaryDTO> appointments = appointmentService.getUserAppointments()
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(appointments);
    }

    // ===================================================================
    // Helper: Convert Appointment → Summary DTO
    // ===================================================================
    private AppointmentSummaryDTO toSummaryDTO(Appointment a) {
        AppointmentSummaryDTO dto = new AppointmentSummaryDTO();
        dto.setId(a.getId());
        dto.setVehicle(a.getVehicle().getBrand() + " " + a.getVehicle().getModel());
        dto.setService(a.getServiceOrModification().getName());
        dto.setType(a.getAppointmentType());
        dto.setDate(a.getAppointmentDate());
        dto.setStatus(a.getStatus());
        dto.setCanStart(a.getStatus().equals("CONFIRMED") && a.getAssignedEmployees().size() > 0);
        return dto;
    }
}