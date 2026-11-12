package com.conliz.platform.service;

import com.conliz.platform.domain.Funcionario;
import com.conliz.platform.dto.FuncionarioDto;
import com.conliz.platform.dto.FuncionarioRequest;
import com.conliz.platform.dto.RhResumo;
import com.conliz.platform.repository.FuncionarioRepository;
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

class RhAdminServiceTest {

    private FuncionarioRepository funcionarioRepository;
    private AuditService auditService;
    private RhAdminService service;

    @BeforeEach
    void setUp() {
        funcionarioRepository = mock(FuncionarioRepository.class);
        auditService = mock(AuditService.class);
        service = new RhAdminService(funcionarioRepository, auditService);
    }

    private FuncionarioRequest request(String cpf, LocalDate admissao, LocalDate demissao) {
        return new FuncionarioRequest("João da Silva", cpf, "joao@conliz.com.br", "(15) 98888-7777",
                "Pedreiro", "OBRAS", admissao, demissao, "ATIVO", new BigDecimal("3200.00"), null);
    }

    @Test
    void mascaraCpfNaListagem() {
        Funcionario funcionario = new Funcionario();
        funcionario.setCpf("12345678901");
        funcionario.setNome("João da Silva");

        FuncionarioDto dto = FuncionarioDto.from(funcionario);

        assertThat(dto.cpf()).isEqualTo("***.456.789-**");
        assertThat(dto.cpf()).doesNotContain("12345678901");
    }

    @Test
    void rejeitaCpfDuplicado() {
        when(funcionarioRepository.existsByCpf("12345678901")).thenReturn(true);

        assertThatThrownBy(() -> service.create(
                request("123.456.789-01", LocalDate.now().minusYears(1), null), "rh@conliz.com.br"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("CPF");
        verify(funcionarioRepository, never()).save(any(Funcionario.class));
    }

    @Test
    void rejeitaDemissaoAntesDaAdmissao() {
        when(funcionarioRepository.existsByCpf(any())).thenReturn(false);

        assertThatThrownBy(() -> service.create(
                request("98765432100", LocalDate.of(2026, 5, 1), LocalDate.of(2026, 4, 1)), "rh@conliz.com.br"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("demissão");
    }

    @Test
    void desligamentoPreencheDataDeDemissao() {
        UUID id = UUID.randomUUID();
        Funcionario funcionario = new Funcionario();
        funcionario.setId(id);
        funcionario.setStatus("ATIVO");

        when(funcionarioRepository.findById(id)).thenReturn(Optional.of(funcionario));
        when(funcionarioRepository.save(any(Funcionario.class))).thenAnswer(i -> i.getArgument(0));

        FuncionarioDto dto = service.updateStatus(id, "desligado", "rh@conliz.com.br");

        assertThat(dto.status()).isEqualTo("DESLIGADO");
        assertThat(dto.dataDemissao()).isEqualTo(LocalDate.now());
    }

    @Test
    void resumoCalculaCustoMedio() {
        when(funcionarioRepository.countByStatus("ATIVO")).thenReturn(4L);
        when(funcionarioRepository.countByStatus("AFASTADO")).thenReturn(1L);
        when(funcionarioRepository.countByStatus("DESLIGADO")).thenReturn(2L);
        when(funcionarioRepository.sumFolhaAtiva()).thenReturn(new BigDecimal("20000.00"));
        when(funcionarioRepository.countAdmitidosDesde(any())).thenReturn(1L);
        when(funcionarioRepository.sumFolhaPorDepartamento()).thenReturn(java.util.List.<Object[]>of(
                new Object[]{"OBRAS", 3L, new BigDecimal("15000.00")},
                new Object[]{"ADMINISTRATIVO", 1L, new BigDecimal("5000.00")}
        ));

        RhResumo resumo = service.resumo();

        assertThat(resumo.totalAtivos()).isEqualTo(4);
        assertThat(resumo.custoMedioAtivo()).isEqualByComparingTo("5000.00");
        assertThat(resumo.porDepartamento()).hasSize(2);
    }
}
