package com.ead.backend.service;   // same package as AppointmentService

import com.ead.backend.entity.*;
import com.ead.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service that ONLY returns **detailed** appointments for the logged-in customer.
 * It lives in the SAME PACKAGE as AppointmentService so it can reuse the private helper.
 */
@Service
public class CustomerAppointmentService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private UserRepository userRepository;   // needed for getCurrentUser()

    /**
     * Returns **all** appointments of the current user with **all lazy relations loaded**.
     */
    @Transactional(readOnly = true)
    public List<Appointment> getCurrentUserDetailedAppointments() {
        User currentUser = getCurrentUser();                 // <-- RE-USED FROM AppointmentService
        return appointmentRepository.findByUserId(currentUser.getId())
                .stream()
                .peek(a -> {
                    // Force lazy loads – required for DTO mapping
                    a.getVehicle().getId();
                    a.getServiceOrModification().getId();
                    a.getServiceCenter().getId();
                    a.getAssignedEmployees().size();   // triggers fetch
                })
                .toList();
    }

    // -----------------------------------------------------------------
    //  PRIVATE HELPER – **identical** to the one in AppointmentService
    // -----------------------------------------------------------------
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();                     // email is the principal in JWT
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}