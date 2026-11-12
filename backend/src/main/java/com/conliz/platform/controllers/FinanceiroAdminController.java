package com.conliz.platform.controllers;

import com.conliz.platform.dto.FinanceiroDto;
import com.conliz.platform.dto.FinanceiroRequest;
import com.conliz.platform.dto.FinanceiroResumo;
import com.conliz.platform.dto.PageResponse;
import com.conliz.platform.service.FinanceiroAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/financeiro")
@Tag(name = "Painel - Financeiro", description = "Contas a pagar e receber, fluxo de caixa e resumo por categoria")
public class FinanceiroAdminController {

    private final FinanceiroAdminService financeiroAdminService;

    public FinanceiroAdminController(FinanceiroAdminService financeiroAdminService) {
        this.financeiroAdminService = financeiroAdminService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL')")
    @Operation(summary = "Listar lançamentos com filtro por tipo, status, período e busca")
    public ResponseEntity<PageResponse<FinanceiroDto>> list(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) String termo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.ASC, "dataVencimento")
        );
        var result = financeiroAdminService.list(tipo, status, inicio, fim, termo, pageable);
        return ResponseEntity.ok(new PageResponse<>(
                result.getContent(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.getNumber(),
                result.getSize()
        ));
    }

    @GetMapping("/resumo")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL')")
    @Operation(summary = "Resumo de caixa (realizado, previsto, atrasados) e totais por categoria no mês")
    public ResponseEntity<FinanceiroResumo> resumo(
            @RequestParam(required = false) String periodo) {
        return ResponseEntity.ok(financeiroAdminService.resumo(periodo));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL')")
    @Operation(summary = "Detalhar um lançamento financeiro")
    public ResponseEntity<FinanceiroDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(financeiroAdminService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCEIRO')")
    @Operation(summary = "Criar lançamento de receita ou despesa")
    public ResponseEntity<FinanceiroDto> create(@Valid @RequestBody FinanceiroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(financeiroAdminService.create(request, ator()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCEIRO')")
    @Operation(summary = "Atualizar um lançamento financeiro")
    public ResponseEntity<FinanceiroDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody FinanceiroRequest request) {
        return ResponseEntity.ok(financeiroAdminService.update(id, request, ator()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCEIRO')")
    @Operation(summary = "Baixar/alterar status do lançamento (PENDENTE, PAGO, CANCELADO, ATRASADO)")
    public ResponseEntity<FinanceiroDto> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {

        String status = payload.get("status");
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O status é obrigatório.");
        }
        String dataPagamento = payload.get("dataPagamento");
        LocalDate data = (dataPagamento == null || dataPagamento.isBlank()) ? null : LocalDate.parse(dataPagamento);

        return ResponseEntity.ok(financeiroAdminService.updateStatus(id, status, data, ator()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCEIRO')")
    @Operation(summary = "Excluir um lançamento financeiro (apenas ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        financeiroAdminService.delete(id, ator());
        return ResponseEntity.noContent().build();
    }

    private String ator() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "sistema";
        }
        return authentication.getName();
    }
}
