package com.ead.backend.service;

import com.ead.backend.dto.ShiftScheduleAppointmentsDTO;
import com.ead.backend.entity.Appointment;
import com.ead.backend.entity.ShiftSchedules;
import com.ead.backend.mappers.ShiftScheduleMapper;
import com.ead.backend.repository.AppointmentRepository;
import com.ead.backend.repository.ShiftSchedulesRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class ShiftScheduleService {
    private final AppointmentRepository appointmentRepository;
    private final ShiftSchedulesRepository shiftSchedulesRepository;

    public ShiftScheduleService(AppointmentRepository appointmentRepository, ShiftSchedulesRepository shiftSchedulesRepository) {
        this.appointmentRepository = appointmentRepository;
        this.shiftSchedulesRepository = shiftSchedulesRepository;
    }

    public List<ShiftScheduleAppointmentsDTO> getPendingAppointments() {

        List<Appointment> pendingAppointment = appointmentRepository.findByStatus("PENDING");

        return pendingAppointment.stream().map(ShiftScheduleMapper::toDTO).toList();
    }

    public List<ShiftScheduleAppointmentsDTO> getAvailableAppointmentsForEmployee(String employeeEmail) {
        List<Appointment> pendingAppointments = appointmentRepository.findByStatus("PENDING");
        return pendingAppointments.stream()
                .filter(apt -> canEmployeeTakeAppointment(employeeEmail, apt))
                .map(ShiftScheduleMapper::toDTO)
                .toList();
    }


    private boolean canEmployeeTakeAppointment(String employeeEmail, Appointment appointment) {

        LocalDateTime startTime = appointment.getAppointmentDate();
        int estimatedDurationMinutes = appointment.getServiceOrModification().getEstimatedTimeMinutes();
        LocalDateTime endTime = startTime.plusMinutes(estimatedDurationMinutes);

        List<ShiftSchedules> conflicts = shiftSchedulesRepository.findConflictingShifts(employeeEmail, startTime, endTime);
        return conflicts.isEmpty();

    }
}
