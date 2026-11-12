package com.conliz.platform.dto;

import com.conliz.platform.domain.Financeiro;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record FinanceiroDto(
        UUID id,
        UUID obraId,
        String tipo,
        String categoria,
        String descricao,
        BigDecimal valor,
        LocalDate dataVencimento,
        LocalDate dataPagamento,
        String status,
        String documentoNum,
        UUID fornecedorId,
        boolean atrasado,
        LocalDateTime criadoEm
) {
    public static FinanceiroDto from(Financeiro lancamento) {
        boolean atrasado = "PENDENTE".equals(lancamento.getStatus())
                && lancamento.getDataVencimento() != null
                && lancamento.getDataVencimento().isBefore(LocalDate.now());

        return new FinanceiroDto(
                lancamento.getId(),
                lancamento.getObraId(),
                lancamento.getTipo(),
                lancamento.getCategoria(),
                lancamento.getDescricao(),
                lancamento.getValor(),
                lancamento.getDataVencimento(),
                lancamento.getDataPagamento(),
                lancamento.getStatus(),
                lancamento.getDocumentoNum(),
                lancamento.getFornecedorId(),
                atrasado,
                lancamento.getCriadoEm()
        );
    }
}
