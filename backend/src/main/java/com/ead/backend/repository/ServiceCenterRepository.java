package com.ead.backend.repository;

import com.ead.backend.entity.ServiceCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceCenterRepository extends JpaRepository<ServiceCenter, Long> {
    
    List<ServiceCenter> findByIsActiveTrue();
    
    // Find service centers that offer a specific service type
    @Query("SELECT sc FROM ServiceCenter sc JOIN sc.serviceTypes st WHERE st.id = :serviceTypeId AND sc.isActive = true")
    List<ServiceCenter> findByServiceTypeId(@Param("serviceTypeId") Long serviceTypeId);
    
    // Find service centers by service type name
    @Query("SELECT sc FROM ServiceCenter sc JOIN sc.serviceTypes st WHERE LOWER(st.name) LIKE LOWER(CONCAT('%', :serviceName, '%')) AND sc.isActive = true")
    List<ServiceCenter> findByServiceTypeName(@Param("serviceName") String serviceName);
    
    @Query("SELECT sc FROM ServiceCenter sc WHERE sc.isActive = true " +
           "AND (6371 * acos(cos(radians(:lat)) * cos(radians(sc.latitude)) * " +
           "cos(radians(sc.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(sc.latitude)))) < :radius")
    List<ServiceCenter> findNearbyServiceCenters(@Param("lat") BigDecimal latitude,
                                                @Param("lng") BigDecimal longitude,
                                                @Param("radius") double radiusInKm);
    
    List<ServiceCenter> findByCityAndIsActiveTrue(String city);
    
    // Eagerly fetch service centers with their service types
    @Query("SELECT DISTINCT sc FROM ServiceCenter sc LEFT JOIN FETCH sc.serviceTypes WHERE sc.isActive = true")
    List<ServiceCenter> findAllWithServiceTypes();
    
    // Find specific service center with service types
    @Query("SELECT sc FROM ServiceCenter sc LEFT JOIN FETCH sc.serviceTypes WHERE sc.id = :id AND sc.isActive = true")
    Optional<ServiceCenter> findByIdWithServiceTypes(@Param("id") Long id);
}