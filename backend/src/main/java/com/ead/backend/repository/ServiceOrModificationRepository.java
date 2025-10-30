package com.ead.backend.repository;

import com.ead.backend.entity.ServiceOrModification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ServiceOrModificationRepository extends JpaRepository<ServiceOrModification, Long> {
    Optional<ServiceOrModification> findByUniqueName(String uniqueName);
}