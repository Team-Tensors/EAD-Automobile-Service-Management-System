package com.ead.backend.dto;

import com.ead.backend.enums.AppointmentType;
import com.ead.backend.enums.PeriodType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsFilterRequestDTO {
    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    private UUID serviceCenterId;
    private AppointmentType appointmentType;
    private String status;
    private PeriodType periodType = PeriodType.DAILY;

    // Default constructor with last 30 days
    public static AnalyticsFilterRequestDTO defaultLast30Days() {
        AnalyticsFilterRequestDTO dto = new AnalyticsFilterRequestDTO();
        dto.setEndDate(LocalDateTime.now());
        dto.setStartDate(LocalDateTime.now().minusDays(30));
        dto.setPeriodType(PeriodType.DAILY);
        return dto;
    }
}

