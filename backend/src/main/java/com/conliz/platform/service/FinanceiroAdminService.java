package com.conliz.platform.service;

import com.conliz.platform.domain.Financeiro;
import com.conliz.platform.dto.FinanceiroDto;
import com.conliz.platform.dto.FinanceiroRequest;
import com.conliz.platform.dto.FinanceiroResumo;
import com.conliz.platform.repository.FinanceiroRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FinanceiroAdminService {

    private static final Set<String> TIPOS = Set.of("RECEITA", "DESPESA");
    private static final Set<String> STATUS = Set.of("PENDENTE", "PAGO", "CANCELADO", "ATRASADO");

    private final FinanceiroRepository financeiroRepository;
    private final AuditService auditService;

    public FinanceiroAdminService(FinanceiroRepository financeiroRepository, AuditService auditService) {
        this.financeiroRepository = financeiroRepository;
        this.auditService = auditService;
    }

    public Page<FinanceiroDto> list(String tipo, String status, LocalDate inicio, LocalDate fim,
                                    String termo, Pageable pageable) {
        return financeiroRepository
                .search(normalizar(tipo, TIPOS), normalizar(status, STATUS), inicio, fim,
                        termo == null || termo.isBlank() ? "" : termo.trim(), pageable)
                .map(FinanceiroDto::from);
    }

    public FinanceiroDto getById(UUID id) {
        return FinanceiroDto.from(buscar(id));
    }

    public FinanceiroResumo resumo(String periodo) {
        YearMonth mes = mesDoPeriodo(periodo);
        LocalDate inicio = mes.atDay(1);
        LocalDate fim = mes.atEndOfMonth();
        LocalDate hoje = LocalDate.now();

        BigDecimal receitaPaga = valorOuZero(financeiroRepository.sumTotalReceitaPaga());
        BigDecimal despesaPaga = valorOuZero(financeiroRepository.sumTotalDespesaPaga());
        BigDecimal receitaPendente = valorOuZero(financeiroRepository.sumTotalReceitaPendente());
        BigDecimal despesaPendente = valorOuZero(financeiroRepository.sumTotalDespesaPendente());

        List<FinanceiroResumo.CategoriaTotal> porCategoria = new ArrayList<>();
        for (Object[] linha : financeiroRepository.sumByCategoria(inicio, fim)) {
            porCategoria.add(new FinanceiroResumo.CategoriaTotal(
                    (String) linha[0],
                    (String) linha[1],
                    linha[2] != null ? new BigDecimal(linha[2].toString()) : BigDecimal.ZERO,
                    linha[3] != null ? ((Number) linha[3]).longValue() : 0L
            ));
        }

        return new FinanceiroResumo(
                receitaPaga,
                despesaPaga,
                receitaPendente,
                despesaPendente,
                receitaPaga.subtract(despesaPaga),
                receitaPaga.add(receitaPendente).subtract(despesaPaga).subtract(despesaPendente),
                financeiroRepository.countAtrasados(hoje),
                valorOuZero(financeiroRepository.sumValorAtrasado(hoje)),
                porCategoria
        );
    }

    @Transactional
    public FinanceiroDto create(FinanceiroRequest request, String ator) {
        Financeiro lancamento = new Financeiro();
        aplicar(lancamento, request);
        Financeiro saved = financeiroRepository.save(lancamento);

        auditService.logAction("FINANCEIRO_CREATED", "FINANCEIRO", saved.getId().toString(),
                String.format("%s lançou %s de R$ %s (%s)", ator, saved.getTipo(), saved.getValor(), saved.getCategoria()));
        return FinanceiroDto.from(saved);
    }

    @Transactional
    public FinanceiroDto update(UUID id, FinanceiroRequest request, String ator) {
        Financeiro lancamento = buscar(id);
        aplicar(lancamento, request);
        Financeiro saved = financeiroRepository.save(lancamento);

        auditService.logAction("FINANCEIRO_UPDATED", "FINANCEIRO", saved.getId().toString(),
                String.format("%s atualizou o lançamento %s", ator, saved.getDescricao()));
        return FinanceiroDto.from(saved);
    }

    @Transactional
    public FinanceiroDto updateStatus(UUID id, String novoStatus, LocalDate dataPagamento, String ator) {
        String status = normalizar(novoStatus, STATUS);
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Status inválido. Use um de: " + String.join(", ", STATUS) + ".");
        }

        Financeiro lancamento = buscar(id);
        String anterior = lancamento.getStatus();
        lancamento.setStatus(status);
        lancamento.setDataPagamento("PAGO".equals(status)
                ? (dataPagamento != null ? dataPagamento : LocalDate.now())
                : dataPagamento);

        Financeiro saved = financeiroRepository.save(lancamento);
        auditService.logAction("FINANCEIRO_STATUS_UPDATED", "FINANCEIRO", saved.getId().toString(),
                String.format("%s alterou o status de %s para %s", ator, anterior, status));
        return FinanceiroDto.from(saved);
    }

    @Transactional
    public void delete(UUID id, String ator) {
        Financeiro lancamento = buscar(id);
        financeiroRepository.delete(lancamento);
        auditService.logAction("FINANCEIRO_DELETED", "FINANCEIRO", id.toString(),
                String.format("%s removeu o lançamento %s", ator, lancamento.getDescricao()));
    }

    private Financeiro buscar(UUID id) {
        return financeiroRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lançamento financeiro não encontrado."));
    }

    private void aplicar(Financeiro lancamento, FinanceiroRequest request) {
        String tipo = normalizar(request.tipo(), TIPOS);
        if (tipo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo deve ser RECEITA ou DESPESA.");
        }
        String status = normalizar(request.status(), STATUS);

        lancamento.setTipo(tipo);
        lancamento.setCategoria(request.categoria().trim());
        lancamento.setDescricao(request.descricao().trim());
        lancamento.setValor(request.valor());
        lancamento.setDataVencimento(request.dataVencimento());
        lancamento.setDocumentoNum(request.documentoNum() == null || request.documentoNum().isBlank()
                ? null : request.documentoNum().trim());

        if (status != null) {
            lancamento.setStatus(status);
        } else if (lancamento.getStatus() == null) {
            lancamento.setStatus("PENDENTE");
        }

        if ("PAGO".equals(lancamento.getStatus())) {
            lancamento.setDataPagamento(request.dataPagamento() != null ? request.dataPagamento() : LocalDate.now());
        } else {
            lancamento.setDataPagamento(request.dataPagamento());
        }
    }

    private String normalizar(String valor, Set<String> permitidos) {
        if (valor == null || valor.isBlank() || "TODOS".equalsIgnoreCase(valor)) {
            return null;
        }
        String normalizado = valor.trim().toUpperCase(Locale.ROOT);
        return permitidos.contains(normalizado) ? normalizado : null;
    }

    private BigDecimal valorOuZero(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }

    private YearMonth mesDoPeriodo(String periodo) {
        if (periodo == null || periodo.isBlank()) {
            return YearMonth.now();
        }
        try {
            return YearMonth.parse(periodo.trim());
        } catch (RuntimeException ex) {
            return YearMonth.now();
        }
    }
}
