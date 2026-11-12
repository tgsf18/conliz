package com.conliz.platform.controllers;

import com.conliz.platform.auth.AuthService;
import com.conliz.platform.auth.CookieService;
import com.conliz.platform.domain.User;
import com.conliz.platform.dto.*;
import com.conliz.platform.service.AuditService;
import com.conliz.platform.service.UserService;
import com.conliz.platform.twofactor.TwoFactorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticação", description = "Endpoints seguros de sessão por cookie, 2FA TOTP e rotação de refresh tokens")
public class AuthController {

    private final AuthService authService;
    private final CookieService cookieService;
    private final TwoFactorService twoFactorService;
    private final UserService userService;
    private final AuditService auditService;

    public AuthController(
            AuthService authService,
            CookieService cookieService,
            TwoFactorService twoFactorService,
            UserService userService,
            AuditService auditService) {
        this.authService = authService;
        this.cookieService = cookieService;
        this.twoFactorService = twoFactorService;
        this.userService = userService;
        this.auditService = auditService;
    }

    @PostMapping("/login")
    @Operation(summary = "Login passo 1 (email e senha com BCrypt)")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse response) {

        String clientIp = extractClientIp(servletRequest);
        AuthService.AuthResult result = authService.login(request, clientIp);

        if (result.response().requires2fa()) {
            return ResponseEntity.ok(result.response());
        }

        applyAuthCookies(response, result);
        return ResponseEntity.ok(result.response());
    }

    @PostMapping("/2fa/verify")
    @Operation(summary = "Login passo 2 (verificação de TOTP ou código de recuperação)")
    public ResponseEntity<AuthResponse> verify2fa(
            @Valid @RequestBody TwoFactorVerifyRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse response) {

        String clientIp = extractClientIp(servletRequest);
        AuthService.AuthResult result = authService.verify2fa(request, clientIp);

        applyAuthCookies(response, result);
        return ResponseEntity.ok(result.response());
    }

    @PostMapping("/2fa/setup")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Iniciar cadastro de 2FA TOTP (gera QR code e códigos de recuperação)")
    public ResponseEntity<TwoFactorSetupResponse> setup2fa(@AuthenticationPrincipal User user) {
        TwoFactorService.TwoFactorSetupData setupData = twoFactorService.initSetup(user.getEmail());
        auditService.logAction("2FA_SETUP_INITIATED", "USER", user.getId().toString(), "QR Code gerado");

        return ResponseEntity.ok(new TwoFactorSetupResponse(
                setupData.secret(),
                setupData.otpauthUrl(),
                setupData.qrCodeBase64(),
                setupData.recoveryCodes()
        ));
    }

    @PostMapping("/2fa/confirm")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Confirmar ativação de 2FA validando primeiro código")
    public ResponseEntity<AuthResponse> confirm2fa(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TwoFactorConfirmRequest request) {

        boolean valid = twoFactorService.verifyTotp(request.secret(), request.code());
        if (!valid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código de verificação incorreto. Tente novamente.");
        }

        var recoveryCodes = twoFactorService.generateRecoveryCodes();
        userService.enable2fa(user, request.secret(), recoveryCodes);
        auditService.logAction("2FA_ENABLED", "USER", user.getId().toString(), "2FA TOTP ativado com sucesso");

        return ResponseEntity.ok(AuthResponse.authenticated(AuthUserDto.fromEntity(user)));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotação de refresh token com emissão de novo JWT")
    public ResponseEntity<AuthResponse> refresh(
            HttpServletRequest servletRequest,
            HttpServletResponse response) {

        String rawRefreshToken = extractCookieValue(servletRequest, CookieService.REFRESH_COOKIE_NAME)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cookie de refresh token não fornecido."));

        AuthService.AuthResult result = authService.refreshToken(rawRefreshToken);
        applyAuthCookies(response, result);

        return ResponseEntity.ok(result.response());
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout com invalidação de token no banco e limpeza de cookies")
    public ResponseEntity<Void> logout(
            @AuthenticationPrincipal User user,
            HttpServletRequest servletRequest,
            HttpServletResponse response) {

        extractCookieValue(servletRequest, CookieService.REFRESH_COOKIE_NAME)
                .ifPresent(token -> authService.logout(token, user));

        response.addHeader(HttpHeaders.SET_COOKIE, cookieService.clearAccessTokenCookie().toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cookieService.clearRefreshTokenCookie().toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cookieService.clearCsrfCookie().toString());

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Consultar usuário autenticado na sessão atual")
    public ResponseEntity<AuthUserDto> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(AuthUserDto.fromEntity(user));
    }

    private void applyAuthCookies(HttpServletResponse response, AuthService.AuthResult result) {
        if (result.accessToken() != null) {
            response.addHeader(HttpHeaders.SET_COOKIE, cookieService.createAccessTokenCookie(result.accessToken()).toString());
        }
        if (result.refreshToken() != null) {
            response.addHeader(HttpHeaders.SET_COOKIE, cookieService.createRefreshTokenCookie(result.refreshToken()).toString());
        }
        if (result.csrfToken() != null) {
            response.addHeader(HttpHeaders.SET_COOKIE, cookieService.createCsrfTokenCookie(result.csrfToken()).toString());
        }
    }

    private Optional<String> extractCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    private String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
