package com.conliz.platform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PublicOrcamentoRequest(
        @NotBlank(message = "O nome completo é obrigatório.")
        @Size(max = 150)
        String nome,

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "Formato de e-mail inválido.")
        String email,

        @NotBlank(message = "O telefone de contato é obrigatório.")
        String telefone,

        @NotBlank(message = "Selecione o tipo de obra.")
        String tipoObra,

        @Positive(message = "A área deve ser um valor positivo.")
        BigDecimal areaM2,

        @NotBlank(message = "A cidade é obrigatória.")
        String cidade,

        String estado,

        @NotBlank(message = "Descreva os detalhes da sua obra ou reforma.")
        @Size(min = 10, max = 3000, message = "A descrição deve ter entre 10 e 3000 caracteres.")
        String descricao,

        String anexosUrls
) {}
