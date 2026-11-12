package com.conliz.platform.controllers;

import com.conliz.platform.dto.FuncionarioDto;
import com.conliz.platform.dto.FuncionarioRequest;
import com.conliz.platform.dto.PageResponse;
import com.conliz.platform.dto.RhResumo;
import com.conliz.platform.service.RhAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/funcionarios")
@Tag(name = "Painel - RH", description = "Quadro de pessoal, folha base, departamentos e status do funcionário")
public class RhAdminController {

    private final RhAdminService rhAdminService;

    public RhAdminController(RhAdminService rhAdminService) {
        this.rhAdminService = rhAdminService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    @Operation(summary = "Listar funcionários com filtro por status, departamento e busca por nome/cargo")
    public ResponseEntity<PageResponse<FuncionarioDto>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String departamento,
            @RequestParam(required = false) String termo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.ASC, "nome")
        );
        var result = rhAdminService.list(status, departamento, termo, pageable);
        return ResponseEntity.ok(new PageResponse<>(
                result.getContent(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.getNumber(),
                result.getSize()
        ));
    }

    @GetMapping("/resumo")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    @Operation(summary = "Headcount, folha base ativa e distribuição por departamento")
    public ResponseEntity<RhResumo> resumo() {
        return ResponseEntity.ok(rhAdminService.resumo());
    }

    @GetMapping("/departamentos")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    @Operation(summary = "Listar departamentos cadastrados")
    public ResponseEntity<List<String>> departamentos() {
        return ResponseEntity.ok(rhAdminService.departamentos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    @Operation(summary = "Detalhar um funcionário")
    public ResponseEntity<FuncionarioDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(rhAdminService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    @Operation(summary = "Cadastrar funcionário (CPF único, 11 dígitos)")
    public ResponseEntity<FuncionarioDto> create(@Valid @RequestBody FuncionarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(rhAdminService.create(request, ator()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    @Operation(summary = "Atualizar cadastro do funcionário")
    public ResponseEntity<FuncionarioDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody FuncionarioRequest request) {
        return ResponseEntity.ok(rhAdminService.update(id, request, ator()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    @Operation(summary = "Alterar status do funcionário (ATIVO, AFASTADO, DESLIGADO, FERIAS)")
    public ResponseEntity<FuncionarioDto> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O status é obrigatório.");
        }
        return ResponseEntity.ok(rhAdminService.updateStatus(id, status, ator()));
    }

    private String ator() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "sistema";
        }
        return authentication.getName();
    }
}
