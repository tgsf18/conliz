package com.conliz.platform.controllers;

import com.conliz.platform.domain.Orcamento;
import com.conliz.platform.dto.ObraDetailDto;
import com.conliz.platform.dto.ObraSummaryDto;
import com.conliz.platform.dto.PublicContatoRequest;
import com.conliz.platform.dto.PublicOrcamentoRequest;
import com.conliz.platform.service.PublicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Site Público", description = "Endpoints de catálogo de obras, soluções e envio de orçamentos e contato")
public class PublicController {

    private final PublicService publicService;

    public PublicController(PublicService publicService) {
        this.publicService = publicService;
    }

    @GetMapping("/obras")
    @Operation(summary = "Listar obras públicas com filtro opcional por categoria")
    public ResponseEntity<List<ObraSummaryDto>> listObras(
            @RequestParam(required = false) String categoria) {
        return ResponseEntity.ok(publicService.listPublicObras(categoria));
    }

    @GetMapping("/obras/{slug}")
    @Operation(summary = "Detalhe completo de uma obra pública com galeria e antes/depois")
    public ResponseEntity<ObraDetailDto> getObra(@PathVariable String slug) {
        return publicService.getObraBySlug(slug)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Obra não encontrada."));
    }

    @GetMapping("/solucoes")
    @Operation(summary = "Listar soluções e serviços editoriais da Conliz")
    public ResponseEntity<List<Map<String, String>>> listSolucoes() {
        return ResponseEntity.ok(publicService.listSolucoes());
    }

    @PostMapping("/orcamentos")
    @Operation(summary = "Enviar formulário de orçamento em etapas (cria status NOVO)")
    public ResponseEntity<Map<String, Object>> submitOrcamento(
            @Valid @RequestBody PublicOrcamentoRequest request) {
        Orcamento orcamento = publicService.createOrcamento(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "codigo", orcamento.getCodigo(),
                "message", "Orçamento recebido com sucesso! Nossa equipe técnica entrará em contato em breve."
        ));
    }

    @PostMapping("/contato")
    @Operation(summary = "Enviar formulário de fale conosco")
    public ResponseEntity<Map<String, Object>> submitContato(
            @Valid @RequestBody PublicContatoRequest request) {
        publicService.processContato(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Mensagem enviada com sucesso! Responderemos o mais breve possível."
        ));
    }
}
