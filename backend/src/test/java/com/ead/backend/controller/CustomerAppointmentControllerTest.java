package com.ead.backend.controller;

import com.ead.backend.dto.DetailedAppointmentDTO;
import com.ead.backend.entity.*;
import com.ead.backend.enums.AppointmentType;
import com.ead.backend.service.CustomerAppointmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerAppointmentControllerTest {

    @Mock
    private CustomerAppointmentService service;

    @InjectMocks
    private CustomerAppointmentController controller;

    private LocalDateTime sampleDate;

    @BeforeEach
    void setUp() {
        sampleDate = LocalDateTime.of(2025, 11, 5, 14, 0, 0);
    }

    private Appointment buildAppointment(String status,
            boolean withAssignedEmployee,
            Integer estimatedTimeHours) {
        Appointment a = new Appointment();
        a.setId(UUID.randomUUID());

        Vehicle v = new Vehicle();
        v.setId(UUID.randomUUID());
        v.setBrand("TestBrand");
        v.setModel("X");
        v.setLicensePlate("ABC123");
        a.setVehicle(v);

        ServiceOrModification s = new ServiceOrModification();
        s.setId(UUID.randomUUID());
        s.setName("Oil Change");
        s.setType(AppointmentType.SERVICE);
        // IMPORTANT: The controller uses estimatedTimeMinutes as HOURS (not minutes) in
        // plusHours().
        // So set estimatedTimeMinutes to the number of hours for test to match
        // controller logic.
        s.setEstimatedTimeMinutes(estimatedTimeHours);
        a.setServiceOrModification(s);

        ServiceCenter sc = new ServiceCenter();
        sc.setId(UUID.randomUUID());
        sc.setName("Central Garage");
        a.setServiceCenter(sc);

        a.setAppointmentDate(sampleDate);
        a.setAppointmentType(AppointmentType.SERVICE);
        a.setStatus(status);

        if (withAssignedEmployee) {
            User emp = new User();
            emp.setId(UUID.randomUUID());
            emp.setFullName("Jane Mechanic");
            Set<User> set = new LinkedHashSet<>();
            set.add(emp);
            a.setAssignedEmployees(set);
        } else {
            a.setAssignedEmployees(new HashSet<>());
        }

        return a;
    }


    @Test
    void getMyDetailedAppointments_nonConfirmedStatus_canStartFalseEvenIfAssigned() {
        Appointment a = buildAppointment("PENDING", true, 3);
        when(service.getCurrentUserDetailedAppointments()).thenReturn(Collections.singletonList(a));

        ResponseEntity<List<DetailedAppointmentDTO>> resp = controller.getMyDetailedAppointments();
        DetailedAppointmentDTO dto = resp.getBody().get(0);

        assertEquals("PENDING", dto.getStatus());
        assertFalse(dto.isCanStart(), "canStart should be false when status is not CONFIRMED");
        assertEquals("Jane Mechanic", dto.getAssignedEmployee());
    }

    @Test
    void getMyDetailedAppointments_estimatedTimeNull_setsEstimatedCompletionTBD() {
        Appointment a = buildAppointment("CONFIRMED", true, null);
        when(service.getCurrentUserDetailedAppointments()).thenReturn(Collections.singletonList(a));

        ResponseEntity<List<DetailedAppointmentDTO>> resp = controller.getMyDetailedAppointments();
        DetailedAppointmentDTO dto = resp.getBody().get(0);

        assertEquals("TBD", dto.getEstimatedCompletion());
    }

    @Test
    void getMyDetailedAppointments_emptyList_returnsEmptyBody() {
        when(service.getCurrentUserDetailedAppointments()).thenReturn(Collections.emptyList());

        ResponseEntity<List<DetailedAppointmentDTO>> resp = controller.getMyDetailedAppointments();

        assertNotNull(resp.getBody());
        assertTrue(resp.getBody().isEmpty());
        verify(service).getCurrentUserDetailedAppointments();
    }
}
