package com.conliz.platform.repository;

import com.conliz.platform.domain.Contrato;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContratoRepository extends JpaRepository<Contrato, UUID> {
    Optional<Contrato> findByNumero(String numero);
    List<Contrato> findByStatusOrderByDataFimAsc(String status);

    @Query("SELECT c FROM Contrato c WHERE c.status = 'VIGENTE' AND c.dataFim BETWEEN :hoje AND :limite ORDER BY c.dataFim ASC")
    List<Contrato> findExpiringContracts(LocalDate hoje, LocalDate limite);

    @Query("SELECT COUNT(c) FROM Contrato c WHERE c.status = 'VIGENTE'")
    long countVigentes();

    Page<Contrato> findByStatus(String status, Pageable pageable);

    @Query("""
            SELECT c FROM Contrato c
            WHERE (:status IS NULL OR c.status = :status)
              AND (LOWER(c.numero) LIKE LOWER(CONCAT('%', :termo, '%'))
                OR LOWER(c.titulo) LIKE LOWER(CONCAT('%', :termo, '%'))
                OR LOWER(c.cliente.nome) LIKE LOWER(CONCAT('%', :termo, '%')))
            """)
    Page<Contrato> search(@Param("status") String status,
                          @Param("termo") String termo,
                          Pageable pageable);

    @Query("""
            SELECT COALESCE(SUM(c.valorTotal), 0) FROM Contrato c
            WHERE c.status = :status
            """)
    BigDecimal sumValorByStatus(@Param("status") String status);

    long countByStatus(String status);
}
