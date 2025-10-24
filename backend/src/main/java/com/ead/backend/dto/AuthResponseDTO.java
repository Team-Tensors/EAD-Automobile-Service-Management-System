package com.ead.backend.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import java.util.Set;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String refreshToken; // Added refresh token
    private String type = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    private Set<String> roles;

    public AuthResponseDTO(String token, String refreshToken, Long id, String email, String fullName, Set<String> roles) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
    }

    // Constructor without refresh token (for backward compatibility)
    public AuthResponseDTO(String token, Long id, String email, String fullName, Set<String> roles) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
    }
}
