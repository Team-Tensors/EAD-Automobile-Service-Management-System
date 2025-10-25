package com.ead.backend.repository;

import com.ead.backend.entity.ModificationType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModificationTypeRepository extends JpaRepository<ModificationType, Long> {}