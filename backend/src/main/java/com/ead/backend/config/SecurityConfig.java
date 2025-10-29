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

import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    public SecurityConfig(OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler) {
        this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
    }

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
                    config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173", "https://team-tensors.github.io", "https://drivecare.pcgenerals.com"));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))

                // Disable CSRF for REST API
                .csrf(csrf -> csrf.disable())

                // Role-based authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (no authentication required)
                        .requestMatchers("/auth/login", "/auth/register", "/auth/register/customer", "/auth/register/employee", "/auth/refresh-token").permitAll()
                        .requestMatchers("/auth/check-email/**", "/auth/check-username/**").permitAll()
                        .requestMatchers("/auth/forgot-password", "/auth/reset-password", "/auth/verify-reset-token/**").permitAll()
                        .requestMatchers("/health", "/h2-console/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // OAuth2 endpoints - allow all OAuth2 related paths
                        .requestMatchers("/oauth2/**", "/login/oauth2/**", "/auth/oauth2/**").permitAll()

                        // Protected auth endpoints (require authentication)
                        .requestMatchers("/auth/profile", "/auth/logout", "/auth/logout-all", "/auth/active-sessions").authenticated()

                        // Admin-only endpoints
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // Employee endpoints (employees and admins can access)
                        .requestMatchers("/employee/**", "/services/manage/**", "/appointments/manage/**", "/projects/manage/**")
                        .hasAnyRole("EMPLOYEE", "ADMIN")

                        // Customer endpoints (customers, employees, and admins can access)
                        .requestMatchers("/customer/**", "/appointments/book/**", "/services/view/**", "/projects/request/**")
                        .hasAnyRole("CUSTOMER", "EMPLOYEE", "ADMIN")

                        // Protected endpoints requiring any authenticated user
                        .requestMatchers("/profile/**", "/dashboard/**").authenticated()

                        .requestMatchers("/notifications/**").authenticated()

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )

                // Stateless session management for JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // OAuth2 Login Configuration with custom success handler
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        .failureUrl("/auth/login?error=oauth_failed")
                        .permitAll()
                )

                // Disable form login to prevent redirects
                .formLogin(form -> form.disable())

                // Configure exception handling
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Access Denied\",\"message\":\"Insufficient privileges\"}");
                        })
                )

                // Only add the JWT authentication filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        http.headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())
        );

        return http.build();
    }
}
