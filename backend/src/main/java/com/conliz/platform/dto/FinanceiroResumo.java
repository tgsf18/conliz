package com.conliz.platform.dto;

import java.math.BigDecimal;
import java.util.List;

/** Resumo financeiro exibido no topo da tela de Financeiro. */
public record FinanceiroResumo(
        BigDecimal receitaPaga,
        BigDecimal despesaPaga,
        BigDecimal receitaPendente,
        BigDecimal despesaPendente,
        BigDecimal saldoRealizado,
        BigDecimal saldoPrevisto,
        long lancamentosAtrasados,
        BigDecimal valorAtrasado,
        List<CategoriaTotal> porCategoria
) {
    public record CategoriaTotal(String tipo, String categoria, BigDecimal total, long quantidade) {}
}
