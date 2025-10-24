package com.ead.backend;

import com.ead.backend.entity.Role;
import com.ead.backend.entity.User;
import com.ead.backend.repository.RoleRepository;
import com.ead.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    @Order(2) // Run after RoleDataInitializer
    CommandLineRunner initData(UserRepository userRepo, RoleRepository roleRepo, PasswordEncoder encoder) {
        return args -> {
            // Roles are now created by RoleDataInitializer, just find them
            Role adminRole = roleRepo.findByName("ADMIN")
                .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

            // Create admin user only if it doesn't exist
            if (userRepo.findByEmail("admin@example.com").isEmpty()) {
                User adminUser = new User();
//                adminUser.setUsername("admin");
                adminUser.setEmail("admin@example.com");
                adminUser.setFullName("Admin");
                adminUser.setPassword(encoder.encode("adminpass"));
                adminUser.getRoles().add(adminRole);
                userRepo.save(adminUser);
                System.out.println("Created admin user: admin@example.com");
            } else {
                System.out.println("Admin user already exists");
            }
        };
    }
}
