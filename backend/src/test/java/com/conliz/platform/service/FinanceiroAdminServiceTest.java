package com.conliz.platform.service;

import com.conliz.platform.domain.Financeiro;
import com.conliz.platform.dto.FinanceiroDto;
import com.conliz.platform.dto.FinanceiroRequest;
import com.conliz.platform.dto.FinanceiroResumo;
import com.conliz.platform.repository.FinanceiroRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FinanceiroAdminServiceTest {

    private FinanceiroRepository financeiroRepository;
    private AuditService auditService;
    private FinanceiroAdminService service;

    @BeforeEach
    void setUp() {
        financeiroRepository = mock(FinanceiroRepository.class);
        auditService = mock(AuditService.class);
        service = new FinanceiroAdminService(financeiroRepository, auditService);
    }

    @Test
    void resumoCalculaSaldosEAtrasados() {
        when(financeiroRepository.sumTotalReceitaPaga()).thenReturn(new BigDecimal("100000.00"));
        when(financeiroRepository.sumTotalDespesaPaga()).thenReturn(new BigDecimal("40000.00"));
        when(financeiroRepository.sumTotalReceitaPendente()).thenReturn(new BigDecimal("25000.00"));
        when(financeiroRepository.sumTotalDespesaPendente()).thenReturn(new BigDecimal("15000.00"));
        when(financeiroRepository.countAtrasados(any())).thenReturn(2L);
        when(financeiroRepository.sumValorAtrasado(any())).thenReturn(new BigDecimal("3500.00"));
        when(financeiroRepository.sumByCategoria(any(), any())).thenReturn(java.util.List.<Object[]>of(
                new Object[]{"RECEITA", "MEDICAO", new BigDecimal("100000.00"), 3L}
        ));

        FinanceiroResumo resumo = service.resumo("2026-11");

        assertThat(resumo.saldoRealizado()).isEqualByComparingTo("60000.00");
        assertThat(resumo.saldoPrevisto()).isEqualByComparingTo("70000.00");
        assertThat(resumo.lancamentosAtrasados()).isEqualTo(2);
        assertThat(resumo.porCategoria()).hasSize(1);
        assertThat(resumo.porCategoria().get(0).categoria()).isEqualTo("MEDICAO");
    }

    @Test
    void marcarComoPagoPreencheDataDePagamento() {
        UUID id = UUID.randomUUID();
        Financeiro lancamento = new Financeiro();
        lancamento.setId(id);
        lancamento.setStatus("PENDENTE");
        lancamento.setValor(new BigDecimal("1000.00"));

        when(financeiroRepository.findById(id)).thenReturn(Optional.of(lancamento));
        when(financeiroRepository.save(any(Financeiro.class))).thenAnswer(i -> i.getArgument(0));

        FinanceiroDto dto = service.updateStatus(id, "pago", null, "admin@conliz.com.br");

        assertThat(dto.status()).isEqualTo("PAGO");
        assertThat(dto.dataPagamento()).isEqualTo(LocalDate.now());
    }

    @Test
    void rejeitaTipoInvalido() {
        FinanceiroRequest req = new FinanceiroRequest("TRANSFERENCIA", "OBRA", "Teste",
                new BigDecimal("10.00"), LocalDate.now(), null, "PENDENTE", null);

        assertThatThrownBy(() -> service.create(req, "admin@conliz.com.br"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("RECEITA ou DESPESA");
        verify(financeiroRepository, never()).save(any(Financeiro.class));
    }
}
