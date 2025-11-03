package com.ead.backend.service;

import com.ead.backend.dto.EmployeeOptionDTO;
import com.ead.backend.dto.ShiftScheduleAppointmentsDTO;
import com.ead.backend.entity.Appointment;
import com.ead.backend.entity.ShiftSchedules;
import com.ead.backend.mappers.ShiftScheduleMapper;
import com.ead.backend.repository.AppointmentRepository;
import com.ead.backend.repository.ShiftSchedulesRepository;
import com.ead.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShiftScheduleService {
    private final AppointmentRepository appointmentRepository;
    private final ShiftSchedulesRepository shiftSchedulesRepository;
    private final UserRepository userRepository;

    public ShiftScheduleService(AppointmentRepository appointmentRepository, ShiftSchedulesRepository shiftSchedulesRepository, UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.shiftSchedulesRepository = shiftSchedulesRepository;
        this.userRepository = userRepository;
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

    public List<EmployeeOptionDTO> getPossibleEmployeesForAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("APPOINTMENT_NOT_FOUND"));

        LocalDateTime startTime = appointment.getAppointmentDate();
        int estimatedDurationMinutes = appointment.getServiceOrModification().getEstimatedTimeMinutes();
        LocalDateTime endTime = startTime.plusMinutes(estimatedDurationMinutes);

        return userRepository.findAll().stream()
                .filter(user -> user.getRoles() != null && user.getRoles().stream().anyMatch(r -> "EMPLOYEE".equals(r.getName())))
                .filter(user -> Boolean.TRUE.equals(user.getActive()))
                .filter(user -> appointment.getAssignedEmployees().stream().noneMatch(ae -> ae.getId().equals(user.getId())))
                .filter(user -> shiftSchedulesRepository.findConflictingShifts(user.getEmail(), startTime, endTime).isEmpty())
                .map(u -> new EmployeeOptionDTO(u.getId(), u.getEmail(), u.getFullName(), u.getPhoneNumber()))
                .collect(Collectors.toList());
    }
}
