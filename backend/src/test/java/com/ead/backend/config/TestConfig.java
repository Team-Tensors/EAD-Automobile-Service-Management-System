package com.ead.backend.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Test Configuration for Authentication and Authorization Tests
 * Provides beans and configurations specific to testing environment
 */
@TestConfiguration
public class TestConfig {

    /**
     * Password encoder bean for testing
     * Uses BCrypt for secure password hashing
     */
    @Bean
    @Primary
    public PasswordEncoder testPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

