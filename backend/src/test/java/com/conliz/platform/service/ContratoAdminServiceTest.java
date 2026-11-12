package com.conliz.platform.service;

import com.conliz.platform.domain.Contrato;
import com.conliz.platform.dto.ContratoDto;
import com.conliz.platform.dto.ContratoRequest;
import com.conliz.platform.repository.ClienteRepository;
import com.conliz.platform.repository.ContratoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ContratoAdminServiceTest {

    private ContratoRepository contratoRepository;
    private AuditService auditService;
    private ContratoAdminService service;

    @BeforeEach
    void setUp() {
        contratoRepository = mock(ContratoRepository.class);
        auditService = mock(AuditService.class);
        service = new ContratoAdminService(contratoRepository, mock(ClienteRepository.class), auditService);
    }

    private ContratoRequest request(LocalDate inicio, LocalDate fim) {
        return new ContratoRequest("Contrato de Empreitada - Residencial", new BigDecimal("250000.00"),
                inicio, fim, "VIGENTE", null, "Escopo aprovado", "Maria Souza", "maria@exemplo.com",
                "(15) 99999-0000", "Sorocaba", "sp");
    }

    @Test
    void rejeitaDataFimAnteriorAoInicio() {
        ContratoRequest req = request(LocalDate.of(2026, 6, 1), LocalDate.of(2026, 5, 1));

        assertThatThrownBy(() -> service.create(req, "admin@conliz.com.br"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("término");
        verify(contratoRepository, never()).save(any(Contrato.class));
    }

    @Test
    void atualizaStatusNormalizadoEAuditaAtor() {
        UUID id = UUID.randomUUID();
        Contrato contrato = new Contrato();
        contrato.setId(id);
        contrato.setNumero("CTR-2026-001");
        contrato.setStatus("VIGENTE");

        when(contratoRepository.findById(id)).thenReturn(Optional.of(contrato));
        when(contratoRepository.save(any(Contrato.class))).thenAnswer(i -> i.getArgument(0));

        ContratoDto dto = service.updateStatus(id, "encerrado", "admin@conliz.com.br");

        assertThat(dto.status()).isEqualTo("ENCERRADO");
        verify(auditService).logAction(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void rejeitaStatusForaDaLista() {
        UUID id = UUID.randomUUID();
        Contrato contrato = new Contrato();
        contrato.setId(id);
        contrato.setStatus("VIGENTE");
        when(contratoRepository.findById(id)).thenReturn(Optional.of(contrato));

        assertThatThrownBy(() -> service.updateStatus(id, "PENDENTE", "admin@conliz.com.br"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Status inválido");
    }

    @Test
    void listagemUsaTermoVazioQuandoNaoInformado() {
        Contrato contrato = new Contrato();
        contrato.setNumero("CTR-2026-002");
        Page<Contrato> page = new PageImpl<>(List.of(contrato));

        when(contratoRepository.search(any(), anyString(), any())).thenReturn(page);

        var resultado = service.list("todos", null, PageRequest.of(0, 20));

        assertThat(resultado.getTotalElements()).isEqualTo(1);
        assertThat(resultado.getContent().get(0).numero()).isEqualTo("CTR-2026-002");
        verify(contratoRepository).search(null, "", PageRequest.of(0, 20));
    }
}
