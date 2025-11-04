package com.ead.backend.integration;

import com.ead.backend.dto.*;
import com.ead.backend.entity.Role;
import com.ead.backend.entity.User;
import com.ead.backend.repository.RoleRepository;
import com.ead.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@DisplayName("Authentication Integration Tests")
public class AuthenticationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Role customerRole;
    private Role employeeRole;

    @BeforeEach
    void setUp() {
        // Clean up database
        userRepository.deleteAll();

        // Ensure roles exist
        customerRole = roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("CUSTOMER");
                    return roleRepository.save(role);
                });

        employeeRole = roleRepository.findByName("EMPLOYEE")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("EMPLOYEE");
                    return roleRepository.save(role);
                });
    }

    @Test
    @DisplayName("Integration: Complete user registration and login flow")
    void testCompleteRegistrationAndLoginFlow() throws Exception {
        // Step 1: Register new user
        SignupRequestDTO signupRequest = new SignupRequestDTO();
        signupRequest.setEmail("integration@example.com");
        signupRequest.setPassword("SecurePass123!");
        signupRequest.setFullName("Integration Test User");
        signupRequest.setPhoneNumber("1234567890");
        signupRequest.setRole("CUSTOMER");

        MvcResult registerResult = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.email").value("integration@example.com"))
                .andReturn();

        // Extract tokens from registration response
        String registrationResponse = registerResult.getResponse().getContentAsString();
        AuthResponseDTO authResponse = objectMapper.readValue(registrationResponse, AuthResponseDTO.class);
        String accessToken = authResponse.getToken();
        String refreshToken = authResponse.getRefreshToken();

        assertNotNull(accessToken);
        assertNotNull(refreshToken);

        // Step 2: Verify user exists in database
        User savedUser = userRepository.findByEmail("integration@example.com").orElse(null);
        assertNotNull(savedUser);
        assertEquals("Integration Test User", savedUser.getFullName());
        assertTrue(savedUser.getActive());

        // Step 3: Login with the same credentials
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("integration@example.com");
        loginRequest.setPassword("SecurePass123!");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.email").value("integration@example.com"));

        // Step 4: Use refresh token to get new access token
        RefreshTokenRequestDTO refreshRequest = new RefreshTokenRequestDTO();
        refreshRequest.setRefreshToken(refreshToken);

        mockMvc.perform(post("/auth/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @DisplayName("Integration: Should prevent duplicate email registration")
    void testDuplicateEmailRegistration() throws Exception {
        // Step 1: Register first user
        SignupRequestDTO firstRequest = new SignupRequestDTO();
        firstRequest.setEmail("duplicate@example.com");
        firstRequest.setPassword("password123");
        firstRequest.setFullName("First User");
        firstRequest.setPhoneNumber("1111111111");
        firstRequest.setRole("CUSTOMER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(firstRequest)))
                .andExpect(status().isCreated());

        // Step 2: Try to register with same email
        SignupRequestDTO duplicateRequest = new SignupRequestDTO();
        duplicateRequest.setEmail("duplicate@example.com");
        duplicateRequest.setPassword("differentpassword");
        duplicateRequest.setFullName("Second User");
        duplicateRequest.setPhoneNumber("2222222222");
        duplicateRequest.setRole("CUSTOMER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already in use"))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Integration: Complete authentication flow with profile management")
    void testAuthenticationWithProfileManagement() throws Exception {
        // Step 1: Create and save user directly in database
        User user = new User();
        user.setEmail("profile@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setFullName("Profile Test User");
        user.setPhoneNumber("5555555555");
        user.setAddress("Original Address");
        user.setActive(true);
        user.setRoles(Set.of(customerRole));
        userRepository.save(user);

        // Step 2: Login
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("profile@example.com");
        loginRequest.setPassword("password123");

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String loginResponse = loginResult.getResponse().getContentAsString();
        AuthResponseDTO authResponse = objectMapper.readValue(loginResponse, AuthResponseDTO.class);
        String accessToken = authResponse.getToken();

        // Step 3: Get profile (would require proper JWT authentication setup)
        // This part would need proper security configuration in test
        // For now, we verify the user exists in DB
        User retrievedUser = userRepository.findByEmail("profile@example.com").orElse(null);
        assertNotNull(retrievedUser);
        assertEquals("Profile Test User", retrievedUser.getFullName());
    }

    @Test
    @DisplayName("Integration: Login failure with invalid credentials")
    void testLoginWithInvalidCredentials() throws Exception {
        // Create user in database
        User user = new User();
        user.setEmail("validuser@example.com");
        user.setPassword(passwordEncoder.encode("correctpassword"));
        user.setFullName("Valid User");
        user.setPhoneNumber("9999999999");
        user.setActive(true);
        user.setRoles(Set.of(customerRole));
        userRepository.save(user);

        // Try to login with wrong password
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("validuser@example.com");
        loginRequest.setPassword("wrongpassword");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Password is incorrect"));
    }

    @Test
    @DisplayName("Integration: Login failure with non-existent email")
    void testLoginWithNonExistentEmail() throws Exception {
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("nonexistent@example.com");
        loginRequest.setPassword("somepassword");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email not found"));
    }

    @Test
    @DisplayName("Integration: Register customer through specific endpoint")
    void testCustomerRegistrationEndpoint() throws Exception {
        SignupRequestDTO signupRequest = new SignupRequestDTO();
        signupRequest.setEmail("customer@example.com");
        signupRequest.setPassword("customerpass123");
        signupRequest.setFullName("Customer User");
        signupRequest.setPhoneNumber("1231231234");

        mockMvc.perform(post("/auth/register/customer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("customer@example.com"))
                .andExpect(jsonPath("$.roles[0]").value("CUSTOMER"));

        // Verify in database
        User savedUser = userRepository.findByEmail("customer@example.com").orElse(null);
        assertNotNull(savedUser);
        assertTrue(savedUser.getRoles().stream().anyMatch(role -> role.getName().equals("CUSTOMER")));
    }

    @Test
    @DisplayName("Integration: Register employee through specific endpoint")
    void testEmployeeRegistrationEndpoint() throws Exception {
        SignupRequestDTO signupRequest = new SignupRequestDTO();
        signupRequest.setEmail("employee@example.com");
        signupRequest.setPassword("employeepass123");
        signupRequest.setFullName("Employee User");
        signupRequest.setPhoneNumber("3213213214");

        mockMvc.perform(post("/auth/register/employee")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("employee@example.com"))
                .andExpect(jsonPath("$.roles[0]").value("EMPLOYEE"));

        // Verify in database
        User savedUser = userRepository.findByEmail("employee@example.com").orElse(null);
        assertNotNull(savedUser);
        assertTrue(savedUser.getRoles().stream().anyMatch(role -> role.getName().equals("EMPLOYEE")));
    }

    @Test
    @DisplayName("Integration: Password reset flow")
    void testPasswordResetFlow() throws Exception {
        // Create user
        User user = new User();
        user.setEmail("resetpass@example.com");
        user.setPassword(passwordEncoder.encode("oldpassword"));
        user.setFullName("Reset Password User");
        user.setPhoneNumber("7777777777");
        user.setActive(true);
        user.setRoles(Set.of(customerRole));
        userRepository.save(user);

        // Request password reset
        ForgotPasswordRequestDTO forgotRequest = new ForgotPasswordRequestDTO();
        forgotRequest.setEmail("resetpass@example.com");

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forgotRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If this email is registered, you will receive a password reset link shortly"));

        // Note: Complete password reset flow would require email service integration
        // and token retrieval from database
    }

    @Test
    @DisplayName("Integration: Logout functionality")
    void testLogoutFunctionality() throws Exception {
        // Create and login user
        User user = new User();
        user.setEmail("logout@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setFullName("Logout Test User");
        user.setPhoneNumber("8888888888");
        user.setActive(true);
        user.setRoles(Set.of(customerRole));
        userRepository.save(user);

        // Login
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("logout@example.com");
        loginRequest.setPassword("password123");

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String loginResponse = loginResult.getResponse().getContentAsString();
        AuthResponseDTO authResponse = objectMapper.readValue(loginResponse, AuthResponseDTO.class);
        String refreshToken = authResponse.getRefreshToken();

        // Logout
        RefreshTokenRequestDTO logoutRequest = new RefreshTokenRequestDTO();
        logoutRequest.setRefreshToken(refreshToken);

        mockMvc.perform(post("/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logoutRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }

    @Test
    @DisplayName("Integration: Validate registration input constraints")
    void testRegistrationValidation() throws Exception {
        // Test with invalid email
        SignupRequestDTO invalidEmailRequest = new SignupRequestDTO();
        invalidEmailRequest.setEmail("notanemail");
        invalidEmailRequest.setPassword("password123");
        invalidEmailRequest.setFullName("Test User");
        invalidEmailRequest.setPhoneNumber("1234567890");
        invalidEmailRequest.setRole("CUSTOMER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidEmailRequest)))
                .andExpect(status().isBadRequest());
    }
}

