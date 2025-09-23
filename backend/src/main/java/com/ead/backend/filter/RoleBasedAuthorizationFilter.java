package com.ead.backend.filter;

import com.ead.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class RoleBasedAuthorizationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RoleBasedAuthorizationFilter.class);
    private final JwtUtil jwtUtil;

    public RoleBasedAuthorizationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        // Skip authorization for public endpoints
        if (isPublicEndpoint(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Get JWT token from Authorization header
        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // If no token and endpoint requires authentication, let Spring Security handle it
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Check role-based authorization for protected endpoints
            if (!hasRequiredRole(token, requestURI, method)) {
                sendAccessDeniedResponse(response, "Access denied: Insufficient role privileges for " + requestURI);
                return;
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            sendAccessDeniedResponse(response, "Authorization error: " + e.getMessage());
        }
    }

    private boolean isPublicEndpoint(String requestURI) {
        List<String> publicPaths = Arrays.asList(
            "/auth/login",
            "/auth/register/customer",
            "/auth/refresh-token",
            "/auth/check-email",
            "/auth/check-username",
            "/health",
            "/h2-console",
            "/swagger-ui",
            "/v3/api-docs",
            "/error",
            "/oauth2",
            "/login"
        );

        return publicPaths.stream().anyMatch(requestURI::startsWith);
    }

    private boolean hasRequiredRole(String token, String requestURI, String method) {
        try {
            // Admin-only endpoints
            if (isAdminOnlyEndpoint(requestURI)) {
                return jwtUtil.hasRole(token, "ADMIN");
            }

            // Employee endpoints (employees and admins can access)
            if (isEmployeeEndpoint(requestURI)) {
                return jwtUtil.hasAnyRole(token, "EMPLOYEE", "ADMIN");
            }

            // Customer endpoints (customers, employees, and admins can access)
            if (isCustomerEndpoint(requestURI)) {
                return jwtUtil.hasAnyRole(token, "CUSTOMER", "EMPLOYEE", "ADMIN");
            }

            // Protected endpoints requiring any authenticated user
            if (isProtectedEndpoint(requestURI)) {
                List<String> roles = jwtUtil.extractRoles(token);
                return !roles.isEmpty(); // Any authenticated user with roles
            }

            // Default: allow if user is authenticated
            return SecurityContextHolder.getContext().getAuthentication() != null;

        } catch (Exception e) {
            logger.error("Error checking roles for token: {}", e.getMessage());
            return false;
        }
    }

    private boolean isAdminOnlyEndpoint(String requestURI) {
        return requestURI.startsWith("/admin/") ||
               requestURI.equals("/auth/register/employee");
    }

    private boolean isEmployeeEndpoint(String requestURI) {
        return requestURI.startsWith("/employee/") ||
               requestURI.startsWith("/services/manage/") ||
               requestURI.startsWith("/appointments/manage/") ||
               requestURI.startsWith("/projects/manage/");
    }

    private boolean isCustomerEndpoint(String requestURI) {
        return requestURI.startsWith("/customer/") ||
               requestURI.startsWith("/appointments/book") ||
               requestURI.startsWith("/services/view/") ||
               requestURI.startsWith("/projects/request");
    }

    private boolean isProtectedEndpoint(String requestURI) {
        return requestURI.startsWith("/profile/") ||
               requestURI.startsWith("/dashboard/") ||
               requestURI.startsWith("/auth/logout") ||
               requestURI.startsWith("/auth/active-sessions");
    }

    private void sendAccessDeniedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write(String.format(
            "{\"error\":\"Access Denied\",\"message\":\"%s\",\"timestamp\":\"%s\"}",
            message, java.time.Instant.now().toString()));
    }
}
