package com.conliz.platform.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record DashboardMetrics(
        OrcamentosFunil orcamentosFunil,
        FinanceiroKpis financeiroKpis,
        List<FluxoMensal> fluxoCaixaMensal,
        List<ObrasFase> obrasPorFase,
        List<ReceitaCustoObra> receitaCustoPorObra,
        List<ContratoVencendo> contratosVencendo,
        long totalContratosVigentes,
        long headcountTotal,
        List<HeadcountDepto> headcountPorDepartamento
) {
    public record OrcamentosFunil(
            long total,
            long novos,
            long emAnalise,
            long enviados,
            long aprovados,
            long recusados,
            double taxaConversao
    ) {}

    public record FinanceiroKpis(
            BigDecimal receitaPaga,
            BigDecimal despesaPaga,
            BigDecimal receitaPendente,
            BigDecimal despesaPendente,
            BigDecimal saldoAtual
    ) {}

    public record FluxoMensal(String mes, BigDecimal receita, BigDecimal despesa, BigDecimal saldo) {}

    public record ObrasFase(String fase, long quantidade) {}

    public record ReceitaCustoObra(String obra, BigDecimal receita, BigDecimal custo, BigDecimal margem) {}

    public record ContratoVencendo(
            UUID id,
            String numero,
            String titulo,
            String cliente,
            BigDecimal valor,
            String dataFim
    ) {}

    public record HeadcountDepto(String departamento, long total) {}
}
