package com.ead.backend.repository;

import com.ead.backend.entity.ServiceCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceCenterRepository extends JpaRepository<ServiceCenter, UUID> {

    List<ServiceCenter> findByIsActiveTrue();

    @Query("SELECT sc FROM ServiceCenter sc WHERE sc.isActive = true " +
            "AND (6371 * acos(cos(radians(:lat)) * cos(radians(sc.latitude)) * " +
            "cos(radians(sc.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
            "sin(radians(sc.latitude)))) < :radius")
    List<ServiceCenter> findNearbyServiceCenters(@Param("lat") BigDecimal latitude,
            @Param("lng") BigDecimal longitude,
            @Param("radius") double radiusInKm);

    List<ServiceCenter> findByCityAndIsActiveTrue(String city);
}