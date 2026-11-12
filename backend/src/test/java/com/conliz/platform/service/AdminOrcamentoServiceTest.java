package com.conliz.platform.service;

import com.conliz.platform.domain.Orcamento;
import com.conliz.platform.repository.ClienteRepository;
import com.conliz.platform.repository.ContratoRepository;
import com.conliz.platform.repository.OrcamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminOrcamentoServiceTest {

    private OrcamentoRepository orcamentoRepository;
    private AuditService auditService;
    private AdminOrcamentoService service;

    @BeforeEach
    void setUp() {
        orcamentoRepository = mock(OrcamentoRepository.class);
        auditService = mock(AuditService.class);
        service = new AdminOrcamentoService(
                orcamentoRepository,
                mock(ClienteRepository.class),
                mock(ContratoRepository.class),
                auditService
        );
    }

    @Test
    void persisteStatusENotaInterna() {
        UUID id = UUID.randomUUID();
        Orcamento orcamento = new Orcamento();
        orcamento.setId(id);
        orcamento.setCodigo("ORC-2026-001");
        orcamento.setStatus("NOVO");

        when(orcamentoRepository.findById(id)).thenReturn(Optional.of(orcamento));
        when(orcamentoRepository.save(any(Orcamento.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Orcamento saved = service.updateStatus(id, "em_analise", "Aguardando levantamento", "admin@conliz.com.br");

        assertThat(saved.getStatus()).isEqualTo("EM_ANALISE");
        assertThat(saved.getNotasInternas()).contains("NOVO -> EM_ANALISE").contains("Aguardando levantamento");
        assertThat(saved.getNotasInternas()).contains("admin@conliz.com.br");
        verify(auditService).logAction(any(), any(), any(), any());
    }

    @Test
    void rejeitaStatusForaDoFunil() {
        UUID id = UUID.randomUUID();
        Orcamento orcamento = new Orcamento();
        orcamento.setId(id);
        orcamento.setCodigo("ORC-2026-002");
        orcamento.setStatus("NOVO");

        when(orcamentoRepository.findById(id)).thenReturn(Optional.of(orcamento));

        assertThatThrownBy(() -> service.updateStatus(id, "RASCUNHO", "teste", "admin@conliz.com.br"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Status inválido");
        assertThat(orcamento.getStatus()).isEqualTo("NOVO");
        verify(orcamentoRepository, never()).save(any(Orcamento.class));
    }
}
