package com.conliz.platform.repository;

import com.conliz.platform.domain.Orcamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrcamentoRepository extends JpaRepository<Orcamento, UUID> {
    Optional<Orcamento> findByCodigo(String codigo);
    List<Orcamento> findByStatusOrderByCriadoEmDesc(String status);
    Page<Orcamento> findAllByOrderByCriadoEmDesc(Pageable pageable);
    long countByStatus(String status);
}
