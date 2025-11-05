package com.ead.backend.repository;

import com.ead.backend.entity.ServiceCenterSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceCenterSlotRepository extends JpaRepository<ServiceCenterSlot, UUID> {

    @Query("SELECT s FROM ServiceCenterSlot s " +
           "WHERE s.serviceCenter.id = :serviceCenterId AND s.isBooked = false")
    List<ServiceCenterSlot> findAvailableSlotsByServiceCenterId(@Param("serviceCenterId") UUID serviceCenterId);

    @Query("SELECT s.slotNumber FROM ServiceCenterSlot s WHERE s.appointmentId = :appointmentId")
    Integer findSlotNumberByAppointmentId(@Param("appointmentId") UUID appointmentId);

    @Modifying
    @Query("UPDATE ServiceCenterSlot s SET s.isBooked = false, s.appointmentId = null " +
           "WHERE s.appointmentId = :appointmentId")
    void clearSlotByAppointmentId(@Param("appointmentId") UUID appointmentId);
}