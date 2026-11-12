package com.conliz.platform.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Payload de criação/edição de contrato no painel. */
public record ContratoRequest(
        @NotBlank @Size(max = 200) String titulo,
        @NotNull @DecimalMin("0.01") BigDecimal valorTotal,
        @NotNull LocalDate dataInicio,
        @NotNull LocalDate dataFim,
        @Size(max = 30) String status,
        @Size(max = 500) String arquivoUrl,
        String observacoes,
        String clienteNome,
        String clienteEmail,
        String clienteTelefone,
        String clienteCidade,
        @Size(max = 2) String clienteUf
) {}
