package com.ead.backend.dto;

import com.ead.backend.entity.AppointmentType;

public class DetailedAppointmentDTO {
    private java.util.UUID id;
    private java.util.UUID vehicleId;
    private String vehicleName;
    private String licensePlate;
    private String service;
    private AppointmentType type;
    private String date; // ISO: "2025-11-05T14:00:00"
    private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED
    private boolean canStart;
    private String serviceCenter;
    private String assignedEmployee;
    private String estimatedCompletion;
    private String centerSlot;

    // Getters and Setters
    public java.util.UUID getId() { return id; }
    public void setId(java.util.UUID id) { this.id = id; }

    public java.util.UUID getVehicleId() { return vehicleId; }
    public void setVehicleId(java.util.UUID vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public AppointmentType getType() { return type; }
    public void setType(AppointmentType type) { this.type = type; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isCanStart() { return canStart; }
    public void setCanStart(boolean canStart) { this.canStart = canStart; }

    public String getServiceCenter() { return serviceCenter; }
    public void setServiceCenter(String serviceCenter) { this.serviceCenter = serviceCenter; }

    public String getAssignedEmployee() { return assignedEmployee; }
    public void setAssignedEmployee(String assignedEmployee) { this.assignedEmployee = assignedEmployee; }

    public String getEstimatedCompletion() { return estimatedCompletion; }
    public void setEstimatedCompletion(String estimatedCompletion) { this.estimatedCompletion = estimatedCompletion; }

    public String getCenterSlot() { return centerSlot; }
    public void setCenterSlot(String centerSlot) { this.centerSlot = centerSlot; }
}