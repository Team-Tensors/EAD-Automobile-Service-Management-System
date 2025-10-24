package com.ead.backend.service;

import com.ead.backend.dto.AuthResponseDTO;
import com.ead.backend.dto.LoginRequestDTO;
import com.ead.backend.dto.SignupRequestDTO;
import com.ead.backend.dto.MessageResponseDTO;
import com.ead.backend.entity.RefreshToken;
import com.ead.backend.repository.RoleRepository;
import com.ead.backend.repository.UserRepository;
import com.ead.backend.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ead.backend.entity.User;
import com.ead.backend.entity.Role;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final RefreshTokenService refreshTokenService; // Added refresh token service

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       UserDetailsService userDetailsService,
                       RefreshTokenService refreshTokenService) { // Added parameter
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.refreshTokenService = refreshTokenService;
    }

    public AuthResponseDTO login(LoginRequestDTO request, String deviceInfo) {
        logger.info("=== LOGIN PROCESS STARTED ===");
        logger.info("Login request for email: {}", request.getEmail());

        // Step 1: Check if user exists with the provided email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    logger.error("User not found with email: {}", request.getEmail());
                    return new RuntimeException("EMAIL_NOT_FOUND");
                });

        logger.info("Found user - ID: {}, Email: {}, Active: {}",
                   user.getId(), user.getEmail(), user.getActive());

        // Step 2: Check if the password matches
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.error("Invalid password for user: {}", request.getEmail());
            throw new RuntimeException("INVALID_PASSWORD");
        }

        logger.info("Password validation successful for: {}", request.getEmail());

        // Step 3: Authenticate user (this should pass now since we pre-validated)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        logger.info("Authentication successful for: {}", request.getEmail());

        // Load user details and generate token
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        logger.info("Found user after authentication - ID: {}, Email: {}",
                   user.getId(), user.getEmail());

        // Create refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, deviceInfo);

        // Extract role names
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        logger.info("Login completed successfully for user: {}", user.getEmail());

        return new AuthResponseDTO(token, refreshToken.getToken(), user.getId(),
                               user.getEmail(), user.getFullName(), roles);
    }

    // Overloaded method for backward compatibility
    public AuthResponseDTO login(LoginRequestDTO request) {
        return login(request, null);
    }

    @Transactional
    public MessageResponseDTO signup(SignupRequestDTO request) {
        logger.info("=== SIGNUP PROCESS STARTED ===");
        logger.info("Signup request - Email: {}, Role: {}",
                   request.getEmail(), request.getRole());

        // Check if email already exists
        Optional<User> existingUserByEmail = userRepository.findByEmail(request.getEmail());
        if (existingUserByEmail.isPresent()) {
            logger.warn("Email already exists: {}", request.getEmail());
            return new MessageResponseDTO("Email is already taken", false);
        }

        try {
            // Create new user with all fields
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFullName(request.getFullName());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setAddress(request.getAddress());
            user.setOauthProvider("local"); // Local registration
            user.setActive(true);

            // Validate and set role
            String roleName = validateAndGetRole(request.getRole());
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

            user.getRoles().add(role);

            logger.info("About to save user - Email: {}, Role: {}",
                       user.getEmail(), roleName);

            User savedUser = userRepository.save(user);

            logger.info("User saved successfully!");
            logger.info("Saved user details - ID: {}, Email: {}, Active: {}",
                       savedUser.getId(), savedUser.getEmail(), savedUser.getActive());
            logger.info("Saved user roles: {}", savedUser.getRoles().stream().map(Role::getName).collect(Collectors.toList()));

            // Verify the user can be found immediately after saving
            Optional<User> verifyByEmail = userRepository.findByEmail(savedUser.getEmail());

            logger.info("Post-save verification:");
            logger.info("Can find by email '{}': {}", savedUser.getEmail(), verifyByEmail.isPresent());

            return new MessageResponseDTO("User registered successfully as " + roleName);

        } catch (Exception e) {
            logger.error("Error during user registration: {}", e.getMessage(), e);
            throw new RuntimeException("Registration failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public User createOrUpdateOAuthUser(String email, String name, String oauthProvider, String oauthId) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            // Update existing user with OAuth info if not already set
            User user = existingUser.get();
            if (user.getOauthProvider() == null) {
                user.setOauthProvider(oauthProvider);
                user.setOauthId(oauthId);
                return userRepository.save(user);
            }
            return user;
        } else {
            // Create new OAuth user with CUSTOMER role by default
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(name);
            newUser.setPassword(passwordEncoder.encode("oauth_" + System.currentTimeMillis())); // Dummy password
            newUser.setOauthProvider(oauthProvider);
            newUser.setOauthId(oauthId);
            newUser.setActive(true);

            // Default role for OAuth users is CUSTOMER
            Role customerRole = roleRepository.findByName("CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));
            newUser.getRoles().add(customerRole);

            return userRepository.save(newUser);
        }
    }

    public AuthResponseDTO generateTokenForOAuthUser(User user, String deviceInfo) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        // Create refresh token for OAuth user
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, deviceInfo);

        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new AuthResponseDTO(token, refreshToken.getToken(), user.getId(),
                               user.getEmail(), user.getFullName(), roles);
    }

    // Overloaded method for backward compatibility
    public AuthResponseDTO generateTokenForOAuthUser(User user) {
        return generateTokenForOAuthUser(user, null);
    }

    /**
     * Refresh JWT token using refresh token
     */
    public AuthResponseDTO refreshToken(String refreshTokenValue) {
        Optional<String> newJwtToken = refreshTokenService.refreshJwtToken(refreshTokenValue);

        if (newJwtToken.isPresent()) {
            // Get user information from refresh token
            RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenValue)
                    .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

            User user = refreshToken.getUser();
            Set<String> roles = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toSet());

            // Return response with new JWT token and existing refresh token
            return new AuthResponseDTO(newJwtToken.get(), refreshTokenValue, user.getId(),
                                   user.getEmail(), user.getFullName(), roles);
        }

        throw new RuntimeException("Unable to refresh token");
    }

    /**
     * Logout user by revoking refresh token
     */
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revokeRefreshToken(refreshToken);
    }

    /**
     * Logout user from all devices
     */
    @Transactional
    public void logoutFromAllDevices(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        refreshTokenService.revokeAllUserTokens(user);
    }

    private String validateAndGetRole(String requestedRole) {
        if (requestedRole == null || requestedRole.trim().isEmpty()) {
            return "CUSTOMER"; // Default role
        }

        String roleName = requestedRole.toUpperCase().trim();

        // Validate role exists in enum
        switch (roleName) {
            case "CUSTOMER":
            case "EMPLOYEE":
            case "ADMIN":
                return roleName;
            default:
                throw new RuntimeException("Invalid role: " + requestedRole +
                    ". Valid roles are: CUSTOMER, EMPLOYEE, ADMIN");
        }
    }

    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
