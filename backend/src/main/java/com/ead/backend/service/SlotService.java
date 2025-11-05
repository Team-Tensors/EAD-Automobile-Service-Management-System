package com.ead.backend.service;

import com.ead.backend.entity.Appointment;
import com.ead.backend.entity.ServiceCenterSlot;
import com.ead.backend.repository.ServiceCenterSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SlotService {

    @Autowired
    private ServiceCenterSlotRepository slotRepository;

    @Transactional
    public void assignSlot(Appointment appointment) {
        List<ServiceCenterSlot> availableSlots = slotRepository.findAvailableSlotsByServiceCenterId(
                appointment.getServiceCenter().getId());
        if (availableSlots.isEmpty()) {
            throw new IllegalStateException("No available slots for service center at " + appointment.getAppointmentDate());
        }
        ServiceCenterSlot slot = availableSlots.get(0);
        slot.setIsBooked(true);
        slot.setAppointmentId(appointment.getId());
        slotRepository.save(slot);
    }

    public Integer getSlotNumber(UUID appointmentId) {
        Integer slotNumber = slotRepository.findSlotNumberByAppointmentId(appointmentId);
        if (slotNumber == null) {
            throw new IllegalStateException("No slot assigned for appointment " + appointmentId);
        }
        return slotNumber;
    }

    @Transactional
    public void clearSlot(UUID appointmentId) {
        slotRepository.clearSlotByAppointmentId(appointmentId);
    }
}