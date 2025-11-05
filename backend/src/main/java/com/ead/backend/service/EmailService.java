package com.ead.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${MAIL_FROM:noreply@automobileservice.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.name:DriveCare}")
    private String appName;

    @Value("${app.logo.url:https://i.imgur.com/placeholder.png}")
    private String logoUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ===================================================================
    // PASSWORD RESET EMAIL
    // ===================================================================
    public void sendPasswordResetEmail(String toEmail, String token, String userName) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + token;

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            // Brevo requires proper From header format - use simple email or "Name <email>"
            // format
            // Parse fromEmail if it contains name
            String fromAddress = fromEmail;
            String fromName = "DriveCare";

            if (fromEmail.contains("<") && fromEmail.contains(">")) {
                // Extract name and email from "Name<email>" format
                int startIdx = fromEmail.indexOf("<");
                fromName = fromEmail.substring(0, startIdx).trim();
                fromAddress = fromEmail.substring(startIdx + 1, fromEmail.indexOf(">")).trim();
            }

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Password Reset Request - " + appName);

            // Set both plain text and HTML content for better compatibility
            String htmlContent = buildPasswordResetEmailHtml(userName, resetLink, token);
            String textContent = buildPasswordResetEmailBody(userName, resetLink, token);

            helper.setText(textContent, htmlContent);

            // Brevo-specific headers for better tracking and deliverability
            mimeMessage.setHeader("X-Mailer", appName);
            mimeMessage.setHeader("Importance", "High");
            mimeMessage.setHeader("Priority", "urgent");

            mailSender.send(mimeMessage);
            logger.info("Password reset email sent successfully to: {} via Brevo", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to create password reset email for: {} - Error: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send password reset email", e);
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: {} - Error: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    private String buildPasswordResetEmailBody(String userName, String resetLink, String token) {
        return String.format(
                """
                        Hello %s,

                        We received a request to reset your password for your %s account.

                        Click the link below to reset your password:
                        %s

                        Or copy and paste this link into your browser:
                        %s

                        Token: %s

                        This link will expire in 1 hour.

                        If you didn't request this password reset, please ignore this email or contact support if you have concerns.

                        Best regards,
                        %s Team
                        """,
                userName, appName, resetLink, resetLink, token, appName);
    }

    private String buildPasswordResetEmailHtml(String userName, String resetLink, String token) {
        return String.format(
                """
                        <!DOCTYPE html>
                               <html>
                               <head>
                                 <meta charset="UTF-8">
                                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                 <style>
                                   * { margin: 0; padding: 0; box-sizing: border-box; }
                                   body {
                                     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                                     background-color: #0a0a0a;
                                     color: #e5e5e5;
                                     padding: 32px;
                                     line-height: 1.6;
                                   }

                                   .email-wrapper {
                                     max-width: 600px;
                                     margin: 0 auto;
                                     background-color: #18181b;
                                     border-radius: 10px;
                                     overflow: hidden;
                                     box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                                   }

                                   .header {
                                     text-align: center;
                                     padding: 48px 32px 32px;
                                     border-bottom: 2px solid #f97316;
                                     background-color: #1f1f23;
                                   }

                                   .logo {
                                     max-width: 150px;
                                     height: auto;
                                     margin-bottom: 16px;
                                   }

                                   .header h1 {
                                     color: #f97316;
                                     font-size: 24px;
                                     font-weight: 600;
                                     letter-spacing: -0.3px;
                                   }

                                   .content {
                                     padding: 40px 32px;
                                   }

                                   .content p {
                                     font-size: 15px;
                                     color: #d4d4d8;
                                     margin-bottom: 18px;
                                   }

                                   .greeting {
                                     font-size: 17px;
                                     color: #ffffff;
                                     font-weight: 500;
                                     margin-bottom: 24px;
                                   }

                                   .button-container {
                                     text-align: center;
                                     margin: 36px 0;
                                   }

                                   .button {
                                     display: inline-block;
                                     background-color: #f97316;
                                     color: #ffffff;
                                     text-decoration: none;
                                     padding: 14px 36px;
                                     border-radius: 6px;
                                     font-weight: 600;
                                     font-size: 15px;
                                     transition: background-color 0.25s ease, transform 0.2s ease;
                                   }

                                   .button:hover {
                                     background-color: #ea580c;
                                     transform: translateY(-1px);
                                   }

                                   .link-section {
                                     background-color: #1f1f23;
                                     padding: 14px 16px;
                                     border-radius: 6px;
                                     margin: 28px 0;
                                   }

                                   .link-section p {
                                     font-size: 13px;
                                     color: #a1a1aa;
                                     margin-bottom: 6px;
                                   }

                                   .link-section a {
                                     font-size: 13px;
                                     color: #f97316;
                                     text-decoration: none;
                                     word-break: break-all;
                                   }

                                   .token-box {
                                     background-color: #1f1f23;
                                     padding: 16px;
                                     border-radius: 6px;
                                     margin: 24px 0;
                                     border: 1px solid #2e2e32;
                                   }

                                   .token-box strong {
                                     color: #ffffff;
                                     display: block;
                                     font-size: 14px;
                                     margin-bottom: 8px;
                                   }

                                   .token-box code {
                                     display: block;
                                     background-color: #0a0a0a;
                                     padding: 12px;
                                     border-radius: 4px;
                                     font-size: 13px;
                                     color: #fafafa;
                                     font-family: 'Courier New', monospace;
                                     border: 1px solid #2e2e32;
                                     word-break: break-all;
                                   }

                                   .warning {
                                     background-color: #2e1b07;
                                     padding: 14px 16px;
                                     border-radius: 6px;
                                     margin: 28px 0;
                                   }

                                   .warning p {
                                     color: #fef3c7;
                                     font-size: 14px;
                                     margin: 0;
                                   }

                                   .divider {
                                     height: 1px;
                                     background: linear-gradient(90deg, transparent, #3f3f46, transparent);
                                     margin: 32px 0;
                                   }

                                   .footer {
                                     background-color: #18181b;
                                     padding: 32px;
                                     text-align: center;
                                     border-top: 1px solid #2e2e32;
                                   }

                                   .footer p {
                                     font-size: 13px;
                                     color: #71717a;
                                     margin: 6px 0;
                                   }

                                   .footer .brand {
                                     color: #f97316;
                                     font-weight: 600;
                                   }

                                   @media (max-width: 600px) {
                                     body { padding: 16px; }
                                     .header, .content, .footer { padding: 24px; }
                                     .header h1 { font-size: 22px; }
                                     .button { padding: 12px 28px; font-size: 14px; }
                                   }
                                 </style>
                               </head>
                               <body>
                                 <div class="email-wrapper">
                                   <div class="header">
                                     <img src="%s" alt="DriveCare Logo" class="logo">
                                     <h1>Password Reset Request</h1>
                                   </div>

                                   <div class="content">
                                     <p class="greeting">Hello <strong>%s</strong>,</p>
                                     <p>We received a request to reset your password for your <strong>%s</strong> account.</p>
                                     <p>Click the button below to securely reset your password:</p>

                                     <div class="button-container">
                                       <a href="%s" class="button" style="color: #ffffff !important;">Reset My Password</a>
                                     </div>

                                     <div class="divider"></div>

                                     <div class="link-section">
                                       <p>Or copy and paste this link into your browser:</p>
                                       <a href="%s">%s</a>
                                     </div>

                                     <div class="token-box">
                                       <strong>Your Reset Token:</strong>
                                       <code>%s</code>
                                     </div>

                                     <div class="warning">
                                       <p>This link will expire in 1 hour for your security.</p>
                                     </div>

                                     <div class="divider"></div>

                                     <p style="font-size: 14px; color: #a1a1aa;">
                                       If you didn't request this password reset, you can safely ignore this email.
                                       Your password will remain unchanged.
                                     </p>
                                   </div>

                                   <div class="footer">
                                     <p>Best regards,</p>
                                     <p class="brand">The %s Team</p>
                                     <p style="margin-top: 20px;">This is an automated email. Please do not reply.</p>
                                     <p style="color: #52525b; font-size: 12px; margin-top: 16px;">
                                       © 2025 %s. All rights reserved.
                                     </p>
                                   </div>
                                 </div>
                               </body>
                               </html>
                        """,
                logoUrl, userName, appName, resetLink, resetLink, resetLink, token, appName, appName);
    }

    // ===================================================================
    // PASSWORD CHANGED CONFIRMATION EMAIL
    // ===================================================================
    public void sendPasswordChangedConfirmation(String toEmail, String userName) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Password Changed Successfully - " + appName);

            String htmlContent = buildPasswordChangedEmailHtml(userName);
            String textContent = buildPasswordChangedEmailBody(userName);

            helper.setText(textContent, htmlContent);

            // Brevo-specific headers
            mimeMessage.setHeader("X-Mailer", appName);

            mailSender.send(mimeMessage);
            logger.info("Password changed confirmation email sent successfully to: {} via Brevo", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to create password changed confirmation email for: {} - Error: {}", toEmail,
                    e.getMessage());
            // Don't throw exception here as password is already changed
        } catch (Exception e) {
            logger.error("Failed to send password changed confirmation email to: {} - Error: {}", toEmail,
                    e.getMessage());
            // Don't throw exception here as password is already changed
        }
    }

    private String buildPasswordChangedEmailBody(String userName) {
        return String.format("""
                Hello %s,

                Your password has been successfully changed for your %s account.

                Password change details:
                - Time: Just now
                - IP Address: [Your current IP]

                If you didn't make this change, please contact our support team immediately.

                Best regards,
                %s Team
                """, userName, appName, appName);
    }

    private String buildPasswordChangedEmailHtml(String userName) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                body {
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                                    line-height: 1.6;
                                    color: #ffffff;
                                    background-color: #09090b;
                                    padding: 20px;
                                }
                                .email-wrapper {
                                    max-width: 600px;
                                    margin: 0 auto;
                                    background-color: #18181b;
                                    border-radius: 12px;
                                    overflow: hidden;
                                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                                }
                                .header {
                                    background: linear-gradient(135deg, #27272a 0%%, #18181b 100%%);
                                    padding: 40px 30px;
                                    text-align: center;
                                    border-bottom: 3px solid #22c55e;
                                }
                                .logo {
                                    max-width: 180px;
                                    height: auto;
                                    margin-bottom: 20px;
                                }
                                .header h1 {
                                    color: #22c55e;
                                    font-size: 28px;
                                    font-weight: 700;
                                    margin: 0;
                                    letter-spacing: -0.5px;
                                }
                                .content {
                                    background-color: #27272a;
                                    padding: 40px 30px;
                                    color: #e4e4e7;
                                }
                                .content p {
                                    margin-bottom: 16px;
                                    font-size: 15px;
                                    color: #d4d4d8;
                                }
                                .greeting {
                                    font-size: 18px;
                                    color: #ffffff;
                                    margin-bottom: 24px;
                                }
                                .info-box {
                                    background-color: #18181b;
                                    padding: 20px;
                                    border-radius: 8px;
                                    margin: 24px 0;
                                    border: 1px solid #3f3f46;
                                }
                                .info-box p {
                                    color: #a1a1aa;
                                    margin: 8px 0;
                                    font-size: 14px;
                                }
                                .info-box strong {
                                    color: #ffffff;
                                }
                                .alert-box {
                                    background-color: #422006;
                                    padding: 20px;
                                    border-radius: 8px;
                                    margin: 24px 0;
                                }
                                .alert-box strong {
                                    color: #f97316;
                                    font-size: 16px;
                                    display: block;
                                    margin-bottom: 8px;
                                }
                                .alert-box p {
                                    color: #fef3c7;
                                    margin: 0;
                                    font-size: 14px;
                                }
                                .divider {
                                    height: 1px;
                                    background: linear-gradient(90deg, transparent, #3f3f46, transparent);
                                    margin: 24px 0;
                                }
                                .footer {
                                    background-color: #18181b;
                                    padding: 30px;
                                    text-align: center;
                                    border-top: 1px solid #3f3f46;
                                }
                                .footer p {
                                    margin: 8px 0;
                                    font-size: 13px;
                                    color: #71717a;
                                }
                                .footer .brand {
                                    color: #f97316;
                                    font-weight: 600;
                                }
                                @media only screen and (max-width: 600px) {
                                    .email-wrapper {
                                        border-radius: 0;
                                    }
                                    .header, .content, .footer {
                                        padding: 24px 20px;
                                    }
                                    .header h1 {
                                        font-size: 24px;
                                    }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="email-wrapper">
                                <div class="header">
                                    <img src="%s" alt="DriveCare Logo" class="logo">
                                    <h1>Password Changed Successfully</h1>
                                </div>

                                <div class="content">
                                    <p class="greeting">Hello <strong>%s</strong>,</p>

                                    <p>Your password has been successfully changed for your <strong>%s</strong> account.</p>

                                    <div class="info-box">
                                        <p><strong>Password Change Details</strong></p>
                                        <p>Time: Just now</p>
                                        <p>Status: Completed successfully</p>
                                        <p>All active sessions remain logged in</p>
                                    </div>

                                    <div class="divider"></div>

                                    <div class="alert-box">
                                        <strong>Security Notice</strong>
                                        <p>If you didn't make this change, please contact our support team immediately. Your account security is our top priority.</p>
                                    </div>

                                    <p style="color: #a1a1aa; font-size: 14px; margin-top: 24px;">
                                        You can now use your new password to log in to your account. Make sure to keep it secure and don't share it with anyone.
                                    </p>
                                </div>

                                <div class="footer">
                                    <p>Best regards,</p>
                                    <p class="brand">The %s Team</p>
                                    <p style="margin-top: 20px;">This is an automated email. Please do not reply.</p>
                                    <p style="color: #52525b; font-size: 12px; margin-top: 16px;">
                                        © 2025 %s. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                logoUrl, userName, appName, appName, appName);
    }

    // ===================================================================
    // APPOINTMENT CONFIRMATION EMAIL (Customer books appointment)
    // ===================================================================
    public void sendAppointmentConfirmationEmail(String toEmail, String userName, String bookingId,
            String appointmentDate, String appointmentTime, String serviceName, String vehicleInfo,
            String serviceCenterName) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String fromAddress = fromEmail;
            String fromName = "DriveCare";

            if (fromEmail.contains("<") && fromEmail.contains(">")) {
                int startIdx = fromEmail.indexOf("<");
                fromName = fromEmail.substring(0, startIdx).trim();
                fromAddress = fromEmail.substring(startIdx + 1, fromEmail.indexOf(">")).trim();
            }

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Appointment Confirmed - " + appName);

            String htmlContent = buildAppointmentConfirmationHtml(userName, bookingId, appointmentDate, appointmentTime,
                    serviceName, vehicleInfo, serviceCenterName);
            String textContent = buildAppointmentConfirmationText(userName, bookingId, appointmentDate, appointmentTime,
                    serviceName, vehicleInfo, serviceCenterName);

            helper.setText(textContent, htmlContent);
            mimeMessage.setHeader("X-Mailer", appName);

            mailSender.send(mimeMessage);
            logger.info("Appointment confirmation email sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send appointment confirmation email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send appointment confirmation email", e);
        }
    }

    private String buildAppointmentConfirmationText(String userName, String bookingId, String appointmentDate,
            String appointmentTime, String serviceName, String vehicleInfo, String serviceCenterName) {
        return String.format("""
                Hello %s,

                Your appointment has been successfully booked!

                Booking Details:
                - Booking ID: %s
                - Service: %s
                - Vehicle: %s
                - Date: %s
                - Time: %s
                - Location: %s

                Please arrive 10-15 minutes early for check-in.

                If you need to cancel or reschedule, please contact us as soon as possible.

                Best regards,
                %s Team
                """, userName, bookingId, serviceName, vehicleInfo, appointmentDate, appointmentTime, serviceCenterName,
                appName);
    }

    private String buildAppointmentConfirmationHtml(String userName, String bookingId, String appointmentDate,
            String appointmentTime, String serviceName, String vehicleInfo, String serviceCenterName) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                body {
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                    background-color: #0a0a0a;
                                    color: #e5e5e5;
                                    padding: 32px;
                                    line-height: 1.6;
                                }
                                .email-wrapper {
                                    max-width: 600px;
                                    margin: 0 auto;
                                    background-color: #18181b;
                                    border-radius: 10px;
                                    overflow: hidden;
                                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                                }
                                .header {
                                    text-align: center;
                                    padding: 48px 32px 32px;
                                    border-bottom: 2px solid #22c55e;
                                    background-color: #1f1f23;
                                }
                                .logo {
                                    max-width: 150px;
                                    height: auto;
                                    margin-bottom: 16px;
                                }
                                .header h1 {
                                    color: #22c55e;
                                    font-size: 24px;
                                    font-weight: 600;
                                }
                                .content {
                                    padding: 40px 32px;
                                }
                                .greeting {
                                    font-size: 17px;
                                    color: #ffffff;
                                    font-weight: 500;
                                    margin-bottom: 24px;
                                }
                                .info-box {
                                    background-color: #1f1f23;
                                    padding: 24px;
                                    border-radius: 8px;
                                    margin: 24px 0;
                                    border: 1px solid #2e2e32;
                                }
                                .info-row {
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 12px 0;
                                    border-bottom: 1px solid #2e2e32;
                                }
                                .info-row:last-child {
                                    border-bottom: none;
                                }
                                .info-label {
                                    color: #a1a1aa;
                                    font-size: 14px;
                                }
                                .info-value {
                                    color: #ffffff;
                                    font-weight: 600;
                                    font-size: 14px;
                                    text-align: right;
                                }
                                .highlight-box {
                                    background-color: #0a2818;
                                    padding: 16px;
                                    border-radius: 6px;
                                    margin: 24px 0;
                                    border-left: 4px solid #22c55e;
                                }
                                .highlight-box p {
                                    color: #86efac;
                                    font-size: 14px;
                                    margin: 0;
                                }
                                .footer {
                                    background-color: #18181b;
                                    padding: 32px;
                                    text-align: center;
                                    border-top: 1px solid #2e2e32;
                                }
                                .footer p {
                                    font-size: 13px;
                                    color: #71717a;
                                    margin: 6px 0;
                                }
                                .footer .brand {
                                    color: #f97316;
                                    font-weight: 600;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="email-wrapper">
                                <div class="header">
                                    <img src="%s" alt="DriveCare Logo" class="logo">
                                    <h1>✓ Appointment Confirmed</h1>
                                </div>

                                <div class="content">
                                    <p class="greeting">Hello <strong>%s</strong>,</p>
                                    <p style="color: #d4d4d8; margin-bottom: 20px;">
                                        Your appointment has been successfully booked! We look forward to serving you.
                                    </p>

                                    <div class="info-box">
                                        <div class="info-row">
                                            <span class="info-label">Booking ID</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Service</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Vehicle</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Date</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Time</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Location</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                    </div>

                                    <div class="highlight-box">
                                        <p>📍 Please arrive 10-15 minutes early for check-in and vehicle inspection.</p>
                                    </div>

                                    <p style="color: #a1a1aa; font-size: 14px; margin-top: 24px;">
                                        If you need to cancel or reschedule your appointment, please contact us as soon as possible.
                                    </p>
                                </div>

                                <div class="footer">
                                    <p>Best regards,</p>
                                    <p class="brand">The %s Team</p>
                                    <p style="margin-top: 20px;">This is an automated email. Please do not reply.</p>
                                    <p style="color: #52525b; font-size: 12px; margin-top: 16px;">
                                        © 2025 %s. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                logoUrl, userName, bookingId, serviceName, vehicleInfo, appointmentDate, appointmentTime,
                serviceCenterName, appName, appName);
    }

    // ===================================================================
    // EMPLOYEE ASSIGNMENT EMAIL (Manager assigns employees)
    // ===================================================================
    public void sendEmployeeAssignmentEmail(String toEmail, String employeeName, String bookingId,
            String appointmentDate, String appointmentTime, String serviceName, String vehicleInfo,
            String customerName) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String fromAddress = fromEmail;
            String fromName = "DriveCare";

            if (fromEmail.contains("<") && fromEmail.contains(">")) {
                int startIdx = fromEmail.indexOf("<");
                fromName = fromEmail.substring(0, startIdx).trim();
                fromAddress = fromEmail.substring(startIdx + 1, fromEmail.indexOf(">")).trim();
            }

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("New Assignment - " + appName);

            String htmlContent = buildEmployeeAssignmentHtml(employeeName, bookingId, appointmentDate, appointmentTime,
                    serviceName, vehicleInfo, customerName);
            String textContent = buildEmployeeAssignmentText(employeeName, bookingId, appointmentDate, appointmentTime,
                    serviceName, vehicleInfo, customerName);

            helper.setText(textContent, htmlContent);
            mimeMessage.setHeader("X-Mailer", appName);

            mailSender.send(mimeMessage);
            logger.info("Employee assignment email sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send employee assignment email to: {}", toEmail, e);
        }
    }

    private String buildEmployeeAssignmentText(String employeeName, String bookingId, String appointmentDate,
            String appointmentTime, String serviceName, String vehicleInfo, String customerName) {
        return String.format("""
                Hello %s,

                You have been assigned to a new appointment.

                Assignment Details:
                - Booking ID: %s
                - Customer: %s
                - Service: %s
                - Vehicle: %s
                - Date: %s
                - Time: %s

                Please review the details and prepare accordingly.

                Best regards,
                %s Team
                """, employeeName, bookingId, customerName, serviceName, vehicleInfo, appointmentDate, appointmentTime,
                appName);
    }

    private String buildEmployeeAssignmentHtml(String employeeName, String bookingId, String appointmentDate,
            String appointmentTime, String serviceName, String vehicleInfo, String customerName) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            background-color: #0a0a0a;
                            color: #e5e5e5;
                            padding: 32px;
                            line-height: 1.6;
                        }
                        .email-wrapper {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #18181b;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                        }
                        .header {
                            text-align: center;
                            padding: 48px 32px 32px;
                            border-bottom: 2px solid #3b82f6;
                            background-color: #1f1f23;
                        }
                        .logo { max-width: 150px; height: auto; margin-bottom: 16px; }
                        .header h1 { color: #3b82f6; font-size: 24px; font-weight: 600; }
                        .content { padding: 40px 32px; }
                        .greeting { font-size: 17px; color: #ffffff; font-weight: 500; margin-bottom: 24px; }
                        .info-box {
                            background-color: #1f1f23;
                            padding: 24px;
                            border-radius: 8px;
                            margin: 24px 0;
                            border: 1px solid #2e2e32;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 12px 0;
                            border-bottom: 1px solid #2e2e32;
                        }
                        .info-row:last-child { border-bottom: none; }
                        .info-label { color: #a1a1aa; font-size: 14px; }
                        .info-value { color: #ffffff; font-weight: 600; font-size: 14px; text-align: right; }
                        .footer {
                            background-color: #18181b;
                            padding: 32px;
                            text-align: center;
                            border-top: 1px solid #2e2e32;
                        }
                        .footer p { font-size: 13px; color: #71717a; margin: 6px 0; }
                        .footer .brand { color: #f97316; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <div class="email-wrapper">
                        <div class="header">
                            <img src="%s" alt="DriveCare Logo" class="logo">
                            <h1>🔧 New Assignment</h1>
                        </div>

                        <div class="content">
                            <p class="greeting">Hello <strong>%s</strong>,</p>
                            <p style="color: #d4d4d8; margin-bottom: 20px;">
                                You have been assigned to a new appointment. Please review the details below.
                            </p>

                            <div class="info-box">
                                <div class="info-row">
                                    <span class="info-label">Booking ID</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Customer</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Service</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Vehicle</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Date</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Time</span>
                                    <span class="info-value">%s</span>
                                </div>
                            </div>
                        </div>

                        <div class="footer">
                            <p>Best regards,</p>
                            <p class="brand">The %s Team</p>
                            <p style="margin-top: 20px;">This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, logoUrl, employeeName, bookingId, customerName, serviceName, vehicleInfo, appointmentDate,
                appointmentTime, appName);
    }

    // ===================================================================
    // WORK STARTED EMAIL (Employee starts work)
    // ===================================================================
    public void sendAppointmentStartedEmail(String toEmail, String customerName, String bookingId, String serviceName,
            String vehicleInfo, String employeeName) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String fromAddress = fromEmail;
            String fromName = "DriveCare";

            if (fromEmail.contains("<") && fromEmail.contains(">")) {
                int startIdx = fromEmail.indexOf("<");
                fromName = fromEmail.substring(0, startIdx).trim();
                fromAddress = fromEmail.substring(startIdx + 1, fromEmail.indexOf(">")).trim();
            }

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Work Started on Your Vehicle - " + appName);

            String htmlContent = buildAppointmentStartedHtml(customerName, bookingId, serviceName, vehicleInfo,
                    employeeName);
            String textContent = buildAppointmentStartedText(customerName, bookingId, serviceName, vehicleInfo,
                    employeeName);

            helper.setText(textContent, htmlContent);
            mimeMessage.setHeader("X-Mailer", appName);

            mailSender.send(mimeMessage);
            logger.info("Appointment started email sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send appointment started email to: {}", toEmail, e);
        }
    }

    private String buildAppointmentStartedText(String customerName, String bookingId, String serviceName,
            String vehicleInfo, String employeeName) {
        return String.format("""
                Hello %s,

                Great news! Work has started on your vehicle.

                Details:
                - Booking ID: %s
                - Service: %s
                - Vehicle: %s
                - Technician: %s

                We'll notify you when the work is completed.

                Best regards,
                %s Team
                """, customerName, bookingId, serviceName, vehicleInfo, employeeName, appName);
    }

    private String buildAppointmentStartedHtml(String customerName, String bookingId, String serviceName,
            String vehicleInfo, String employeeName) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            background-color: #0a0a0a;
                            color: #e5e5e5;
                            padding: 32px;
                            line-height: 1.6;
                        }
                        .email-wrapper {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #18181b;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                        }
                        .header {
                            text-align: center;
                            padding: 48px 32px 32px;
                            border-bottom: 2px solid #eab308;
                            background-color: #1f1f23;
                        }
                        .logo { max-width: 150px; height: auto; margin-bottom: 16px; }
                        .header h1 { color: #eab308; font-size: 24px; font-weight: 600; }
                        .content { padding: 40px 32px; }
                        .greeting { font-size: 17px; color: #ffffff; font-weight: 500; margin-bottom: 24px; }
                        .info-box {
                            background-color: #1f1f23;
                            padding: 24px;
                            border-radius: 8px;
                            margin: 24px 0;
                            border: 1px solid #2e2e32;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 12px 0;
                            border-bottom: 1px solid #2e2e32;
                        }
                        .info-row:last-child { border-bottom: none; }
                        .info-label { color: #a1a1aa; font-size: 14px; }
                        .info-value { color: #ffffff; font-weight: 600; font-size: 14px; text-align: right; }
                        .footer {
                            background-color: #18181b;
                            padding: 32px;
                            text-align: center;
                            border-top: 1px solid #2e2e32;
                        }
                        .footer p { font-size: 13px; color: #71717a; margin: 6px 0; }
                        .footer .brand { color: #f97316; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <div class="email-wrapper">
                        <div class="header">
                            <img src="%s" alt="DriveCare Logo" class="logo">
                            <h1>🚗 Work in Progress</h1>
                        </div>

                        <div class="content">
                            <p class="greeting">Hello <strong>%s</strong>,</p>
                            <p style="color: #d4d4d8; margin-bottom: 20px;">
                                Great news! Our technician has started working on your vehicle.
                            </p>

                            <div class="info-box">
                                <div class="info-row">
                                    <span class="info-label">Booking ID</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Service</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Vehicle</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Technician</span>
                                    <span class="info-value">%s</span>
                                </div>
                            </div>

                            <p style="color: #a1a1aa; font-size: 14px;">
                                We'll notify you as soon as the work is completed.
                            </p>
                        </div>

                        <div class="footer">
                            <p>Best regards,</p>
                            <p class="brand">The %s Team</p>
                            <p style="margin-top: 20px;">This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, logoUrl, customerName, bookingId, serviceName, vehicleInfo, employeeName, appName);
    }

    // ===================================================================
    // WORK COMPLETED EMAIL (Employee completes work)
    // ===================================================================
    public void sendAppointmentCompletedEmail(String toEmail, String customerName, String bookingId, String serviceName,
            String vehicleInfo, String startTime, String endTime) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String fromAddress = fromEmail;
            String fromName = "DriveCare";

            if (fromEmail.contains("<") && fromEmail.contains(">")) {
                int startIdx = fromEmail.indexOf("<");
                fromName = fromEmail.substring(0, startIdx).trim();
                fromAddress = fromEmail.substring(startIdx + 1, fromEmail.indexOf(">")).trim();
            }

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Service Completed - " + appName);

            String htmlContent = buildAppointmentCompletedHtml(customerName, bookingId, serviceName, vehicleInfo,
                    startTime, endTime);
            String textContent = buildAppointmentCompletedText(customerName, bookingId, serviceName, vehicleInfo,
                    startTime, endTime);

            helper.setText(textContent, htmlContent);
            mimeMessage.setHeader("X-Mailer", appName);

            mailSender.send(mimeMessage);
            logger.info("Appointment completed email sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send appointment completed email to: {}", toEmail, e);
        }
    }

    private String buildAppointmentCompletedText(String customerName, String bookingId, String serviceName,
            String vehicleInfo, String startTime, String endTime) {
        return String.format("""
                Hello %s,

                Excellent news! The service on your vehicle has been completed successfully.

                Completion Details:
                - Booking ID: %s
                - Service: %s
                - Vehicle: %s
                - Started: %s
                - Completed: %s

                Your vehicle is ready for pickup!

                Thank you for choosing %s.

                Best regards,
                %s Team
                """, customerName, bookingId, serviceName, vehicleInfo, startTime, endTime, appName, appName);
    }

    private String buildAppointmentCompletedHtml(String customerName, String bookingId, String serviceName,
            String vehicleInfo, String startTime, String endTime) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <style>
                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                body {
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                    background-color: #0a0a0a;
                                    color: #e5e5e5;
                                    padding: 32px;
                                    line-height: 1.6;
                                }
                                .email-wrapper {
                                    max-width: 600px;
                                    margin: 0 auto;
                                    background-color: #18181b;
                                    border-radius: 10px;
                                    overflow: hidden;
                                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                                }
                                .header {
                                    text-align: center;
                                    padding: 48px 32px 32px;
                                    border-bottom: 2px solid #22c55e;
                                    background-color: #1f1f23;
                                }
                                .logo { max-width: 150px; height: auto; margin-bottom: 16px; }
                                .header h1 { color: #22c55e; font-size: 24px; font-weight: 600; }
                                .content { padding: 40px 32px; }
                                .greeting { font-size: 17px; color: #ffffff; font-weight: 500; margin-bottom: 24px; }
                                .success-banner {
                                    background: linear-gradient(135deg, #166534 0%%, #22c55e 100%%);
                                    padding: 20px;
                                    border-radius: 8px;
                                    text-align: center;
                                    margin: 24px 0;
                                }
                                .success-banner h2 {
                                    color: #ffffff;
                                    font-size: 20px;
                                    margin-bottom: 8px;
                                }
                                .success-banner p {
                                    color: #dcfce7;
                                    font-size: 14px;
                                    margin: 0;
                                }
                                .info-box {
                                    background-color: #1f1f23;
                                    padding: 24px;
                                    border-radius: 8px;
                                    margin: 24px 0;
                                    border: 1px solid #2e2e32;
                                }
                                .info-row {
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 12px 0;
                                    border-bottom: 1px solid #2e2e32;
                                }
                                .info-row:last-child { border-bottom: none; }
                                .info-label { color: #a1a1aa; font-size: 14px; }
                                .info-value { color: #ffffff; font-weight: 600; font-size: 14px; text-align: right; }
                                .footer {
                                    background-color: #18181b;
                                    padding: 32px;
                                    text-align: center;
                                    border-top: 1px solid #2e2e32;
                                }
                                .footer p { font-size: 13px; color: #71717a; margin: 6px 0; }
                                .footer .brand { color: #f97316; font-weight: 600; }
                            </style>
                        </head>
                        <body>
                            <div class="email-wrapper">
                                <div class="header">
                                    <img src="%s" alt="DriveCare Logo" class="logo">
                                    <h1>✓ Service Completed</h1>
                                </div>

                                <div class="content">
                                    <p class="greeting">Hello <strong>%s</strong>,</p>

                                    <div class="success-banner">
                                        <h2>🎉 All Done!</h2>
                                        <p>Your vehicle service has been completed successfully</p>
                                    </div>

                                    <div class="info-box">
                                        <div class="info-row">
                                            <span class="info-label">Booking ID</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Service</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Vehicle</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Started At</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Completed At</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                    </div>

                                    <p style="color: #22c55e; font-size: 16px; font-weight: 600; text-align: center; margin: 24px 0;">
                                        Your vehicle is ready for pickup!
                                    </p>

                                    <p style="color: #a1a1aa; font-size: 14px;">
                                        Thank you for choosing %s. We hope to serve you again soon!
                                    </p>
                                </div>

                                <div class="footer">
                                    <p>Best regards,</p>
                                    <p class="brand">The %s Team</p>
                                    <p style="margin-top: 20px;">This is an automated email. Please do not reply.</p>
                                    <p style="color: #52525b; font-size: 12px; margin-top: 16px;">
                                        © 2025 %s. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                logoUrl, customerName, bookingId, serviceName, vehicleInfo, startTime, endTime, appName, appName,
                appName);
    }

    // ===================================================================
    // VEHICLE ADDED EMAIL
    // ===================================================================
    public void sendVehicleAddedEmail(String toEmail, String userName, String vehicleInfo, String registrationNumber,
            String make, String model, String year) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String fromAddress = fromEmail;
            String fromName = "DriveCare";

            if (fromEmail.contains("<") && fromEmail.contains(">")) {
                int startIdx = fromEmail.indexOf("<");
                fromName = fromEmail.substring(0, startIdx).trim();
                fromAddress = fromEmail.substring(startIdx + 1, fromEmail.indexOf(">")).trim();
            }

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Vehicle Added Successfully - " + appName);

            String htmlContent = buildVehicleAddedHtml(userName, vehicleInfo, registrationNumber, make, model, year);
            String textContent = buildVehicleAddedText(userName, vehicleInfo, registrationNumber, make, model, year);

            helper.setText(textContent, htmlContent);
            mimeMessage.setHeader("X-Mailer", appName);

            mailSender.send(mimeMessage);
            logger.info("Vehicle added email sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send vehicle added email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send vehicle added email", e);
        }
    }

    private String buildVehicleAddedText(String userName, String vehicleInfo, String registrationNumber, String make,
            String model, String year) {
        return String.format("""
                Hello %s,

                Great news! Your vehicle has been successfully added to your %s account.

                Vehicle Details:
                - Registration Number: %s
                - Make: %s
                - Model: %s
                - Year: %s

                You can now:
                • Book service appointments for this vehicle
                • Track service history
                • Receive maintenance reminders
                • Manage vehicle information

                If you didn't add this vehicle, please contact us immediately.

                Best regards,
                %s Team
                """, userName, appName, registrationNumber, make, model, year, appName);
    }

    private String buildVehicleAddedHtml(String userName, String vehicleInfo, String registrationNumber, String make,
            String model, String year) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <style>
                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                body {
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                    background-color: #0a0a0a;
                                    color: #e5e5e5;
                                    padding: 32px;
                                    line-height: 1.6;
                                }
                                .email-wrapper {
                                    max-width: 600px;
                                    margin: 0 auto;
                                    background-color: #18181b;
                                    border-radius: 10px;
                                    overflow: hidden;
                                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                                }
                                .header {
                                    text-align: center;
                                    padding: 48px 32px 32px;
                                    border-bottom: 2px solid #22c55e;
                                    background-color: #1f1f23;
                                }
                                .logo { max-width: 150px; height: auto; margin-bottom: 16px; }
                                .header h1 { color: #22c55e; font-size: 24px; font-weight: 600; }
                                .content { padding: 40px 32px; }
                                .greeting { font-size: 17px; color: #ffffff; font-weight: 500; margin-bottom: 24px; }
                                .vehicle-card {
                                    background: linear-gradient(135deg, #1f1f23 0%%, #2e2e32 100%%);
                                    padding: 24px;
                                    border-radius: 12px;
                                    margin: 24px 0;
                                    border: 2px solid #22c55e;
                                }
                                .vehicle-card h2 {
                                    color: #22c55e;
                                    font-size: 20px;
                                    margin-bottom: 16px;
                                    text-align: center;
                                }
                                .info-row {
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 12px 0;
                                    border-bottom: 1px solid #3f3f46;
                                }
                                .info-row:last-child { border-bottom: none; }
                                .info-label { color: #a1a1aa; font-size: 14px; }
                                .info-value { color: #ffffff; font-weight: 600; font-size: 14px; text-align: right; }
                                .features-box {
                                    background-color: #1f1f23;
                                    padding: 20px;
                                    border-radius: 8px;
                                    margin: 24px 0;
                                }
                                .features-box h3 {
                                    color: #ffffff;
                                    font-size: 16px;
                                    margin-bottom: 12px;
                                }
                                .features-box ul {
                                    list-style: none;
                                    padding: 0;
                                }
                                .features-box li {
                                    color: #d4d4d8;
                                    font-size: 14px;
                                    padding: 8px 0;
                                    padding-left: 24px;
                                    position: relative;
                                }
                                .features-box li:before {
                                    content: "✓";
                                    color: #22c55e;
                                    font-weight: bold;
                                    position: absolute;
                                    left: 0;
                                }
                                .security-notice {
                                    background-color: #422006;
                                    padding: 16px;
                                    border-radius: 6px;
                                    margin: 24px 0;
                                }
                                .security-notice p {
                                    color: #fef3c7;
                                    font-size: 13px;
                                    margin: 0;
                                }
                                .footer {
                                    background-color: #18181b;
                                    padding: 32px;
                                    text-align: center;
                                    border-top: 1px solid #2e2e32;
                                }
                                .footer p { font-size: 13px; color: #71717a; margin: 6px 0; }
                                .footer .brand { color: #f97316; font-weight: 600; }
                            </style>
                        </head>
                        <body>
                            <div class="email-wrapper">
                                <div class="header">
                                    <img src="%s" alt="DriveCare Logo" class="logo">
                                    <h1>🚗 Vehicle Added Successfully</h1>
                                </div>

                                <div class="content">
                                    <p class="greeting">Hello <strong>%s</strong>,</p>
                                    <p style="color: #d4d4d8; margin-bottom: 20px;">
                                        Great news! Your vehicle has been successfully added to your account.
                                    </p>

                                    <div class="vehicle-card">
                                        <h2>%s</h2>
                                        <div class="info-row">
                                            <span class="info-label">Registration Number</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Make</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Model</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Year</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                    </div>

                                    <div class="features-box">
                                        <h3>What's Next?</h3>
                                        <ul>
                                            <li>Book service appointments for this vehicle</li>
                                            <li>Track complete service history</li>
                                            <li>Receive maintenance reminders</li>
                                            <li>Manage vehicle information anytime</li>
                                        </ul>
                                    </div>

                                    <div class="security-notice">
                                        <p><strong>Security Notice:</strong> If you didn't add this vehicle to your account, please contact our support team immediately.</p>
                                    </div>
                                </div>

                                <div class="footer">
                                    <p>Best regards,</p>
                                    <p class="brand">The %s Team</p>
                                    <p style="margin-top: 20px;">This is an automated email. Please do not reply.</p>
                                    <p style="color: #52525b; font-size: 12px; margin-top: 16px;">
                                        © 2025 %s. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                logoUrl, userName, vehicleInfo, registrationNumber, make, model, year, appName, appName);
    }

    // ===================================================================
    // VEHICLE UPDATED EMAIL
    // ===================================================================
    public void sendVehicleUpdatedEmail(String toEmail, String userName, String vehicleInfo, String registrationNumber,
            String changesSummary) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String fromAddress = fromEmail;
            String fromName = "DriveCare";

            if (fromEmail.contains("<") && fromEmail.contains(">")) {
                int startIdx = fromEmail.indexOf("<");
                fromName = fromEmail.substring(0, startIdx).trim();
                fromAddress = fromEmail.substring(startIdx + 1, fromEmail.indexOf(">")).trim();
            }

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Vehicle Information Updated - " + appName);

            String htmlContent = buildVehicleUpdatedHtml(userName, vehicleInfo, registrationNumber, changesSummary);
            String textContent = buildVehicleUpdatedText(userName, vehicleInfo, registrationNumber, changesSummary);

            helper.setText(textContent, htmlContent);
            mimeMessage.setHeader("X-Mailer", appName);

            mailSender.send(mimeMessage);
            logger.info("Vehicle updated email sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send vehicle updated email to: {}", toEmail, e);
        }
    }

    private String buildVehicleUpdatedText(String userName, String vehicleInfo, String registrationNumber,
            String changesSummary) {
        return String.format("""
                Hello %s,

                The information for your vehicle (%s) has been updated.

                Changes Made:
                %s

                If you didn't make these changes, please contact us immediately.

                Best regards,
                %s Team
                """, userName, vehicleInfo, changesSummary, appName);
    }

    private String buildVehicleUpdatedHtml(String userName, String vehicleInfo, String registrationNumber,
            String changesSummary) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <style>
                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                body {
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                    background-color: #0a0a0a;
                                    color: #e5e5e5;
                                    padding: 32px;
                                    line-height: 1.6;
                                }
                                .email-wrapper {
                                    max-width: 600px;
                                    margin: 0 auto;
                                    background-color: #18181b;
                                    border-radius: 10px;
                                    overflow: hidden;
                                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                                }
                                .header {
                                    text-align: center;
                                    padding: 48px 32px 32px;
                                    border-bottom: 2px solid #3b82f6;
                                    background-color: #1f1f23;
                                }
                                .logo { max-width: 150px; height: auto; margin-bottom: 16px; }
                                .header h1 { color: #3b82f6; font-size: 24px; font-weight: 600; }
                                .content { padding: 40px 32px; }
                                .greeting { font-size: 17px; color: #ffffff; font-weight: 500; margin-bottom: 24px; }
                                .changes-box {
                                    background-color: #1f1f23;
                                    padding: 20px;
                                    border-radius: 8px;
                                    margin: 24px 0;
                                    border-left: 4px solid #3b82f6;
                                }
                                .changes-box h3 {
                                    color: #3b82f6;
                                    font-size: 16px;
                                    margin-bottom: 12px;
                                }
                                .changes-box pre {
                                    color: #d4d4d8;
                                    font-size: 14px;
                                    white-space: pre-wrap;
                                    font-family: monospace;
                                    line-height: 1.6;
                                }
                                .security-notice {
                                    background-color: #422006;
                                    padding: 16px;
                                    border-radius: 6px;
                                    margin: 24px 0;
                                }
                                .security-notice p {
                                    color: #fef3c7;
                                    font-size: 13px;
                                    margin: 0;
                                }
                                .footer {
                                    background-color: #18181b;
                                    padding: 32px;
                                    text-align: center;
                                    border-top: 1px solid #2e2e32;
                                }
                                .footer p { font-size: 13px; color: #71717a; margin: 6px 0; }
                                .footer .brand { color: #f97316; font-weight: 600; }
                            </style>
                        </head>
                        <body>
                            <div class="email-wrapper">
                                <div class="header">
                                    <img src="%s" alt="DriveCare Logo" class="logo">
                                    <h1>🔄 Vehicle Information Updated</h1>
                                </div>

                                <div class="content">
                                    <p class="greeting">Hello <strong>%s</strong>,</p>
                                    <p style="color: #d4d4d8; margin-bottom: 20px;">
                                        The information for your vehicle <strong>%s</strong> (Reg: %s) has been updated.
                                    </p>

                                    <div class="changes-box">
                                        <h3>Changes Made:</h3>
                                        <pre>%s</pre>
                                    </div>

                                    <div class="security-notice">
                                        <p><strong>Security Notice:</strong> If you didn't make these changes, please contact our support team immediately.</p>
                                    </div>
                                </div>

                                <div class="footer">
                                    <p>Best regards,</p>
                                    <p class="brand">The %s Team</p>
                                    <p style="margin-top: 20px;">This is an automated email. Please do not reply.</p>
                                    <p style="color: #52525b; font-size: 12px; margin-top: 16px;">
                                        © 2025 %s. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                logoUrl, userName, vehicleInfo, registrationNumber, changesSummary, appName, appName);
    }

    // ===================================================================
    // VEHICLE DELETED EMAIL
    // ===================================================================
    public void sendVehicleDeletedEmail(String toEmail, String userName, String vehicleInfo, String registrationNumber,
            String deletionTime) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String fromAddress = fromEmail;
            String fromName = "DriveCare";

            if (fromEmail.contains("<") && fromEmail.contains(">")) {
                int startIdx = fromEmail.indexOf("<");
                fromName = fromEmail.substring(0, startIdx).trim();
                fromAddress = fromEmail.substring(startIdx + 1, fromEmail.indexOf(">")).trim();
            }

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Vehicle Removed from Account - " + appName);

            String htmlContent = buildVehicleDeletedHtml(userName, vehicleInfo, registrationNumber, deletionTime);
            String textContent = buildVehicleDeletedText(userName, vehicleInfo, registrationNumber, deletionTime);

            helper.setText(textContent, htmlContent);
            mimeMessage.setHeader("X-Mailer", appName);

            mailSender.send(mimeMessage);
            logger.info("Vehicle deleted email sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send vehicle deleted email to: {}", toEmail, e);
        }
    }

    private String buildVehicleDeletedText(String userName, String vehicleInfo, String registrationNumber,
            String deletionTime) {
        return String.format("""
                Hello %s,

                Your vehicle has been removed from your %s account.

                Removed Vehicle:
                - Vehicle: %s
                - Registration: %s
                - Removed At: %s

                Important:
                • All service history for this vehicle has been retained
                • You can add this vehicle again at any time
                • Associated appointments are still accessible

                If you didn't remove this vehicle, please contact us immediately.

                Best regards,
                %s Team
                """, userName, appName, vehicleInfo, registrationNumber, deletionTime, appName);
    }

    private String buildVehicleDeletedHtml(String userName, String vehicleInfo, String registrationNumber,
            String deletionTime) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <style>
                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                body {
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                    background-color: #0a0a0a;
                                    color: #e5e5e5;
                                    padding: 32px;
                                    line-height: 1.6;
                                }
                                .email-wrapper {
                                    max-width: 600px;
                                    margin: 0 auto;
                                    background-color: #18181b;
                                    border-radius: 10px;
                                    overflow: hidden;
                                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                                }
                                .header {
                                    text-align: center;
                                    padding: 48px 32px 32px;
                                    border-bottom: 2px solid #ef4444;
                                    background-color: #1f1f23;
                                }
                                .logo { max-width: 150px; height: auto; margin-bottom: 16px; }
                                .header h1 { color: #ef4444; font-size: 24px; font-weight: 600; }
                                .content { padding: 40px 32px; }
                                .greeting { font-size: 17px; color: #ffffff; font-weight: 500; margin-bottom: 24px; }
                                .vehicle-box {
                                    background-color: #1f1f23;
                                    padding: 20px;
                                    border-radius: 8px;
                                    margin: 24px 0;
                                    border-left: 4px solid #ef4444;
                                }
                                .vehicle-box h3 {
                                    color: #ef4444;
                                    font-size: 16px;
                                    margin-bottom: 12px;
                                }
                                .info-row {
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 8px 0;
                                }
                                .info-label { color: #a1a1aa; font-size: 14px; }
                                .info-value { color: #ffffff; font-weight: 600; font-size: 14px; text-align: right; }
                                .info-box {
                                    background-color: #1f1f23;
                                    padding: 16px;
                                    border-radius: 6px;
                                    margin: 24px 0;
                                }
                                .info-box h4 {
                                    color: #ffffff;
                                    font-size: 14px;
                                    margin-bottom: 8px;
                                }
                                .info-box ul {
                                    list-style: none;
                                    padding: 0;
                                }
                                .info-box li {
                                    color: #d4d4d8;
                                    font-size: 13px;
                                    padding: 6px 0;
                                    padding-left: 20px;
                                    position: relative;
                                }
                                .info-box li:before {
                                    content: "•";
                                    color: #a1a1aa;
                                    position: absolute;
                                    left: 0;
                                }
                                .security-notice {
                                    background-color: #7f1d1d;
                                    padding: 16px;
                                    border-radius: 6px;
                                    margin: 24px 0;
                                }
                                .security-notice p {
                                    color: #fecaca;
                                    font-size: 13px;
                                    margin: 0;
                                }
                                .footer {
                                    background-color: #18181b;
                                    padding: 32px;
                                    text-align: center;
                                    border-top: 1px solid #2e2e32;
                                }
                                .footer p { font-size: 13px; color: #71717a; margin: 6px 0; }
                                .footer .brand { color: #f97316; font-weight: 600; }
                            </style>
                        </head>
                        <body>
                            <div class="email-wrapper">
                                <div class="header">
                                    <img src="%s" alt="DriveCare Logo" class="logo">
                                    <h1>🗑️ Vehicle Removed</h1>
                                </div>

                                <div class="content">
                                    <p class="greeting">Hello <strong>%s</strong>,</p>
                                    <p style="color: #d4d4d8; margin-bottom: 20px;">
                                        Your vehicle has been removed from your account.
                                    </p>

                                    <div class="vehicle-box">
                                        <h3>Removed Vehicle Details</h3>
                                        <div class="info-row">
                                            <span class="info-label">Vehicle</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Registration Number</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="info-label">Removed At</span>
                                            <span class="info-value">%s</span>
                                        </div>
                                    </div>

                                    <div class="info-box">
                                        <h4>Important Information:</h4>
                                        <ul>
                                            <li>All service history for this vehicle has been retained</li>
                                            <li>You can add this vehicle again at any time</li>
                                            <li>Associated appointments are still accessible in your history</li>
                                        </ul>
                                    </div>

                                    <div class="security-notice">
                                        <p><strong>⚠️ Security Alert:</strong> If you didn't remove this vehicle, please contact our support team immediately. This could indicate unauthorized access to your account.</p>
                                    </div>
                                </div>

                                <div class="footer">
                                    <p>Best regards,</p>
                                    <p class="brand">The %s Team</p>
                                    <p style="margin-top: 20px;">This is an automated email. Please do not reply.</p>
                                    <p style="color: #52525b; font-size: 12px; margin-top: 16px;">
                                        © 2025 %s. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                logoUrl, userName, vehicleInfo, registrationNumber, deletionTime, appName, appName);
    }

    // ===================================================================
    // LOW STOCK ALERT EMAIL
    // ===================================================================
    public void sendLowStockAlert(String toEmail, String adminName, String itemName,
            int currentQuantity, int minStock, String category) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String fromAddress = fromEmail;
            String fromName = "DriveCare";

            if (fromEmail.contains("<") && fromEmail.contains(">")) {
                int startIdx = fromEmail.indexOf("<");
                fromName = fromEmail.substring(0, startIdx).trim();
                fromAddress = fromEmail.substring(startIdx + 1, fromEmail.indexOf(">")).trim();
            }

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Low Stock Alert: " + itemName + " - " + appName);

            String htmlContent = buildLowStockAlertHtml(adminName, itemName, currentQuantity, minStock, category);
            String textContent = buildLowStockAlertText(adminName, itemName, currentQuantity, minStock, category);

            helper.setText(textContent, htmlContent);
            mimeMessage.setHeader("X-Mailer", appName);
            mimeMessage.setHeader("Priority", "urgent");

            mailSender.send(mimeMessage);
            logger.info("Low stock alert email sent to: {} for item: {}", toEmail, itemName);
        } catch (Exception e) {
            logger.error("Failed to send low stock alert email to: {} for item: {}", toEmail, itemName, e);
            // Don't throw exception - inventory operations should continue even if email
            // fails
        }
    }

    private String buildLowStockAlertText(String adminName, String itemName,
            int currentQuantity, int minStock, String category) {
        return String.format("""
                Hello %s,

                ⚠️ LOW STOCK ALERT

                An inventory item has fallen below its minimum stock threshold and requires immediate attention.

                Item Details:
                - Item Name: %s
                - Category: %s
                - Current Stock: %d units
                - Minimum Stock: %d units
                - Status: CRITICAL - Needs Restocking

                Action Required:
                Please restock this item as soon as possible to avoid service disruptions.

                You can restock this item from the Admin Inventory page:
                %s/admin/inventory

                Best regards,
                %s Inventory Management System
                """, adminName, itemName, category, currentQuantity, minStock, frontendUrl, appName);
    }

    private String buildLowStockAlertHtml(String adminName, String itemName,
            int currentQuantity, int minStock, String category) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                body {
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                    background-color: #0a0a0a;
                                    color: #e5e5e5;
                                    padding: 32px;
                                    line-height: 1.6;
                                }
                                .email-wrapper {
                                    max-width: 600px;
                                    margin: 0 auto;
                                    background-color: #18181b;
                                    border-radius: 10px;
                                    overflow: hidden;
                                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                                }
                                .header {
                                    text-align: center;
                                    padding: 48px 32px 32px;
                                    border-bottom: 2px solid #ef4444;
                                    background-color: #1f1f23;
                                }
                                .logo { max-width: 150px; height: auto; margin-bottom: 16px; }
                                .header h1 {
                                    color: #ef4444;
                                    font-size: 24px;
                                    font-weight: 600;
                                }
                                .content { padding: 40px 32px; }
                                .greeting { font-size: 17px; color: #ffffff; font-weight: 500; margin-bottom: 24px; }
                                .alert-banner {
                                    background: linear-gradient(135deg, #7f1d1d 0%%, #ef4444 100%%);
                                    padding: 20px;
                                    border-radius: 8px;
                                    text-align: center;
                                    margin: 24px 0;
                                    border: 2px solid #dc2626;
                                }
                                .alert-banner h2 {
                                    color: #ffffff;
                                    font-size: 20px;
                                    margin-bottom: 8px;
                                }
                                .alert-banner p {
                                    color: #fecaca;
                                    font-size: 14px;
                                    margin: 0;
                                }
                                .item-box {
                                    background-color: #1f1f23;
                                    padding: 24px;
                                    border-radius: 8px;
                                    margin: 24px 0;
                                    border-left: 4px solid #ef4444;
                                }
                                .item-name {
                                    color: #ffffff;
                                    font-size: 20px;
                                    font-weight: 700;
                                    margin-bottom: 16px;
                                    text-align: center;
                                }
                                .stock-info {
                                    display: flex;
                                    justify-content: space-around;
                                    margin: 20px 0;
                                    padding: 16px;
                                    background-color: #18181b;
                                    border-radius: 6px;
                                }
                                .stock-col {
                                    text-align: center;
                                }
                                .stock-label {
                                    color: #a1a1aa;
                                    font-size: 12px;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                    margin-bottom: 8px;
                                }
                                .stock-value {
                                    color: #ffffff;
                                    font-size: 24px;
                                    font-weight: 700;
                                }
                                .stock-value.critical {
                                    color: #ef4444;
                                }
                                .stock-value.normal {
                                    color: #22c55e;
                                }
                                .stock-unit {
                                    color: #a1a1aa;
                                    font-size: 14px;
                                    margin-left: 4px;
                                }
                                .status-badge {
                                    display: inline-block;
                                    background-color: #7f1d1d;
                                    color: #fecaca;
                                    padding: 8px 16px;
                                    border-radius: 20px;
                                    font-size: 12px;
                                    font-weight: 600;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                    margin: 12px 0;
                                }
                                .category-tag {
                                    display: inline-block;
                                    background-color: #3730a3;
                                    color: #c7d2fe;
                                    padding: 6px 12px;
                                    border-radius: 12px;
                                    font-size: 11px;
                                    font-weight: 600;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                    margin-bottom: 12px;
                                }
                                .action-box {
                                    background: linear-gradient(135deg, #422006 0%%, #78350f 100%%);
                                    padding: 20px;
                                    border-radius: 8px;
                                    margin: 24px 0;
                                    border-left: 4px solid #f97316;
                                }
                                .action-box h3 {
                                    color: #fed7aa;
                                    font-size: 16px;
                                    margin-bottom: 12px;
                                }
                                .action-box p {
                                    color: #fef3c7;
                                    font-size: 14px;
                                    margin-bottom: 16px;
                                }
                                .button-container {
                                    text-align: center;
                                    margin: 24px 0;
                                }
                                .button {
                                    display: inline-block;
                                    background-color: #ef4444;
                                    color: #ffffff;
                                    text-decoration: none;
                                    padding: 14px 36px;
                                    border-radius: 6px;
                                    font-weight: 600;
                                    font-size: 15px;
                                    transition: background-color 0.25s ease;
                                }
                                .button:hover {
                                    background-color: #dc2626;
                                }
                                .footer {
                                    background-color: #18181b;
                                    padding: 32px;
                                    text-align: center;
                                    border-top: 1px solid #2e2e32;
                                }
                                .footer p { font-size: 13px; color: #71717a; margin: 6px 0; }
                                .footer .brand { color: #f97316; font-weight: 600; }
                            </style>
                        </head>
                        <body>
                            <div class="email-wrapper">
                                <div class="header">
                                    <img src="%s" alt="DriveCare Logo" class="logo">
                                    <h1>⚠️ Low Stock Alert</h1>
                                </div>

                                <div class="content">
                                    <p class="greeting">Hello <strong>%s</strong>,</p>

                                    <div class="alert-banner">
                                        <h2>🚨 Immediate Action Required</h2>
                                        <p>An inventory item has fallen below minimum stock level</p>
                                    </div>

                                    <div class="item-box">
                                        <div style="text-align: center;">
                                            <span class="category-tag">%s</span>
                                        </div>
                                        <div class="item-name">%s</div>
                                        <div style="text-align: center;">
                                            <span class="status-badge">⚠️ CRITICAL - Needs Restocking</span>
                                        </div>

                                        <div class="stock-info">
                                            <div class="stock-col">
                                                <div class="stock-label">Current Stock</div>
                                                <div class="stock-value critical">
                                                    %d<span class="stock-unit">units</span>
                                                </div>
                                            </div>
                                            <div class="stock-col">
                                                <div class="stock-label">Minimum Stock</div>
                                                <div class="stock-value normal">
                                                    %d<span class="stock-unit">units</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="action-box">
                                        <h3>📋 Required Action</h3>
                                        <p>Please restock this item as soon as possible to avoid service disruptions and ensure smooth operations.</p>
                                    </div>

                                    <div class="button-container">
                                        <a href="%s/admin/inventory" class="button" style="color: #ffffff !important;">
                                            Restock Now
                                        </a>
                                    </div>

                                    <p style="color: #a1a1aa; font-size: 13px; text-align: center; margin-top: 24px;">
                                        This is an automated alert from the Inventory Management System
                                    </p>
                                </div>

                                <div class="footer">
                                    <p>Best regards,</p>
                                    <p class="brand">%s Inventory Management System</p>
                                    <p style="margin-top: 20px;">This is an automated email. Please do not reply.</p>
                                    <p style="color: #52525b; font-size: 12px; margin-top: 16px;">
                                        © 2025 %s. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                logoUrl, adminName, category, itemName, currentQuantity, minStock,
                frontendUrl, appName, appName);
    }
}