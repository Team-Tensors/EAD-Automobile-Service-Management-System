package com.ead.backend.config;

import com.ead.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            StompCommand command = accessor.getCommand();
            log.debug("WebSocket command received: {}", command);
            
            if (StompCommand.CONNECT.equals(command)) {
                log.info("WebSocket CONNECT command - attempting authentication");

                // Extract token from headers
                List<String> authHeaders = accessor.getNativeHeader("Authorization");
                
                if (authHeaders != null && !authHeaders.isEmpty()) {
                    String authHeader = authHeaders.get(0);
                    log.debug("Authorization header present");

                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        
                        try {
                            // Validate token and set authentication
                            String username = jwtUtil.extractUsername(token);
                            
                            if (username != null) {
                                log.info("JWT username extracted: {}", username);
                                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                            
                                if (jwtUtil.validateToken(token, userDetails)) {
                                    log.info("WebSocket authentication successful for user: {}", username);
                                    UsernamePasswordAuthenticationToken authentication =
                                        new UsernamePasswordAuthenticationToken(
                                            userDetails, 
                                            null, 
                                            userDetails.getAuthorities()
                                        );
                                    
                                    accessor.setUser(authentication);
                                    log.info("Principal set for user: {}", username);
                                } else {
                                    log.warn("WebSocket JWT token validation failed for user: {}", username);
                                }
                            } else {
                                log.warn("WebSocket JWT username extraction failed");
                            }
                        } catch (Exception e) {
                            log.error("WebSocket authentication failed: {}", e.getMessage(), e);
                        }
                    } else {
                        log.warn("WebSocket Authorization header does not start with 'Bearer '");
                    }
                } else {
                    log.warn("WebSocket CONNECT without Authorization header");
                }
            } else if (StompCommand.SEND.equals(command)) {
                // Log SEND commands for debugging
                String destination = accessor.getDestination();
                log.info("WebSocket SEND to destination: {}", destination);
                
                // Check if user is authenticated
                if (accessor.getUser() == null) {
                    log.error("User not authenticated for SEND command to: {}", destination);
                    log.error("Session ID: {}", accessor.getSessionId());
                    log.error("Message headers: {}", accessor.getMessageHeaders());
                } else {
                    log.info("Authenticated user {} sending to: {}", 
                        accessor.getUser().getName(), destination);
                }
            } else if (StompCommand.SUBSCRIBE.equals(command)) {
                // Log SUBSCRIBE commands
                String destination = accessor.getDestination();
                log.info("WebSocket SUBSCRIBE to destination: {}", destination);
                if (accessor.getUser() != null) {
                    log.info("User {} subscribed to: {}", accessor.getUser().getName(), destination);
                } else {
                    log.warn("Unauthenticated user trying to subscribe to: {}", destination);
                }
            }
        }

        return message;
    }
}
