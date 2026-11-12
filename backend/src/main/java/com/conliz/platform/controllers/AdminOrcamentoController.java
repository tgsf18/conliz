package com.conliz.platform.controllers;

import com.conliz.platform.domain.Contrato;
import com.conliz.platform.domain.User;
import com.conliz.platform.domain.Orcamento;
import com.conliz.platform.dto.PageResponse;
import com.conliz.platform.service.AdminOrcamentoService;
import com.conliz.platform.service.PdfProposalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orcamentos")
@Tag(name = "Painel - Orçamentos & Propostas", description = "Gestão de orçamentos, Kanban, notas e conversão em contrato")
public class AdminOrcamentoController {

    private final AdminOrcamentoService adminOrcamentoService;
    private final PdfProposalService pdfProposalService;

    public AdminOrcamentoController(
            AdminOrcamentoService adminOrcamentoService,
            PdfProposalService pdfProposalService) {
        this.adminOrcamentoService = adminOrcamentoService;
        this.pdfProposalService = pdfProposalService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL', 'ENGENHARIA')")
    @Operation(summary = "Listar orçamentos com filtro opcional por status")
    public ResponseEntity<?> listAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "20") int size) {
        if (page != null) {
            int safePage = Math.max(page, 0);
            int safeSize = Math.min(Math.max(size, 1), 100);
            var result = adminOrcamentoService.listPage(
                    status,
                    PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "criadoEm"))
            );
            return ResponseEntity.ok(new PageResponse<>(
                    result.getContent(),
                    result.getTotalElements(),
                    result.getTotalPages(),
                    result.getNumber(),
                    result.getSize()
            ));
        }
        return ResponseEntity.ok(adminOrcamentoService.listAll(status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL', 'ENGENHARIA')")
    @Operation(summary = "Consultar detalhes do orçamento")
    public ResponseEntity<Orcamento> getById(@PathVariable UUID id) {
        return adminOrcamentoService.getById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orçamento não encontrado."));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL', 'ENGENHARIA')")
    @Operation(summary = "Atualizar status do orçamento (NOVO, EM_ANALISE, ENVIADO, APROVADO, RECUSADO)")
    public ResponseEntity<Orcamento> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        String nota = payload.get("nota");
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O status é obrigatório.");
        }
        return ResponseEntity.ok(adminOrcamentoService.updateStatus(id, status, nota, currentActor()));
    }

    @PostMapping("/{id}/notas")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL', 'ENGENHARIA')")
    @Operation(summary = "Adicionar anotação técnica/comercial interna no orçamento")
    public ResponseEntity<Orcamento> addNota(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        String nota = payload.get("nota");
        if (nota == null || nota.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A anotação não pode ser vazia.");
        }
        return ResponseEntity.ok(adminOrcamentoService.addNota(id, nota, currentActor()));
    }

    @PostMapping("/{id}/converter-contrato")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL')")
    @Operation(summary = "Conversão de orçamento aprovado em contrato oficial com 1 clique")
    public ResponseEntity<Map<String, Object>> convertToContract(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> payload) {

        BigDecimal customValor = null;
        LocalDate customDataFim = null;

        if (payload != null) {
            if (payload.get("valorTotal") != null) {
                customValor = new BigDecimal(payload.get("valorTotal").toString());
            }
            if (payload.get("dataFim") != null) {
                customDataFim = LocalDate.parse(payload.get("dataFim").toString());
            }
        }

        Contrato contrato = adminOrcamentoService.convertToContract(id, customValor, customDataFim, currentActor());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "contratoId", contrato.getId(),
                "numeroContrato", contrato.getNumero(),
                "valorTotal", contrato.getValorTotal(),
                "message", "Orçamento convertido no contrato " + contrato.getNumero() + " com sucesso!"
        ));
    }

    @GetMapping("/{id}/proposta-pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL', 'ENGENHARIA')")
    @Operation(summary = "Gerar e baixar proposta comercial executiva em PDF")
    public ResponseEntity<byte[]> downloadProposalPdf(@PathVariable UUID id) {
        Orcamento orcamento = adminOrcamentoService.getById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orçamento não encontrado."));

        byte[] pdfBytes = pdfProposalService.generateProposalPdf(orcamento);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Proposta-Conliz-" + orcamento.getCodigo() + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    /** Ator autenticado (e-mail) para a trilha de auditoria e notas internas. */
    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "sistema";
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user.getEmail();
        }
        return authentication.getName();
    }
}
