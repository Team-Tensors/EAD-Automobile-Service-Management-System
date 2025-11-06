package com.ead.backend.service;

import com.ead.backend.entity.PasswordResetToken;
import com.ead.backend.entity.Role;
import com.ead.backend.entity.User;
import com.ead.backend.repository.PasswordResetTokenRepository;
import com.ead.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Password Reset Service Unit Tests")
class PasswordResetServiceTest {

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Setup test data
        Role customerRole = new Role();
        customerRole.setId(1L);
        customerRole.setName("CUSTOMER");

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setPassword("$2a$10$hashedPassword");
        testUser.setFullName("Test User");
        testUser.setPhoneNumber("1234567890");
        testUser.setActive(true);
        testUser.setRoles(Set.of(customerRole));
    }

    @Test
    @DisplayName("Should successfully initiate password reset")
    void testInitiatePasswordReset_Success() {
        // Arrange
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class))).thenAnswer(invocation -> {
            PasswordResetToken token = invocation.getArgument(0);
            token.setId(1L);
            return token;
        });
        doNothing().when(emailService).sendPasswordResetEmail(anyString(), anyString(), anyString());

        // Act
        passwordResetService.initiatePasswordReset(testUser.getEmail());

        // Assert
        verify(userRepository).findByEmail(testUser.getEmail());
        verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendPasswordResetEmail(eq(testUser.getEmail()), anyString(), eq(testUser.getFullName()));
    }

    @Test
    @DisplayName("Should handle initiate password reset for non-existent user")
    void testInitiatePasswordReset_UserNotFound() {
        // Arrange
        String email = "nonexistent@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert - Should throw exception
        assertThrows(RuntimeException.class, () ->
            passwordResetService.initiatePasswordReset(email)
        );

        verify(userRepository).findByEmail(email);
        verify(passwordResetTokenRepository, never()).save(any());
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should successfully verify valid reset token")
    void testVerifyResetToken_Valid() {
        // Arrange
        String tokenString = "valid-token-123";
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(tokenString);
        resetToken.setUser(testUser);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        resetToken.setUsed(false);

        when(passwordResetTokenRepository.findByToken(tokenString)).thenReturn(Optional.of(resetToken));

        // Act
        PasswordResetToken result = passwordResetService.verifyResetToken(tokenString);

        // Assert
        assertNotNull(result);
        assertEquals(tokenString, result.getToken());
        assertEquals(testUser, result.getUser());
        assertFalse(result.getUsed());

        verify(passwordResetTokenRepository).findByToken(tokenString);
    }

    @Test
    @DisplayName("Should throw exception for expired reset token")
    void testVerifyResetToken_Expired() {
        // Arrange
        String tokenString = "expired-token";
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(tokenString);
        resetToken.setUser(testUser);
        resetToken.setExpiryDate(LocalDateTime.now().minusHours(1)); // Expired
        resetToken.setUsed(false);

        when(passwordResetTokenRepository.findByToken(tokenString)).thenReturn(Optional.of(resetToken));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            passwordResetService.verifyResetToken(tokenString)
        );

        assertTrue(exception.getMessage().contains("expired") || exception.getMessage().contains("Invalid"));
        verify(passwordResetTokenRepository).findByToken(tokenString);
    }

    @Test
    @DisplayName("Should throw exception for already used token")
    void testVerifyResetToken_AlreadyUsed() {
        // Arrange
        String tokenString = "used-token";
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(tokenString);
        resetToken.setUser(testUser);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        resetToken.setUsed(true);

        when(passwordResetTokenRepository.findByToken(tokenString)).thenReturn(Optional.of(resetToken));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            passwordResetService.verifyResetToken(tokenString)
        );

        assertTrue(exception.getMessage().contains("used") || exception.getMessage().contains("expired"));
        verify(passwordResetTokenRepository).findByToken(tokenString);
    }

    @Test
    @DisplayName("Should throw exception for non-existent token")
    void testVerifyResetToken_NotFound() {
        // Arrange
        String tokenString = "non-existent-token";
        when(passwordResetTokenRepository.findByToken(tokenString)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            passwordResetService.verifyResetToken(tokenString)
        );

        assertTrue(exception.getMessage().contains("Invalid") || exception.getMessage().contains("expired"));
        verify(passwordResetTokenRepository).findByToken(tokenString);
    }

    @Test
    @DisplayName("Should successfully reset password")
    void testResetPassword_Success() {
        // Arrange
        String tokenString = "valid-reset-token";
        String newPassword = "newSecurePassword123";
        String encodedPassword = "$2a$10$newEncodedPassword";

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(tokenString);
        resetToken.setUser(testUser);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        resetToken.setUsed(false);

        when(passwordResetTokenRepository.findByToken(tokenString)).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        passwordResetService.resetPassword(tokenString, newPassword);

        // Assert
        verify(passwordResetTokenRepository).findByToken(tokenString);
        verify(passwordEncoder).encode(newPassword);
        verify(userRepository).save(testUser);
        verify(passwordResetTokenRepository).save(resetToken);

        assertEquals(encodedPassword, testUser.getPassword());
    }

    @Test
    @DisplayName("Should fail to reset password with expired token")
    void testResetPassword_ExpiredToken() {
        // Arrange
        String tokenString = "expired-token";
        String newPassword = "newPassword123";

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(tokenString);
        resetToken.setUser(testUser);
        resetToken.setExpiryDate(LocalDateTime.now().minusHours(1));
        resetToken.setUsed(false);

        when(passwordResetTokenRepository.findByToken(tokenString)).thenReturn(Optional.of(resetToken));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            passwordResetService.resetPassword(tokenString, newPassword)
        );

        assertTrue(exception.getMessage().contains("expired") || exception.getMessage().contains("used"));
        verify(passwordResetTokenRepository).findByToken(tokenString);
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should fail to reset password with already used token")
    void testResetPassword_UsedToken() {
        // Arrange
        String tokenString = "used-token";
        String newPassword = "newPassword123";

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(tokenString);
        resetToken.setUser(testUser);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        resetToken.setUsed(true);

        when(passwordResetTokenRepository.findByToken(tokenString)).thenReturn(Optional.of(resetToken));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            passwordResetService.resetPassword(tokenString, newPassword)
        );

        assertTrue(exception.getMessage().contains("used") || exception.getMessage().contains("expired"));
        verify(passwordResetTokenRepository).findByToken(tokenString);
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
    }
}
