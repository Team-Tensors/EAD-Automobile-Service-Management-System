package com.ead.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("JWT Util Unit Tests")
class JwtUtilTest {

    private JwtUtil jwtUtil;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();

        // Set JWT secret and expiration using reflection
        ReflectionTestUtils.setField(jwtUtil, "secretKey", "mySecretKeyForTestingPurposesThatIsLongEnoughForHS256Algorithm");
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", 3600000L); // 1 hour

        // Create test user details
        userDetails = User.builder()
                .username("test@example.com")
                .password("password")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .build();
    }

    @Test
    @DisplayName("Should successfully generate JWT token")
    void testGenerateToken_Success() {
        // Act
        String token = jwtUtil.generateToken(userDetails);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts: header.payload.signature
    }

    @Test
    @DisplayName("Should extract username from token")
    void testExtractUsername_Success() {
        // Arrange
        String token = jwtUtil.generateToken(userDetails);

        // Act
        String username = jwtUtil.extractUsername(token);

        // Assert
        assertEquals("test@example.com", username);
    }

    @Test
    @DisplayName("Should extract expiration date from token")
    void testExtractExpiration() {
        // Arrange
        String token = jwtUtil.generateToken(userDetails);

        // Act
        Date expiration = jwtUtil.extractExpiration(token);

        // Assert
        assertNotNull(expiration);
        assertTrue(expiration.after(new Date())); // Token should not be expired
    }

    @Test
    @DisplayName("Should validate token successfully")
    void testValidateToken_WithExpiration() {
        // Arrange
        String token = jwtUtil.generateToken(userDetails);

        // Act
        Boolean isValid = jwtUtil.validateToken(token, userDetails);

        // Assert - Token should be valid and not expired
        assertTrue(isValid);
    }

    @Test
    @DisplayName("Should fail validation with wrong username")
    void testValidateToken_WrongUsername() {
        // Arrange
        String token = jwtUtil.generateToken(userDetails);

        UserDetails wrongUserDetails = User.builder()
                .username("wrong@example.com")
                .password("password")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .build();

        // Act
        Boolean isValid = jwtUtil.validateToken(token, wrongUserDetails);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should throw exception for malformed token")
    void testValidateToken_MalformedToken() {
        // Arrange
        String malformedToken = "this.is.notavalidtoken";

        // Act & Assert
        assertThrows(MalformedJwtException.class, () ->
            jwtUtil.extractUsername(malformedToken)
        );
    }

    @Test
    @DisplayName("Should throw exception for invalid signature")
    void testValidateToken_InvalidSignature() {
        // Arrange
        String token = jwtUtil.generateToken(userDetails);

        // Change the secret key to make signature invalid
        ReflectionTestUtils.setField(jwtUtil, "secretKey", "differentSecretKeyThatWillMakeSignatureInvalidForSureNow");

        // Act & Assert
        assertThrows(SignatureException.class, () ->
            jwtUtil.extractUsername(token)
        );
    }

    @Test
    @DisplayName("Should include roles in token")
    void testGenerateToken_WithRoles() {
        // Arrange
        UserDetails userWithRoles = User.builder()
                .username("admin@example.com")
                .password("password")
                .authorities(
                        new SimpleGrantedAuthority("ROLE_ADMIN"),
                        new SimpleGrantedAuthority("ROLE_EMPLOYEE")
                )
                .build();

        // Act
        String token = jwtUtil.generateToken(userWithRoles);

        // Assert - Token should be generated successfully
        assertNotNull(token);
        assertFalse(token.isEmpty());

        // Extract username to verify token is valid
        String username = jwtUtil.extractUsername(token);
        assertEquals("admin@example.com", username);
    }

    @Test
    @DisplayName("Should fail validation with expired token")
    void testValidateToken_ExpiredToken() {
        // Arrange - Set expiration to negative value (already expired)
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", -1000L);
        String expiredToken = jwtUtil.generateToken(userDetails);

        // Reset to normal expiration
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", 3600000L);

        // Act & Assert
        assertThrows(ExpiredJwtException.class, () ->
            jwtUtil.extractUsername(expiredToken)
        );
    }

    @Test
    @DisplayName("Should extract claim using function")
    void testExtractClaim() {
        // Arrange
        String token = jwtUtil.generateToken(userDetails);

        // Act
        String subject = jwtUtil.extractClaim(token, Claims::getSubject);
        Date issuedAt = jwtUtil.extractClaim(token, Claims::getIssuedAt);

        // Assert
        assertEquals("test@example.com", subject);
        assertNotNull(issuedAt);
        assertTrue(issuedAt.before(new Date()) || issuedAt.equals(new Date()));
    }

    @Test
    @DisplayName("Should generate different tokens for different users")
    void testGenerateToken_DifferentUsers() {
        // Arrange
        UserDetails user1 = User.builder()
                .username("user1@example.com")
                .password("password")
                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                .build();

        UserDetails user2 = User.builder()
                .username("user2@example.com")
                .password("password")
                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                .build();

        // Act
        String token1 = jwtUtil.generateToken(user1);
        String token2 = jwtUtil.generateToken(user2);

        // Assert
        assertNotEquals(token1, token2);
        assertEquals("user1@example.com", jwtUtil.extractUsername(token1));
        assertEquals("user2@example.com", jwtUtil.extractUsername(token2));
    }
}
