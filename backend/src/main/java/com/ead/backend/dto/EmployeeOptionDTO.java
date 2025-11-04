package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class EmployeeOptionDTO {
    private final UUID id;
    private final String email;
    private final String fullName;
    private final String phoneNumber;
}
