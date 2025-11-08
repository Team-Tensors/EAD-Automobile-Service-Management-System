package com.ead.backend.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class AnalyticsHelper {

    /**
     * Calculate percentage
     */
    public static Double calculatePercentage(Long part, Long total) {
        if (total == null || total == 0) {
            return 0.0;
        }
        return roundToTwoDecimals((part * 100.0) / total);
    }

    /**
     * Calculate percentage with double values
     */
    public static Double calculatePercentage(Double part, Double total) {
        if (total == null || total == 0.0) {
            return 0.0;
        }
        return roundToTwoDecimals((part * 100.0) / total);
    }

    /**
     * Round to two decimal places
     */
    public static Double roundToTwoDecimals(Double value) {
        if (value == null) {
            return 0.0;
        }
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(2, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }

    /**
     * Safe addition of Double values
     */
    public static Double safeAdd(Double a, Double b) {
        Double valueA = (a != null) ? a : 0.0;
        Double valueB = (b != null) ? b : 0.0;
        return roundToTwoDecimals(valueA + valueB);
    }

    /**
     * Safe division
     */
    public static Double safeDivide(Double numerator, Double denominator) {
        if (denominator == null || denominator == 0.0) {
            return 0.0;
        }
        if (numerator == null) {
            return 0.0;
        }
        return roundToTwoDecimals(numerator / denominator);
    }

    /**
     * Safe division with Long values
     */
    public static Double safeDivide(Long numerator, Long denominator) {
        if (denominator == null || denominator == 0) {
            return 0.0;
        }
        if (numerator == null) {
            return 0.0;
        }
        return roundToTwoDecimals(numerator.doubleValue() / denominator.doubleValue());
    }

    /**
     * Format currency (returns value with $ symbol)
     */
    public static String formatCurrency(Double value) {
        if (value == null) {
            return "$0.00";
        }
        return String.format("$%.2f", value);
    }

    /**
     * Convert to safe double
     */
    public static Double toSafeDouble(Object value) {
        if (value == null) {
            return 0.0;
        }
        if (value instanceof Double) {
            return (Double) value;
        }
        if (value instanceof Integer) {
            return ((Integer) value).doubleValue();
        }
        if (value instanceof Long) {
            return ((Long) value).doubleValue();
        }
        if (value instanceof BigDecimal) {
            return ((BigDecimal) value).doubleValue();
        }
        return 0.0;
    }

    /**
     * Convert to safe long
     */
    public static Long toSafeLong(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Long) {
            return (Long) value;
        }
        if (value instanceof Integer) {
            return ((Integer) value).longValue();
        }
        if (value instanceof BigDecimal) {
            return ((BigDecimal) value).longValue();
        }
        return 0L;
    }
}

