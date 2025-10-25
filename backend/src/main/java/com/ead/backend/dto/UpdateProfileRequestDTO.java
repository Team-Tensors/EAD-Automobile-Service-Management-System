package com.ead.backend.dto;

import lombok.Data;

@Data
public class UpdateProfileRequestDTO {
    private String phoneNumber;
    private String address;
    private String role; // "CUSTOMER", "EMPLOYEE"
    private String fullName;
}
