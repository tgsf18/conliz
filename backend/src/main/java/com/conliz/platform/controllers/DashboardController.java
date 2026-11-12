package com.conliz.platform.controllers;

import com.conliz.platform.dto.DashboardMetrics;
import com.conliz.platform.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@Tag(name = "Painel - Dashboard", description = "Métricas executivas, fluxo de caixa, funil e KPIs")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'COMERCIAL', 'ENGENHARIA')")
    @Operation(summary = "Obter dados analíticos e consolidados para o dashboard executivo")
    public ResponseEntity<DashboardMetrics> getMetrics(
            @RequestParam(required = false, defaultValue = "ANO_ATUAL") String periodo) {
        return ResponseEntity.ok(dashboardService.getDashboardMetrics(periodo));
    }
}
