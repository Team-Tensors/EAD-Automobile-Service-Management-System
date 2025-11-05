package com.ead.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class ChatbotService {

    @Value("${groq.api.key}")
    private String apiKey;
    private final WebClient webClient;
    private final ShiftScheduleService shiftScheduleService;
    private final AppointmentService appointmentService;
    private final Map<String, Deque<Map<String, String>>> conversationHistory = new ConcurrentHashMap<>();

    private static final int MAX_HISTORY = 50;

    public ChatbotService(WebClient.Builder webClientBuilder,
                          ShiftScheduleService shiftScheduleService,
                          AppointmentService appointmentService) {
        this.shiftScheduleService = shiftScheduleService;
        this.appointmentService = appointmentService;

        this.webClient = webClientBuilder
                .baseUrl("https://api.groq.com/openai/v1")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public String getChatResponse(String userMessage, String userIp) {
        try {
            String intent = detectIntentFromLLM(userMessage, userIp);

            String reply = switch (intent) {
                case "appointment_info" -> handleAppointmentInfo(userMessage);
                case "book_appointment" -> handleBooking(userMessage);
                default -> handleGeneralConversation(userMessage, userIp);
            };

            storeMessage(userIp, "user", userMessage);
            storeMessage(userIp, "assistant", reply);

            return reply;

        } catch (Exception e) {
            return "Error processing your request: " + e.getMessage();
        }
    }

    private String detectIntentFromLLM(String message, String userIp) {

        List<Map<String, String>> history = getConversationHistory(userIp);

        StringBuilder contextBuilder = new StringBuilder();
        for (Map<String, String> msg : history) {
            contextBuilder.append(msg.get("role")).append(": ").append(msg.get("content")).append("\n");
        }

        String contextSummary = contextBuilder.length() > 800 ?
                contextBuilder.substring(contextBuilder.length() - 800) :
                contextBuilder.toString();

        Map<String, Object> body = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", List.of(
                        Map.of("role", "system", "content",
                                """
                                You are an intent classifier for DriveCare automobile service chatbot.
                                Use the conversation history and user’s latest message to determine the user's intent.
                                Possible intents:
                                1. "general" — small talk, greetings, or unrelated queries.
                                2. "appointment_info" — when asking for appointment details, available times, or current bookings.
                                3. "book_appointment" — when trying to book, confirm, or modify an appointment.
                                Consider context like when the user just says "Friday" or "tomorrow" after discussing booking — 
                                this still means they are booking or checking availability.
                                Respond ONLY with one of these words: general, appointment_info, book_appointment.
                                """),
                        Map.of("role", "user", "content",
                                "Conversation so far:\n" + contextSummary +
                                        "\nUser's latest message: " + message)
                )
        );

        Map<?, ?> response = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        log.info("Intent classification response: {}", response);

        String intent = (String) ((Map<?, ?>) ((Map<?, ?>) ((List<?>) response.get("choices")).get(0))
                .get("message")).get("content");

        if (intent == null) return "general";
        intent = intent.trim().toLowerCase();

        if (intent.contains("book_appointment")) return "book_appointment";
        if (intent.contains("appointment_info") || intent.contains("available")) return "appointment_info";
        return "general";
    }


    private String handleGeneralConversation(String userMessage, String userIp) {
        List<Map<String, String>> messages = new ArrayList<>();

        // Comprehensive DriveCare knowledge injected into system prompt
        String driveCareContext = """
        You are the official virtual assistant for DriveCare — a premium automobile service provider in Colombo, Sri Lanka.
        DriveCare offers maintenance, repair, diagnostics, brake repair, engine repair, tire repair, AC repair, radiator service, and system diagnostics.
        Core values: integrity, excellence, customer satisfaction.
        DriveCare ensures top-quality service, expert technicians (90% rating), quick turnaround (85%), and quality assurance (95%).
        Office: 320A, T.B. Jayah Mawatha, Colombo 10, Sri Lanka.
        Working hours: Mon–Fri 8:00 AM–7:00 PM, Sat/Sun 9:00 AM–4:00 PM.
        Contact: +1-800-123-4567 | support@example.com
        Motto: "From our garage to your driveway – your trusted partner in car care."
        Services include appointment scheduling, vehicle addition, and locating nearest service stations.
        Respond concisely (≤300 characters) in a friendly and professional tone as DriveCare Assistant.
    """;

        // System instruction to set identity and context
        messages.add(Map.of("role", "system", "content", driveCareContext));

        // Add previous user context for conversation continuity
        messages.addAll(getConversationHistory(userIp));

        // Add current user message
        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> body = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", messages
        );

        Map<?, ?> response = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        String reply = (String) ((Map<?, ?>) ((Map<?, ?>) ((List<?>) response.get("choices")).get(0))
                .get("message")).get("content");

        return reply.length() > 300 ? reply.substring(0, 297) + "..." : reply;
    }


    private String handleAppointmentInfo(String message) {
        String dateHint = extractDayFromMessage(message);
        if (dateHint == null) {
            return "Please specify a date like 'Friday' or 'tomorrow' to check available appointments.";
        }
        return "Available appointment slots on " + dateHint + ": 9:00 AM, 11:00 AM, 2:00 PM.";
    }

    private String handleBooking(String message) {
        String dateHint = extractDayFromMessage(message);
        if (dateHint == null) {
            return "Please specify the date and time you'd like to book.";
        }
        return "Your appointment has been successfully booked for " + dateHint + " at 10:00 AM.";
    }

    private String extractDayFromMessage(String msg) {
        msg = msg.toLowerCase();
        if (msg.contains("today")) return "today";
        if (msg.contains("tomorrow")) return "tomorrow";
        if (msg.contains("monday")) return "Monday";
        if (msg.contains("tuesday")) return "Tuesday";
        if (msg.contains("wednesday")) return "Wednesday";
        if (msg.contains("thursday")) return "Thursday";
        if (msg.contains("friday")) return "Friday";
        if (msg.contains("saturday")) return "Saturday";
        if (msg.contains("sunday")) return "Sunday";
        return null;
    }

    private void storeMessage(String userIp, String role, String content) {
        conversationHistory.computeIfAbsent(userIp, k -> new ArrayDeque<>());

        Deque<Map<String, String>> history = conversationHistory.get(userIp);
        history.addLast(Map.of("role", role, "content", content));

        while (history.size() > MAX_HISTORY) {
            history.removeFirst();
        }
    }

    private List<Map<String, String>> getConversationHistory(String userIp) {
        return new ArrayList<>(conversationHistory.getOrDefault(userIp, new ArrayDeque<>()));
    }
}
