package com.ead.backend.service;

import com.ead.backend.entity.*;
import com.ead.backend.enums.AppointmentType;
import com.ead.backend.repository.AppointmentRepository;
import com.ead.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerAppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomerAppointmentService service;

    private SecurityContext originalContext;

    @BeforeEach
    void setUp() {
        // keep original context so we can restore after tests
        originalContext = SecurityContextHolder.getContext();
    }

    @AfterEach
    void tearDown() {
        // clear or restore security context to avoid leaking mocks between tests
        SecurityContextHolder.clearContext();
        if (originalContext != null)
            SecurityContextHolder.setContext(originalContext);
    }

    // Helper to create a realistic Appointment with nested relations
    private Appointment createSampleAppointment(UUID userId) {
        User user = new User();
        user.setId(userId);
        user.setEmail("cust@example.com");

        Vehicle vehicle = new Vehicle();
        vehicle.setId(UUID.randomUUID());
        vehicle.setBrand("TestBrand");
        vehicle.setModel("X");
        vehicle.setYear(2020);
        vehicle.setColor("Blue");
        vehicle.setLicensePlate("ABC-123");
        vehicle.setUser(user);

        ServiceOrModification serviceOrModification = new ServiceOrModification();
        serviceOrModification.setId(UUID.randomUUID());
        serviceOrModification.setType(AppointmentType.SERVICE);
        serviceOrModification.setName("Oil Change");
        serviceOrModification.setEstimatedCost(29.99);
        serviceOrModification.setEstimatedTimeMinutes(30);

        ServiceCenter center = new ServiceCenter();
        center.setId(UUID.randomUUID());
        center.setName("Downtown Garage");
        center.setAddress("123 Main St");
        center.setCity("Testville");
        center.setLatitude(BigDecimal.valueOf(1.0));
        center.setLongitude(BigDecimal.valueOf(1.0));

        Appointment appointment = new Appointment();
        appointment.setId(UUID.randomUUID());
        appointment.setUser(user);
        appointment.setVehicle(vehicle);
        appointment.setServiceOrModification(serviceOrModification);
        appointment.setServiceCenter(center);
        appointment.setAppointmentDate(LocalDateTime.now().plusDays(1));
        appointment.setStatus("PENDING");

        // assigned employees (simulate a ManyToMany)
        User emp = new User();
        emp.setId(UUID.randomUUID());
        emp.setEmail("emp@example.com");
        appointment.getAssignedEmployees().add(emp);

        return appointment;
    }

    @Test
    void getCurrentUserDetailedAppointments_returnsAppointmentsWithRelationsLoaded() {
        // Arrange
        UUID userId = UUID.randomUUID();
        String email = "customer@domain.test";

        // Mock security context/authentication to return the email principal
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn(email);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        User user = new User();
        user.setId(userId);
        user.setEmail(email);

        Appointment appt = createSampleAppointment(userId);

        when(userRepository.findByEmail(eq(email))).thenReturn(Optional.of(user));
        when(appointmentRepository.findByUserId(eq(userId))).thenReturn(Collections.singletonList(appt));

        // Act
        List<Appointment> results = service.getCurrentUserDetailedAppointments();

        // Assert
        assertThat(results).isNotNull().hasSize(1);
        Appointment returned = results.get(0);
        // verify nested relations are present and accessible
        assertThat(returned.getUser()).isNotNull();
        assertThat(returned.getUser().getId()).isEqualTo(userId);
        assertThat(returned.getVehicle()).isNotNull();
        assertThat(returned.getServiceOrModification()).isNotNull();
        assertThat(returned.getServiceCenter()).isNotNull();
        assertThat(returned.getAssignedEmployees()).isNotNull().hasSize(1);

        verify(userRepository).findByEmail(eq(email));
        verify(appointmentRepository).findByUserId(eq(userId));
        verifyNoMoreInteractions(userRepository, appointmentRepository);
    }

    @Test
    void getCurrentUserDetailedAppointments_whenNoUser_throwsRuntimeException() {
        // Arrange
        String email = "missing@domain.test";
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn(email);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail(eq(email))).thenReturn(Optional.empty());

        // Act / Assert
        assertThrows(RuntimeException.class, () -> service.getCurrentUserDetailedAppointments());

        verify(userRepository).findByEmail(eq(email));
        verifyNoMoreInteractions(appointmentRepository);
    }

    @Test
    void getCurrentUserDetailedAppointments_returnsEmptyListWhenNoAppointments() {
        // Arrange
        UUID userId = UUID.randomUUID();
        String email = "empty@domain.test";

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn(email);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        User user = new User();
        user.setId(userId);
        user.setEmail(email);

        when(userRepository.findByEmail(eq(email))).thenReturn(Optional.of(user));
        when(appointmentRepository.findByUserId(eq(userId))).thenReturn(Collections.emptyList());

        // Act
        List<Appointment> results = service.getCurrentUserDetailedAppointments();

        // Assert
        assertThat(results).isNotNull().isEmpty();

        verify(userRepository).findByEmail(eq(email));
        verify(appointmentRepository).findByUserId(eq(userId));
        verifyNoMoreInteractions(userRepository, appointmentRepository);
    }
}
