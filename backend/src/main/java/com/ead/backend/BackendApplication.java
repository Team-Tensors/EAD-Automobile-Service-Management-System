package com.ead.backend;

import com.ead.backend.entity.Role;
import com.ead.backend.entity.User;
import com.ead.backend.repository.RoleRepository;
import com.ead.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.beans.factory.annotation.Autowired;

import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@EnableScheduling
@Slf4j
public class BackendApplication {

    @Autowired
    private Environment env;

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

    @EventListener(ApplicationReadyEvent.class)
    public void printSwaggerUrl() {
        String activeProfile = env.getProperty("spring.profiles.active", "dev");

        // Only show Swagger URL in development profiles
        if ("dev".equals(activeProfile) || "local".equals(activeProfile)) {
            String port = env.getProperty("server.port", "8080");
            String contextPath = env.getProperty("server.servlet.context-path", "");

            String swaggerUrl = "http://localhost:" + port + contextPath + "/swagger-ui/index.html";
            String apiDocsUrl = "http://localhost:" + port + contextPath + "/v3/api-docs";

            log.info("\n" +
                    "═══════════════════════════════════════════════════════════\n" +
                    "DRIVECARE API STARTED SUCCESSFULLY!\n" +
                    "═══════════════════════════════════════════════════════════\n" +
                    "Swagger UI: {}\n" +
                    "API Docs:   {}\n" +
                    "Profile:    {}\n" +
                    "Ready to manage your automobile services!\n" +
                    "═══════════════════════════════════════════════════════════",
                    swaggerUrl, apiDocsUrl, activeProfile);
        } else {
            log.info("Application started successfully in '{}' profile", activeProfile);
        }
    }
}
