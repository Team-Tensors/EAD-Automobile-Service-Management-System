package com.ead.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;

@Slf4j
@Service
public class ChatbotService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final WebClient webClient;
    private final ShiftScheduleService shiftScheduleService;
    private final AppointmentService appointmentService;

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

    public String getChatResponse(String userMessage) {
        try {
            // Step 1: Get intent from LLM
            String intent = detectIntentFromLLM(userMessage);

            // Step 2: Route based on intent
            switch (intent) {
                case "appointment_info":
                    return handleAppointmentInfo(userMessage);
                case "book_appointment":
                    return handleBooking(userMessage);
                case "general":
                default:
                    return handleGeneralConversation(userMessage);
            }

        } catch (Exception e) {
            return "Error processing your request: " + e.getMessage();
        }
    }

    /**
     * Use Groq LLM to classify message intent.
     * The model must respond with one of:
     * "general", "appointment_info", "book_appointment"
     */
    private String detectIntentFromLLM(String message) {
        Map<String, Object> body = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", new Object[]{
                        Map.of("role", "system", "content",
                                "You are a classifier that determines user intent in an automobile service chatbot. "
                                        + "Possible intents: 'general', 'appointment_info', 'book_appointment'. "
                                        + "Respond ONLY with one word: the intent name. No explanation."),
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
        log.info("Response from chatbot is {}", response);

        String intent = (String) ((Map<?, ?>) ((Map<?, ?>) ((java.util.List<?>) response.get("choices")).get(0))
                .get("message")).get("content");

        if (intent == null) return "general";

        intent = intent.trim().toLowerCase();
        if (intent.contains("book_appointment")) return "book_appointment";
        if (intent.contains("appointment_info") || intent.contains("available")) return "appointment_info";
        return "general";
    }

    /** Handle general conversation with Groq API and limit character count **/
    private String handleGeneralConversation(String userMessage) {
        Map<String, Object> body = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", new Object[]{
                        Map.of("role", "system", "content",
                                "You are a friendly automobile service assistant. Keep responses under 300 characters."),
                        Map.of("role", "user", "content", userMessage)
                }
        );

        Map<?, ?> response = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        String reply = (String) ((Map<?, ?>) ((Map<?, ?>) ((java.util.List<?>) response.get("choices")).get(0))
                .get("message")).get("content");

        // Enforce 300-char limit
        return reply.length() > 300 ? reply.substring(0, 297) + "..." : reply;
    }

    /** Handle appointment availability queries **/
    private String handleAppointmentInfo(String message) {
        String dateHint = extractDayFromMessage(message);
        if (dateHint == null) {
            return "Please specify a date like 'Friday' or 'tomorrow' to check available appointments.";
        }

        // Example logic – integrate with your service later
        return "Available appointment slots on " + dateHint + ": 9:00 AM, 11:00 AM, 2:00 PM.";
    }

    /** Handle booking request **/
    private String handleBooking(String message) {
        String dateHint = extractDayFromMessage(message);
        if (dateHint == null) {
            return "Please specify the date and time you'd like to book.";
        }

        // Example simplified booking
        return "Your appointment has been successfully booked for " + dateHint + " at 10:00 AM.";
    }

    /** Extract simple day keywords **/
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
}
