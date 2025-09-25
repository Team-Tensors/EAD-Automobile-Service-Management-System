package com.ead.backend.config;

import com.ead.backend.entity.Role;
import com.ead.backend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(1) // Ensure this runs before other components
public class RoleDataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initializeRoles();
    }

    private void initializeRoles() {
        // Always check and create missing roles
        createRoleIfNotExists("CUSTOMER");
        createRoleIfNotExists("EMPLOYEE");
        createRoleIfNotExists("ADMIN");

        System.out.println("Role initialization complete. Current roles:");
        roleRepository.findAll().forEach(role ->
            System.out.println("- ID: " + role.getId() + ", Name: '" + role.getName() + "'"));
    }

    private void createRoleIfNotExists(String roleName) {
        try {
            if (roleRepository.findByName(roleName).isEmpty()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.saveAndFlush(role);
                System.out.println("Created role: " + roleName);
            } else {
                System.out.println("Role already exists: " + roleName);
            }
        } catch (Exception e) {
            // Handle unique constraint violation - role might have been created by another thread
            if (e.getMessage().contains("Unique index") || e.getMessage().contains("23505")) {
                System.out.println("Role " + roleName + " already exists (caught unique constraint violation)");
            } else {
                System.err.println("Error creating role " + roleName + ": " + e.getMessage());
                throw e;
            }
        }
    }
}
