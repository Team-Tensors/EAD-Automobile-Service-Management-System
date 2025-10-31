package com.ead.backend.controller;

import com.ead.backend.annotation.JwtSecurityAnnotations;
import com.ead.backend.dto.ShiftScheduleRequestDTO;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/shift")
public class ShiftScheduleController {

    public ShiftScheduleController(){

    }

    @JwtSecurityAnnotations.AdminOnly
    @GetMapping("/pending-appointments")
    public void getPendingAppointments(){
    }

    @JwtSecurityAnnotations.EmployeeAccess
    @GetMapping("/possible-appointments/{employeeId}")
    public void getPossibleAppointments(@PathVariable("employeeId") Long employeeId){
    }

    @JwtSecurityAnnotations.AdminOnly
    @GetMapping("/possible-employees/{appointmentId}")
    public void getPossibleEmployees(@PathVariable("appointmentId") Long appointmentId){}

    @JwtSecurityAnnotations.EmployeeAccess
    @PostMapping("/assign-employee")
    public void assignEmployee(@RequestBody ShiftScheduleRequestDTO shiftScheduleRequestDTO){
    }

}
