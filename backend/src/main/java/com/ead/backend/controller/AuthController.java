package com.ead.backend.controller;

import com.ead.backend.dto.AuthResponseDTO;
import com.ead.backend.dto.LoginRequestDTO;
import com.ead.backend.dto.SignupRequestDTO;
import com.ead.backend.dto.MessageResponseDTO;
import com.ead.backend.dto.RefreshTokenRequestDTO;
import com.ead.backend.dto.UpdateProfileRequestDTO;
import com.ead.backend.dto.ForgotPasswordRequestDTO;
import com.ead.backend.dto.ResetPasswordRequestDTO;
import com.ead.backend.dto.VerifyResetTokenResponseDTO;
import com.ead.backend.entity.User;
import com.ead.backend.entity.PasswordResetToken;
import com.ead.backend.service.AuthService;
import com.ead.backend.service.RefreshTokenService;
import com.ead.backend.service.PasswordResetService;
import com.ead.backend.annotation.JwtSecurityAnnotations.Authenticated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/auth")
@Validated
@CrossOrigin(origins = "http://localhost:3000") // For React frontend
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, RefreshTokenService refreshTokenService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.passwordResetService = passwordResetService;
        logger.info("AuthController initialized successfully with JWT-based role authorization");
    }

    /**
     * Customer & Employee Login - Returns JWT token with user details and refresh token
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request, HttpServletRequest httpRequest) {
        logger.info("=== LOGIN REQUEST RECEIVED ===");
        logger.info("Request URL: {}", httpRequest.getRequestURL());
        logger.info("Request Method: {}", httpRequest.getMethod());
        logger.info("Email: {}", request.getEmail());
        logger.info("Client IP: {}", getClientIpAddress(httpRequest));
        logger.info("User-Agent: {}", httpRequest.getHeader("User-Agent"));

        try {
            String deviceInfo = extractDeviceInfo(httpRequest);
            logger.info("Device Info: {}", deviceInfo);

            AuthResponseDTO response = authService.login(request, deviceInfo);
            logger.info("Login successful for user: {}", request.getEmail());
            logger.info("Generated JWT token length: {}", response.getToken().length());
            logger.info("Generated refresh token: {}", response.getRefreshToken());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();

            // Check for specific error types
            if ("EMAIL_NOT_FOUND".equals(errorMessage)) {
                logger.error("Login failed - Email not found: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponseDTO("Email not found", false));
            } else if ("INVALID_PASSWORD".equals(errorMessage)) {
                logger.error("Login failed - Invalid password for user: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponseDTO("Password is incorrect", false));
            } else {
                logger.error("Login failed for user: {} - Error: {}", request.getEmail(), errorMessage);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponseDTO("Invalid email or password", false));
            }
        } catch (Exception e) {
            logger.error("Login failed for user: {} - Unexpected error: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponseDTO("Invalid email or password", false));
        }
    }

    /**
     * Refresh JWT token using refresh token
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO request) {
        logger.info("=== REFRESH TOKEN REQUEST RECEIVED ===");
        logger.info("Refresh token: {}", request.getRefreshToken());

        try {
            AuthResponseDTO response = authService.refreshToken(request.getRefreshToken());
            logger.info("Token refresh successful");
            logger.info("New JWT token length: {}", response.getToken().length());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Token refresh failed - Error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponseDTO("Invalid or expired refresh token", false));
        }
    }

    /**
     * Rotate refresh token (get new refresh token)
     */
    @PostMapping("/rotate-refresh-token")
    public ResponseEntity<?> rotateRefreshToken(@Valid @RequestBody RefreshTokenRequestDTO request,
                                                HttpServletRequest httpRequest) {
        logger.info("=== ROTATE REFRESH TOKEN REQUEST RECEIVED ===");
        logger.info("Old refresh token: {}", request.getRefreshToken());

        try {
            String deviceInfo = extractDeviceInfo(httpRequest);
            var newRefreshToken = refreshTokenService.rotateRefreshToken(
                request.getRefreshToken(), deviceInfo);

            logger.info("Refresh token rotation successful");
            logger.info("New refresh token: {}", newRefreshToken.getToken());

            return ResponseEntity.ok(new MessageResponseDTO(
                "Refresh token rotated successfully. New token: " + newRefreshToken.getToken()));
        } catch (Exception e) {
            logger.error("Refresh token rotation failed - Error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponseDTO("Unable to rotate refresh token: " + e.getMessage(), false));
        }
    }

    /**
     * Customer & Employee Registration - For automobile service management
     */
    @PostMapping("/register")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequestDTO request, HttpServletRequest httpRequest) {
        logger.info("=== REGISTRATION REQUEST RECEIVED ===");
        logger.info("Email: {}", request.getEmail());
        logger.info("Full Name: {}", request.getFullName());
        logger.info("Role: {}", request.getRole());
        logger.info("Phone: {}", request.getPhoneNumber());

        try {
            MessageResponseDTO signupResponse = authService.signup(request);
            if (signupResponse.isSuccess()) {
                logger.info("Registration successful for user: {}", request.getEmail());

                // Auto-login after successful registration
                String deviceInfo = extractDeviceInfo(httpRequest);
                LoginRequestDTO loginRequestDTO = new LoginRequestDTO();
                loginRequestDTO.setEmail(request.getEmail());
                loginRequestDTO.setPassword(request.getPassword());

                AuthResponseDTO authResponseDTO = authService.login(loginRequestDTO, deviceInfo);
                logger.info("Auto-login successful after registration for user: {}", request.getEmail());
                logger.info("Generated JWT token length: {}", authResponseDTO.getToken().length());
                logger.info("Generated refresh token: {}", authResponseDTO.getRefreshToken());

                return ResponseEntity.status(HttpStatus.CREATED).body(authResponseDTO);
            } else {
                logger.warn("Registration failed for user: {} - Reason: {}", request.getEmail(), signupResponse.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(signupResponse);
            }
        } catch (Exception e) {
            logger.error("Registration failed for user: {} - Error: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponseDTO("Registration failed: " + e.getMessage(), false));
        }
    }

    /**
     * Customer Registration - Specific endpoint for customers
     */
    @PostMapping("/register/customer")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody SignupRequestDTO request, HttpServletRequest httpRequest) {
        logger.info("=== CUSTOMER REGISTRATION REQUEST RECEIVED ===");
        logger.info("Customer Email: {}", request.getEmail());

        request.setRole("CUSTOMER"); // Force customer role
        return signup(request, httpRequest);
    }

    /**
     * Employee Registration - Now uses JWT-based role checking instead of hardcoded security rules
     */
    @PostMapping("/register/employee")
//    @AdminOnly // Only admins can create employees - checked via JWT token
    public ResponseEntity<?> registerEmployee(@Valid @RequestBody SignupRequestDTO request, HttpServletRequest httpRequest) {
        logger.info("=== EMPLOYEE REGISTRATION REQUEST RECEIVED ===");
        logger.info("Employee Email: {}", request.getEmail());

        request.setRole("EMPLOYEE"); // Force employee role
        return signup(request, httpRequest);
    }

    /**
     * Logout with refresh token revocation
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) RefreshTokenRequestDTO request) {
        logger.info("=== LOGOUT REQUEST RECEIVED ===");

        try {
            if (request != null && request.getRefreshToken() != null) {
                logger.info("Logout with refresh token: {}", request.getRefreshToken());
                authService.logout(request.getRefreshToken());
                logger.info("Logout successful with token revocation");
                return ResponseEntity.ok(new MessageResponseDTO("Logged out successfully"));
            } else {
                logger.info("Client-side logout (no refresh token provided)");
                return ResponseEntity.ok(new MessageResponseDTO("Logged out successfully (client-side only)"));
            }
        } catch (Exception e) {
            logger.error("Logout failed - Error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponseDTO("Logout failed: " + e.getMessage(), false));
        }
    }

    /**
     * Logout from all devices - Uses JWT-based authentication check
     */
    @PostMapping("/logout-all")
    @Authenticated // Requires valid JWT token with any role
    public ResponseEntity<?> logoutFromAllDevices(Authentication authentication) {
        logger.info("=== LOGOUT ALL DEVICES REQUEST RECEIVED ===");
        logger.info("User email: {}", authentication.getName());

        try {
            String email = authentication.getName(); // This will be the email since we use email as username
            authService.logoutFromAllDevices(email);
            logger.info("Logout from all devices successful for user: {}", email);
            return ResponseEntity.ok(new MessageResponseDTO("Logged out from all devices successfully"));
        } catch (Exception e) {
            logger.error("Logout from all devices failed for user: {} - Error: {}", authentication.getName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponseDTO("Logout from all devices failed: " + e.getMessage(), false));
        }
    }

    /**
     * Get active sessions - Uses JWT-based authentication check
     */
    @GetMapping("/active-sessions")
    @Authenticated // Requires valid JWT token with any role
    public ResponseEntity<?> getActiveSessions(Authentication authentication) {
        logger.info("=== GET ACTIVE SESSIONS REQUEST RECEIVED ===");
        logger.info("User email: {}", authentication.getName());

        try {
            String email = authentication.getName(); // This will be the email since we use email as username
            User user = authService.findUserByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            var activeTokens = refreshTokenService.getActiveTokensForUser(user);
            logger.info("Found {} active sessions for user: {}", activeTokens.size(), email);

            // Convert to a safe response (don't expose actual tokens)
            var sessions = activeTokens.stream().map(token -> {
                var sessionInfo = new java.util.HashMap<String, Object>();
                sessionInfo.put("id", token.getId());
                sessionInfo.put("deviceInfo", token.getDeviceInfo());
                sessionInfo.put("createdAt", token.getCreatedAt());
                sessionInfo.put("lastUsedAt", token.getLastUsedAt());
                return sessionInfo;
            }).toList();

            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            logger.error("Failed to fetch active sessions for user: {} - Error: {}", authentication.getName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDTO("Unable to fetch active sessions", false));
        }
    }

    /**
     * Get current user profile
     */
    @GetMapping("/profile")
    @Authenticated // Requires valid JWT token with any role
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        logger.info("=== GET USER PROFILE REQUEST RECEIVED ===");
        logger.info("User email: {}", authentication.getName());

        try {
            String email = authentication.getName();
            User user = authService.findUserByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Create profile response
            var profile = new java.util.HashMap<String, Object>();
            profile.put("id", user.getId());
            profile.put("email", user.getEmail());
            profile.put("fullName", user.getFullName());
            profile.put("phoneNumber", user.getPhoneNumber());
            profile.put("address", user.getAddress());
            profile.put("active", user.getActive());
            profile.put("oauthProvider", user.getOauthProvider());
            profile.put("roles", user.getRoles().stream()
                    .map(role -> role.getName())
                    .collect(java.util.stream.Collectors.toSet()));

            logger.info("Profile fetched successfully for user: {}", email);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            logger.error("Failed to fetch profile for user: {} - Error: {}", authentication.getName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDTO("Unable to fetch user profile", false));
        }
    }

    /**
     * Update user profile - allows updating any user information
     */
    @PutMapping("/update-profile")
    @Authenticated // Requires valid JWT token with any role
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequestDTO request,
                                          Authentication authentication) {
        logger.info("=== UPDATE PROFILE REQUEST RECEIVED ===");
        logger.info("User email: {}", authentication.getName());
        logger.info("Update fields - Phone: {}, Role: {}, FullName: {}, Address: {}",
                   request.getPhoneNumber(), request.getRole(), request.getFullName(), request.getAddress());

        try {
            String email = authentication.getName();
            User updatedUser = authService.updateProfile(
                email,
                request.getPhoneNumber(),
                request.getAddress(),
                request.getRole(),
                request.getFullName()
            );

            // Create response with updated user information
            var response = new java.util.HashMap<String, Object>();
            response.put("id", updatedUser.getId());
            response.put("email", updatedUser.getEmail());
            response.put("fullName", updatedUser.getFullName());
            response.put("phoneNumber", updatedUser.getPhoneNumber());
            response.put("address", updatedUser.getAddress());
            response.put("active", updatedUser.getActive());
            response.put("oauthProvider", updatedUser.getOauthProvider());
            response.put("roles", updatedUser.getRoles().stream()
                    .map(role -> role.getName())
                    .collect(java.util.stream.Collectors.toSet()));

            logger.info("Profile updated successfully for user: {}", email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to update profile for user: {} - Error: {}", authentication.getName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponseDTO("Unable to update profile: " + e.getMessage(), false));
        }
    }

    /**
     * Forgot Password - Request password reset email
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        logger.info("=== FORGOT PASSWORD REQUEST RECEIVED ===");
        logger.info("Email: {}", request.getEmail());

        try {
            passwordResetService.initiatePasswordReset(request.getEmail());
            logger.info("Password reset initiated for email: {}", request.getEmail());

            // Always return success to prevent email enumeration
            return ResponseEntity.ok(new MessageResponseDTO(
                "If this email is registered, you will receive a password reset link shortly"));
        } catch (Exception e) {
            logger.error("Forgot password request failed for email: {} - Error: {}",
                        request.getEmail(), e.getMessage());
            // Return generic message for security
            return ResponseEntity.ok(new MessageResponseDTO(
                "If this email is registered, you will receive a password reset link shortly"));
        }
    }

    /**
     * Reset Password - Set new password with token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        logger.info("=== RESET PASSWORD REQUEST RECEIVED ===");

        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            logger.info("Password reset successful");

            return ResponseEntity.ok(new MessageResponseDTO(
                "Password has been reset successfully. You can now login with your new password"));
        } catch (Exception e) {
            logger.error("Password reset failed - Error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponseDTO(e.getMessage(), false));
        }
    }

    /**
     * Verify Reset Token - Check if token is valid
     */
    @GetMapping("/verify-reset-token/{token}")
    public ResponseEntity<?> verifyResetToken(@PathVariable String token) {
        logger.info("=== VERIFY RESET TOKEN REQUEST RECEIVED ===");

        try {
            PasswordResetToken resetToken = passwordResetService.verifyResetToken(token);
            logger.info("Token verification successful");

            return ResponseEntity.ok(new VerifyResetTokenResponseDTO(
                true,
                resetToken.getUser().getEmail(),
                "Token is valid"
            ));
        } catch (Exception e) {
            logger.error("Token verification failed - Error: {}", e.getMessage());
            return ResponseEntity.ok(new VerifyResetTokenResponseDTO(
                false,
                e.getMessage()
            ));
        }
    }

    /**
     * Extract device information from HTTP request
     */
    private String extractDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = getClientIpAddress(request);
        return String.format("IP: %s, Agent: %s",
                            ipAddress != null ? ipAddress : "unknown",
                            userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 100)) : "unknown");
    }

    /**
     * Get client IP address considering proxy headers
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String[] headers = {"X-Forwarded-For", "X-Real-IP", "Proxy-Client-IP", "WL-Proxy-Client-IP"};

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }

        return request.getRemoteAddr();
    }
}
