package com.ead.backend.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class AdminEmployeeCenterDTO {
    private UUID employeeId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private UUID serviceCenterId;
    private String serviceCenterName;
}

