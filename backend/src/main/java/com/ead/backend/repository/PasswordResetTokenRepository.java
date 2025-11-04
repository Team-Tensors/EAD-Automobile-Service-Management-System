package com.ead.backend.repository;

import com.ead.backend.entity.PasswordResetToken;
import com.ead.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    List<PasswordResetToken> findByUserAndUsedFalse(User user);

    void deleteByExpiryDateBefore(LocalDateTime dateTime);

    void deleteByUser(User user);

}

