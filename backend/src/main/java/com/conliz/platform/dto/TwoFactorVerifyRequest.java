package com.conliz.platform.dto;

import jakarta.validation.constraints.NotBlank;

public record TwoFactorVerifyRequest(
        @NotBlank(message = "O token de pré-autenticação é obrigatório.")
        String preAuthToken,

        @NotBlank(message = "O código 2FA ou de recuperação é obrigatório.")
        String code
) {}
