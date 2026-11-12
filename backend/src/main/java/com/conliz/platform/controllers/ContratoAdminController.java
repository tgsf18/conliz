package com.conliz.platform.controllers;

import com.conliz.platform.dto.ContratoDto;
import com.conliz.platform.dto.ContratoRequest;
import com.conliz.platform.dto.PageResponse;
import com.conliz.platform.service.ContratoAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/contratos")
@Tag(name = "Painel - Contratos", description = "Gestão de contratos de empreitada, vigência e status")
public class ContratoAdminController {

    private final ContratoAdminService contratoAdminService;

    public ContratoAdminController(ContratoAdminService contratoAdminService) {
        this.contratoAdminService = contratoAdminService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL', 'ENGENHARIA')")
    @Operation(summary = "Listar contratos com filtro por status e busca por número, título ou cliente")
    public ResponseEntity<PageResponse<ContratoDto>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String termo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "criadoEm")
        );
        var result = contratoAdminService.list(status, termo, pageable);
        return ResponseEntity.ok(new PageResponse<>(
                result.getContent(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.getNumber(),
                result.getSize()
        ));
    }

    @GetMapping("/vencendo")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL', 'ENGENHARIA')")
    @Operation(summary = "Contratos vigentes que vencem nos próximos N dias")
    public ResponseEntity<List<ContratoDto>> vencendo(@RequestParam(defaultValue = "30") int dias) {
        return ResponseEntity.ok(contratoAdminService.vencendoEm(dias));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL', 'ENGENHARIA')")
    @Operation(summary = "Detalhar um contrato")
    public ResponseEntity<ContratoDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(contratoAdminService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL')")
    @Operation(summary = "Cadastrar contrato (gera número sequencial do ano)")
    public ResponseEntity<ContratoDto> create(@Valid @RequestBody ContratoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contratoAdminService.create(request, ator()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL')")
    @Operation(summary = "Atualizar dados do contrato")
    public ResponseEntity<ContratoDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody ContratoRequest request) {
        return ResponseEntity.ok(contratoAdminService.update(id, request, ator()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL')")
    @Operation(summary = "Alterar status do contrato (VIGENTE, ENCERRADO, SUSPENSO, CANCELADO)")
    public ResponseEntity<ContratoDto> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || status.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "O status é obrigatório.");
        }
        return ResponseEntity.ok(contratoAdminService.updateStatus(id, status, ator()));
    }

    private String ator() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "sistema";
        }
        return authentication.getName();
    }
}
