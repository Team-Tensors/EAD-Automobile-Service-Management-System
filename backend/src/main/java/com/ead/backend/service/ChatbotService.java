package com.ead.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.regex.Pattern;

@Service
public class ChatbotService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final WebClient webClient;
    private final ShiftScheduleService shiftScheduleService;
    private final AppointmentService appointmentService;

    public ChatbotService(WebClient.Builder webClientBuilder, ShiftScheduleService shiftScheduleService, AppointmentService appointmentService) {
        this.shiftScheduleService = shiftScheduleService;
        this.webClient = webClientBuilder
                .baseUrl("https://api.groq.com/openai/v1")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.appointmentService = appointmentService;
    }

    public String getChatResponse(String userMessage) {
        try {
            // Step 1: Determine intent
            String intent = detectIntent(userMessage.toLowerCase());

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

    /** Detect user intent using simple keyword matching **/
    private String detectIntent(String message) {
        if (Pattern.compile("available|free|slots|dates|times").matcher(message).find()) {
            return "appointment_info";
        } else if (Pattern.compile("book|reserve|appointment|schedule").matcher(message).find()) {
            return "book_appointment";
        } else {
            return "general";
        }
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

        // Ensure max length of ~300 chars
        return reply.length() > 300 ? reply.substring(0, 297) + "..." : reply;
    }

    /** Handle appointment availability queries **/
    private String handleAppointmentInfo(String message) {
        // Example: Extract day keywords (you can enhance this with NLP later)
        String dateHint = extractDayFromMessage(message);
        if (dateHint == null) {
            return "Please specify a date, like 'Friday' or 'tomorrow', to check available appointments.";
        }

        // var slots = shiftScheduleService.getAvailableSlots(java.time.LocalDate.now().plusDays(getDayOffset(dateHint)));
        // if (slots.isEmpty()) {
            // return "No available slots found for " + dateHint + ". Please try another date.";
        // }
        return "Available appointment slots on " + dateHint;
    }

    /** Handle booking request **/
    private String handleBooking(String message) {
        // Example: simulate booking logic
        String dateHint = extractDayFromMessage(message);
        if (dateHint == null) {
            return "Please specify the date and time you'd like to book.";
        }

        // Example simplified booking (replace with your ShiftScheduleService logic)
        // boolean booked = shiftScheduleService.bookAppointment("User123",
                // java.time.LocalDate.now().plusDays(getDayOffset(dateHint)), java.time.LocalTime.of(10, 0));

//        return booked
//                ? "Your appointment has been successfully booked for " + dateHint + " at 10:00 AM."
//                : "Unable to book your appointment. Please try a different time or date.";
        return "Your appointment has been successfully booked for " + dateHint + " at 10:00 AM.";
    }

    /** Extract day keyword from message **/
    private String extractDayFromMessage(String msg) {
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

    /** Calculate offset days for simple natural phrases **/
    private int getDayOffset(String day) {
        switch (day.toLowerCase()) {
            case "today":
                return 0;
            case "tomorrow":
                return 1;
            case "friday":
                return java.time.DayOfWeek.FRIDAY.getValue() - java.time.LocalDate.now().getDayOfWeek().getValue();
            default:
                return 0;
        }
    }
}
