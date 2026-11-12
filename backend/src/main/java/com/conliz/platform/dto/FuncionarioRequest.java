package com.conliz.platform.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Payload de criação/edição de funcionário. */
public record FuncionarioRequest(
        @NotBlank @Size(max = 150) String nome,
        @NotBlank @Size(max = 20) String cpf,
        @Size(max = 150) String email,
        @Size(max = 30) String telefone,
        @NotBlank @Size(max = 100) String cargo,
        @NotBlank @Size(max = 100) String departamento,
        @NotNull LocalDate dataAdmissao,
        LocalDate dataDemissao,
        @Pattern(regexp = "ATIVO|AFASTADO|DESLIGADO|FERIAS", message = "Status inválido.") String status,
        @NotNull @DecimalMin("0.00") BigDecimal salarioBase,
        String chavePix
) {}
