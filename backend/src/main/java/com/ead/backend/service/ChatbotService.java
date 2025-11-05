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
                case "book_appointment" -> handleBooking(userMessage);
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
    
    /**
     * Builds a summary of recent conversation history for context.
     * Limits the context to the most recent messages within the context window size.
     *
     * @param userIp unique identifier for the user session
     * @return conversation context as a string
     */
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

    /**
     * Parses the raw intent string from the LLM into a standardized intent category.
     *
     * @param intent raw intent string from LLM
     * @return standardized intent: "book_appointment", "appointment_info", or "general"
     */
    private String parseIntent(String intent) {
        if (intent == null) return "general";

        String normalized = intent.trim().toLowerCase();
        if (normalized.contains("book_appointment")) return "book_appointment";
        if (normalized.contains("appointment_info")) return "appointment_info";
        return "general";
    }

    /**
     * Checks if the assistant recently asked for a date in the conversation history.
     *
     * @param userIp unique identifier for the user session
     * @return true if the assistant asked for a date in recent messages
     */
    private boolean assistantAskedForDate(String userIp) {
        Deque<Message> history = conversationHistory.get(userIp);
        if (history == null || history.isEmpty()) return false;

        return history.stream()
                .filter(msg -> "assistant".equals(msg.role()))
                .limit(RECENT_MESSAGES_CHECK)
                .anyMatch(msg -> {
                    String content = msg.content().toLowerCase();
                    return content.contains("please specify the date") ||
                            content.contains("could you please specify the date") ||
                            content.contains("what date") ||
                            content.contains("which date") ||
                            content.contains("what time");
                });
    }

    /**
     * Handles general conversation queries using the LLM with DriveCare context.
     *
     * @param userMessage the user's message
     * @param userIp unique identifier for the user session
     * @return chatbot response string
     */
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

    /**
     * Returns the DriveCare context prompt for general conversations.
     *
     * @return DriveCare context string
     */
    private String getDriveCareContext() {
        return """
            You are the official DriveCare assistant.
            DriveCare is a premium automobile service provider in Colombo, Sri Lanka.
            Services: maintenance, repair, diagnostics, AC, brake, tire, engine, and radiator.
            Hours: Mon–Fri 8AM–7PM, Sat/Sun 9AM–4PM.
            Respond politely and professionally within 300 characters.
        """;
    }

    /**
     * Handles appointment information queries by extracting the date and fetching available slots.
     *
     * @param userMessage the user's message
     * @param location user's location for finding nearby service centers
     * @return formatted response with available appointment slots
     */
    private String handleAppointmentInfo(String userMessage, ChatCenterLocationDTO location) {
        try {
            LocalDate targetDate = extractDateFromMessage(userMessage);
            if (targetDate == null) {
                return "Could you please specify the date to check available appointments?";
            }

            List<ServiceCenterDTO> centers = serviceCenterService.getNearby(
                    location.getLatitude(),
                    location.getLongitude(),
                    50.0
            );

            if (centers.isEmpty()) {
                return "No nearby service centers found within 50km.";
            }

            Map<Integer, Integer> slots = appointmentService.getAvailableSlotsByHour(
                    centers.get(0).getId(),
                    targetDate
            );

            return formatAvailableSlots(targetDate, slots);
        } catch (Exception e) {
            log.error("Error fetching appointment info: {}", e.getMessage());
            return "I'm having trouble checking appointments right now. Please try again shortly.";
        }
    }

    /**
     * Formats available appointment slots into a readable response string.
     *
     * @param date the appointment date
     * @param slots map of hour to available slot count
     * @return formatted string describing available slots
     */
    private String formatAvailableSlots(LocalDate date, Map<Integer, Integer> slots) {
        if (slots.isEmpty()) {
            return String.format("No available slots on %s. Please try another date.", date);
        }

        StringBuilder response = new StringBuilder("Available slots on ")
                .append(date).append(": ");

        slots.forEach((hour, count) ->
                response.append(String.format("%02d:00 (%d slots), ", hour, count))
        );

        String result = response.toString();
        return result.substring(0, result.length() - 2);
    }

    /**
     * Handles appointment booking requests by extracting the date from the message.
     *
     * @param message the user's booking message
     * @return confirmation message or request for more information
     */
    private String handleBooking(String message) {
        LocalDate date = extractDateFromMessage(message);
        if (date == null) {
            return "Please specify the date and time you'd like to book.";
        }
        return String.format("Your appointment has been successfully booked for %s at 10:00 AM.", date);
    }

    /**
     * Extracts a date from the user's message using natural language parsing.
     * Supports relative dates (today, tomorrow), day names, and explicit date formats.
     *
     * @param message the user's message
     * @return extracted LocalDate, or null if no date found
     */
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

    /**
     * Extracts a day of week from the message and returns the next occurrence of that day.
     *
     * @param message normalized message text
     * @param today current date
     * @return next occurrence of the specified day, or null if no day found
     */
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

    /**
     * Calculates the next occurrence of a specified day of week from a given date.
     *
     * @param from starting date
     * @param targetDay target day of week
     * @return date of next occurrence (always at least 1 day in the future)
     */
    private LocalDate getNextOccurrence(LocalDate from, DayOfWeek targetDay) {
        DayOfWeek currentDay = from.getDayOfWeek();
        int daysUntil = (targetDay.getValue() - currentDay.getValue() + 7) % 7;
        return from.plusDays(daysUntil == 0 ? 7 : daysUntil);
    }

    /**
     * Attempts to parse an explicit date format from the message.
     * Tries multiple date formats including ISO, slash-separated, and dash-separated.
     *
     * @param message the user's message
     * @return parsed LocalDate, or null if parsing fails
     */
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

    /**
     * Stores a message in the conversation history for a specific user session.
     * Maintains a maximum history size by removing oldest messages.
     *
     * @param userIp unique identifier for the user session
     * @param role message role ("user" or "assistant")
     * @param content message content
     */
    private void storeMessage(String userIp, String role, String content) {
        conversationHistory.computeIfAbsent(userIp, k -> new ArrayDeque<>());
        Deque<Message> history = conversationHistory.get(userIp);
        history.addLast(new Message(role, content));

        while (history.size() > MAX_HISTORY) {
            history.removeFirst();
        }
    }

    /**
     * Retrieves the conversation history for a specific user session.
     *
     * @param userIp unique identifier for the user session
     * @return list of messages in chronological order
     */
    private List<Message> getConversationHistory(String userIp) {
        return new ArrayList<>(conversationHistory.getOrDefault(userIp, new ArrayDeque<>()));
    }

    /**
     * Converts a list of Message records to a list of maps for API compatibility.
     *
     * @param messages list of Message records
     * @return list of maps with "role" and "content" keys
     */
    private List<Map<String, String>> convertMessagesToMap(List<Message> messages) {
        return messages.stream()
                .map(msg -> Map.of("role", msg.role(), "content", msg.content()))
                .toList();
    }

    /**
     * Truncates a response string to a maximum length with ellipsis if needed.
     *
     * @param response the response string
     * @param maxLength maximum allowed length
     * @return truncated string with "..." suffix if truncation occurred
     */
    private String truncateResponse(String response, int maxLength) {
        if (response == null) return "";
        return response.length() > maxLength
                ? response.substring(0, maxLength - 3) + "..."
                : response;
    }

    /**
     * Represents a single message in the conversation history.
     *
     * @param role the role of the message sender ("user" or "assistant")
     * @param content the message content
     */
    private record Message(String role, String content) {}

    private String getIntentClassificationPrompt() {
        return """
            You are a strict intent classifier for DriveCare assistant.
            Use the provided conversation context and latest user message.
            Allowed outputs (single word only): general, appointment_info, book_appointment.
        
            Return "book_appointment" ONLY if the user explicitly intends to create/confirm/cancel an appointment
            (look for verbs like book, reserve, schedule, confirm, cancel, reschedule, change).
        
            For short replies that are just dates/times (e.g., "Friday", "10am"), prefer appointment_info
            unless booking verbs are present.
        
            Respond with exactly one of: general, appointment_info, book_appointment.
        """;
    }
}