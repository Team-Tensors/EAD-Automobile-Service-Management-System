package com.ead.backend.service;

import com.ead.backend.util.JwtUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.List;

@Service("jwtAuthorizationService")
public class JwtAuthorizationService {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthorizationService.class);
    private final JwtUtil jwtUtil;

    public JwtAuthorizationService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Check if the current user has a specific role
     */
    public boolean hasRole(Authentication authentication, String role) {
        String token = extractTokenFromAuthentication(authentication);
        if (token == null) {
            logger.debug("No JWT token found for role check: {}", role);
            return false;
        }

        try {
            boolean hasRole = jwtUtil.hasRole(token, role);
            logger.debug("Role check for '{}': {}", role, hasRole);
            return hasRole;
        } catch (Exception e) {
            logger.error("Error checking role '{}': {}", role, e.getMessage());
            return false;
        }
    }

    /**
     * Check if the current user has any of the specified roles
     */
    public boolean hasAnyRole(Authentication authentication, String... roles) {
        String token = extractTokenFromAuthentication(authentication);
        if (token == null) {
            logger.debug("No JWT token found for role check: {}", Arrays.toString(roles));
            return false;
        }

        try {
            boolean hasAnyRole = jwtUtil.hasAnyRole(token, roles);
            logger.debug("Role check for any of '{}': {}", Arrays.toString(roles), hasAnyRole);
            return hasAnyRole;
        } catch (Exception e) {
            logger.error("Error checking roles '{}': {}", Arrays.toString(roles), e.getMessage());
            return false;
        }
    }

    /**
     * Check if user is authenticated with valid JWT token
     */
    public boolean isAuthenticated(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String token = extractTokenFromAuthentication(authentication);
        if (token == null) {
            return false;
        }

        try {
            List<String> roles = jwtUtil.extractRoles(token);
            boolean isAuthenticated = !roles.isEmpty();
            logger.debug("Authentication check: {} (roles: {})", isAuthenticated, roles);
            return isAuthenticated;
        } catch (Exception e) {
            logger.error("Error checking authentication: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get user roles from JWT token
     */
    public List<String> getUserRoles(Authentication authentication) {
        String token = extractTokenFromAuthentication(authentication);
        if (token == null) {
            return List.of();
        }

        try {
            return jwtUtil.extractRoles(token);
        } catch (Exception e) {
            logger.error("Error extracting user roles: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Get user email from JWT token
     */
    public String getUserEmail(Authentication authentication) {
        String token = extractTokenFromAuthentication(authentication);
        if (token == null) {
            return null;
        }

        try {
            return jwtUtil.extractUsername(token); // This is actually the email in our system
        } catch (Exception e) {
            logger.error("Error extracting user email: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract JWT token from Spring Security Authentication
     */
    private String extractTokenFromAuthentication(Authentication authentication) {
        if (authentication == null) {
            authentication = SecurityContextHolder.getContext().getAuthentication();
        }

        if (authentication == null) {
            return null;
        }

        // Try to get token from credentials
        Object credentials = authentication.getCredentials();
        if (credentials instanceof String) {
            return (String) credentials;
        }

        // Try to get from principal if it's a JWT token string
        Object principal = authentication.getPrincipal();
        if (principal instanceof String && ((String) principal).contains(".")) {
            return (String) principal;
        }

        return null;
    }
}
