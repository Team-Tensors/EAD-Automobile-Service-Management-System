package com.ead.backend.repository;

import com.ead.backend.entity.AppointmentType;
import com.ead.backend.entity.ServiceOrModification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceOrModificationRepository extends JpaRepository<ServiceOrModification, UUID> {
    List<ServiceOrModification> findByType(AppointmentType type);
    Optional<ServiceOrModification> findByUniqueName(String uniqueName);
}