package com.ead.backend.service;
import com.ead.backend.entity.User;
import com.ead.backend.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);
    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("=== ATTEMPTING USER LOOKUP ===");
        logger.info("Looking up user with email: {}", username);

        // Note: Spring Security still calls this method "loadUserByUsername"
        // but we're using it with email as the identifier
        Optional<User> userByEmail = userRepository.findByEmail(username);
        logger.info("Search by email '{}' result: {}", username, userByEmail.isPresent() ? "FOUND" : "NOT FOUND");

        User user = userByEmail
                .orElseThrow(() -> {
                    logger.error("User not found with email: {}", username);
                    return new UsernameNotFoundException("User not found with email: " + username);
                });

        logger.info("User found! ID: {}, Email: {}, Active: {}",
                   user.getId(), user.getEmail(), user.getActive());
        logger.info("User roles: {}", user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toList()));

        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
                .collect(Collectors.toList());

        logger.info("Generated authorities: {}", authorities);

        // Use email as the username for Spring Security's UserDetails
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), authorities);
    }

    /**
     * Get User entity by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}