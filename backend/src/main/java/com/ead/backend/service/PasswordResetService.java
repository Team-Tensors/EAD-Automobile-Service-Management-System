package com.ead.backend.service;

import com.ead.backend.entity.PasswordResetToken;
import com.ead.backend.entity.User;
import com.ead.backend.repository.PasswordResetTokenRepository;
import com.ead.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(UserRepository userRepository,
                               PasswordResetTokenRepository tokenRepository,
                               EmailService emailService,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void initiatePasswordReset(String email) {
        logger.info("Password reset requested for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("Password reset requested for non-existent email: {}", email);
                    // For security, we don't reveal if email exists
                    return new RuntimeException("If this email exists, a reset link has been sent");
                });

        // Check if user registered via OAuth (not local)
        // Only block password reset for actual OAuth providers like "google", not "local"
        if (user.getOauthProvider() != null
            && !user.getOauthProvider().isEmpty()
            && !user.getOauthProvider().equalsIgnoreCase("local")) {
            logger.warn("Password reset attempted for OAuth user: {} (Provider: {})", email, user.getOauthProvider());
            throw new RuntimeException("This account uses " + user.getOauthProvider() + " login. Please use " + user.getOauthProvider() + " to sign in.");
        }

        // Invalidate any existing tokens for this user
        invalidateExistingTokens(user);

        // Generate new token
        String token = generateResetToken();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setUsed(false);

        tokenRepository.save(resetToken);
        logger.info("Password reset token created for user: {}", email);

        // Send email
        try {
            emailService.sendPasswordResetEmail(email, token, user.getFullName());
            logger.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: {}", email, e);
            throw new RuntimeException("Failed to send password reset email. Please try again later.");
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        logger.info("Password reset attempt with token");

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    logger.warn("Invalid password reset token used");
                    return new RuntimeException("Invalid or expired reset token");
                });

        if (!resetToken.isValid()) {
            logger.warn("Expired or used password reset token: {}", token);
            throw new RuntimeException("This reset link has expired or already been used. Please request a new one.");
        }

        User user = resetToken.getUser();

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);

        logger.info("Password reset successful for user: {}", user.getEmail());

        // Send confirmation email
        try {
            emailService.sendPasswordChangedConfirmation(user.getEmail(), user.getFullName());
        } catch (Exception e) {
            logger.error("Failed to send password changed confirmation email", e);
            // Don't throw exception as password is already changed
        }
    }

    public PasswordResetToken verifyResetToken(String token) {
        logger.info("Verifying password reset token");

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    logger.warn("Token verification failed - token not found");
                    return new RuntimeException("Invalid reset token");
                });

        if (!resetToken.isValid()) {
            logger.warn("Token verification failed - token expired or used");
            throw new RuntimeException("This reset link has expired or already been used");
        }

        logger.info("Token verified successfully for user: {}", resetToken.getUser().getEmail());
        return resetToken;
    }

    @Transactional
    protected void invalidateExistingTokens(User user) {
        var existingTokens = tokenRepository.findByUserAndUsedFalse(user);
        for (PasswordResetToken token : existingTokens) {
            token.setUsed(true);
            tokenRepository.save(token);
        }
        logger.info("Invalidated {} existing tokens for user: {}", existingTokens.size(), user.getEmail());
    }

    private String generateResetToken() {
        return UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
    }

    // Clean up expired tokens every day at 2 AM
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        logger.info("Starting cleanup of expired password reset tokens");
        LocalDateTime threshold = LocalDateTime.now().minusDays(1);
        tokenRepository.deleteByExpiryDateBefore(threshold);
        logger.info("Expired password reset tokens cleaned up");
    }
}
