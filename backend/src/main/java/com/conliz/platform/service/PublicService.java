package com.conliz.platform.service;

import com.conliz.platform.domain.Obra;
import com.conliz.platform.domain.Orcamento;
import com.conliz.platform.dto.ObraDetailDto;
import com.conliz.platform.dto.ObraSummaryDto;
import com.conliz.platform.dto.PublicContatoRequest;
import com.conliz.platform.dto.PublicOrcamentoRequest;
import com.conliz.platform.repository.ObraRepository;
import com.conliz.platform.repository.OrcamentoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PublicService {

    private static final Logger log = LoggerFactory.getLogger(PublicService.class);
    private final ObraRepository obraRepository;
    private final OrcamentoRepository orcamentoRepository;
    private final AuditService auditService;
    private final SecureRandom random = new SecureRandom();

    public PublicService(
            ObraRepository obraRepository,
            OrcamentoRepository orcamentoRepository,
            AuditService auditService) {
        this.obraRepository = obraRepository;
        this.orcamentoRepository = orcamentoRepository;
        this.auditService = auditService;
    }

    public List<ObraSummaryDto> listPublicObras(String categoria) {
        List<Obra> list;
        if (categoria != null && !categoria.isBlank() && !"TODAS".equalsIgnoreCase(categoria)) {
            list = obraRepository.findByPublicaTrueAndCategoriaIgnoreCase(categoria.trim());
        } else {
            list = obraRepository.findByPublicaTrueOrderByAnoConclusaoDescCriadoEmDesc();
        }
        return list.stream().map(ObraSummaryDto::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public Optional<ObraDetailDto> getObraBySlug(String slug) {
        return obraRepository.findBySlugAndPublicaTrue(slug)
                .map(ObraDetailDto::fromEntity);
    }

    public List<Map<String, String>> listSolucoes() {
        return List.of(
                Map.of(
                        "id", "construcao-residencial",
                        "titulo", "Construção Residencial de Alto Padrão",
                        "tagline", "A confiança que estrutura o seu lar.",
                        "descricao", "Execução completa de residências unifamiliares em condomínios fechados em Sorocaba, Votorantim e região. Gestão rigorosa de cronograma, transparência técnica e respeito minucioso ao projeto arquitetônico.",
                        "detalhes", "Fundações profundas, estruturas em concreto armado aparente, isolamento termoacústico, instalações hidrossanitárias e acabamentos nobres com paginação milimétrica.",
                        "imagem", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                ),
                Map.of(
                        "id", "reforma-retrofit",
                        "titulo", "Reformas & Retrofit Estrutural",
                        "tagline", "Renovação com inteligência construtiva e zero improviso.",
                        "descricao", "Transformação arquitetônica de apartamentos duplex, coberturas e residências consolidadas. Reforço estrutural, integração de ambientes e modernização de instalações.",
                        "detalhes", "Demolição controlada, reforços metálicos, nivelamento de contrapiso, impermeabilização de lajes e varandas, marcenaria integrada e automação predial.",
                        "imagem", "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
                ),
                Map.of(
                        "id", "comercial-corporativo",
                        "titulo", "Obras Comerciais & Corporativas",
                        "tagline", "Espaços que traduzem autoridade e sofisticação.",
                        "descricao", "Construção e adequação de clínicas médicas, escritórios corporativos, restaurantes e lojas com prazos de entrega rigorosamente cumpridos para antecipar o retorno do investimento.",
                        "detalhes", "Adequações às normas da Anvisa e bombeiros, piso elevado, cabeamento estruturado de alta performance, drywall acústico e climatização central.",
                        "imagem", "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
                ),
                Map.of(
                        "id", "gestao-projetos",
                        "titulo", "Gestão de Obras & Empreitada Global",
                        "tagline", "Planejamento sob medida, previsibilidade total de custos.",
                        "descricao", "Modelo turnkey onde a Conliz gerencia fornecedores, cotações de materiais no atacado, equipe própria qualificada, diário de obra em tempo real e relatórios quinzenais de medição.",
                        "detalhes", "Orçamento paramétrico detalhado, controle rigoroso de perdas, suporte a financiamento bancário para construção e ART/RRT emitidos por engenheiros sêniores.",
                        "imagem", "https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1200&q=80"
                )
        );
    }

    @Transactional
    public Orcamento createOrcamento(PublicOrcamentoRequest req) {
        String codigo = String.format("ORC-%d-%04d", Year.now().getValue(), random.nextInt(9000) + 1000);

        Orcamento orcamento = new Orcamento();
        orcamento.setCodigo(codigo);
        orcamento.setNomeSolicitante(req.nome());
        orcamento.setEmailSolicitante(req.email());
        orcamento.setTelefoneSolicitante(req.telefone());
        orcamento.setTipoObra(req.tipoObra());
        orcamento.setAreaM2(req.areaM2());
        orcamento.setCidade(req.cidade());
        orcamento.setEstado(req.estado() != null ? req.estado().toUpperCase() : "SP");
        orcamento.setDescricao(req.descricao());
        orcamento.setAnexosUrls(req.anexosUrls());
        orcamento.setStatus("NOVO");

        Orcamento saved = orcamentoRepository.save(orcamento);
        auditService.logAction("PUBLIC_ORCAMENTO_CREATED", "ORCAMENTO", saved.getCodigo(), "Novo orçamento enviado pelo site público: " + req.nome());
        log.info("New public budget request created: code={} client={}", codigo, req.nome());

        return saved;
    }

    public void processContato(PublicContatoRequest req) {
        auditService.logAction("PUBLIC_CONTATO_SENT", "CONTATO", req.email(), "Contato recebido via site: " + req.assunto());
        log.info("Contact form submitted: from={} subject={}", req.email(), req.assunto());
    }
}
