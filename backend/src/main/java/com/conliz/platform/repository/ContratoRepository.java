package com.conliz.platform.repository;

import com.conliz.platform.domain.Contrato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

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
}
