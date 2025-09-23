package com.ead.backend.service;

import com.ead.backend.dto.AuthResponse;
import com.ead.backend.dto.LoginRequest;
import com.ead.backend.dto.SignupRequest;
import com.ead.backend.dto.MessageResponse;
import com.ead.backend.repository.RoleRepository;
import com.ead.backend.repository.UserRepository;
import com.ead.backend.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ead.backend.entity.User;
import com.ead.backend.entity.Role;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        // Load user details and generate token
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        // Get user from database for additional info
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Extract role names
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new AuthResponse(token, user.getId(), user.getUsername(),
                               user.getEmail(), user.getFullName(), roles);
    }

    @Transactional
    public MessageResponse signup(SignupRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new MessageResponse("Email is already taken", false);
        }

        // Check if username already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return new MessageResponse("Username is already taken", false);
        }

        // Create new user with all fields
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setOauthProvider("local"); // Local registration
        user.setActive(true);

        // Validate and set role
        String roleName = validateAndGetRole(request.getRole());
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

        user.getRoles().add(role);
        userRepository.save(user);

        return new MessageResponse("User registered successfully as " + roleName);
    }

    @Transactional
    public User createOrUpdateOAuthUser(String email, String name, String oauthProvider, String oauthId) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            // Update existing user with OAuth info if not already set
            User user = existingUser.get();
            if (user.getOauthProvider() == null) {
                user.setOauthProvider(oauthProvider);
                user.setOauthId(oauthId);
                return userRepository.save(user);
            }
            return user;
        } else {
            // Create new OAuth user with CUSTOMER role by default
            User newUser = new User();
            newUser.setUsername(email);
            newUser.setEmail(email);
            newUser.setFullName(name);
            newUser.setPassword(passwordEncoder.encode("oauth_" + System.currentTimeMillis())); // Dummy password
            newUser.setOauthProvider(oauthProvider);
            newUser.setOauthId(oauthId);
            newUser.setActive(true);

            // Default role for OAuth users is CUSTOMER
            Role customerRole = roleRepository.findByName("CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));
            newUser.getRoles().add(customerRole);

            return userRepository.save(newUser);
        }
    }

    public AuthResponse generateTokenForOAuthUser(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new AuthResponse(token, user.getId(), user.getUsername(),
                               user.getEmail(), user.getFullName(), roles);
    }

    private String validateAndGetRole(String requestedRole) {
        if (requestedRole == null || requestedRole.trim().isEmpty()) {
            return "CUSTOMER"; // Default role
        }

        String roleName = requestedRole.toUpperCase().trim();

        // Validate role exists in enum
        switch (roleName) {
            case "CUSTOMER":
            case "EMPLOYEE":
            case "ADMIN":
                return roleName;
            default:
                throw new RuntimeException("Invalid role: " + requestedRole +
                    ". Valid roles are: CUSTOMER, EMPLOYEE, ADMIN");
        }
    }

    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
