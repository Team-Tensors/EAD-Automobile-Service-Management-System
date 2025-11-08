package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class EmployeeDTO {
    private UUID id;
    private String email;
    private String fullName;
    private String phoneNumber;

    public EmployeeDTO() {

    }
}
