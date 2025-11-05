package com.ead.backend.controller;

import com.ead.backend.service.ChatbotService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat")
public class ChatBotController {
    private final ChatbotService chatBotService;
    public ChatBotController(ChatbotService chatBotService) {
        this.chatBotService = chatBotService;
    }
    @PostMapping("/message")
    public String getChatBotMessage(@RequestBody ChatRequest chatRequest) {
        return chatBotService.getChatResponse(chatRequest.getMessage());
    }
}


@Setter
@Getter
class ChatRequest {
    private String message;

}
