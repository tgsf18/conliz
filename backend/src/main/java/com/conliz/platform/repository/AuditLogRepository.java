package com.conliz.platform.repository;

import com.conliz.platform.domain.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    Page<AuditLog> findByEntidadeOrderByCriadoEmDesc(String entidade, Pageable pageable);
    Page<AuditLog> findAllByOrderByCriadoEmDesc(Pageable pageable);
}
