package com.conliz.platform.dto;

public record AuthResponse(
        boolean success,
        boolean requires2fa,
        String preAuthToken,
        String message,
        AuthUserDto user
) {
    public static AuthResponse requires2fa(String preAuthToken) {
        return new AuthResponse(true, true, preAuthToken, "Código 2FA ou de recuperação necessário.", null);
    }

    public static AuthResponse authenticated(AuthUserDto user) {
        return new AuthResponse(true, false, null, "Autenticado com sucesso.", user);
    }
}
