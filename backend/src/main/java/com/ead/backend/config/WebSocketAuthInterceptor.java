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

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.debug("WebSocket CONNECT command received");

            // Extract token from headers
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            
            if (authHeaders != null && !authHeaders.isEmpty()) {
                String authHeader = authHeaders.get(0);
                log.debug("Authorization header found: {}", authHeader != null ? "Bearer ***" : "null");

                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    
                    try {
                        // Validate token and set authentication
                        String username = jwtUtil.extractUsername(token);
                        
                        if (username != null) {
                            log.debug("JWT username extracted: {}", username);
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
        }

        return message;
    }
}
