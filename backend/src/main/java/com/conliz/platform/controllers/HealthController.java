package com.conliz.platform.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health Check", description = "Monitoramento e status da API Conliz")
public class HealthController {

    @GetMapping
    @Operation(summary = "Verificar integridade do backend")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "app", "Conliz Platform Backend",
                "version", "1.0.0",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
