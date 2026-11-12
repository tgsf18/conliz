package com.conliz.platform.dto;

import com.conliz.platform.domain.Contrato;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record ContratoDto(
        UUID id,
        String numero,
        UUID orcamentoId,
        UUID clienteId,
        String clienteNome,
        String clienteEmail,
        String clienteTelefone,
        String clienteCidade,
        String clienteUf,
        String titulo,
        BigDecimal valorTotal,
        LocalDate dataInicio,
        LocalDate dataFim,
        String status,
        String arquivoUrl,
        String observacoes,
        LocalDateTime criadoEm
) {
    public static ContratoDto from(Contrato contrato) {
        var cliente = contrato.getCliente();
        return new ContratoDto(
                contrato.getId(),
                contrato.getNumero(),
                contrato.getOrcamentoId(),
                cliente != null ? cliente.getId() : null,
                cliente != null ? cliente.getNome() : null,
                cliente != null ? cliente.getEmail() : null,
                cliente != null ? cliente.getTelefone() : null,
                cliente != null ? cliente.getCidade() : null,
                cliente != null ? cliente.getUf() : null,
                contrato.getTitulo(),
                contrato.getValorTotal(),
                contrato.getDataInicio(),
                contrato.getDataFim(),
                contrato.getStatus(),
                contrato.getArquivoUrl(),
                contrato.getObservacoes(),
                contrato.getCriadoEm()
        );
    }
}
