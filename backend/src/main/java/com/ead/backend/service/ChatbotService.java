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

    // Memory for conversation history (per user IP)
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
            // Step 1: Get intent from LLM
            String intent = detectIntentFromLLM(userMessage, userIp);

            // Step 2: Route based on intent
            String reply;
            switch (intent) {
                case "appointment_info":
                    reply = handleAppointmentInfo(userMessage);
                    break;
                case "book_appointment":
                    reply = handleBooking(userMessage);
                    break;
                case "general":
                default:
                    reply = handleGeneralConversation(userMessage, userIp);
                    break;
            }

            // Step 3: Save to memory
            storeMessage(userIp, "user", userMessage);
            storeMessage(userIp, "assistant", reply);

            return reply;

        } catch (Exception e) {
            return "Error processing your request: " + e.getMessage();
        }
    }

    /** Use LLM to detect user intent **/
    private String detectIntentFromLLM(String message, String userIp) {
        List<Map<String, String>> context = new ArrayList<>(getConversationHistory(userIp));
        context.add(Map.of("role", "user", "content", message));

        Map<String, Object> body = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", new Object[]{
                        Map.of("role", "system", "content",
                                "You are a classifier that determines the user's intent in an automobile service chatbot. "
                                        + "Possible intents: 'general', 'appointment_info', 'book_appointment'. "
                                        + "Respond ONLY with one of these words — nothing else."),
                        Map.of("role", "user", "content", message)
                }
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

    /** Handle general conversation with context **/
    private String handleGeneralConversation(String userMessage, String userIp) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system",
                "content", "You are a friendly automobile service assistant. Keep responses under 300 characters."));

        // Add previous context
        messages.addAll(getConversationHistory(userIp));
        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> body = Map.of("model", "llama-3.1-8b-instant", "messages", messages);

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

    /** Handle appointment info requests **/
    private String handleAppointmentInfo(String message) {
        String dateHint = extractDayFromMessage(message);
        if (dateHint == null) {
            return "Please specify a date like 'Friday' or 'tomorrow' to check available appointments.";
        }
        return "Available appointment slots on " + dateHint + ": 9:00 AM, 11:00 AM, 2:00 PM.";
    }

    /** Handle booking requests **/
    private String handleBooking(String message) {
        String dateHint = extractDayFromMessage(message);
        if (dateHint == null) {
            return "Please specify the date and time you'd like to book.";
        }
        return "Your appointment has been successfully booked for " + dateHint + " at 10:00 AM.";
    }

    /** Extract days **/
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

    /** Store message in user memory **/
    private void storeMessage(String userIp, String role, String content) {
        conversationHistory.computeIfAbsent(userIp, k -> new ArrayDeque<>());

        Deque<Map<String, String>> history = conversationHistory.get(userIp);
        history.addLast(Map.of("role", role, "content", content));

        // Trim old messages
        while (history.size() > MAX_HISTORY) {
            history.removeFirst();
        }
    }

    /** Get history safely **/
    private List<Map<String, String>> getConversationHistory(String userIp) {
        return new ArrayList<>(conversationHistory.getOrDefault(userIp, new ArrayDeque<>()));
    }
}
