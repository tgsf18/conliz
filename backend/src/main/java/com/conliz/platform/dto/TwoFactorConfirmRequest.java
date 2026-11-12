package com.conliz.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TwoFactorConfirmRequest(
        @NotBlank(message = "O segredo é obrigatório.")
        String secret,

        @NotBlank(message = "O código TOTP de 6 dígitos é obrigatório.")
        @Pattern(regexp = "^[0-9]{6}$", message = "O código deve conter exatamente 6 dígitos numéricos.")
        String code
) {}
