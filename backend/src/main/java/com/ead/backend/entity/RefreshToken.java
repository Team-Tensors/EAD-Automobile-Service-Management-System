package com.ead.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false, length = 500)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Instant expiryDate;

    @Column(nullable = false)
    private Instant createdAt;

    @Column
    private Instant lastUsedAt;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column
    private String deviceInfo; // Optional: track device/browser

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    // Utility methods
    public boolean isExpired() {
        return Instant.now().isAfter(this.expiryDate);
    }

    public void markAsUsed() {
        this.lastUsedAt = Instant.now();
    }

    public void revoke() {
        this.revoked = true;
    }
}
