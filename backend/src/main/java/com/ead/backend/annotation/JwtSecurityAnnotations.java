package com.ead.backend.annotation;

import org.springframework.security.access.prepost.PreAuthorize;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Enhanced JWT-based security annotations for Automobile Service Management System
 * These annotations work with JWT tokens to check roles dynamically per request
 */
public class JwtSecurityAnnotations {

    /**
     * Admin-only access - requires ADMIN role in JWT token
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("@jwtAuthorizationService.hasRole(authentication, 'ADMIN')")
    public @interface AdminOnly {
    }

    /**
     * Employee access - requires EMPLOYEE or ADMIN role in JWT token
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("@jwtAuthorizationService.hasAnyRole(authentication, 'EMPLOYEE', 'ADMIN')")
    public @interface EmployeeAccess {
    }

    /**
     * Customer access - requires CUSTOMER, EMPLOYEE, or ADMIN role in JWT token
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("@jwtAuthorizationService.hasAnyRole(authentication, 'CUSTOMER', 'EMPLOYEE', 'ADMIN')")
    public @interface CustomerAccess {
    }

    /**
     * Customer or Admin only - requires CUSTOMER or ADMIN role in JWT token
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("@jwtAuthorizationService.hasAnyRole(authentication, 'CUSTOMER', 'ADMIN')")
    public @interface CustomerOrAdmin {
    }

    /**
     * Any authenticated user - requires valid JWT token with any role
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("@jwtAuthorizationService.isAuthenticated(authentication)")
    public @interface Authenticated {
    }

    /**
     * Service management access - for automobile service operations
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("@jwtAuthorizationService.hasAnyRole(authentication, 'EMPLOYEE', 'ADMIN')")
    public @interface ServiceManagement {
    }

    /**
     * Appointment management access - for appointment operations
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("@jwtAuthorizationService.hasAnyRole(authentication, 'EMPLOYEE', 'ADMIN')")
    public @interface AppointmentManagement {
    }
}
