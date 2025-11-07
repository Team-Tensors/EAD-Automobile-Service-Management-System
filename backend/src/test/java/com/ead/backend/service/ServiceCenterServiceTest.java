package com.ead.backend.service;

import com.ead.backend.dto.ServiceCenterDTO;
import com.ead.backend.entity.ServiceCenter;
import com.ead.backend.repository.ServiceCenterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceCenterServiceTest {

    @Mock
    private ServiceCenterRepository repository;

    @InjectMocks
    private ServiceCenterService service;

    private ServiceCenter sampleCenter() {
        ServiceCenter sc = new ServiceCenter();
        sc.setId(UUID.randomUUID());
        sc.setName("Test Center");
        sc.setAddress("1 Test Ave");
        sc.setCity("TestCity");
        sc.setLatitude(BigDecimal.valueOf(12.345678));
        sc.setLongitude(BigDecimal.valueOf(98.7654321));
        sc.setPhone("+123456789");
        sc.setEmail("contact@test.center");
        sc.setOperatingHours("9-5");
        sc.setIsActive(true);
        sc.setCenterSlot(3);
        return sc;
    }

    @BeforeEach
    void setUp() {
        // no-op for now
    }

    @Test
    void getAllActive_returnsMappedDtoList() {
        // Arrange
        ServiceCenter sc = sampleCenter();
        when(repository.findByIsActiveTrue()).thenReturn(List.of(sc));

        // Act
        List<ServiceCenterDTO> results = service.getAllActive();

        // Assert
        assertThat(results).isNotNull().hasSize(1);
        ServiceCenterDTO dto = results.get(0);
        assertThat(dto.getId()).isEqualTo(sc.getId());
        assertThat(dto.getName()).isEqualTo(sc.getName());
        assertThat(dto.getCity()).isEqualTo(sc.getCity());
        assertThat(dto.getCenterSlot()).isEqualTo(sc.getCenterSlot());

        verify(repository).findByIsActiveTrue();
        verifyNoMoreInteractions(repository);
    }

    @Test
    void getAllActive_whenEmpty_returnsEmptyList() {
        when(repository.findByIsActiveTrue()).thenReturn(Collections.emptyList());

        List<ServiceCenterDTO> results = service.getAllActive();

        assertThat(results).isNotNull().isEmpty();
        verify(repository).findByIsActiveTrue();
        verifyNoMoreInteractions(repository);
    }

    @Test
    void getNearby_callsRepositoryAndReturnsDtos() {
        ServiceCenter sc = sampleCenter();
        BigDecimal lat = BigDecimal.valueOf(10.0);
        BigDecimal lng = BigDecimal.valueOf(20.0);
        double radius = 5.0;

        when(repository.findNearbyServiceCenters(eq(lat), eq(lng), eq(radius))).thenReturn(List.of(sc));

        List<ServiceCenterDTO> results = service.getNearby(lat, lng, radius);

        assertThat(results).isNotNull().hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo(sc.getName());

        verify(repository).findNearbyServiceCenters(eq(lat), eq(lng), eq(radius));
        verifyNoMoreInteractions(repository);
    }

    @Test
    void getNearby_whenNoResults_returnsEmptyList() {
        BigDecimal lat = BigDecimal.valueOf(10.0);
        BigDecimal lng = BigDecimal.valueOf(20.0);
        double radius = 1.0;

        when(repository.findNearbyServiceCenters(eq(lat), eq(lng), eq(radius))).thenReturn(Collections.emptyList());

        List<ServiceCenterDTO> results = service.getNearby(lat, lng, radius);

        assertThat(results).isNotNull().isEmpty();
        verify(repository).findNearbyServiceCenters(eq(lat), eq(lng), eq(radius));
        verifyNoMoreInteractions(repository);
    }

    @Test
    void getByCity_returnsCentersInCity() {
        ServiceCenter sc = sampleCenter();
        when(repository.findByCityAndIsActiveTrue(eq("TestCity"))).thenReturn(List.of(sc));

        List<ServiceCenterDTO> results = service.getByCity("TestCity");

        assertThat(results).isNotNull().hasSize(1);
        assertThat(results.get(0).getCity()).isEqualTo("TestCity");

        verify(repository).findByCityAndIsActiveTrue(eq("TestCity"));
        verifyNoMoreInteractions(repository);
    }

    @Test
    void getByCity_whenNoCenters_returnsEmptyList() {
        when(repository.findByCityAndIsActiveTrue(eq("Unknown"))).thenReturn(Collections.emptyList());

        List<ServiceCenterDTO> results = service.getByCity("Unknown");

        assertThat(results).isNotNull().isEmpty();
        verify(repository).findByCityAndIsActiveTrue(eq("Unknown"));
        verifyNoMoreInteractions(repository);
    }

    @Test
    void getWithAvailableSlots_returnsCentersWithSlots() {
        ServiceCenter sc = sampleCenter();
        when(repository.findByIsActiveTrueAndCenterSlotGreaterThan(eq(0))).thenReturn(List.of(sc));

        List<ServiceCenterDTO> results = service.getWithAvailableSlots();

        assertThat(results).isNotNull().hasSize(1);
        assertThat(results.get(0).getCenterSlot()).isGreaterThan(0);

        verify(repository).findByIsActiveTrueAndCenterSlotGreaterThan(eq(0));
        verifyNoMoreInteractions(repository);
    }

    @Test
    void getWithAvailableSlots_whenNone_returnsEmptyList() {
        when(repository.findByIsActiveTrueAndCenterSlotGreaterThan(eq(0))).thenReturn(Collections.emptyList());

        List<ServiceCenterDTO> results = service.getWithAvailableSlots();

        assertThat(results).isNotNull().isEmpty();
        verify(repository).findByIsActiveTrueAndCenterSlotGreaterThan(eq(0));
        verifyNoMoreInteractions(repository);
    }
}
