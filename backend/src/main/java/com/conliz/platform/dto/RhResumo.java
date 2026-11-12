package com.conliz.platform.dto;

import java.math.BigDecimal;
import java.util.List;

/** Resumo de RH exibido no topo da tela de Pessoal. */
public record RhResumo(
        long totalAtivos,
        long totalAfastados,
        long totalDesligados,
        BigDecimal folhaBaseAtiva,
        BigDecimal custoMedioAtivo,
        long admissoesUltimos30Dias,
        List<DepartamentoTotal> porDepartamento
) {
    public record DepartamentoTotal(String departamento, long total, BigDecimal folha) {}

    public static RhResumo vazio() {
        return new RhResumo(0, 0, 0, BigDecimal.ZERO, BigDecimal.ZERO, 0, List.of());
    }

    public static RhResumo of(long ativos, long afastados, long desligados, BigDecimal folha,
                              long admissoes, List<DepartamentoTotal> porDepartamento) {
        BigDecimal custoMedio = ativos > 0
                ? folha.divide(BigDecimal.valueOf(ativos), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        return new RhResumo(ativos, afastados, desligados, folha, custoMedio, admissoes, porDepartamento);
    }
}
