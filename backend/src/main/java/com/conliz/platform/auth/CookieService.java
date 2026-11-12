package com.conliz.platform.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class CookieService {

    public static final String ACCESS_COOKIE_NAME = "conliz_access_token";
    public static final String REFRESH_COOKIE_NAME = "conliz_refresh_token";
    public static final String CSRF_COOKIE_NAME = "XSRF-TOKEN";

    private final boolean secure;
    private final String sameSite;
    private final String domain;
    private final long accessMinutes;
    private final long refreshDays;

    public CookieService(
            @Value("${conliz.cookie.secure:false}") boolean secure,
            @Value("${conliz.cookie.same-site:Strict}") String sameSite,
            @Value("${conliz.cookie.domain:}") String domain,
            @Value("${conliz.jwt.expiration-minutes:15}") long accessMinutes,
            @Value("${conliz.jwt.refresh-expiration-days:7}") long refreshDays) {
        this.secure = secure;
        this.sameSite = sameSite;
        this.domain = domain;
        this.accessMinutes = accessMinutes;
        this.refreshDays = refreshDays;
    }

    public ResponseCookie createAccessTokenCookie(String token) {
        return buildCookie(ACCESS_COOKIE_NAME, token, Duration.ofMinutes(accessMinutes), true);
    }

    public ResponseCookie createRefreshTokenCookie(String token) {
        return buildCookie(REFRESH_COOKIE_NAME, token, Duration.ofDays(refreshDays), true);
    }

    public ResponseCookie createCsrfTokenCookie(String csrfToken) {
        // Double-submit cookie pattern: readable by JavaScript frontend to include in X-XSRF-TOKEN header
        return buildCookie(CSRF_COOKIE_NAME, csrfToken, Duration.ofDays(refreshDays), false);
    }

    public ResponseCookie clearAccessTokenCookie() {
        return buildCookie(ACCESS_COOKIE_NAME, "", Duration.ZERO, true);
    }

    public ResponseCookie clearRefreshTokenCookie() {
        return buildCookie(REFRESH_COOKIE_NAME, "", Duration.ZERO, true);
    }

    public ResponseCookie clearCsrfCookie() {
        return buildCookie(CSRF_COOKIE_NAME, "", Duration.ZERO, false);
    }

    private ResponseCookie buildCookie(String name, String value, Duration maxAge, boolean httpOnly) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(httpOnly)
                .secure(secure)
                .path("/")
                .maxAge(maxAge)
                .sameSite(sameSite);

        if (domain != null && !domain.isBlank()) {
            builder.domain(domain);
        }

        return builder.build();
    }
}
