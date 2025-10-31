package com.ead.backend.filter;

import com.ead.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SseTokenAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(SseTokenAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public SseTokenAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Only apply to SSE subscribe endpoints
        if (request.getRequestURI().contains("/notifications/subscribe")) {
            logger.info("SSE authentication filter triggered for: {}", request.getRequestURI());

            String token = request.getParameter("token");

            if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    logger.info("Attempting to authenticate SSE connection with query token");

                    String username = jwtUtil.extractUsername(token);
                    logger.info("Extracted username from token: {}", username);

                    if (username != null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        logger.info("Loaded user details for: {}", username);

                        if (jwtUtil.validateToken(token, userDetails)) {
                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities()
                                    );
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authToken);

                            logger.info("SSE authentication successful for user: {}", username);
                        } else {
                            logger.warn("Token validation failed for SSE connection");
                        }
                    }
                } catch (Exception e) {
                    logger.error("Cannot set user authentication from query token: {}", e.getMessage());
                }
            } else if (token == null) {
                logger.warn("No token provided in query parameter for SSE endpoint");
            }
        }

        filterChain.doFilter(request, response);
    }
}