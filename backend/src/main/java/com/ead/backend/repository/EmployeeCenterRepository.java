package com.ead.backend.repository;

import com.ead.backend.entity.EmployeeCenter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmployeeCenterRepository extends JpaRepository<EmployeeCenter, UUID> {
    Optional<EmployeeCenter> findByEmployeeId(UUID employeeId);
}
