package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyResetTokenResponseDTO {

    private boolean valid;
    private String email;
    private String message;

    public VerifyResetTokenResponseDTO(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }
}

