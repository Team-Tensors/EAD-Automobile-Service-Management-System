package com.ead.backend.service;

import com.ead.backend.entity.RefreshToken;
import com.ead.backend.entity.User;
import com.ead.backend.repository.RefreshTokenRepository;
import com.ead.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService; // Added UserDetailsService

    @Value("${jwt.refresh.expiration:604800000}") // 7 days in milliseconds
    private Long refreshTokenExpiration;

    @Value("${jwt.refresh.max-tokens-per-user:5}") // Maximum refresh tokens per user
    private Integer maxTokensPerUser;

    /**
     * Create a new refresh token for a user
     */
    @Transactional
    public RefreshToken createRefreshToken(User user, String deviceInfo) {
        // Clean up expired tokens first
        cleanExpiredTokensForUser(user);

        // Limit number of active tokens per user
        limitActiveTokensForUser(user);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenExpiration));
        refreshToken.setDeviceInfo(deviceInfo);
        refreshToken.setRevoked(false);

        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Verify and get refresh token
     */
    public Optional<RefreshToken> verifyRefreshToken(String token) {
        Optional<RefreshToken> refreshToken = refreshTokenRepository.findByTokenAndRevokedFalse(token);

        if (refreshToken.isPresent()) {
            RefreshToken rt = refreshToken.get();
            if (rt.isExpired()) {
                log.warn("Refresh token {} has expired", token);
                rt.revoke();
                refreshTokenRepository.save(rt);
                return Optional.empty();
            }

            // Mark as used
            rt.markAsUsed();
            refreshTokenRepository.save(rt);
            return Optional.of(rt);
        }

        return Optional.empty();
    }

    /**
     * Refresh JWT token using refresh token
     */
    @Transactional
    public Optional<String> refreshJwtToken(String refreshTokenValue) {
        Optional<RefreshToken> refreshTokenOpt = verifyRefreshToken(refreshTokenValue);

        if (refreshTokenOpt.isPresent()) {
            RefreshToken refreshToken = refreshTokenOpt.get();
            User user = refreshToken.getUser();

            // Load UserDetails and generate new JWT token using email
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            return Optional.of(jwtUtil.generateToken(userDetails));
        }

        return Optional.empty();
    }

    /**
     * Rotate refresh token (create new, revoke old)
     */
    @Transactional
    public RefreshToken rotateRefreshToken(String oldToken, String deviceInfo) {
        Optional<RefreshToken> oldRefreshToken = refreshTokenRepository.findByTokenAndRevokedFalse(oldToken);

        if (oldRefreshToken.isPresent() && !oldRefreshToken.get().isExpired()) {
            RefreshToken oldRT = oldRefreshToken.get();
            User user = oldRT.getUser();

            // Revoke old token
            oldRT.revoke();
            refreshTokenRepository.save(oldRT);

            // Create new token
            return createRefreshToken(user, deviceInfo);
        }

        throw new RuntimeException("Invalid refresh token for rotation");
    }

    /**
     * Revoke specific refresh token
     */
    @Transactional
    public void revokeRefreshToken(String token) {
        Optional<RefreshToken> refreshToken = refreshTokenRepository.findByToken(token);
        if (refreshToken.isPresent()) {
            RefreshToken rt = refreshToken.get();
            rt.revoke();
            refreshTokenRepository.save(rt);
            log.info("Refresh token {} revoked", token);
        }
    }

    /**
     * Revoke all refresh tokens for a user
     */
    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllUserTokens(user);
        log.info("All refresh tokens revoked for user: {}", user.getEmail());
    }

    /**
     * Revoke all user tokens except the current one
     */
    @Transactional
    public void revokeAllUserTokensExcept(User user, String currentToken) {
        refreshTokenRepository.revokeAllUserTokensExcept(user, currentToken);
        log.info("All refresh tokens revoked for user: {} except current token", user.getEmail());
    }

    /**
     * Get all active tokens for a user
     */
    public List<RefreshToken> getActiveTokensForUser(User user) {
        return refreshTokenRepository.findByUserAndRevokedFalse(user);
    }

    /**
     * Clean expired tokens for a specific user
     */
    @Transactional
    protected void cleanExpiredTokensForUser(User user) {
        List<RefreshToken> userTokens = refreshTokenRepository.findByUser(user);
        userTokens.stream()
                .filter(RefreshToken::isExpired)
                .forEach(token -> {
                    token.revoke();
                    refreshTokenRepository.save(token);
                });
    }

    /**
     * Limit active tokens per user
     */
    @Transactional
    protected void limitActiveTokensForUser(User user) {
        List<RefreshToken> activeTokens = refreshTokenRepository.findByUserAndRevokedFalse(user);

        if (activeTokens.size() >= maxTokensPerUser) {
            // Remove oldest tokens
            activeTokens.stream()
                    .sorted(Comparator.comparing(RefreshToken::getCreatedAt))
                    .limit(activeTokens.size() - maxTokensPerUser + 1)
                    .forEach(token -> {
                        token.revoke();
                        refreshTokenRepository.save(token);
                    });
        }
    }

    /**
     * Scheduled cleanup of expired tokens (runs every hour)
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(Instant.now());
        log.info("Cleaned up expired refresh tokens");
    }
}
