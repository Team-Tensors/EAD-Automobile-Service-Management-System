package com.ead.backend.util;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Utility class for LLM API interactions.
 * Provides methods for configuring WebClient and making API calls to Groq.
 */
public class LLMUtil {

    private static final String GROQ_BASE_URL = "https://api.groq.com/openai/v1";
    private static final String CHAT_COMPLETIONS_ENDPOINT = "/chat/completions";

    private LLMUtil() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    /**
     * Configures a WebClient builder with default settings for Groq API.
     *
     * @param webClientBuilder the WebClient builder to configure
     * @return configured WebClient instance
     */
    public static WebClient configureWebClient(WebClient.Builder webClientBuilder) {
        return webClientBuilder
                .baseUrl(GROQ_BASE_URL)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Makes a synchronous call to the LLM API and extracts the response content.
     *
     * @param webClient configured WebClient instance
     * @param apiKey Groq API key for authentication
     * @param model model name to use (e.g., "llama-3.1-8b-instant")
     * @param messages list of messages with "role" and "content" keys
     * @return extracted content from the LLM response
     * @throws RuntimeException if the API call fails or response parsing fails
     */
    public static String callLLM(WebClient webClient,
                                 String apiKey,
                                 String model,
                                 List<Map<String, String>> messages) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", messages
        );

        Map<?, ?> response = webClient.post()
                .uri(CHAT_COMPLETIONS_ENDPOINT)
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return extractContent(response);
    }

    /**
     * Extracts the content from the LLM API response.
     *
     * @param response the API response map
     * @return extracted content string
     * @throws RuntimeException if content extraction fails
     */
    private static String extractContent(Map<?, ?> response) {
        return (String) Optional.ofNullable(response)
                .map(r -> r.get("choices"))
                .filter(List.class::isInstance)
                .map(List.class::cast)
                .filter(list -> !list.isEmpty())
                .map(list -> list.get(0))
                .filter(Map.class::isInstance)
                .map(Map.class::cast)
                .map(choice -> choice.get("message"))
                .filter(Map.class::isInstance)
                .map(Map.class::cast)
                .map(message -> message.get("content"))
                .orElseThrow(() -> new RuntimeException("Failed to extract content from LLM response"));
    }
}