package com.conliz.platform.service;

import com.conliz.platform.domain.Funcionario;
import com.conliz.platform.dto.FuncionarioDto;
import com.conliz.platform.dto.FuncionarioRequest;
import com.conliz.platform.dto.RhResumo;
import com.conliz.platform.repository.FuncionarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class RhAdminService {

    private static final Set<String> STATUS = Set.of("ATIVO", "AFASTADO", "DESLIGADO", "FERIAS");

    private final FuncionarioRepository funcionarioRepository;
    private final AuditService auditService;

    public RhAdminService(FuncionarioRepository funcionarioRepository, AuditService auditService) {
        this.funcionarioRepository = funcionarioRepository;
        this.auditService = auditService;
    }

    public Page<FuncionarioDto> list(String status, String departamento, String termo, Pageable pageable) {
        String termoFiltro = termo == null || termo.isBlank() ? "" : termo.trim();
        return funcionarioRepository
                .search(normalizar(status), blankToNull(departamento), termoFiltro, pageable)
                .map(FuncionarioDto::from);
    }

    public FuncionarioDto getById(UUID id) {
        return FuncionarioDto.from(buscar(id));
    }

    public RhResumo resumo() {
        long ativos = funcionarioRepository.countByStatus("ATIVO");
        long afastados = funcionarioRepository.countByStatus("AFASTADO");
        long desligados = funcionarioRepository.countByStatus("DESLIGADO");

        BigDecimal folha = funcionarioRepository.sumFolhaAtiva();
        if (folha == null) folha = BigDecimal.ZERO;

        long admissoes = funcionarioRepository.countAdmitidosDesde(LocalDate.now().minusDays(30));

        List<RhResumo.DepartamentoTotal> porDepartamento = new ArrayList<>();
        for (Object[] linha : funcionarioRepository.sumFolhaPorDepartamento()) {
            porDepartamento.add(new RhResumo.DepartamentoTotal(
                    (String) linha[0],
                    linha[1] != null ? ((Number) linha[1]).longValue() : 0L,
                    linha[2] != null ? new BigDecimal(linha[2].toString()) : BigDecimal.ZERO
            ));
        }

        return RhResumo.of(ativos, afastados, desligados, folha, admissoes, porDepartamento);
    }

    public List<String> departamentos() {
        return funcionarioRepository.findDepartamentos();
    }

    @Transactional
    public FuncionarioDto create(FuncionarioRequest request, String ator) {
        String cpf = apenasDigitos(request.cpf());
        if (cpf.length() != 11) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF deve conter 11 dígitos.");
        }
        if (funcionarioRepository.existsByCpf(cpf)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um funcionário com este CPF.");
        }

        Funcionario funcionario = new Funcionario();
        funcionario.setCpf(cpf);
        aplicar(funcionario, request);

        Funcionario saved = funcionarioRepository.save(funcionario);
        auditService.logAction("FUNCIONARIO_CREATED", "FUNCIONARIO", saved.getId().toString(),
                String.format("%s cadastrou %s (%s)", ator, saved.getNome(), saved.getDepartamento()));
        return FuncionarioDto.from(saved);
    }

    @Transactional
    public FuncionarioDto update(UUID id, FuncionarioRequest request, String ator) {
        Funcionario funcionario = buscar(id);
        String cpf = apenasDigitos(request.cpf());
        if (cpf.length() != 11) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF deve conter 11 dígitos.");
        }
        if (!cpf.equals(funcionario.getCpf()) && funcionarioRepository.existsByCpf(cpf)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um funcionário com este CPF.");
        }

        funcionario.setCpf(cpf);
        aplicar(funcionario, request);

        Funcionario saved = funcionarioRepository.save(funcionario);
        auditService.logAction("FUNCIONARIO_UPDATED", "FUNCIONARIO", saved.getId().toString(),
                String.format("%s atualizou o cadastro de %s", ator, saved.getNome()));
        return FuncionarioDto.from(saved);
    }

    @Transactional
    public FuncionarioDto updateStatus(UUID id, String novoStatus, String ator) {
        String status = normalizar(novoStatus);
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Status inválido. Use um de: " + String.join(", ", STATUS) + ".");
        }

        Funcionario funcionario = buscar(id);
        String anterior = funcionario.getStatus();
        funcionario.setStatus(status);
        if ("DESLIGADO".equals(status) && funcionario.getDataDemissao() == null) {
            funcionario.setDataDemissao(LocalDate.now());
        }

        Funcionario saved = funcionarioRepository.save(funcionario);
        auditService.logAction("FUNCIONARIO_STATUS_UPDATED", "FUNCIONARIO", saved.getId().toString(),
                String.format("%s alterou o status de %s para %s", ator, anterior, status));
        return FuncionarioDto.from(saved);
    }

    private Funcionario buscar(UUID id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Funcionário não encontrado."));
    }

    private void aplicar(Funcionario funcionario, FuncionarioRequest request) {
        if (request.dataDemissao() != null && request.dataDemissao().isBefore(request.dataAdmissao())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A data de demissão não pode ser anterior à data de admissão.");
        }

        funcionario.setNome(request.nome().trim());
        funcionario.setEmail(blankToNull(request.email()));
        funcionario.setTelefone(blankToNull(request.telefone()));
        funcionario.setCargo(request.cargo().trim());
        funcionario.setDepartamento(request.departamento().trim());
        funcionario.setDataAdmissao(request.dataAdmissao());
        funcionario.setDataDemissao(request.dataDemissao());
        funcionario.setSalarioBase(request.salarioBase());
        funcionario.setChavePix(blankToNull(request.chavePix()));

        String status = normalizar(request.status());
        funcionario.setStatus(status != null ? status : (funcionario.getStatus() != null ? funcionario.getStatus() : "ATIVO"));
    }

    private String normalizar(String valor) {
        if (valor == null || valor.isBlank() || "TODOS".equalsIgnoreCase(valor)) {
            return null;
        }
        String normalizado = valor.trim().toUpperCase(Locale.ROOT);
        return STATUS.contains(normalizado) ? normalizado : null;
    }

    private String apenasDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("\\D", "");
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
