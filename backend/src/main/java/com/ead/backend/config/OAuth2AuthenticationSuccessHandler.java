package com.ead.backend.config;

import com.ead.backend.dto.AuthResponseDTO;
import com.ead.backend.entity.User;
import com.ead.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);
    private final AuthService authService;

    public OAuth2AuthenticationSuccessHandler(@Lazy AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        logger.info("=== OAUTH2 AUTHENTICATION SUCCESS ===");

        try {
            // Extract OAuth2 user information
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            String googleId = oauth2User.getAttribute("sub");

            logger.info("OAuth2 user authenticated - Email: {}, Name: {}", email, name);

            // Extract device info
            String deviceInfo = extractDeviceInfo(request);

            // Create or update user in database
            User user = authService.createOrUpdateOAuthUser(email, name, "google", googleId);
            logger.info("User created/updated - ID: {}, Email: {}", user.getId(), user.getEmail());

            // Generate JWT tokens
            AuthResponseDTO authResponseDTO = authService.generateTokenForOAuthUser(user, deviceInfo);
            logger.info("JWT tokens generated for user: {}", user.getEmail());

            // Build redirect URL with tokens
            String frontendUrl = buildFrontendRedirectUrl(authResponseDTO, user);
            logger.info("Redirecting to frontend: {}", frontendUrl);

            // Redirect to frontend
            getRedirectStrategy().sendRedirect(request, response, frontendUrl);

        } catch (Exception e) {
            logger.error("OAuth2 authentication failed - Error: {}", e.getMessage(), e);

            // Redirect to frontend with error
            String errorUrl = "http://localhost:5173/login?error=oauth_failed&message=" +
                            URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }

    private String buildFrontendRedirectUrl(AuthResponseDTO authResponseDTO, User user) throws Exception {
        return String.format(
            "http://localhost:5173/oauth/callback?token=%s&refreshToken=%s&id=%s&email=%s&fullName=%s",
            authResponseDTO.getToken(),
            authResponseDTO.getRefreshToken(),
            user.getId(),
            URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8),
            URLEncoder.encode(user.getFullName(), StandardCharsets.UTF_8)
        );
    }

    private String extractDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = getClientIpAddress(request);
        return String.format("IP: %s, Agent: %s",
                            ipAddress != null ? ipAddress : "unknown",
                            userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 100)) : "unknown");
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String[] headers = {"X-Forwarded-For", "X-Real-IP", "Proxy-Client-IP", "WL-Proxy-Client-IP"};

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }

        return request.getRemoteAddr();
    }
}
