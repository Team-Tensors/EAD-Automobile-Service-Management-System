package com.ead.backend.service;

import com.ead.backend.dto.ChatCenterLocationDTO;
import com.ead.backend.dto.ServiceCenterDTO;
import com.ead.backend.util.LLMUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class ChatbotService {

    private static final int MAX_HISTORY = 50;
    private static final int MAX_RESPONSE_LENGTH = 300;
    private static final int CONTEXT_WINDOW_SIZE = 800;
    private static final int RECENT_MESSAGES_CHECK = 6;
    private static final String DEFAULT_MODEL = "llama-3.1-8b-instant";

    private static final Pattern DATE_PATTERN = Pattern.compile("\\d{4}-\\d{2}-\\d{2}");
    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("yyyy/MM/dd"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy")
    );

    @Value("${groq.api.key}")
    private String apiKey;

    private final WebClient webClient;
    private final ShiftScheduleService shiftScheduleService;
    private final AppointmentService appointmentService;
    private final ServiceCenterService serviceCenterService;
    private final Map<String, Deque<Message>> conversationHistory = new ConcurrentHashMap<>();

    public ChatbotService(WebClient.Builder webClientBuilder,
                          ShiftScheduleService shiftScheduleService,
                          AppointmentService appointmentService,
                          ServiceCenterService serviceCenterService) {
        this.shiftScheduleService = shiftScheduleService;
        this.appointmentService = appointmentService;
        this.serviceCenterService = serviceCenterService;
        this.webClient = LLMUtil.configureWebClient(webClientBuilder);
    }

    public String getChatResponse(String userMessage, String userIp, ChatCenterLocationDTO locationDTO) {
        if (userMessage == null || userMessage.isBlank()) {
            return "Please provide a valid message.";
        }

        try {
            String intent = detectIntentFromLLM(userMessage, userIp);
            String reply = switch (intent) {
                case "appointment_info" -> handleAppointmentInfo(userMessage, locationDTO);
                default -> handleGeneralConversation(userMessage, userIp);
            };

            storeMessage(userIp, "user", userMessage);
            storeMessage(userIp, "assistant", reply);
            return reply;
        } catch (Exception e) {
            log.error("Error processing chat for IP {}: {}", userIp, e.getMessage(), e);
            return "I'm having trouble processing your request right now. Please try again shortly.";
        }
    }

    private String detectIntentFromLLM(String message, String userIp) {
        if (assistantAskedForDate(userIp) && message.trim().length() <= 30) {
            return "appointment_info";
        }

        String contextSummary = buildContextSummary(userIp);
        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", getIntentClassificationPrompt()),
                Map.of("role", "user", "content",
                        "Conversation so far:\n" + contextSummary +
                                "\nUser's latest message: " + message)
        );

        try {
            String intent = LLMUtil.callLLM(webClient, apiKey, DEFAULT_MODEL, messages);
            return parseIntent(intent);
        } catch (Exception e) {
            log.warn("Failed to detect intent via LLM: {}", e.getMessage());
            return "general";
        }
    }

    private String buildContextSummary(String userIp) {
        List<Message> history = getConversationHistory(userIp);
        StringBuilder contextBuilder = new StringBuilder();

        for (Message msg : history) {
            contextBuilder.append(msg.role()).append(": ")
                    .append(msg.content()).append("\n");
        }

        String context = contextBuilder.toString();
        return context.length() > CONTEXT_WINDOW_SIZE
                ? context.substring(context.length() - CONTEXT_WINDOW_SIZE)
                : context;
    }

    private String parseIntent(String intent) {
        if (intent == null) return "general";
        String normalized = intent.trim().toLowerCase();
        if (normalized.contains("appointment_info")) return "appointment_info";
        return "general";
    }

    private boolean assistantAskedForDate(String userIp) {
        Deque<Message> history = conversationHistory.get(userIp);
        if (history == null || history.isEmpty()) return false;

        return history.stream()
                .filter(msg -> "assistant".equals(msg.role()))
                .limit(RECENT_MESSAGES_CHECK)
                .anyMatch(msg -> {
                    String content = msg.content().toLowerCase();
                    return content.contains("please specify the date") ||
                            content.contains("which date") ||
                            content.contains("what date") ||
                            content.contains("what time");
                });
    }

    private String handleGeneralConversation(String userMessage, String userIp) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", getDriveCareContext()));
        messages.addAll(convertMessagesToMap(getConversationHistory(userIp)));
        messages.add(Map.of("role", "user", "content", userMessage));

        try {
            String reply = LLMUtil.callLLM(webClient, apiKey, DEFAULT_MODEL, messages);
            return truncateResponse(reply, MAX_RESPONSE_LENGTH);
        } catch (Exception e) {
            log.error("Error in general conversation: {}", e.getMessage());
            return "I apologize, but I'm having trouble responding right now. Please try again.";
        }
    }

    private String getDriveCareContext() {
        return """
            You are the official DriveCare assistant.
            DriveCare is a premium automobile service provider in Colombo, Sri Lanka.
            Services: maintenance, repair, diagnostics, AC, brake, tire, engine, and radiator.
            Hours: Mon–Fri 8AM–7PM, Sat/Sun 9AM–4PM.
            Customers can also log in or register and book appointments through our seamless web app at drivecaresl.com.
            Respond politely and professionally within 300 characters.
        """;
    }

    private String handleAppointmentInfo(String userMessage, ChatCenterLocationDTO location) {
        try {
            LocalDate targetDate = extractDateFromMessage(userMessage);
            if (targetDate == null) {
                return "Could you please specify the date or day to check available appointments?";
            }

            if (location == null) {
                return "Please share your location so I can find nearby DriveCare centers for booking.";
            }

            List<ServiceCenterDTO> centers = serviceCenterService.getNearby(
                    location.getLatitude(),
                    location.getLongitude(),
                    50.0
            );

            if (centers.isEmpty()) {
                return "No nearby service centers found within 50km of your location.";
            }

            Map<Integer, Integer> slots = appointmentService.getAvailableSlotsByHour(
                    centers.get(0).getId(),
                    targetDate
            );

            return formatAvailableSlots(targetDate, slots);
        } catch (Exception e) {
            log.error("Error fetching appointment info: {}", e.getMessage());
            return "Sorry, I couldn’t retrieve available slots. Please try again or visit drivecaresl.com to book directly.";
        }
    }

    private String formatAvailableSlots(LocalDate date, Map<Integer, Integer> slots) {
        if (slots == null || slots.isEmpty()) {
            return String.format("No available slots on %s. You can log in or register at drivecaresl.com to book another date.", date);
        }

        StringBuilder response = new StringBuilder("Available slots on ")
                .append(date).append(": ");

        slots.forEach((hour, count) ->
                response.append(String.format("%02d:00 (%d slots), ", hour, count))
        );

        String result = response.toString();
        return result.substring(0, result.length() - 2);
    }

    private String handleBooking(String message) {
        LocalDate date = extractDateFromMessage(message);
        if (date == null) {
            return "Please specify the date and time you'd like to book your appointment.";
        }
        return String.format(
                "Your appointment has been successfully booked for %s at 10:00 AM. You can also log in or register on drivecaresl.com to manage or cancel bookings.",
                date
        );
    }

    private LocalDate extractDateFromMessage(String message) {
        if (message == null) return null;
        String normalized = message.toLowerCase().trim();
        LocalDate today = LocalDate.now();

        if (normalized.contains("today")) return today;
        if (normalized.contains("tomorrow")) return today.plusDays(1);

        LocalDate dayOfWeek = extractDayOfWeek(normalized, today);
        if (dayOfWeek != null) return dayOfWeek;

        return parseExplicitDate(message);
    }

    private LocalDate extractDayOfWeek(String message, LocalDate today) {
        Map<String, DayOfWeek> dayMap = Map.of(
                "monday", DayOfWeek.MONDAY,
                "tuesday", DayOfWeek.TUESDAY,
                "wednesday", DayOfWeek.WEDNESDAY,
                "thursday", DayOfWeek.THURSDAY,
                "friday", DayOfWeek.FRIDAY,
                "saturday", DayOfWeek.SATURDAY,
                "sunday", DayOfWeek.SUNDAY
        );

        for (Map.Entry<String, DayOfWeek> entry : dayMap.entrySet()) {
            if (message.contains(entry.getKey())) {
                return getNextOccurrence(today, entry.getValue());
            }
        }
        return null;
    }

    private LocalDate getNextOccurrence(LocalDate from, DayOfWeek targetDay) {
        DayOfWeek currentDay = from.getDayOfWeek();
        int daysUntil = (targetDay.getValue() - currentDay.getValue() + 7) % 7;
        return from.plusDays(daysUntil == 0 ? 7 : daysUntil);
    }

    private LocalDate parseExplicitDate(String message) {
        Matcher matcher = DATE_PATTERN.matcher(message);
        if (matcher.find()) {
            String dateStr = matcher.group();
            for (DateTimeFormatter formatter : DATE_FORMATTERS) {
                try {
                    return LocalDate.parse(dateStr, formatter);
                } catch (DateTimeParseException ignored) {}
            }
        }
        return null;
    }

    private void storeMessage(String userIp, String role, String content) {
        conversationHistory.computeIfAbsent(userIp, k -> new ArrayDeque<>());
        Deque<Message> history = conversationHistory.get(userIp);
        history.addLast(new Message(role, content));
        while (history.size() > MAX_HISTORY) {
            history.removeFirst();
        }
    }

    private List<Message> getConversationHistory(String userIp) {
        return new ArrayList<>(conversationHistory.getOrDefault(userIp, new ArrayDeque<>()));
    }

    private List<Map<String, String>> convertMessagesToMap(List<Message> messages) {
        return messages.stream()
                .map(msg -> Map.of("role", msg.role(), "content", msg.content()))
                .toList();
    }

    private String truncateResponse(String response, int maxLength) {
        if (response == null) return "";
        return response.length() > maxLength
                ? response.substring(0, maxLength - 3) + "..."
                : response;
    }

    private record Message(String role, String content) {}

    private String getIntentClassificationPrompt() {
        return """
            You are a strict intent classifier for the DriveCare assistant.
            Analyze the conversation context and the latest user message.
            Allowed outputs (single word only): general, appointment_info.
            Use "appointment_info" if the message includes words like 
            "appointment", "book", "booking", "reserve", "slot", "availability", 
            or mentions a specific day or date (e.g., "Friday", "tomorrow", "10th November").
            Use "general" for all other messages, including greetings, service inquiries, or unrelated topics.
            Respond with exactly one of: general or appointment_info.
        """;
    }
}
