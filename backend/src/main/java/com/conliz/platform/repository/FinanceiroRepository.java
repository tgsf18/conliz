package com.conliz.platform.repository;

import com.conliz.platform.domain.Financeiro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
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

    @Query("""
            SELECT f FROM Financeiro f
            WHERE (:tipo IS NULL OR f.tipo = :tipo)
              AND (:status IS NULL OR f.status = :status)
              AND (:inicio IS NULL OR f.dataVencimento >= :inicio)
              AND (:fim IS NULL OR f.dataVencimento <= :fim)
              AND (:termo IS NULL OR LOWER(f.descricao) LIKE LOWER(CONCAT('%', :termo, '%'))
                   OR LOWER(f.categoria) LIKE LOWER(CONCAT('%', :termo, '%')))
            """)
    Page<Financeiro> search(@Param("tipo") String tipo,
                            @Param("status") String status,
                            @Param("inicio") LocalDate inicio,
                            @Param("fim") LocalDate fim,
                            @Param("termo") String termo,
                            Pageable pageable);

    @Query("""
            SELECT COALESCE(SUM(f.valor), 0) FROM Financeiro f
            WHERE f.status = 'PENDENTE' AND f.dataVencimento < :hoje
            """)
    BigDecimal sumValorAtrasado(@Param("hoje") LocalDate hoje);

    @Query("SELECT COUNT(f) FROM Financeiro f WHERE f.status = 'PENDENTE' AND f.dataVencimento < :hoje")
    long countAtrasados(@Param("hoje") LocalDate hoje);

    @Query("""
            SELECT f.tipo AS tipo, f.categoria AS categoria, SUM(f.valor) AS total, COUNT(f) AS quantidade
            FROM Financeiro f
            WHERE f.dataVencimento BETWEEN :inicio AND :fim
            GROUP BY f.tipo, f.categoria
            ORDER BY f.tipo, SUM(f.valor) DESC
            """)
    List<Object[]> sumByCategoria(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
