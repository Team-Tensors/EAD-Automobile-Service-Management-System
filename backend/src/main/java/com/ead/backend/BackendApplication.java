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




@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    CommandLineRunner initData(UserRepository userRepo, RoleRepository roleRepo, PasswordEncoder encoder) {
        return args -> {
            Role customerRole = roleRepo.save(new Role("Customer"));
            Role employee = roleRepo.save(new Role("EMPLOYEE"));
            Role admin = roleRepo.save(new Role("ADMIN"));

            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@example.com");
            adminUser.setPassword(encoder.encode("adminpass"));  // Hash password
            adminUser.getRoles().add(admin);
            userRepo.save(adminUser);
        };
    }

}
