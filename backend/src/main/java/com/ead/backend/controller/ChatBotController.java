package com.ead.backend.controller;

import com.ead.backend.dto.ChatRequestDTO;
import com.ead.backend.service.ChatbotService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import static com.ead.backend.util.ClientDetailsUtil.getClientIp;

@Slf4j
@RestController
@RequestMapping("/chat")
public class ChatBotController {
    private final ChatbotService chatBotService;
    public ChatBotController(ChatbotService chatBotService) {
        this.chatBotService = chatBotService;
    }
    @PostMapping("/message")
    public String getChatBotMessage(@RequestBody ChatRequestDTO chatRequest, HttpServletRequest request) {
        String clientIp = getClientIp(request);
        return chatBotService.getChatResponse(chatRequest.getMessage(), clientIp, chatRequest.getLocation());
    }
}



