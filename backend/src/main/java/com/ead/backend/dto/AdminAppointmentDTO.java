package com.ead.backend.dto;

import com.ead.backend.enums.AppointmentType;

import java.time.LocalDateTime;
import java.util.UUID;

public class AdminAppointmentDTO {
    private UUID id;
    private UUID vehicleId;
    private String vehicleName;
    private String licensePlate;
    private String customerName;
    private String customerEmail;
    private String service;
    private AppointmentType type;
    private String date; // ISO string
    private String status;
    private String serviceCenter;
    private String assignedEmployees; // Comma-separated names
    private Integer assignedEmployeeCount;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getVehicleId() { return vehicleId; }
    public void setVehicleId(UUID vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public AppointmentType getType() { return type; }
    public void setType(AppointmentType type) { this.type = type; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getServiceCenter() { return serviceCenter; }
    public void setServiceCenter(String serviceCenter) { this.serviceCenter = serviceCenter; }

    public String getAssignedEmployees() { return assignedEmployees; }
    public void setAssignedEmployees(String assignedEmployees) { this.assignedEmployees = assignedEmployees; }

    public Integer getAssignedEmployeeCount() { return assignedEmployeeCount; }
    public void setAssignedEmployeeCount(Integer assignedEmployeeCount) { this.assignedEmployeeCount = assignedEmployeeCount; }
}
