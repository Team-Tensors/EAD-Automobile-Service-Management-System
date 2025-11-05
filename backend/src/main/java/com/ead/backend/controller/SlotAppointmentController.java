package com.ead.backend.controller;

import com.ead.backend.dto.SlotAppointmentDTO;
import com.ead.backend.entity.*;
import com.ead.backend.repository.*;
import com.ead.backend.service.AppointmentService;
import com.ead.backend.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/slot-appointments")
public class SlotAppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private SlotService slotService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ServiceOrModificationRepository serviceOrModificationRepository;

    @Autowired
    private ServiceCenterRepository serviceCenterRepository;

    @PostMapping
    public ResponseEntity<SlotAppointmentDTO> createAppointment(@RequestBody SlotAppointmentDTO dto) {
        Appointment appointment = new Appointment();
        appointment.setUser(userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found")));
        appointment.setVehicle(vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found")));
        appointment.setAppointmentType(dto.getAppointmentType());
        appointment.setServiceOrModification(serviceOrModificationRepository.findById(dto.getServiceOrModificationId())
                .orElseThrow(() -> new IllegalArgumentException("Service or modification not found")));
        appointment.setServiceCenter(serviceCenterRepository.findById(dto.getServiceCenterId())
                .orElseThrow(() -> new IllegalArgumentException("Service center not found")));
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
        appointment.setDescription(dto.getDescription());
        if (dto.getAssignedEmployeeIds() != null && !dto.getAssignedEmployeeIds().isEmpty()) {
            appointment.setAssignedEmployees(userRepository.findAllById(dto.getAssignedEmployeeIds()).stream()
                    .collect(Collectors.toSet()));
        }

        Appointment savedAppointment = appointmentService.createAppointment(appointment);
        slotService.assignSlot(savedAppointment);

        SlotAppointmentDTO savedDto = new SlotAppointmentDTO();
        savedDto.setId(savedAppointment.getId());
        savedDto.setUserId(savedAppointment.getUser().getId());
        savedDto.setVehicleId(savedAppointment.getVehicle().getId());
        savedDto.setAppointmentType(savedAppointment.getAppointmentType());
        savedDto.setServiceOrModificationId(savedAppointment.getServiceOrModification().getId());
        savedDto.setServiceCenterId(savedAppointment.getServiceCenter().getId());
        savedDto.setSlotNumber(slotService.getSlotNumber(savedAppointment.getId()));
        savedDto.setAppointmentDate(savedAppointment.getAppointmentDate());
        savedDto.setStatus(savedAppointment.getStatus());
        savedDto.setDescription(savedAppointment.getDescription());
        savedDto.setAssignedEmployeeIds(savedAppointment.getAssignedEmployees().stream()
                .map(User::getId)
                .collect(Collectors.toSet()));

        return ResponseEntity.ok(savedDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SlotAppointmentDTO> getAppointment(@PathVariable UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        SlotAppointmentDTO dto = new SlotAppointmentDTO();
        dto.setId(appointment.getId());
        dto.setUserId(appointment.getUser().getId()); // Fixed: changed 'attachment' to 'appointment'
        dto.setVehicleId(appointment.getVehicle().getId());
        dto.setAppointmentType(appointment.getAppointmentType());
        dto.setServiceOrModificationId(appointment.getServiceOrModification().getId());
        dto.setServiceCenterId(appointment.getServiceCenter().getId());
        dto.setSlotNumber(slotService.getSlotNumber(id));
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setStatus(appointment.getStatus());
        dto.setDescription(appointment.getDescription());
        dto.setAssignedEmployeeIds(appointment.getAssignedEmployees().stream()
                .map(User::getId)
                .collect(Collectors.toSet()));
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<SlotAppointmentDTO> cancelAppointment(@PathVariable UUID id) {
        Appointment cancelledAppointment = appointmentService.cancelAppointment(id);
        slotService.clearSlot(id);

        SlotAppointmentDTO dto = new SlotAppointmentDTO();
        dto.setId(cancelledAppointment.getId());
        dto.setUserId(cancelledAppointment.getUser().getId());
        dto.setVehicleId(cancelledAppointment.getVehicle().getId());
        dto.setAppointmentType(cancelledAppointment.getAppointmentType());
        dto.setServiceOrModificationId(cancelledAppointment.getServiceOrModification().getId());
        dto.setServiceCenterId(cancelledAppointment.getServiceCenter().getId());
        dto.setSlotNumber(null); // Slot cleared
        dto.setAppointmentDate(cancelledAppointment.getAppointmentDate());
        dto.setStatus(cancelledAppointment.getStatus());
        dto.setDescription(cancelledAppointment.getDescription());
        dto.setAssignedEmployeeIds(cancelledAppointment.getAssignedEmployees().stream()
                .map(User::getId)
                .collect(Collectors.toSet()));
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<SlotAppointmentDTO>> getAppointmentsByUser(@RequestParam UUID userId) {
        List<Appointment> appointments = appointmentRepository.findByUserId(userId);
        List<SlotAppointmentDTO> dtos = appointments.stream().map(appointment -> {
            SlotAppointmentDTO dto = new SlotAppointmentDTO();
            dto.setId(appointment.getId());
            dto.setUserId(appointment.getUser().getId());
            dto.setVehicleId(appointment.getVehicle().getId());
            dto.setAppointmentType(appointment.getAppointmentType());
            dto.setServiceOrModificationId(appointment.getServiceOrModification().getId());
            dto.setServiceCenterId(appointment.getServiceCenter().getId());
            dto.setSlotNumber(slotService.getSlotNumber(appointment.getId()));
            dto.setAppointmentDate(appointment.getAppointmentDate());
            dto.setStatus(appointment.getStatus());
            dto.setDescription(appointment.getDescription());
            dto.setAssignedEmployeeIds(appointment.getAssignedEmployees().stream()
                    .map(User::getId)
                    .collect(Collectors.toSet()));
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}