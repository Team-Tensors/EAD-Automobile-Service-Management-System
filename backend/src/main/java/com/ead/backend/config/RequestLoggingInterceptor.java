package com.ead.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        long startTime = System.currentTimeMillis();
        request.setAttribute("startTime", startTime);

        logger.info("🚀 INCOMING REQUEST: {} {} from IP: {}",
                   request.getMethod(),
                   request.getRequestURI(),
                   getClientIpAddress(request));

        logger.info("📋 Request Headers:");
        request.getHeaderNames().asIterator().forEachRemaining(headerName ->
            logger.info("   {}: {}", headerName, request.getHeader(headerName))
        );

        if (request.getQueryString() != null) {
            logger.info("🔍 Query Parameters: {}", request.getQueryString());
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                               Object handler, Exception ex) {
        long startTime = (Long) request.getAttribute("startTime");
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        logger.info("✅ REQUEST COMPLETED: {} {} - Status: {} - Duration: {}ms",
                   request.getMethod(),
                   request.getRequestURI(),
                   response.getStatus(),
                   duration);

        if (ex != null) {
            logger.error("❌ REQUEST FAILED with exception: {}", ex.getMessage());
        }

        logger.info("════════════════════════════════════════");
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
