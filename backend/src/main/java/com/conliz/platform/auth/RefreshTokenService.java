package com.conliz.platform.auth;

import com.conliz.platform.domain.RefreshToken;
import com.conliz.platform.domain.User;
import com.conliz.platform.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final long expirationDays;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${conliz.jwt.refresh-expiration-days:7}") long expirationDays) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.expirationDays = expirationDays;
    }

    public record GeneratedRefreshToken(String rawToken, RefreshToken entity) {}

    @Transactional
    public GeneratedRefreshToken createRefreshToken(User user) {
        String rawToken = generateSecureToken();
        String hash = hashToken(rawToken);

        LocalDateTime expiresAt = LocalDateTime.now().plusDays(expirationDays);
        RefreshToken refreshToken = new RefreshToken(user, hash, expiresAt);
        RefreshToken saved = refreshTokenRepository.save(refreshToken);

        return new GeneratedRefreshToken(rawToken, saved);
    }

    @Transactional
    public Optional<GeneratedRefreshToken> rotateRefreshToken(String rawToken) {
        String hash = hashToken(rawToken);
        Optional<RefreshToken> existingOpt = refreshTokenRepository.findByTokenHash(hash);

        if (existingOpt.isEmpty()) {
            return Optional.empty();
        }

        RefreshToken current = existingOpt.get();

        // Security: If already revoked, possible token theft attempt -> revoke all user tokens!
        if (current.isRevoked()) {
            refreshTokenRepository.revokeAllForUser(current.getUsuario());
            return Optional.empty();
        }

        if (current.isExpired()) {
            current.setRevoked(true);
            refreshTokenRepository.save(current);
            return Optional.empty();
        }

        // Revoke current token
        current.setRevoked(true);

        // Generate new rotating token
        String newRawToken = generateSecureToken();
        String newHash = hashToken(newRawToken);
        current.setReplacedByTokenHash(newHash);
        refreshTokenRepository.save(current);

        LocalDateTime expiresAt = LocalDateTime.now().plusDays(expirationDays);
        RefreshToken newEntity = new RefreshToken(current.getUsuario(), newHash, expiresAt);
        RefreshToken saved = refreshTokenRepository.save(newEntity);

        return Optional.of(new GeneratedRefreshToken(newRawToken, saved));
    }

    @Transactional
    public void revokeToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        String hash = hashToken(rawToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllForUser(user);
    }

    private String generateSecureToken() {
        byte[] randomBytes = new byte[48];
        secureRandom.nextBytes(randomBytes);
        return HexFormat.of().formatHex(randomBytes);
    }

    public String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
