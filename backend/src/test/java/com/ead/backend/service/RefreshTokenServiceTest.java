package com.ead.backend.service;

import com.ead.backend.entity.RefreshToken;
import com.ead.backend.entity.Role;
import com.ead.backend.entity.User;
import com.ead.backend.repository.RefreshTokenRepository;
import com.ead.backend.repository.UserRepository;
import com.ead.backend.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Refresh Token Service Unit Tests")
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Set refresh token expiration using reflection (e.g., 7 days)
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenExpiration", 604800000L);

        // Set max tokens per user
        ReflectionTestUtils.setField(refreshTokenService, "maxTokensPerUser", 5);

        // Setup test data
        Role customerRole = new Role();
        customerRole.setId(1L);
        customerRole.setName("CUSTOMER");

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        testUser.setPhoneNumber("1234567890");
        testUser.setActive(true);
        testUser.setRoles(Set.of(customerRole));
    }

    @Test
    @DisplayName("Should successfully create refresh token")
    void testCreateRefreshToken_Success() {
        // Arrange
        String deviceInfo = "Chrome on Windows";

        // Mock the repository calls for cleaning up and limiting tokens
        when(refreshTokenRepository.findByUserAndRevokedFalse(testUser)).thenReturn(Collections.emptyList());

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> {
            RefreshToken token = invocation.getArgument(0);
            token.setId(UUID.randomUUID().toString());
            return token;
        });

        // Act
        RefreshToken result = refreshTokenService.createRefreshToken(testUser, deviceInfo);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getToken());
        assertEquals(testUser, result.getUser());
        assertEquals(deviceInfo, result.getDeviceInfo());
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getExpiryDate());
        assertTrue(result.getExpiryDate().isAfter(Instant.now()));

        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Should verify valid refresh token")
    void testVerifyRefreshToken_Valid() {
        // Arrange
        String tokenString = "valid-token-string";
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(tokenString);
        refreshToken.setUser(testUser);
        refreshToken.setExpiryDate(Instant.now().plusSeconds(7 * 24 * 60 * 60));
        refreshToken.setRevoked(false);

        when(refreshTokenRepository.findByTokenAndRevokedFalse(tokenString)).thenReturn(Optional.of(refreshToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Optional<RefreshToken> result = refreshTokenService.verifyRefreshToken(tokenString);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(tokenString, result.get().getToken());
        assertNotNull(result.get().getLastUsedAt());

        verify(refreshTokenRepository).findByTokenAndRevokedFalse(tokenString);
        verify(refreshTokenRepository).save(refreshToken);
    }

    @Test
    @DisplayName("Should return empty for expired refresh token")
    void testVerifyRefreshToken_Expired() {
        // Arrange
        String tokenString = "expired-token-string";
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(tokenString);
        refreshToken.setUser(testUser);
        refreshToken.setExpiryDate(Instant.now().minusSeconds(1)); // Expired
        refreshToken.setRevoked(false);

        when(refreshTokenRepository.findByTokenAndRevokedFalse(tokenString)).thenReturn(Optional.of(refreshToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Optional<RefreshToken> result = refreshTokenService.verifyRefreshToken(tokenString);

        // Assert
        assertFalse(result.isPresent());
        verify(refreshTokenRepository).findByTokenAndRevokedFalse(tokenString);
        verify(refreshTokenRepository).save(refreshToken);
    }

    @Test
    @DisplayName("Should return empty for non-existent refresh token")
    void testVerifyRefreshToken_NotFound() {
        // Arrange
        String tokenString = "non-existent-token";
        when(refreshTokenRepository.findByTokenAndRevokedFalse(tokenString)).thenReturn(Optional.empty());

        // Act
        Optional<RefreshToken> result = refreshTokenService.verifyRefreshToken(tokenString);

        // Assert
        assertFalse(result.isPresent());
        verify(refreshTokenRepository).findByTokenAndRevokedFalse(tokenString);
    }

    @Test
    @DisplayName("Should successfully revoke refresh token")
    void testRevokeRefreshToken_Success() {
        // Arrange
        String tokenString = "token-to-revoke";
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(tokenString);
        refreshToken.setUser(testUser);
        refreshToken.setRevoked(false);

        when(refreshTokenRepository.findByToken(tokenString)).thenReturn(Optional.of(refreshToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        refreshTokenService.revokeRefreshToken(tokenString);

        // Assert
        verify(refreshTokenRepository).findByToken(tokenString);
        verify(refreshTokenRepository).save(refreshToken);
        assertTrue(refreshToken.isRevoked());
    }

    @Test
    @DisplayName("Should handle revocation of non-existent token gracefully")
    void testRevokeRefreshToken_NotFound() {
        // Arrange
        String tokenString = "non-existent-token";
        when(refreshTokenRepository.findByToken(tokenString)).thenReturn(Optional.empty());

        // Act & Assert - Should not throw exception
        assertDoesNotThrow(() -> refreshTokenService.revokeRefreshToken(tokenString));

        verify(refreshTokenRepository).findByToken(tokenString);
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should successfully revoke all refresh tokens for user")
    void testRevokeAllUserTokens_Success() {
        // Arrange
        doNothing().when(refreshTokenRepository).revokeAllUserTokens(testUser);

        // Act
        refreshTokenService.revokeAllUserTokens(testUser);

        // Assert
        verify(refreshTokenRepository).revokeAllUserTokens(testUser);
    }

    @Test
    @DisplayName("Should rotate refresh token successfully")
    void testRotateRefreshToken_Success() {
        // Arrange
        String oldTokenString = "old-token";
        String deviceInfo = "Firefox on Mac";

        RefreshToken oldToken = new RefreshToken();
        oldToken.setToken(oldTokenString);
        oldToken.setUser(testUser);
        oldToken.setExpiryDate(Instant.now().plusSeconds(7 * 24 * 60 * 60));
        oldToken.setRevoked(false);
        oldToken.setDeviceInfo(deviceInfo);

        when(refreshTokenRepository.findByTokenAndRevokedFalse(oldTokenString)).thenReturn(Optional.of(oldToken));
        when(refreshTokenRepository.findByUserAndRevokedFalse(testUser)).thenReturn(Collections.emptyList());
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> {
            RefreshToken token = invocation.getArgument(0);
            if (token.getId() == null) {
                token.setId(UUID.randomUUID().toString());
            }
            return token;
        });

        // Act
        RefreshToken newToken = refreshTokenService.rotateRefreshToken(oldTokenString, deviceInfo);

        // Assert
        assertNotNull(newToken);
        assertNotEquals(oldTokenString, newToken.getToken());
        assertEquals(testUser, newToken.getUser());
        assertEquals(deviceInfo, newToken.getDeviceInfo());

        verify(refreshTokenRepository).findByTokenAndRevokedFalse(oldTokenString);
        verify(refreshTokenRepository, atLeastOnce()).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Should fail to rotate expired token")
    void testRotateRefreshToken_ExpiredToken() {
        // Arrange
        String oldTokenString = "expired-token";
        String deviceInfo = "Safari on iOS";

        RefreshToken expiredToken = new RefreshToken();
        expiredToken.setToken(oldTokenString);
        expiredToken.setUser(testUser);
        expiredToken.setExpiryDate(Instant.now().minusSeconds(1));
        expiredToken.setRevoked(false);

        when(refreshTokenRepository.findByTokenAndRevokedFalse(oldTokenString)).thenReturn(Optional.of(expiredToken));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            refreshTokenService.rotateRefreshToken(oldTokenString, deviceInfo)
        );

        assertTrue(exception.getMessage().contains("Invalid"));
        verify(refreshTokenRepository).findByTokenAndRevokedFalse(oldTokenString);
    }

    @Test
    @DisplayName("Should generate unique token strings")
    void testGenerateUniqueTokenStrings() {
        // Arrange
        when(refreshTokenRepository.findByUserAndRevokedFalse(testUser)).thenReturn(Collections.emptyList());

        // Act
        Set<String> tokens = new HashSet<>();
        for (int i = 0; i < 100; i++) {
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> {
                RefreshToken token = invocation.getArgument(0);
                token.setId(UUID.randomUUID().toString());
                return token;
            });

            RefreshToken token = refreshTokenService.createRefreshToken(testUser, "device");
            tokens.add(token.getToken());
        }

        // Assert - All tokens should be unique
        assertEquals(100, tokens.size());
    }
}
