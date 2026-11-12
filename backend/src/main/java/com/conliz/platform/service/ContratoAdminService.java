package com.conliz.platform.service;

import com.conliz.platform.domain.Cliente;
import com.conliz.platform.domain.Contrato;
import com.conliz.platform.dto.ContratoDto;
import com.conliz.platform.dto.ContratoRequest;
import com.conliz.platform.repository.ClienteRepository;
import com.conliz.platform.repository.ContratoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ContratoAdminService {

    private static final Set<String> STATUS_VALIDOS =
            Set.of("VIGENTE", "ENCERRADO", "SUSPENSO", "CANCELADO");

    private final ContratoRepository contratoRepository;
    private final ClienteRepository clienteRepository;
    private final AuditService auditService;

    public ContratoAdminService(
            ContratoRepository contratoRepository,
            ClienteRepository clienteRepository,
            AuditService auditService) {
        this.contratoRepository = contratoRepository;
        this.clienteRepository = clienteRepository;
        this.auditService = auditService;
    }

    public Page<ContratoDto> list(String status, String termo, Pageable pageable) {
        String statusFiltro = normalizarStatus(status);
        String termoFiltro = termo == null || termo.isBlank() ? "" : termo.trim();
        return contratoRepository.search(statusFiltro, termoFiltro, pageable).map(ContratoDto::from);
    }

    public ContratoDto getById(UUID id) {
        return ContratoDto.from(buscar(id));
    }

    public List<ContratoDto> vencendoEm(int dias) {
        LocalDate hoje = LocalDate.now();
        int janela = Math.min(Math.max(dias, 1), 365);
        return contratoRepository.findExpiringContracts(hoje, hoje.plusDays(janela))
                .stream()
                .map(ContratoDto::from)
                .toList();
    }

    @Transactional
    public ContratoDto create(ContratoRequest request, String ator) {
        validarDatas(request);
        Cliente cliente = resolverCliente(request);

        Contrato contrato = new Contrato();
        contrato.setNumero(proximoNumero());
        contrato.setCliente(cliente);
        aplicar(contrato, request);

        Contrato saved = contratoRepository.save(contrato);
        auditService.logAction("CONTRATO_CREATED", "CONTRATO", saved.getNumero(),
                String.format("%s criou o contrato %s (R$ %s)", ator, saved.getNumero(), saved.getValorTotal()));
        return ContratoDto.from(saved);
    }

    @Transactional
    public ContratoDto update(UUID id, ContratoRequest request, String ator) {
        validarDatas(request);
        Contrato contrato = buscar(id);
        aplicar(contrato, request);

        Contrato saved = contratoRepository.save(contrato);
        auditService.logAction("CONTRATO_UPDATED", "CONTRATO", saved.getNumero(),
                String.format("%s atualizou o contrato %s", ator, saved.getNumero()));
        return ContratoDto.from(saved);
    }

    @Transactional
    public ContratoDto updateStatus(UUID id, String novoStatus, String ator) {
        String status = normalizarStatus(novoStatus);
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Status inválido. Use um de: " + String.join(", ", STATUS_VALIDOS) + ".");
        }

        Contrato contrato = buscar(id);
        String anterior = contrato.getStatus();
        contrato.setStatus(status);
        Contrato saved = contratoRepository.save(contrato);

        auditService.logAction("CONTRATO_STATUS_UPDATED", "CONTRATO", saved.getNumero(),
                String.format("%s alterou o status de %s para %s", ator, anterior, status));
        return ContratoDto.from(saved);
    }

    private Contrato buscar(UUID id) {
        return contratoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado."));
    }

    private void aplicar(Contrato contrato, ContratoRequest request) {
        contrato.setTitulo(request.titulo().trim());
        contrato.setValorTotal(request.valorTotal());
        contrato.setDataInicio(request.dataInicio());
        contrato.setDataFim(request.dataFim());
        contrato.setArquivoUrl(blankToNull(request.arquivoUrl()));
        contrato.setObservacoes(blankToNull(request.observacoes()));

        String status = normalizarStatus(request.status());
        contrato.setStatus(status != null ? status : (contrato.getStatus() != null ? contrato.getStatus() : "VIGENTE"));

        if (contrato.getCliente() == null) {
            contrato.setCliente(resolverCliente(request));
        }
    }

    private Cliente resolverCliente(ContratoRequest request) {
        String email = blankToNull(request.clienteEmail());
        if (email != null) {
            var existente = clienteRepository.findByEmail(email.toLowerCase(Locale.ROOT));
            if (existente.isPresent()) {
                return existente.get();
            }
        }
        if (request.clienteNome() == null || request.clienteNome().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o nome do cliente do contrato.");
        }
        Cliente novo = new Cliente(
                request.clienteNome().trim(),
                email,
                blankToNull(request.clienteTelefone()),
                blankToNull(request.clienteCidade()),
                request.clienteUf() != null ? request.clienteUf().toUpperCase(Locale.ROOT) : "SP"
        );
        return clienteRepository.save(novo);
    }

    private void validarDatas(ContratoRequest request) {
        if (request.dataFim().isBefore(request.dataInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A data de término não pode ser anterior à data de início.");
        }
        if (request.valorTotal() == null || request.valorTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O valor total deve ser maior que zero.");
        }
    }

    private String proximoNumero() {
        String prefixo = "CTR-" + LocalDate.now().getYear() + "-";
        for (int i = 1; i <= 999; i++) {
            String candidato = String.format("%s%03d", prefixo, i);
            if (contratoRepository.findByNumero(candidato).isEmpty()) {
                return candidato;
            }
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Não foi possível gerar um número de contrato livre para o ano corrente.");
    }

    private String normalizarStatus(String status) {
        if (status == null || status.isBlank() || "TODOS".equalsIgnoreCase(status)) {
            return null;
        }
        String normalizado = status.trim().toUpperCase(Locale.ROOT);
        return STATUS_VALIDOS.contains(normalizado) ? normalizado : null;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
