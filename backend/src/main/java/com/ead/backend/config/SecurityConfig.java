package com.ead.backend.config;

import com.ead.backend.filter.JwtAuthenticationFilter;
import com.ead.backend.filter.SseTokenAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
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
    private final SseTokenAuthenticationFilter sseTokenAuthenticationFilter;

    public SecurityConfig(OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler, SseTokenAuthenticationFilter sseTokenAuthenticationFilter) {
        this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
        this.sseTokenAuthenticationFilter = sseTokenAuthenticationFilter;
    }

    @Bean
    @Profile({"dev", "local", "default"})
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/v3/api-docs",
            "/swagger-resources/**",
            "/webjars/**",
            "/swagger-ui/index.html"
        );
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
            .csrf(AbstractHttpConfigurer::disable)

            // Role-based authorization rules
            .authorizeHttpRequests(auth -> auth
                // Swagger endpoints - MUST BE FIRST to avoid conflicts
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/v3/api-docs",
                    "/swagger-resources/**",
                    "/webjars/**",
                    "/swagger-ui/index.html",
                    "/api-docs/**"
                ).permitAll()

                // Public endpoints (no authentication required)
                .requestMatchers("/health", "/health/debug", "/test", "/h2-console/**").permitAll()
                .requestMatchers("/auth/login", "/auth/register", "/auth/register/customer", "/auth/register/employee", "/auth/refresh-token").permitAll()
                .requestMatchers("/auth/check-email/**", "/auth/check-username/**").permitAll()
                .requestMatchers("/auth/forgot-password", "/auth/reset-password", "/auth/verify-reset-token/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/chat/**").permitAll()

                // WebSocket endpoints
                .requestMatchers("/ws-chat/**").permitAll()

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
            .formLogin(AbstractHttpConfigurer::disable)

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

                .addFilterBefore(sseTokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // Only add the JWT authentication filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        http.headers(headers -> headers
            .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
        );

        return http.build();
    }
}
