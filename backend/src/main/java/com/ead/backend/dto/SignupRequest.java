package com.ead.backend.dto;

public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private String role; // e.g., "USER", "ADMIN"

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }


    public String getPassword() {
        return password;
    }


    public String getRole() {
        return role;
    }
}
