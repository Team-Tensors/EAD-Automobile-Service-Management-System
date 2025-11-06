package com.ead.backend.service;

import com.ead.backend.dto.AdminEmployeeCenterDTO;
import com.ead.backend.entity.EmployeeCenter;
import com.ead.backend.entity.User;
import com.ead.backend.repository.EmployeeCenterRepository;
import com.ead.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final EmployeeCenterRepository employeeCenterRepository;

    public List<AdminEmployeeCenterDTO> getAllEmployeesWithServiceCenter() {
        List<User> employees = userRepository.findByRoleName("EMPLOYEE");

        return employees.stream().map(emp -> {
            AdminEmployeeCenterDTO dto = new AdminEmployeeCenterDTO();
            dto.setEmployeeId(emp.getId());
            dto.setFullName(emp.getFullName());
            dto.setEmail(emp.getEmail());
            dto.setPhoneNumber(emp.getPhoneNumber());

            Optional<EmployeeCenter> assignment = employeeCenterRepository.findByEmployeeId(emp.getId());
            if (assignment.isPresent() && assignment.get().getServiceCenter() != null) {
                dto.setServiceCenterId(assignment.get().getServiceCenter().getId());
                dto.setServiceCenterName(assignment.get().getServiceCenter().getName());
            } else {
                dto.setServiceCenterId(null);
                dto.setServiceCenterName(null);
            }

            return dto;
        }).collect(Collectors.toList());
    }
}



