package com.ead.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HealthResponseDTO {
    private String status;
    
    public void setStatus(String status) {
        this.status = status;
    }
}
