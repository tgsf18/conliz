package com.conliz.platform.service;

import com.conliz.platform.domain.Contrato;
import com.conliz.platform.domain.Financeiro;
import com.conliz.platform.domain.Obra;
import com.conliz.platform.dto.DashboardMetrics;
import com.conliz.platform.repository.ContratoRepository;
import com.conliz.platform.repository.FinanceiroRepository;
import com.conliz.platform.repository.FuncionarioRepository;
import com.conliz.platform.repository.ObraRepository;
import com.conliz.platform.repository.OrcamentoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class DashboardService {

    private static final List<String> FASES = List.of(
            "FUNDACAO", "ESTRUTURA", "ALVENARIA", "INSTALACOES", "ACABAMENTO", "CONCLUIDA"
    );
    private static final DateTimeFormatter MES_FMT = DateTimeFormatter.ofPattern("MM/yy", Locale.forLanguageTag("pt-BR"));

    private final OrcamentoRepository orcamentoRepository;
    private final ContratoRepository contratoRepository;
    private final ObraRepository obraRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final FinanceiroRepository financeiroRepository;

    public DashboardService(
            OrcamentoRepository orcamentoRepository,
            ContratoRepository contratoRepository,
            ObraRepository obraRepository,
            FuncionarioRepository funcionarioRepository,
            FinanceiroRepository financeiroRepository) {
        this.orcamentoRepository = orcamentoRepository;
        this.contratoRepository = contratoRepository;
        this.obraRepository = obraRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.financeiroRepository = financeiroRepository;
    }

    public DashboardMetrics getDashboardMetrics(String periodo) {
        long totalOrcamentos = orcamentoRepository.count();
        long novos = orcamentoRepository.countByStatus("NOVO");
        long emAnalise = orcamentoRepository.countByStatus("EM_ANALISE");
        long enviados = orcamentoRepository.countByStatus("ENVIADO");
        long aprovados = orcamentoRepository.countByStatus("APROVADO");
        long recusados = orcamentoRepository.countByStatus("RECUSADO");
        double taxaConversao = totalOrcamentos > 0
                ? Math.round(((double) aprovados / totalOrcamentos) * 1000.0) / 10.0
                : 0.0;

        BigDecimal receitaPaga = zero(financeiroRepository.sumTotalReceitaPaga());
        BigDecimal despesaPaga = zero(financeiroRepository.sumTotalDespesaPaga());
        BigDecimal receitaPendente = zero(financeiroRepository.sumTotalReceitaPendente());
        BigDecimal despesaPendente = zero(financeiroRepository.sumTotalDespesaPendente());

        List<Obra> obras = obraRepository.findAll();
        List<Financeiro> pagos = financeiroRepository.findByStatus("PAGO");

        LocalDate hoje = LocalDate.now();
        List<Contrato> expiring = contratoRepository.findExpiringContracts(hoje, hoje.plusDays(90));

        return new DashboardMetrics(
                new DashboardMetrics.OrcamentosFunil(totalOrcamentos, novos, emAnalise, enviados, aprovados, recusados, taxaConversao),
                new DashboardMetrics.FinanceiroKpis(
                        receitaPaga,
                        despesaPaga,
                        receitaPendente,
                        despesaPendente,
                        receitaPaga.subtract(despesaPaga)
                ),
                fluxoCaixa(pagos, periodo),
                obrasPorFase(obras),
                receitaCustoPorObra(obras, pagos),
                expiring.stream().map(this::toContratoVencendo).toList(),
                contratoRepository.countVigentes(),
                funcionarioRepository.countByStatus("ATIVO"),
                headcountPorDepartamento()
        );
    }

    private List<DashboardMetrics.FluxoMensal> fluxoCaixa(List<Financeiro> pagos, String periodo) {
        Map<YearMonth, BigDecimal[]> buckets = new LinkedHashMap<>();
        for (Financeiro lancamento : pagos) {
            LocalDate referencia = lancamento.getDataPagamento() != null
                    ? lancamento.getDataPagamento()
                    : lancamento.getDataVencimento();
            if (referencia == null || lancamento.getValor() == null) {
                continue;
            }
            YearMonth mes = YearMonth.from(referencia);
            if (!includeMonth(mes, periodo)) {
                continue;
            }
            BigDecimal[] acc = buckets.computeIfAbsent(mes, key -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            if ("DESPESA".equalsIgnoreCase(lancamento.getTipo())) {
                acc[1] = acc[1].add(lancamento.getValor());
            } else if ("RECEITA".equalsIgnoreCase(lancamento.getTipo())) {
                acc[0] = acc[0].add(lancamento.getValor());
            }
        }

        return buckets.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new DashboardMetrics.FluxoMensal(
                        entry.getKey().format(MES_FMT),
                        entry.getValue()[0],
                        entry.getValue()[1],
                        entry.getValue()[0].subtract(entry.getValue()[1])
                ))
                .toList();
    }

    private boolean includeMonth(YearMonth mes, String periodo) {
        if (periodo == null || periodo.isBlank() || "TUDO".equalsIgnoreCase(periodo)) {
            return true;
        }
        YearMonth agora = YearMonth.now();
        if ("ANO_ATUAL".equalsIgnoreCase(periodo)) {
            return mes.getYear() == agora.getYear();
        }
        if ("ULTIMOS_12".equalsIgnoreCase(periodo)) {
            return !mes.isBefore(agora.minusMonths(11));
        }
        return true;
    }

    private List<DashboardMetrics.ObrasFase> obrasPorFase(List<Obra> obras) {
        Map<String, Long> contagem = new LinkedHashMap<>();
        for (String fase : FASES) {
            contagem.put(fase, 0L);
        }
        for (Obra obra : obras) {
            String fase = obra.getFaseAtual() != null ? obra.getFaseAtual().toUpperCase(Locale.ROOT) : "FUNDACAO";
            contagem.merge(fase, 1L, Long::sum);
        }
        return contagem.entrySet().stream()
                .map(entry -> new DashboardMetrics.ObrasFase(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<DashboardMetrics.ReceitaCustoObra> receitaCustoPorObra(List<Obra> obras, List<Financeiro> pagos) {
        Map<UUID, String> nomes = new LinkedHashMap<>();
        for (Obra obra : obras) {
            nomes.put(obra.getId(), obra.getNome() != null ? obra.getNome() : "Obra");
        }
        Map<UUID, BigDecimal[]> totais = new LinkedHashMap<>();
        for (Financeiro lancamento : pagos) {
            if (lancamento.getObraId() == null || lancamento.getValor() == null) {
                continue;
            }
            BigDecimal[] acc = totais.computeIfAbsent(lancamento.getObraId(), key -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            if ("DESPESA".equalsIgnoreCase(lancamento.getTipo())) {
                acc[1] = acc[1].add(lancamento.getValor());
            } else if ("RECEITA".equalsIgnoreCase(lancamento.getTipo())) {
                acc[0] = acc[0].add(lancamento.getValor());
            }
        }
        return totais.entrySet().stream()
                .map(entry -> {
                    BigDecimal receita = entry.getValue()[0];
                    BigDecimal custo = entry.getValue()[1];
                    BigDecimal margem = receita.signum() == 0
                            ? BigDecimal.ZERO
                            : receita.subtract(custo).multiply(BigDecimal.valueOf(100)).divide(receita, 1, RoundingMode.HALF_UP);
                    return new DashboardMetrics.ReceitaCustoObra(nomes.getOrDefault(entry.getKey(), "Obra"), receita, custo, margem);
                })
                .sorted(Comparator.comparing(DashboardMetrics.ReceitaCustoObra::obra))
                .toList();
    }

    private List<DashboardMetrics.HeadcountDepto> headcountPorDepartamento() {
        List<DashboardMetrics.HeadcountDepto> result = new ArrayList<>();
        for (Map<String, Object> row : funcionarioRepository.countHeadcountByDepartment()) {
            Object departamento = firstPresent(row, "departamento", "dept");
            Object total = firstPresent(row, "total", "count");
            if (departamento == null || !(total instanceof Number number)) {
                continue;
            }
            result.add(new DashboardMetrics.HeadcountDepto(String.valueOf(departamento), number.longValue()));
        }
        result.sort(Comparator.comparing(DashboardMetrics.HeadcountDepto::departamento));
        return result;
    }

    private DashboardMetrics.ContratoVencendo toContratoVencendo(Contrato contrato) {
        String cliente = contrato.getCliente() != null && contrato.getCliente().getNome() != null
                ? contrato.getCliente().getNome()
                : "";
        return new DashboardMetrics.ContratoVencendo(
                contrato.getId(),
                contrato.getNumero(),
                contrato.getTitulo(),
                cliente,
                contrato.getValorTotal(),
                contrato.getDataFim() != null ? contrato.getDataFim().toString() : ""
        );
    }

    private Object firstPresent(Map<String, Object> row, String... keys) {
        for (String key : keys) {
            if (row.containsKey(key) && row.get(key) != null) {
                return row.get(key);
            }
        }
        return null;
    }

    private BigDecimal zero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
