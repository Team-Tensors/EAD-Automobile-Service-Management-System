package com.ead.backend.service;

import com.ead.backend.dto.AdminEmployeeCenterDTO;
import com.ead.backend.entity.EmployeeCenter;
import com.ead.backend.entity.ServiceCenter;
import com.ead.backend.entity.User;
import com.ead.backend.repository.EmployeeCenterRepository;
import com.ead.backend.repository.ServiceCenterRepository;
import com.ead.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final EmployeeCenterRepository employeeCenterRepository;
    private  final ServiceCenterRepository serviceCenterRepository;

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

    // TODO: If EmployeeCenter is already available for employee then update instead of creating new one
    public void assignEmployeeToServiceCenter(UUID employeeId, UUID serviceCenterId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        ServiceCenter serviceCenter = serviceCenterRepository.findById(serviceCenterId).orElseThrow(
                () -> new RuntimeException("Service Center not found")
        );

        EmployeeCenter employeeCenter = new EmployeeCenter();
        employeeCenter.setEmployee(employee);
        employeeCenter.setServiceCenter(serviceCenter);

        employeeCenterRepository.save(employeeCenter);
    }
}



