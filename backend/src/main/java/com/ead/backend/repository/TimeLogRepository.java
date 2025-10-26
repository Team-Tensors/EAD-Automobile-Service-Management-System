package com.ead.backend.repository;

import com.ead.backend.entity.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    // Retrieve all time logs for a given appointment and user
    List<TimeLog> findByAppointmentIdAndUserId(Long appointmentId, Long userId);
}
