package com.ead.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
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

    public void sendPasswordResetEmail(String toEmail, String token, String userName) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + token;

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            // Brevo requires proper From header format - use simple email or "Name <email>" format
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
        return String.format("""
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
                """, userName, appName, resetLink, resetLink, token, appName);
    }

    private String buildPasswordResetEmailHtml(String userName, String resetLink, String token) {
        return String.format("""
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
                               If you didn’t request this password reset, you can safely ignore this email.
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
                """, logoUrl, userName, appName, resetLink, resetLink, resetLink, token, appName, appName);
    }

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
            logger.error("Failed to create password changed confirmation email for: {} - Error: {}", toEmail, e.getMessage());
            // Don't throw exception here as password is already changed
        } catch (Exception e) {
            logger.error("Failed to send password changed confirmation email to: {} - Error: {}", toEmail, e.getMessage());
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
        return String.format("""
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
                """, logoUrl, userName, appName, appName, appName);
    }
}
