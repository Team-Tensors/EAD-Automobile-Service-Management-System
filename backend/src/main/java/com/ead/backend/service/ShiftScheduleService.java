package com.ead.backend.service;

import com.ead.backend.dto.ShiftScheduleAppointmentsDTO;
import com.ead.backend.entity.Appointment;
import com.ead.backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class ShiftScheduleService {
    private final AppointmentRepository appointmentRepository;

    public ShiftScheduleService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public List<ShiftScheduleAppointmentsDTO> getPendingAppointments() {

        List<Appointment> pendingAppointment = appointmentRepository.findByStatus("PENDING");

        return pendingAppointment.stream().map(appointment -> {
            ShiftScheduleAppointmentsDTO dto = new ShiftScheduleAppointmentsDTO();
            dto.setUserName(appointment.getUser().getFullName());
            dto.setVehicle(appointment.getVehicle().getLicensePlate());
            dto.setAppointmentType(appointment.getAppointmentType().name());
            dto.setServiceOrModification(appointment.getServiceOrModification().getName());
            dto.setServiceCenter(appointment.getServiceCenter().getName());
            dto.setAppointmentDate(appointment.getAppointmentDate());
            dto.setStartTime(appointment.getStartTime());
            dto.setEndTime(appointment.getEndTime());
            dto.setStatus(appointment.getStatus());
            dto.setDescription(appointment.getDescription());
            return dto;
        }).toList();
    }

    private boolean canEmployeeTakeAppointment(Long employeeId, Appointment appointment) {
        LocalDateTime endTime = calculateEndTime(appointment);

        // Check shift
        boolean hasShift = appointmentRepository.findActiveShift(
                employeeId,
                appointment.getAppointmentDate(),
                appointment.getStartTime()
        ).isPresent();

        if (!hasShift) return false;

        // Check conflicts
        boolean hasConflict = assignmentRepository.existsConflictingAssignment(
                employeeId,
                appointment.getAppointmentDate(),
                appointment.getStartTime(),
                endTime
        );

        if (hasConflict) return false;

        // Check skills
        return employeeSkillRepository.hasAllRequiredSkillsForService(
                employeeId,
                appointment.getServiceId()
        );
    }

    private LocalDateTime calculateEndTime(Appointment appointment) {

        int estimatedDurationOfAppointmentMinutes = appointment.getServiceOrModification().getEstimatedTimeMinutes();
        return appointment.getStartTime().plusMinutes(estimatedDurationOfAppointmentMinutes);
    }

}
