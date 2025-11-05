package com.ead.backend.mappers;

import com.ead.backend.dto.VehicleCreateDTO;
import com.ead.backend.dto.VehicleResponseDTO;
import com.ead.backend.entity.Vehicle;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class VehicleMapper {

    // === DTO → Entity (for create/update) ===
    public static void updateEntity(VehicleCreateDTO dto, Vehicle vehicle) {
        if (dto == null || vehicle == null) return;

        vehicle.setBrand(dto.getBrand());
        vehicle.setModel(dto.getModel());
        vehicle.setYear(dto.getYear());
        vehicle.setColor(dto.getColor());
        vehicle.setLicensePlate(dto.getLicensePlate());

        if (dto.getLastServiceDate() != null && !dto.getLastServiceDate().isBlank()) {
            LocalDate date = LocalDate.parse(dto.getLastServiceDate());
            vehicle.setLastServiceDate(date.atStartOfDay());
        } else {
            vehicle.setLastServiceDate(null);
        }
    }

    // === Entity → DTO (response) ===
    public static VehicleResponseDTO toDTO(Vehicle vehicle) {
        if (vehicle == null) return null;

        VehicleResponseDTO dto = new VehicleResponseDTO();
        dto.setId(vehicle.getId() != null ? vehicle.getId().toString() : null);
        dto.setBrand(vehicle.getBrand());
        dto.setModel(vehicle.getModel());
        dto.setYear(vehicle.getYear());
        dto.setColor(vehicle.getColor());
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setLastServiceDate(vehicle.getLastServiceDate());
        return dto;
    }

    public static List<VehicleResponseDTO> toDTOList(List<Vehicle> vehicles) {
        if (vehicles == null || vehicles.isEmpty()) return new ArrayList<>();
        return vehicles.stream().map(VehicleMapper::toDTO).toList();
    }
}