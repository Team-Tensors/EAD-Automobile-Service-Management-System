package com.ead.backend.mappers;

import com.ead.backend.dto.ShiftScheduleAppointmentsDTO;

import com.ead.backend.entity.Appointment;

public class ShiftScheduleMapper {
    public static ShiftScheduleAppointmentsDTO toDTO(Appointment appointment) {
        ShiftScheduleAppointmentsDTO dto = new ShiftScheduleAppointmentsDTO();
        dto.setAppointmentId(appointment.getId().toString());
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
    }
}
