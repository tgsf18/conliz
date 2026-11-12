package com.conliz.platform.auth;

import com.conliz.platform.domain.User;
import com.conliz.platform.dto.*;
import com.conliz.platform.ratelimit.RateLimitService;
import com.conliz.platform.service.AuditService;
import com.conliz.platform.service.UserService;
import com.conliz.platform.twofactor.TwoFactorService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final TwoFactorService twoFactorService;
    private final RateLimitService rateLimitService;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;
    private final SecretKey preAuthKey;

    public AuthService(
            UserService userService,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            TwoFactorService twoFactorService,
            RateLimitService rateLimitService,
            AuditService auditService,
            PasswordEncoder passwordEncoder,
            @Value("${conliz.jwt.secret}") String secret) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.twoFactorService = twoFactorService;
        this.rateLimitService = rateLimitService;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;

        byte[] keyBytes = ("PRE_AUTH_" + secret).getBytes(StandardCharsets.UTF_8);
        byte[] padded = new byte[32];
        System.arraycopy(keyBytes, 0, padded, 0, Math.min(keyBytes.length, 32));
        this.preAuthKey = Keys.hmacShaKeyFor(padded);
    }

    public record AuthResult(
            String accessToken,
            String refreshToken,
            String csrfToken,
            AuthResponse response
    ) {}

    public AuthResult login(LoginRequest request, String clientIp) {
        // 1. Anti brute force rate limiting
        if (!rateLimitService.tryConsumeLoginAttempt("ip:" + clientIp) ||
            !rateLimitService.tryConsumeLoginAttempt("email:" + request.email().toLowerCase().trim())) {
            auditService.logAction("RATE_LIMIT_EXCEEDED", "AUTH", clientIp, "Tentativa de login bloqueada por rate limit");
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Muitas tentativas de acesso. Por favor, aguarde 1 minuto.");
        }

        // 2. Lookup user
        Optional<User> userOpt = userService.findByEmail(request.email());
        if (userOpt.isEmpty()) {
            auditService.logAction("LOGIN_FAILED", "USER", request.email(), "Tentativa com e-mail inexistente");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas.");
        }

        User user = userOpt.get();

        // 3. Check account status & lockout
        if (!user.isAtivo()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Conta inativa. Contate a administração.");
        }

        if (user.isLockedOut()) {
            auditService.logAction("ACCOUNT_LOCKED_ACCESS_ATTEMPT", "USER", user.getId().toString(), "Tentativa durante período de bloqueio temporário");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Conta temporariamente bloqueada por tentativas excessivas. Tente novamente em alguns minutos.");
        }

        // 4. Validate password
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            userService.registerFailedLogin(user);
            auditService.logAction("LOGIN_FAILED", "USER", user.getId().toString(), "Senha incorreta");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas.");
        }

        // 5. Check if 2FA is required
        if (user.isTwoFactorEnabled()) {
            String preAuthToken = generatePreAuthToken(user.getId());
            auditService.logAction("LOGIN_STEP1_SUCCESS", "USER", user.getId().toString(), "Passo 1 OK, aguardando TOTP 2FA");
            return new AuthResult(null, null, null, AuthResponse.requires2fa(preAuthToken));
        }

        // 6. Direct success (No 2FA)
        return completeAuthentication(user, "LOGIN_SUCCESS");
    }

    public AuthResult verify2fa(TwoFactorVerifyRequest request, String clientIp) {
        if (!rateLimitService.tryConsumeLoginAttempt("2fa:" + clientIp)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Muitas tentativas de validação. Aguarde 1 minuto.");
        }

        UUID userId = validatePreAuthToken(request.preAuthToken());
        User user = userService.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão de verificação inválida."));

        if (!user.isAtivo() || user.isLockedOut()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Conta indisponível ou bloqueada.");
        }

        String inputCode = request.code().trim();
        boolean validTotp = twoFactorService.verifyTotp(user.getTwoFactorSecret(), inputCode);
        boolean validRecovery = false;

        if (!validTotp) {
            validRecovery = userService.verifyAndConsumeRecoveryCode(user, inputCode);
        }

        if (!validTotp && !validRecovery) {
            userService.registerFailedLogin(user);
            auditService.logAction("2FA_FAILED", "USER", user.getId().toString(), "Código TOTP/recuperação inválido");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Código de verificação ou recuperação inválido.");
        }

        String action = validRecovery ? "2FA_RECOVERY_CODE_USED" : "2FA_SUCCESS";
        return completeAuthentication(user, action);
    }

    @org.springframework.transaction.annotation.Transactional
    public AuthResult refreshToken(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão não encontrada.");
        }

        var rotatedOpt = refreshTokenService.rotateRefreshToken(rawRefreshToken);
        if (rotatedOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão expirada ou token revogado.");
        }

        var generated = rotatedOpt.get();
        User user = generated.entity().getUsuario();

        if (!user.isAtivo()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário desativado.");
        }

        String newAccessToken = jwtService.generateAccessToken(user);
        String newCsrfToken = UUID.randomUUID().toString();

        return new AuthResult(
                newAccessToken,
                generated.rawToken(),
                newCsrfToken,
                AuthResponse.authenticated(AuthUserDto.fromEntity(user))
        );
    }

    public void logout(String rawRefreshToken, User currentUser) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            refreshTokenService.revokeToken(rawRefreshToken);
        }
        if (currentUser != null) {
            auditService.logAction("LOGOUT", "USER", currentUser.getId().toString(), "Logout realizado pelo usuário");
        }
    }

    private AuthResult completeAuthentication(User user, String auditAction) {
        userService.registerSuccessfulLogin(user);
        String accessToken = jwtService.generateAccessToken(user);
        var refreshResult = refreshTokenService.createRefreshToken(user);
        String csrfToken = UUID.randomUUID().toString();

        auditService.logAction(auditAction, "USER", user.getId().toString(), "Autenticação concluída com emissão de cookies");

        return new AuthResult(
                accessToken,
                refreshResult.rawToken(),
                csrfToken,
                AuthResponse.authenticated(AuthUserDto.fromEntity(user))
        );
    }

    private String generatePreAuthToken(UUID userId) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .subject("2fa_preauth")
                .claim("userId", userId.toString())
                .issuedAt(new Date(now))
                .expiration(new Date(now + 5 * 60 * 1000L)) // 5 minutes validity
                .signWith(preAuthKey)
                .compact();
    }

    private UUID validatePreAuthToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(preAuthKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (!"2fa_preauth".equals(claims.getSubject())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido.");
            }

            return UUID.fromString(claims.get("userId", String.class));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token de pré-autenticação expirado ou inválido.");
        }
    }
}
