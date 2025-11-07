package com.ead.backend.controller;

import com.ead.backend.dto.ServiceCenterDTO;
import com.ead.backend.service.ServiceCenterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ServiceCenterControllerTest {

    @Mock
    private ServiceCenterService serviceCenterService;

    @InjectMocks
    private ServiceCenterController controller;

    private ServiceCenterDTO mockServiceCenter;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockServiceCenter = new ServiceCenterDTO();
        // Set up mock service center data
        mockServiceCenter.setId(new UUID(0, 1));
        mockServiceCenter.setName("Test Center");
    }

    @Test
    void getAllWithServices_WhenCentersExist_ReturnsServiceCentersList() {
        // Arrange
        List<ServiceCenterDTO> expectedCenters = Arrays.asList(mockServiceCenter);
        when(serviceCenterService.getAllActive()).thenReturn(expectedCenters);

        // Act
        ResponseEntity<List<ServiceCenterDTO>> response = controller.getAllWithServices();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedCenters, response.getBody());
        verify(serviceCenterService).getAllActive();
    }

    @Test
    void getAllWithServices_WhenNoCenters_ReturnsEmptyList() {
        // Arrange
        when(serviceCenterService.getAllActive()).thenReturn(Collections.emptyList());

        // Act
        ResponseEntity<List<ServiceCenterDTO>> response = controller.getAllWithServices();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isEmpty());
        verify(serviceCenterService).getAllActive();
    }

    @Test
    void getNearbyWithServices_WhenCentersExist_ReturnsNearbyServiceCenters() {
        // Arrange
        BigDecimal lat = new BigDecimal("1.2345");
        BigDecimal lng = new BigDecimal("2.3456");
        double radius = 50.0;
        List<ServiceCenterDTO> expectedCenters = Arrays.asList(mockServiceCenter);
        when(serviceCenterService.getNearby(lat, lng, radius)).thenReturn(expectedCenters);

        // Act
        ResponseEntity<List<ServiceCenterDTO>> response = controller.getNearbyWithServices(lat, lng, radius);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedCenters, response.getBody());
        verify(serviceCenterService).getNearby(lat, lng, radius);
    }

    @Test
    void getNearbyWithServices_WhenNoCentersNearby_ReturnsEmptyList() {
        // Arrange
        BigDecimal lat = new BigDecimal("1.2345");
        BigDecimal lng = new BigDecimal("2.3456");
        double radius = 50.0;
        when(serviceCenterService.getNearby(lat, lng, radius)).thenReturn(Collections.emptyList());

        // Act
        ResponseEntity<List<ServiceCenterDTO>> response = controller.getNearbyWithServices(lat, lng, radius);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isEmpty());
        verify(serviceCenterService).getNearby(lat, lng, radius);
    }

    @Test
    void getWithAvailableSlots_WhenSlotsAvailable_ReturnsServiceCentersList() {
        // Arrange
        List<ServiceCenterDTO> expectedCenters = Arrays.asList(mockServiceCenter);
        when(serviceCenterService.getWithAvailableSlots()).thenReturn(expectedCenters);

        // Act
        ResponseEntity<List<ServiceCenterDTO>> response = controller.getWithAvailableSlots();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedCenters, response.getBody());
        verify(serviceCenterService).getWithAvailableSlots();
    }

    @Test
    void getWithAvailableSlots_WhenNoSlotsAvailable_ReturnsEmptyList() {
        // Arrange
        when(serviceCenterService.getWithAvailableSlots()).thenReturn(Collections.emptyList());

        // Act
        ResponseEntity<List<ServiceCenterDTO>> response = controller.getWithAvailableSlots();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isEmpty());
        verify(serviceCenterService).getWithAvailableSlots();
    }
}