package com.ead.backend.controller;

import com.ead.backend.dto.AuthResponse;
import com.ead.backend.dto.LoginRequest;
import com.ead.backend.dto.SignupRequest;
import com.ead.backend.dto.MessageResponse;
import com.ead.backend.entity.User;
import com.ead.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
@RequestMapping("/auth")
@Validated
@CrossOrigin(origins = "http://localhost:3000") // For React frontend
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Customer & Employee Login - Returns JWT token with user details
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Invalid username or password", false));
        }
    }

    /**
     * Customer & Employee Registration - For automobile service management
     */
    @PostMapping("/register")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            MessageResponse response = authService.signup(request);
            if (response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Registration failed: " + e.getMessage(), false));
        }
    }

    /**
     * Customer Registration - Specific endpoint for customers
     */
    @PostMapping("/register/customer")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody SignupRequest request) {
        request.setRole("CUSTOMER"); // Force customer role
        return signup(request);
    }

    /**
     * Employee Registration - Specific endpoint for employees (admin access required)
     */
    @PostMapping("/register/employee")
    public ResponseEntity<?> registerEmployee(@Valid @RequestBody SignupRequest request) {
        request.setRole("EMPLOYEE"); // Force employee role
        return signup(request);
    }

    /**
     * OAuth2 Success Handler - For Google OAuth integration
     */
    @GetMapping("/oauth2/success")
    public void oauth2Success(Authentication authentication, HttpServletResponse response) throws IOException {
        try {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");

            // Create or update OAuth user
            User user = authService.createOrUpdateOAuthUser(email, name, "google",
                    oauth2User.getAttribute("sub"));

            // Generate token for OAuth user
            AuthResponse authResponse = authService.generateTokenForOAuthUser(user);

            // Redirect to frontend with token (you can customize this URL)
            String frontendUrl = "http://localhost:3000/oauth/callback?token=" +
                    authResponse.getToken() + "&user=" + user.getId();
            response.sendRedirect(frontendUrl);

        } catch (Exception e) {
            response.sendRedirect("http://localhost:3000/login?error=oauth_failed");
        }
    }

    /**
     * Get current user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = authService.findUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Return user without password
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("User not found", false));
        }
    }

    /**
     * Logout endpoint (client-side token invalidation)
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    /**
     * Check if user exists by email (for registration validation)
     */
    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmailExists(@PathVariable String email) {
        boolean exists = authService.findUserByEmail(email).isPresent();
        return ResponseEntity.ok(new MessageResponse(
                exists ? "Email already exists" : "Email available",
                !exists));
    }

    /**
     * Check if username exists (for registration validation)
     */
    @GetMapping("/check-username/{username}")
    public ResponseEntity<?> checkUsernameExists(@PathVariable String username) {
        boolean exists = authService.findUserByUsername(username).isPresent();
        return ResponseEntity.ok(new MessageResponse(
                exists ? "Username already exists" : "Username available",
                !exists));
    }
}
