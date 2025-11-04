package com.ead.backend.repository;

import com.ead.backend.entity.ShiftSchedules;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ShiftSchedulesRepository extends JpaRepository<ShiftSchedules, UUID> {
    @Query("""
        SELECT s FROM ShiftSchedules s
        WHERE s.employee.id = :employeeId
          AND ((s.startTime <= :endTime) AND (s.endTime >= :startTime))
    """)
    List<ShiftSchedules> findConflictingShifts(UUID employeeId, LocalDateTime startTime, LocalDateTime endTime);
}
