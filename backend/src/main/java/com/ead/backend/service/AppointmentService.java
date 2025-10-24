package com.ead.backend.service;

import com.ead.backend.entity.Appointment;
import com.ead.backend.entity.ServiceType;
import com.ead.backend.entity.User;
import com.ead.backend.entity.Vehicle;
import com.ead.backend.repository.AppointmentRepository;
import com.ead.backend.repository.ServiceTypeRepository;
import com.ead.backend.repository.UserRepository;
import com.ead.backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    /**
     * Book an appointment using entity
     */
    public Appointment createAppointment(Appointment appointment) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate vehicle exists and belongs to user
        Vehicle vehicle = vehicleRepository.findById(appointment.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!vehicle.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only book appointments for your own vehicle");
        }

        // Validate service type
        ServiceType serviceType = serviceTypeRepository.findById(appointment.getServiceType().getId())
                .orElseThrow(() -> new RuntimeException("Service type not found"));

        // Validate date
        if (appointment.getAppointmentDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Appointment date must be in the future");
        }

        // Set relations
        appointment.setUser(user);
        appointment.setVehicle(vehicle);
        appointment.setServiceType(serviceType);
        appointment.setStatus("PENDING");

        return appointmentRepository.save(appointment);
    }

    /**
     * Get all appointments of the logged-in user
     */
    public List<Appointment> getUserAppointments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return appointmentRepository.findByUserId(user.getId());
    }
}