package com.ead.backend.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class MessageResponseDTO {
    private String message;
    private boolean success;

    public MessageResponseDTO(String message) {
        this.message = message;
        this.success = true;
    }
}
