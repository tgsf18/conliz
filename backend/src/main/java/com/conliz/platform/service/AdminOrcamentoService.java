package com.conliz.platform.service;

import com.conliz.platform.domain.Cliente;
import com.conliz.platform.domain.Contrato;
import com.conliz.platform.domain.Orcamento;
import com.conliz.platform.repository.ClienteRepository;
import com.conliz.platform.repository.ContratoRepository;
import com.conliz.platform.repository.OrcamentoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AdminOrcamentoService {

    private static final List<String> ORCAMENTO_STATUSES =
            List.of("NOVO", "EM_ANALISE", "ENVIADO", "APROVADO", "RECUSADO");

    private final OrcamentoRepository orcamentoRepository;
    private final ClienteRepository clienteRepository;
    private final ContratoRepository contratoRepository;
    private final AuditService auditService;
    private final SecureRandom random = new SecureRandom();

    public AdminOrcamentoService(
            OrcamentoRepository orcamentoRepository,
            ClienteRepository clienteRepository,
            ContratoRepository contratoRepository,
            AuditService auditService) {
        this.orcamentoRepository = orcamentoRepository;
        this.clienteRepository = clienteRepository;
        this.contratoRepository = contratoRepository;
        this.auditService = auditService;
    }

    public List<Orcamento> listAll(String status) {
        if (status != null && !status.isBlank() && !"TODOS".equalsIgnoreCase(status)) {
            return orcamentoRepository.findByStatusOrderByCriadoEmDesc(status.toUpperCase().trim());
        }
        return orcamentoRepository.findAll();
    }

    public Page<Orcamento> listPage(String status, Pageable pageable) {
        if (status != null && !status.isBlank() && !"TODOS".equalsIgnoreCase(status)) {
            return orcamentoRepository.findByStatus(status.toUpperCase().trim(), pageable);
        }
        return orcamentoRepository.findAll(pageable);
    }

    public Optional<Orcamento> getById(UUID id) {
        return orcamentoRepository.findById(id);
    }

    public Orcamento updateStatus(UUID id, String newStatus, String nota) {
        return updateStatus(id, newStatus, nota, "sistema");
    }

    @Transactional
    public Orcamento updateStatus(UUID id, String newStatus, String nota, String ator) {
        Orcamento orcamento = orcamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orçamento não encontrado."));

        String oldStatus = orcamento.getStatus();
        String normalizedStatus = newStatus.toUpperCase().trim();
        if (!ORCAMENTO_STATUSES.contains(normalizedStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Status inválido. Use um de: " + String.join(", ", ORCAMENTO_STATUSES) + ".");
        }
        orcamento.setStatus(normalizedStatus);

        if (nota != null && !nota.isBlank()) {
            appendNota(orcamento, String.format("[%s -> %s] %s: %s", oldStatus, normalizedStatus, ator, nota));
        }

        Orcamento saved = orcamentoRepository.save(orcamento);
        auditService.logAction("ORCAMENTO_STATUS_UPDATED", "ORCAMENTO", orcamento.getCodigo(),
                String.format("%s alterou o status de %s para %s", ator, oldStatus, normalizedStatus));

        return saved;
    }

    public Orcamento addNota(UUID id, String nota) {
        return addNota(id, nota, "sistema");
    }

    @Transactional
    public Orcamento addNota(UUID id, String nota, String ator) {
        Orcamento orcamento = orcamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orçamento não encontrado."));

        appendNota(orcamento, String.format("%s: %s", ator, nota));
        Orcamento saved = orcamentoRepository.save(orcamento);
        auditService.logAction("ORCAMENTO_NOTA_ADDED", "ORCAMENTO", orcamento.getCodigo(),
                String.format("%s adicionou uma anotação interna", ator));
        return saved;
    }

    public Contrato convertToContract(UUID id, BigDecimal customValor, LocalDate customDataFim) {
        return convertToContract(id, customValor, customDataFim, "sistema");
    }

    @Transactional
    public Contrato convertToContract(UUID id, BigDecimal customValor, LocalDate customDataFim, String ator) {
        Orcamento orcamento = orcamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orçamento não encontrado."));

        // 1. Find or create Cliente
        Cliente cliente = null;
        if (orcamento.getClienteId() != null) {
            cliente = clienteRepository.findById(orcamento.getClienteId()).orElse(null);
        }
        if (cliente == null && orcamento.getEmailSolicitante() != null) {
            cliente = clienteRepository.findByEmail(orcamento.getEmailSolicitante()).orElse(null);
        }
        if (cliente == null) {
            cliente = new Cliente(
                    orcamento.getNomeSolicitante(),
                    orcamento.getEmailSolicitante(),
                    orcamento.getTelefoneSolicitante(),
                    orcamento.getCidade(),
                    orcamento.getEstado()
            );
            cliente = clienteRepository.save(cliente);
            orcamento.setClienteId(cliente.getId());
        }

        // 2. Generate unique contract number
        String contractNum = String.format("CTR-%d-%03d", Year.now().getValue(), random.nextInt(900) + 100);

        // 3. Build contract
        Contrato contrato = new Contrato();
        contrato.setNumero(contractNum);
        contrato.setOrcamentoId(orcamento.getId());
        contrato.setCliente(cliente);
        contrato.setTitulo("Contrato de Empreitada - " + orcamento.getTipoObra() + " (" + orcamento.getNomeSolicitante() + ")");

        BigDecimal finalVal = customValor != null ? customValor
                : (orcamento.getValorEstimado() != null ? orcamento.getValorEstimado() : BigDecimal.valueOf(150000.00));
        contrato.setValorTotal(finalVal);

        contrato.setDataInicio(LocalDate.now());
        contrato.setDataFim(customDataFim != null ? customDataFim : LocalDate.now().plusMonths(6));
        contrato.setStatus("VIGENTE");
        contrato.setObservacoes("Convertido diretamente a partir do orçamento " + orcamento.getCodigo());

        Contrato savedContract = contratoRepository.save(contrato);

        // 4. Update orcamento
        orcamento.setStatus("APROVADO");
        appendNota(orcamento, "Orçamento convertido no contrato " + contractNum + " em " + LocalDate.now() + " por " + ator);
        orcamentoRepository.save(orcamento);

        auditService.logAction("ORCAMENTO_CONVERTED_TO_CONTRACT", "CONTRATO", contractNum,
                "Orçamento " + orcamento.getCodigo() + " convertido com sucesso no contrato " + contractNum);

        return savedContract;
    }

    private void appendNota(Orcamento orcamento, String novaNota) {
        String timestamp = LocalDateTime.now().toString().substring(0, 16).replace("T", " ");
        String entry = String.format("[%s] %s", timestamp, novaNota);
        if (orcamento.getNotasInternas() == null || orcamento.getNotasInternas().isBlank()) {
            orcamento.setNotasInternas(entry);
        } else {
            orcamento.setNotasInternas(orcamento.getNotasInternas() + "\n" + entry);
        }
    }
}
