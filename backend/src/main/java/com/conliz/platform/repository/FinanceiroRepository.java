package com.conliz.platform.repository;

import com.conliz.platform.domain.Financeiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
public interface FinanceiroRepository extends JpaRepository<Financeiro, UUID> {
    List<Financeiro> findByObraIdOrderByDataVencimentoAsc(UUID obraId);

    List<Financeiro> findByStatus(String status);

    @Query("SELECT f FROM Financeiro f WHERE f.dataVencimento BETWEEN :inicio AND :fim ORDER BY f.dataVencimento ASC")
    List<Financeiro> findByPeriod(LocalDate inicio, LocalDate fim);

    @Query("SELECT COALESCE(SUM(f.valor), 0) FROM Financeiro f WHERE f.tipo = 'RECEITA' AND f.status = 'PAGO'")
    BigDecimal sumTotalReceitaPaga();

    @Query("SELECT COALESCE(SUM(f.valor), 0) FROM Financeiro f WHERE f.tipo = 'DESPESA' AND f.status = 'PAGO'")
    BigDecimal sumTotalDespesaPaga();

    @Query("SELECT COALESCE(SUM(f.valor), 0) FROM Financeiro f WHERE f.tipo = 'RECEITA' AND f.status = 'PENDENTE'")
    BigDecimal sumTotalReceitaPendente();

    @Query("SELECT COALESCE(SUM(f.valor), 0) FROM Financeiro f WHERE f.tipo = 'DESPESA' AND f.status = 'PENDENTE'")
    BigDecimal sumTotalDespesaPendente();
}
