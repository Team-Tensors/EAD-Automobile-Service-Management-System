package com.ead.backend.util;

import com.ead.backend.enums.PeriodType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

public class DatePeriodGrouper {

    private static final DateTimeFormatter DAILY_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter WEEKLY_FORMATTER = DateTimeFormatter.ofPattern("'Week' w, yyyy");
    private static final DateTimeFormatter MONTHLY_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy");
    private static final DateTimeFormatter YEARLY_FORMATTER = DateTimeFormatter.ofPattern("yyyy");

    /**
     * Group data by period type
     */
    public static <T> Map<LocalDate, List<T>> groupByPeriod(
            List<T> items,
            java.util.function.Function<T, LocalDateTime> dateExtractor,
            PeriodType periodType) {

        Map<LocalDate, List<T>> grouped = new LinkedHashMap<>();

        for (T item : items) {
            LocalDateTime dateTime = dateExtractor.apply(item);
            if (dateTime == null) continue;

            LocalDate periodKey = getPeriodKey(dateTime, periodType);
            grouped.computeIfAbsent(periodKey, k -> new ArrayList<>()).add(item);
        }

        return grouped;
    }

    /**
     * Get period key based on period type
     */
    public static LocalDate getPeriodKey(LocalDateTime dateTime, PeriodType periodType) {
        LocalDate date = dateTime.toLocalDate();

        switch (periodType) {
            case DAILY:
                return date;
            case WEEKLY:
                return date.with(WeekFields.ISO.dayOfWeek(), 1); // Monday of the week
            case MONTHLY:
                return date.withDayOfMonth(1); // First day of month
            case YEARLY:
                return date.withDayOfYear(1); // First day of year
            default:
                return date;
        }
    }

    /**
     * Format period label
     */
    public static String formatPeriodLabel(LocalDate period, PeriodType periodType) {
        switch (periodType) {
            case DAILY:
                return period.format(DAILY_FORMATTER);
            case WEEKLY:
                return period.format(WEEKLY_FORMATTER);
            case MONTHLY:
                return period.format(MONTHLY_FORMATTER);
            case YEARLY:
                return period.format(YEARLY_FORMATTER);
            default:
                return period.toString();
        }
    }

    /**
     * Generate all periods between start and end dates
     */
    public static List<LocalDate> generatePeriods(LocalDateTime start, LocalDateTime end, PeriodType periodType) {
        List<LocalDate> periods = new ArrayList<>();
        LocalDate current = getPeriodKey(start, periodType);
        LocalDate endPeriod = getPeriodKey(end, periodType);

        while (!current.isAfter(endPeriod)) {
            periods.add(current);
            current = getNextPeriod(current, periodType);
        }

        return periods;
    }

    /**
     * Get next period based on period type
     */
    private static LocalDate getNextPeriod(LocalDate current, PeriodType periodType) {
        switch (periodType) {
            case DAILY:
                return current.plusDays(1);
            case WEEKLY:
                return current.plusWeeks(1);
            case MONTHLY:
                return current.plusMonths(1);
            case YEARLY:
                return current.plusYears(1);
            default:
                return current.plusDays(1);
        }
    }

    /**
     * Fill missing periods with zero values
     */
    public static <T> Map<LocalDate, List<T>> fillMissingPeriods(
            Map<LocalDate, List<T>> data,
            LocalDateTime start,
            LocalDateTime end,
            PeriodType periodType) {

        Map<LocalDate, List<T>> filled = new LinkedHashMap<>();
        List<LocalDate> allPeriods = generatePeriods(start, end, periodType);

        for (LocalDate period : allPeriods) {
            filled.put(period, data.getOrDefault(period, new ArrayList<>()));
        }

        return filled;
    }
}

