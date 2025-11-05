package com.ead.backend.dto;

import com.ead.backend.entity.AppointmentType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.HashSet;

@Data
public class SlotAppointmentDTO {
    private UUID id;
    private UUID userId;
    private UUID vehicleId;
    private AppointmentType appointmentType;
    private UUID serviceOrModificationId;
    private UUID serviceCenterId;
    private Integer slotNumber;
    private LocalDateTime appointmentDate;
    private String status;
    private String description;
    private Set<UUID> assignedEmployeeIds = new HashSet<>();

    public UUID getServiceCenterId() {
        return serviceCenterId;
    }

    public void setServiceCenterId(UUID serviceCenterId) {
        this.serviceCenterId = serviceCenterId;
    }

    public Integer getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(Integer slotNumber) {
        this.slotNumber = slotNumber;
    }
}