package com.ead.backend.service;

import com.ead.backend.dto.*;
import com.ead.backend.entity.RefreshToken;
import com.ead.backend.entity.Role;
import com.ead.backend.entity.User;
import com.ead.backend.repository.RoleRepository;
import com.ead.backend.repository.UserRepository;
import com.ead.backend.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Auth Service Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private Role customerRole;
    private Role employeeRole;

    @BeforeEach
    void setUp() {
        // Setup test roles
        customerRole = new Role();
        customerRole.setId(1L);
        customerRole.setName("CUSTOMER");

        employeeRole = new Role();
        employeeRole.setId(2L);
        employeeRole.setName("EMPLOYEE");

        // Setup test user
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setPassword("$2a$10$hashedPassword");
        testUser.setFullName("Test User");
        testUser.setPhoneNumber("1234567890");
        testUser.setAddress("123 Test St");
        testUser.setActive(true);
        testUser.setRoles(new HashSet<>(Set.of(customerRole)));
    }

    @Test
    @DisplayName("Should successfully login with valid credentials")
    void testLogin_Success() {
        // Arrange
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(testUser.getEmail())
                .password(testUser.getPassword())
                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                .build();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token-123");
        refreshToken.setUser(testUser);

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPassword())).thenReturn(true);
        when(userDetailsService.loadUserByUsername(loginRequest.getEmail())).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("jwt-token-123");
        when(refreshTokenService.createRefreshToken(eq(testUser), anyString())).thenReturn(refreshToken);

        // Act
        AuthResponseDTO response = authService.login(loginRequest, "device-info");

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token-123", response.getToken());
        assertEquals("refresh-token-123", response.getRefreshToken());
        assertEquals(testUser.getEmail(), response.getEmail());
        assertEquals(testUser.getFullName(), response.getFullName());
        assertTrue(response.getRoles().contains("CUSTOMER"));

        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPassword());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil).generateToken(userDetails);
        verify(refreshTokenService).createRefreshToken(eq(testUser), anyString());
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void testLogin_UserNotFound() {
        // Arrange
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("notfound@example.com");
        loginRequest.setPassword("password123");

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login(loginRequest, "device-info");
        });

        assertEquals("EMAIL_NOT_FOUND", exception.getMessage());
        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("Should throw exception when password is invalid")
    void testLogin_InvalidPassword() {
        // Arrange
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("wrongpassword");

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPassword())).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login(loginRequest, "device-info");
        });

        assertEquals("INVALID_PASSWORD", exception.getMessage());
        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPassword());
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("Should successfully register new customer")
    void testSignup_Success() {
        // Arrange
        SignupRequestDTO signupRequest = new SignupRequestDTO();
        signupRequest.setEmail("newuser@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setFullName("New User");
        signupRequest.setPhoneNumber("9876543210");
        signupRequest.setRole("CUSTOMER");

        when(userRepository.findByEmail(signupRequest.getEmail())).thenReturn(Optional.empty());
        when(roleRepository.findByName("CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode(signupRequest.getPassword())).thenReturn("$2a$10$encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        MessageResponseDTO response = authService.signup(signupRequest);

        // Assert
        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertTrue(response.getMessage().contains("successfully"));

        verify(userRepository).findByEmail(signupRequest.getEmail());
        verify(roleRepository).findByName("CUSTOMER");
        verify(passwordEncoder).encode(signupRequest.getPassword());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should fail registration when email already exists")
    void testSignup_EmailAlreadyExists() {
        // Arrange
        SignupRequestDTO signupRequest = new SignupRequestDTO();
        signupRequest.setEmail("existing@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setFullName("Existing User");
        signupRequest.setPhoneNumber("9876543210");
        signupRequest.setRole("CUSTOMER");

        when(userRepository.findByEmail(signupRequest.getEmail())).thenReturn(Optional.of(testUser));

        // Act
        MessageResponseDTO response = authService.signup(signupRequest);

        // Assert
        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertEquals("Email already in use", response.getMessage());

        verify(userRepository).findByEmail(signupRequest.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should fail registration when role not found")
    void testSignup_RoleNotFound() {
        // Arrange
        SignupRequestDTO signupRequest = new SignupRequestDTO();
        signupRequest.setEmail("newuser@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setFullName("New User");
        signupRequest.setPhoneNumber("9876543210");
        signupRequest.setRole("INVALID_ROLE");

        when(userRepository.findByEmail(signupRequest.getEmail())).thenReturn(Optional.empty());
        when(roleRepository.findByName("INVALID_ROLE")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            authService.signup(signupRequest)
        );

        assertTrue(exception.getMessage().contains("not found"));
        verify(userRepository).findByEmail(signupRequest.getEmail());
        verify(roleRepository).findByName("INVALID_ROLE");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully refresh token")
    void testRefreshToken_Success() {
        // Arrange
        String refreshTokenString = "valid-refresh-token";

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenString);
        refreshToken.setUser(testUser);

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(testUser.getEmail())
                .password(testUser.getPassword())
                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                .build();

        when(refreshTokenService.verifyRefreshToken(refreshTokenString)).thenReturn(Optional.of(refreshToken));
        when(userDetailsService.loadUserByUsername(testUser.getEmail())).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("new-jwt-token");

        // Act
        AuthResponseDTO response = authService.refreshToken(refreshTokenString);

        // Assert
        assertNotNull(response);
        assertEquals("new-jwt-token", response.getToken());
        assertEquals(refreshTokenString, response.getRefreshToken());
        assertEquals(testUser.getEmail(), response.getEmail());

        verify(refreshTokenService).verifyRefreshToken(refreshTokenString);
        verify(userDetailsService).loadUserByUsername(testUser.getEmail());
        verify(jwtUtil).generateToken(userDetails);
    }

    @Test
    @DisplayName("Should throw exception for invalid refresh token")
    void testRefreshToken_InvalidToken() {
        // Arrange
        String invalidToken = "invalid-refresh-token";

        when(refreshTokenService.verifyRefreshToken(invalidToken))
                .thenThrow(new RuntimeException("Invalid refresh token"));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.refreshToken(invalidToken);
        });

        assertEquals("Invalid refresh token", exception.getMessage());
        verify(refreshTokenService).verifyRefreshToken(invalidToken);
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    @DisplayName("Should successfully update user profile")
    void testUpdateProfile_Success() {
        // Arrange
        String email = "test@example.com";
        String newPhone = "9999999999";
        String newAddress = "456 New St";
        String newRole = "EMPLOYEE";
        String newFullName = "Updated User";

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(roleRepository.findByName(newRole)).thenReturn(Optional.of(employeeRole));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User updatedUser = authService.updateProfile(email, newPhone, newAddress, newRole, newFullName);

        // Assert
        assertNotNull(updatedUser);
        assertEquals(newPhone, updatedUser.getPhoneNumber());
        assertEquals(newAddress, updatedUser.getAddress());
        assertEquals(newFullName, updatedUser.getFullName());
        assertTrue(updatedUser.getRoles().contains(employeeRole));

        verify(userRepository).findByEmail(email);
        verify(roleRepository).findByName(newRole);
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should find user by email")
    void testFindUserByEmail_Success() {
        // Arrange
        String email = "test@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = authService.findUserByEmail(email);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(email, result.get().getEmail());
        verify(userRepository).findByEmail(email);
    }

    @Test
    @DisplayName("Should return empty optional when user not found")
    void testFindUserByEmail_NotFound() {
        // Arrange
        String email = "notfound@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act
        Optional<User> result = authService.findUserByEmail(email);

        // Assert
        assertFalse(result.isPresent());
        verify(userRepository).findByEmail(email);
    }

    @Test
    @DisplayName("Should successfully logout and revoke refresh token")
    void testLogout_Success() {
        // Arrange
        String refreshTokenString = "valid-refresh-token";
        doNothing().when(refreshTokenService).revokeRefreshToken(refreshTokenString);

        // Act
        authService.logout(refreshTokenString);

        // Assert
        verify(refreshTokenService).revokeRefreshToken(refreshTokenString);
    }

    @Test
    @DisplayName("Should successfully logout from all devices")
    void testLogoutFromAllDevices_Success() {
        // Arrange
        String email = "test@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        doNothing().when(refreshTokenService).revokeAllUserTokens(testUser);

        // Act
        authService.logoutFromAllDevices(email);

        // Assert
        verify(userRepository).findByEmail(email);
        verify(refreshTokenService).revokeAllUserTokens(testUser);
    }

    @Test
    @DisplayName("Should throw exception when logging out from all devices with invalid user")
    void testLogoutFromAllDevices_UserNotFound() {
        // Arrange
        String email = "notfound@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            authService.logoutFromAllDevices(email)
        );

        assertTrue(exception.getMessage().contains("not found"));
        verify(userRepository).findByEmail(email);
        verify(refreshTokenService, never()).revokeAllUserTokens(any());
    }
}

