package com.ead.backend.controller;

import com.ead.backend.annotation.JwtSecurityAnnotations;
import com.ead.backend.dto.ShiftScheduleAppointmentsDTO;
import com.ead.backend.dto.ShiftScheduleRequestDTO;
import com.ead.backend.service.ShiftScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/shift")
public class ShiftScheduleController {

    private final ShiftScheduleService shiftScheduleService;
    public ShiftScheduleController(ShiftScheduleService shiftScheduleService){

        this.shiftScheduleService = shiftScheduleService;
    }

    /**
     * Get all pending appointments for assignment to employees Admin only
     */
    @JwtSecurityAnnotations.AdminOnly
    @GetMapping("/pending-appointments")
    public ResponseEntity<List<ShiftScheduleAppointmentsDTO>> getPendingAppointments(){
        List<ShiftScheduleAppointmentsDTO> pendingAppointments = shiftScheduleService.getPendingAppointments();
        return ResponseEntity.ok(pendingAppointments);

    }

    /**
     * Get available appointments for self-assignment
     *
     */

    @JwtSecurityAnnotations.EmployeeAccess
    @GetMapping("/possible-appointments")
    public ResponseEntity<List<ShiftScheduleAppointmentsDTO>> getPossibleAppointments(Authentication authentication){
        try {
            String email = authentication.getName();
            List<ShiftScheduleAppointmentsDTO> possibleAppointments = shiftScheduleService.getAvailableAppointmentsForEmployee(email);
            return ResponseEntity.ok(possibleAppointments);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).build();
        }

    }

    @JwtSecurityAnnotations.AdminOnly
    @GetMapping("/possible-employees/{appointmentId}")
    public void getPossibleEmployees(@PathVariable("appointmentId") Long appointmentId){}

    @JwtSecurityAnnotations.EmployeeAccess
    @PostMapping("/assign-employee")
    public void assignEmployee(@RequestBody ShiftScheduleRequestDTO shiftScheduleRequestDTO){
    }

}
