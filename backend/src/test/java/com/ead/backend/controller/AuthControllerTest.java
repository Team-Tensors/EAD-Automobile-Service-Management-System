package com.ead.backend.controller;

import com.ead.backend.dto.*;
import com.ead.backend.entity.User;
import com.ead.backend.entity.Role;
import com.ead.backend.entity.PasswordResetToken;
import com.ead.backend.service.AuthService;
import com.ead.backend.service.RefreshTokenService;
import com.ead.backend.service.PasswordResetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(MockitoExtension.class)
@DisplayName("Auth Controller Tests")
@SuppressWarnings("removal") // MockBean is deprecated in Spring Boot 3.4+ but no stable replacement yet
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    @SuppressWarnings("removal")
    private AuthService authService;

    @MockBean
    @SuppressWarnings("removal")
    private RefreshTokenService refreshTokenService;

    @MockBean
    @SuppressWarnings("removal")
    private PasswordResetService passwordResetService;

    private User testUser;
    private Role customerRole;

    @BeforeEach
    void setUp() {
        // Setup test data
        customerRole = new Role();
        customerRole.setId(1L);
        customerRole.setName("CUSTOMER");

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        testUser.setPhoneNumber("1234567890");
        testUser.setAddress("123 Test St");
        testUser.setActive(true);
        testUser.setRoles(Set.of(customerRole));
    }

    @Test
    @DisplayName("Should successfully login with valid credentials")
    void testLogin_Success() throws Exception {
        // Arrange
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        AuthResponseDTO authResponse = new AuthResponseDTO(
                "jwt-token",
                "refresh-token",
                testUser.getId(),
                testUser.getEmail(),
                testUser.getFullName(),
                Set.of("CUSTOMER")
        );

        when(authService.login(any(LoginRequestDTO.class), anyString())).thenReturn(authResponse);

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.roles[0]").value("CUSTOMER"));

        verify(authService, times(1)).login(any(LoginRequestDTO.class), anyString());
    }

    @Test
    @DisplayName("Should return 401 when email not found")
    void testLogin_EmailNotFound() throws Exception {
        // Arrange
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("notfound@example.com");
        loginRequest.setPassword("password123");

        when(authService.login(any(LoginRequestDTO.class), anyString()))
                .thenThrow(new RuntimeException("EMAIL_NOT_FOUND"));

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email not found"))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Should return 401 when password is invalid")
    void testLogin_InvalidPassword() throws Exception {
        // Arrange
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("wrongpassword");

        when(authService.login(any(LoginRequestDTO.class), anyString()))
                .thenThrow(new RuntimeException("INVALID_PASSWORD"));

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Password is incorrect"))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Should successfully register a new customer")
    void testRegister_Success() throws Exception {
        // Arrange
        SignupRequestDTO signupRequest = new SignupRequestDTO();
        signupRequest.setEmail("newuser@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setFullName("New User");
        signupRequest.setPhoneNumber("9876543210");
        signupRequest.setRole("CUSTOMER");

        MessageResponseDTO signupResponse = new MessageResponseDTO("User registered successfully", true);
        AuthResponseDTO authResponse = new AuthResponseDTO(
                "jwt-token",
                "refresh-token",
                UUID.randomUUID(),
                "newuser@example.com",
                "New User",
                Set.of("CUSTOMER")
        );

        when(authService.signup(any(SignupRequestDTO.class))).thenReturn(signupResponse);
        when(authService.login(any(LoginRequestDTO.class), anyString())).thenReturn(authResponse);

        // Act & Assert
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("newuser@example.com"));

        verify(authService, times(1)).signup(any(SignupRequestDTO.class));
        verify(authService, times(1)).login(any(LoginRequestDTO.class), anyString());
    }

    @Test
    @DisplayName("Should fail registration when email already exists")
    void testRegister_EmailAlreadyExists() throws Exception {
        // Arrange
        SignupRequestDTO signupRequest = new SignupRequestDTO();
        signupRequest.setEmail("existing@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setFullName("Existing User");
        signupRequest.setPhoneNumber("9876543210");
        signupRequest.setRole("CUSTOMER");

        MessageResponseDTO signupResponse = new MessageResponseDTO("Email already in use", false);

        when(authService.signup(any(SignupRequestDTO.class))).thenReturn(signupResponse);

        // Act & Assert
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already in use"))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Should successfully refresh token")
    void testRefreshToken_Success() throws Exception {
        // Arrange
        RefreshTokenRequestDTO refreshRequest = new RefreshTokenRequestDTO();
        refreshRequest.setRefreshToken("valid-refresh-token");

        AuthResponseDTO authResponse = new AuthResponseDTO(
                "new-jwt-token",
                "valid-refresh-token",
                testUser.getId(),
                testUser.getEmail(),
                testUser.getFullName(),
                Set.of("CUSTOMER")
        );

        when(authService.refreshToken(anyString())).thenReturn(authResponse);

        // Act & Assert
        mockMvc.perform(post("/auth/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("new-jwt-token"));

        verify(authService, times(1)).refreshToken(anyString());
    }

    @Test
    @DisplayName("Should fail refresh token with invalid token")
    void testRefreshToken_InvalidToken() throws Exception {
        // Arrange
        RefreshTokenRequestDTO refreshRequest = new RefreshTokenRequestDTO();
        refreshRequest.setRefreshToken("invalid-refresh-token");

        when(authService.refreshToken(anyString()))
                .thenThrow(new RuntimeException("Invalid refresh token"));

        // Act & Assert
        mockMvc.perform(post("/auth/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid or expired refresh token"));
    }

    @Test
    @DisplayName("Should successfully initiate forgot password")
    void testForgotPassword_Success() throws Exception {
        // Arrange
        ForgotPasswordRequestDTO forgotPasswordRequest = new ForgotPasswordRequestDTO();
        forgotPasswordRequest.setEmail("test@example.com");

        doNothing().when(passwordResetService).initiatePasswordReset(anyString());

        // Act & Assert
        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forgotPasswordRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If this email is registered, you will receive a password reset link shortly"));

        verify(passwordResetService, times(1)).initiatePasswordReset(anyString());
    }

    @Test
    @DisplayName("Should successfully reset password with valid token")
    void testResetPassword_Success() throws Exception {
        // Arrange
        ResetPasswordRequestDTO resetPasswordRequest = new ResetPasswordRequestDTO();
        resetPasswordRequest.setToken("valid-reset-token");
        resetPasswordRequest.setNewPassword("newPassword123");

        doNothing().when(passwordResetService).resetPassword(anyString(), anyString());

        // Act & Assert
        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password has been reset successfully. You can now login with your new password"));

        verify(passwordResetService, times(1)).resetPassword(anyString(), anyString());
    }

    @Test
    @DisplayName("Should fail reset password with invalid token")
    void testResetPassword_InvalidToken() throws Exception {
        // Arrange
        ResetPasswordRequestDTO resetPasswordRequest = new ResetPasswordRequestDTO();
        resetPasswordRequest.setToken("invalid-reset-token");
        resetPasswordRequest.setNewPassword("newPassword123");

        doThrow(new RuntimeException("Invalid or expired token"))
                .when(passwordResetService).resetPassword(anyString(), anyString());

        // Act & Assert
        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired token"));
    }

    @Test
    @DisplayName("Should verify valid reset token")
    void testVerifyResetToken_Valid() throws Exception {
        // Arrange
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken("valid-token");
        resetToken.setUser(testUser);

        when(passwordResetService.verifyResetToken(anyString())).thenReturn(resetToken);

        // Act & Assert
        mockMvc.perform(get("/auth/verify-reset-token/valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.email").value("test@example.com"));

        verify(passwordResetService, times(1)).verifyResetToken(anyString());
    }

    @Test
    @DisplayName("Should handle invalid reset token verification")
    void testVerifyResetToken_Invalid() throws Exception {
        // Arrange
        when(passwordResetService.verifyResetToken(anyString()))
                .thenThrow(new RuntimeException("Token expired"));

        // Act & Assert
        mockMvc.perform(get("/auth/verify-reset-token/invalid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.message").value("Token expired"));
    }
}

