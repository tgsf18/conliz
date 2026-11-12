package com.conliz.platform.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Payload de criação/edição de lançamento financeiro. */
public record FinanceiroRequest(
        @NotBlank @Pattern(regexp = "RECEITA|DESPESA", message = "Tipo deve ser RECEITA ou DESPESA.") String tipo,
        @NotBlank @Size(max = 100) String categoria,
        @NotBlank @Size(max = 255) String descricao,
        @NotNull @DecimalMin("0.01") BigDecimal valor,
        @NotNull LocalDate dataVencimento,
        LocalDate dataPagamento,
        @Pattern(regexp = "PENDENTE|PAGO|CANCELADO|ATRASADO", message = "Status inválido.") String status,
        @Size(max = 100) String documentoNum
) {}
