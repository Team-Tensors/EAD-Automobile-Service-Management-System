package com.ead.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponseDTO<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public AnalyticsResponseDTO(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public static <T> AnalyticsResponseDTO<T> success(T data) {
        return new AnalyticsResponseDTO<>(true, "Analytics data retrieved successfully", data);
    }

    public static <T> AnalyticsResponseDTO<T> success(String message, T data) {
        return new AnalyticsResponseDTO<>(true, message, data);
    }

    public static <T> AnalyticsResponseDTO<T> error(String message) {
        return new AnalyticsResponseDTO<>(false, message, null);
    }
}

