package com.conliz.platform.service;

import com.conliz.platform.domain.Financeiro;
import com.conliz.platform.domain.Obra;
import com.conliz.platform.dto.DashboardMetrics;
import com.conliz.platform.repository.ContratoRepository;
import com.conliz.platform.repository.FinanceiroRepository;
import com.conliz.platform.repository.FuncionarioRepository;
import com.conliz.platform.repository.ObraRepository;
import com.conliz.platform.repository.OrcamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DashboardServiceTest {

    private OrcamentoRepository orcamentoRepository;
    private ContratoRepository contratoRepository;
    private ObraRepository obraRepository;
    private FuncionarioRepository funcionarioRepository;
    private FinanceiroRepository financeiroRepository;
    private DashboardService service;

    @BeforeEach
    void setUp() {
        orcamentoRepository = mock(OrcamentoRepository.class);
        contratoRepository = mock(ContratoRepository.class);
        obraRepository = mock(ObraRepository.class);
        funcionarioRepository = mock(FuncionarioRepository.class);
        financeiroRepository = mock(FinanceiroRepository.class);
        service = new DashboardService(
                orcamentoRepository,
                contratoRepository,
                obraRepository,
                funcionarioRepository,
                financeiroRepository
        );
    }

    @Test
    void agregaKpisEFluxoAPartirDosRepositorios() {
        UUID obraId = UUID.randomUUID();
        Obra obra = new Obra();
        obra.setId(obraId);
        obra.setNome("Residência Alphaville");
        obra.setFaseAtual("ESTRUTURA");

        Financeiro receita = pago(obraId, "RECEITA", "85000.00", LocalDate.of(LocalDate.now().getYear(), 2, 9));
        Financeiro despesa = pago(obraId, "DESPESA", "28500.00", LocalDate.of(LocalDate.now().getYear(), 2, 14));

        when(orcamentoRepository.count()).thenReturn(4L);
        when(orcamentoRepository.countByStatus("NOVO")).thenReturn(2L);
        when(orcamentoRepository.countByStatus("EM_ANALISE")).thenReturn(1L);
        when(orcamentoRepository.countByStatus("ENVIADO")).thenReturn(0L);
        when(orcamentoRepository.countByStatus("APROVADO")).thenReturn(1L);
        when(orcamentoRepository.countByStatus("RECUSADO")).thenReturn(0L);
        when(financeiroRepository.sumTotalReceitaPaga()).thenReturn(new BigDecimal("85000.00"));
        when(financeiroRepository.sumTotalDespesaPaga()).thenReturn(new BigDecimal("28500.00"));
        when(financeiroRepository.sumTotalReceitaPendente()).thenReturn(new BigDecimal("1000.00"));
        when(financeiroRepository.sumTotalDespesaPendente()).thenReturn(BigDecimal.ZERO);
        when(financeiroRepository.findByStatus("PAGO")).thenReturn(List.of(receita, despesa));
        when(obraRepository.findAll()).thenReturn(List.of(obra));
        when(contratoRepository.findExpiringContracts(any(), any())).thenReturn(List.of());
        when(contratoRepository.countVigentes()).thenReturn(2L);
        when(funcionarioRepository.countByStatus("ATIVO")).thenReturn(3L);
        when(funcionarioRepository.countHeadcountByDepartment())
                .thenReturn(List.of(Map.of("departamento", "Engenharia", "total", 2L)));

        DashboardMetrics metrics = service.getDashboardMetrics("ANO_ATUAL");

        assertThat(metrics.orcamentosFunil().taxaConversao()).isEqualTo(25.0);
        assertThat(metrics.financeiroKpis().saldoAtual()).isEqualByComparingTo("56500.00");
        assertThat(metrics.fluxoCaixaMensal()).hasSize(1);
        assertThat(metrics.fluxoCaixaMensal().get(0).receita()).isEqualByComparingTo("85000.00");
        assertThat(metrics.fluxoCaixaMensal().get(0).despesa()).isEqualByComparingTo("28500.00");
        assertThat(metrics.receitaCustoPorObra()).singleElement().satisfies(item -> {
            assertThat(item.obra()).isEqualTo("Residência Alphaville");
            assertThat(item.margem()).isEqualByComparingTo("66.5");
        });
        assertThat(metrics.obrasPorFase()).anySatisfy(fase -> {
            assertThat(fase.fase()).isEqualTo("ESTRUTURA");
            assertThat(fase.quantidade()).isEqualTo(1L);
        });
        assertThat(metrics.headcountPorDepartamento()).singleElement()
                .extracting(DashboardMetrics.HeadcountDepto::total)
                .isEqualTo(2L);
        assertThat(metrics.totalContratosVigentes()).isEqualTo(2L);
    }

    private Financeiro pago(UUID obraId, String tipo, String valor, LocalDate pagamento) {
        Financeiro lancamento = new Financeiro();
        lancamento.setObraId(obraId);
        lancamento.setTipo(tipo);
        lancamento.setValor(new BigDecimal(valor));
        lancamento.setStatus("PAGO");
        lancamento.setDataVencimento(pagamento);
        lancamento.setDataPagamento(pagamento);
        return lancamento;
    }
}
