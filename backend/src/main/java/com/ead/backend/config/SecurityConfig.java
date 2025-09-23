package com.ead.backend.config;

import com.ead.backend.filter.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse; // Fixed import
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        http
            // CORS Configuration for React frontend
            .cors(cors -> cors.configurationSource(request -> {
                var config = new org.springframework.web.cors.CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                return config;
            }))

            // Disable CSRF for REST API
            .csrf(csrf -> csrf.disable())

            // Authorization rules for Automobile Service Management System
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/auth/**", "/oauth2/**", "/login/**").permitAll()
                .requestMatchers("/health", "/h2-console/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/error").permitAll() // Allow error endpoint

                // Admin-only endpoints
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/auth/register/employee").hasRole("ADMIN") // Only admin can create employees

                // Employee endpoints (employees and admins)
                .requestMatchers("/employee/**").hasAnyRole("EMPLOYEE", "ADMIN")
                .requestMatchers("/services/manage/**").hasAnyRole("EMPLOYEE", "ADMIN")
                .requestMatchers("/appointments/manage/**").hasAnyRole("EMPLOYEE", "ADMIN")
                .requestMatchers("/projects/manage/**").hasAnyRole("EMPLOYEE", "ADMIN")

                // Customer endpoints (customers, employees, and admins)
                .requestMatchers("/customer/**").hasAnyRole("CUSTOMER", "EMPLOYEE", "ADMIN")
                .requestMatchers("/appointments/book").hasAnyRole("CUSTOMER", "ADMIN")
                .requestMatchers("/services/view/**").hasAnyRole("CUSTOMER", "EMPLOYEE", "ADMIN")
                .requestMatchers("/projects/request").hasAnyRole("CUSTOMER", "ADMIN")

                // Protected endpoints requiring any authenticated user
                .requestMatchers("/profile/**").authenticated()
                .requestMatchers("/dashboard/**").authenticated()

                // All other requests require authentication
                .anyRequest().authenticated()
            )

            // Stateless session management for JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // OAuth2 Login Configuration - Fixed to prevent redirect loops
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("/auth/oauth2/success", true) // Redirect to our handler
                .failureUrl("/auth/login?error=oauth_failed")
            )

            // Disable form login to prevent redirects
            .formLogin(form -> form.disable())

            // Configure exception handling
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"" + authException.getMessage() + "\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Access Denied\",\"message\":\"" + accessDeniedException.getMessage() + "\"}");
                })
            )

            // Add JWT filter before UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        // Allow H2 console frame options (for development) - Updated for Spring Boot 3.x
        http.headers(headers -> headers
            .frameOptions(frame -> frame.sameOrigin())
        );

        return http.build();
    }
}
