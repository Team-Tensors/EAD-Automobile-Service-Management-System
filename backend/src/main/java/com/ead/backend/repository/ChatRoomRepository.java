package com.ead.backend.repository;

import com.ead.backend.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {

    Optional<ChatRoom> findByAppointment_Id(UUID appointmentId);

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.customer.id = :userId OR cr.employee.id = :userId ORDER BY cr.lastMessageAt DESC")
    List<ChatRoom> findAllByUserId(@Param("userId") UUID userId);

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.customer.id = :customerId ORDER BY cr.lastMessageAt DESC")
    List<ChatRoom> findAllByCustomerId(@Param("customerId") UUID customerId);

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.employee.id = :employeeId ORDER BY cr.lastMessageAt DESC")
    List<ChatRoom> findAllByEmployeeId(@Param("employeeId") UUID employeeId);

    boolean existsByAppointment_Id(UUID appointmentId);
}

