package com.conliz.platform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PublicContatoRequest(
        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 150)
        String nome,

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "Formato de e-mail inválido.")
        String email,

        @NotBlank(message = "O telefone é obrigatório.")
        String telefone,

        @NotBlank(message = "O assunto é obrigatório.")
        String assunto,

        @NotBlank(message = "A mensagem é obrigatória.")
        @Size(min = 10, max = 2000, message = "A mensagem deve ter entre 10 e 2000 caracteres.")
        String mensagem
) {}
