package com.ead.backend.service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.ead.backend.dto.ChatCenterLocationDTO;
import com.ead.backend.dto.ServiceCenterDTO;
import com.ead.backend.util.LLMUtil;

import lombok.extern.slf4j.Slf4j;

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
            return "⚠️ Please provide a valid message.";
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
            return "⚠️ **System Error**\n\nI'm having trouble processing your request right now. Please try again shortly.";
        }
    }

    private String detectIntentFromLLM(String message, String userIp) {
        // If assistant asked for date and user responds with a short message, assume it's a date
        if (assistantAskedForDate(userIp) && message.trim().length() <= 50) {
            return "appointment_info";
        }

        // Check for explicit appointment-related keywords
        String normalized = message.toLowerCase();
        if (normalized.contains("slot") || 
            normalized.contains("appointment") || 
            normalized.contains("book") || 
            normalized.contains("available") ||
            normalized.contains("availability") ||
            normalized.contains("reserve") ||
            normalized.contains("schedule")) {
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
                    return content.contains("date required") ||
                            content.contains("specify a date") ||
                            content.contains("please specify the date") ||
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
            return "⚠️ I apologize, but I'm having trouble responding right now. Please try again.";
        }
    }

    private String getDriveCareContext() {
        return """
            You are the official DriveCare assistant, a specialized chatbot for DriveCare automobile services.
            
            STRICT GUIDELINES:
            1. ONLY answer questions related to DriveCare services, appointments, operating hours, and automobile service inquiries.
            2. If a question is NOT related to automobile services, DriveCare, or car maintenance, politely decline with: "I'm sorry, but I can only assist with DriveCare automobile services and appointments. For other inquiries, please contact our customer service."
            3. If you don't know the answer to a DriveCare-related question, respond with: "I don't have that specific information. Please visit drivecaresl.com or contact our customer service for detailed assistance."
            4. NEVER make up information, prices, or specific service details that weren't provided.
            
            ABOUT DRIVECARE:
            - Premium automobile service provider in Colombo, Sri Lanka
            - Services offered: maintenance, repair, diagnostics, AC service, brake service, tire service, engine service, and radiator service
            - Operating hours: Monday–Friday 8AM–7PM, Saturday/Sunday 9AM–4PM
            - Website: drivecaresl.com (for appointments, registration, and account management)
            
            RESPONSE RULES:
            - Be polite, professional, and concise (within 300 characters)
            - Format responses in Markdown for better readability
            - Use **bold** for important information like service names, hours, or key points
            - Use bullet points (-) for lists when mentioning multiple services or options
            - Use emojis sparingly for visual appeal (e.g., 🚗 for car-related topics, ⏰ for time, 📍 for location)
            - Direct users to [drivecaresl.com](https://drivecaresl.com) for booking, cancellations, and account-related tasks
            - Stay strictly within your knowledge boundaries
            - Refuse to discuss topics unrelated to automobile services
        """;
    }

    private String handleAppointmentInfo(String userMessage, ChatCenterLocationDTO location) {
        try {
            LocalDate targetDate = extractDateFromMessage(userMessage);
            if (targetDate == null) {
                return "📅 **Date Required**\n\nTo check available appointment slots, please specify a date.\n\n**Examples:**\n- 'Check availability for Friday'\n- 'Show slots for November 15th'\n- 'What's available tomorrow?'\n\n🌐 You can also visit [drivecaresl.com](https://drivecaresl.com) to view and book appointments directly.";
            }

            if (location == null) {
                return "📍 **Location Needed**\n\nTo show available appointment slots, I need your location.\n\nPlease enable location sharing or visit [drivecaresl.com](https://drivecaresl.com) to select a service center and book your appointment.";
            }

            List<ServiceCenterDTO> centers = serviceCenterService.getNearby(
                    BigDecimal.valueOf(location.getLatitude()),
                    BigDecimal.valueOf(location.getLongitude()),
                    50.0
            );

            if (centers.isEmpty()) {
                return "❌ **No Centers Found**\n\nI couldn't find any DriveCare service centers within **50km** of your location.\n\n🌐 Please visit [drivecaresl.com](https://drivecaresl.com) to view all available centers and book an appointment at your preferred location.";
            }

            Map<Integer, Integer> slots = appointmentService.getAvailableSlotsByHour(
                    centers.get(0).getId(),
                    targetDate
            );

            return formatAvailableSlots(targetDate, slots, centers.get(0).getName());
        } catch (Exception e) {
            log.error("Error fetching appointment info: {}", e.getMessage());
            return "⚠️ **Service Temporarily Unavailable**\n\nI'm unable to retrieve slot information right now.\n\n🌐 Please visit [drivecaresl.com](https://drivecaresl.com) to check availability and book your appointment, or try again in a moment.";
        }
    }

    private String formatAvailableSlots(LocalDate date, Map<Integer, Integer> slots, String centerName) {
        if (slots == null || slots.isEmpty()) {
            return String.format("❌ **No appointment slots available**\n\n📅 Date: **%s**\n📍 Center: **%s**\n\n💡 Please visit [drivecaresl.com](https://drivecaresl.com) to check other dates or alternative service centers.", 
                    date.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy")), centerName);
        }

        StringBuilder response = new StringBuilder()
                .append("✅ **Available Appointment Slots**\n\n")
                .append("📅 **Date:** ").append(date.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy"))).append("\n")
                .append("📍 **Center:** ").append(centerName).append("\n\n")
                .append("⏰ **Time Slots:**\n");

        List<Map.Entry<Integer, Integer>> sortedSlots = new ArrayList<>(slots.entrySet());
        sortedSlots.sort(Map.Entry.comparingByKey());

        for (Map.Entry<Integer, Integer> entry : sortedSlots) {
            String timeSlot = String.format("%02d:00", entry.getKey());
            int available = entry.getValue();
            response.append(String.format("- **%s** — %d slot%s available\n", timeSlot, available, available > 1 ? "s" : ""));
        }
        
        response.append("\n🌐 To book your appointment, please visit [drivecaresl.com](https://drivecaresl.com)");
        
        return response.toString();
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
            You are a strict intent classifier for the DriveCare automobile service assistant.
            Analyze the conversation context and the latest user message to determine intent.
            
            CLASSIFICATION RULES:
            1. Return "appointment_info" ONLY if the message clearly requests:
               - Appointment availability, slots, or scheduling information
               - Keywords: "appointment", "book", "booking", "reserve", "slot", "availability", "available", "free time"
               - Mentions specific dates/days: "Friday", "tomorrow", "next week", "10th November", "today"
               - Questions about when appointments are available or open slots
            
            2. Return "general" for:
               - Greetings and introductions
               - Service inquiries (what services, prices, hours)
               - General questions about DriveCare
               - Any automobile-related questions
               - All other DriveCare-related conversations
            
            OUTPUT FORMAT: Respond with exactly ONE word: "general" or "appointment_info"
            Do not include explanations or additional text.
        """;
    }
}
