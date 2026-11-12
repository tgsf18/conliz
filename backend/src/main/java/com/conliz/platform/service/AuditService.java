package com.conliz.platform.service;

import com.conliz.platform.domain.AuditLog;
import com.conliz.platform.domain.User;
import com.conliz.platform.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(String acao, String entidade, String entidadeId, String detalhes) {
        try {
            UUID usuarioId = null;
            String usuarioEmail = "ANONYMOUS";

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User user) {
                usuarioId = user.getId();
                usuarioEmail = user.getEmail();
            }

            String ip = extractClientIp();
            AuditLog audit = new AuditLog(usuarioId, usuarioEmail, acao, entidade, entidadeId, ip, detalhes);
            auditLogRepository.save(audit);
            log.info("Audit: user={} action={} entity={}:{}", usuarioEmail, acao, entidade, entidadeId);
        } catch (Exception ex) {
            log.error("Failed to persist audit log: {}", ex.getMessage());
        }
    }

    public Page<AuditLog> listLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCriadoEmDesc(pageable);
    }

    private String extractClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception ignored) {
        }
        return "0.0.0.0";
    }
}
