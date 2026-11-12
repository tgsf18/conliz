package com.conliz.platform.controllers;

import com.conliz.platform.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Administração Segura", description = "Endpoints com controle estrito de RBAC por @PreAuthorize")
public class AdminTestController {

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'COMERCIAL', 'ENGENHARIA')")
    @Operation(summary = "Visão geral administrativa acessível por qualquer papel autenticado")
    public ResponseEntity<Map<String, Object>> overview(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of(
                "status", "AUTHORIZED",
                "user", user.getEmail(),
                "role", user.getRole().name()
        ));
    }

    @GetMapping("/rh/check")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    @Operation(summary = "Endpoint restrito ao RH e Admin")
    public ResponseEntity<Map<String, String>> rhOnly() {
        return ResponseEntity.ok(Map.of("module", "RH", "access", "GRANTED"));
    }

    @GetMapping("/comercial/check")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL')")
    @Operation(summary = "Endpoint restrito ao Comercial e Admin")
    public ResponseEntity<Map<String, String>> comercialOnly() {
        return ResponseEntity.ok(Map.of("module", "COMERCIAL", "access", "GRANTED"));
    }

    @GetMapping("/engenharia/check")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGENHARIA')")
    @Operation(summary = "Endpoint restrito à Engenharia e Admin")
    public ResponseEntity<Map<String, String>> engenhariaOnly() {
        return ResponseEntity.ok(Map.of("module", "ENGENHARIA", "access", "GRANTED"));
    }

    @GetMapping("/root/check")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Endpoint exclusivo de Administração do Sistema")
    public ResponseEntity<Map<String, String>> adminOnly() {
        return ResponseEntity.ok(Map.of("module", "ADMIN_ROOT", "access", "GRANTED"));
    }
}
