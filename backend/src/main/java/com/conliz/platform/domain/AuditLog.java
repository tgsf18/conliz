package com.conliz.platform.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "auditoria")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Column(name = "usuario_email", length = 150)
    private String usuarioEmail;

    @Column(nullable = false, length = 100)
    private String acao;

    @Column(nullable = false, length = 100)
    private String entidade;

    @Column(name = "entidade_id", length = 100)
    private String entidadeId;

    @Column(name = "ip_origem", length = 50)
    private String ipOrigem;

    @Column(columnDefinition = "TEXT")
    private String detalhes;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    public AuditLog() {
    }

    public AuditLog(UUID usuarioId, String usuarioEmail, String acao, String entidade, String entidadeId, String ipOrigem, String detalhes) {
        this.usuarioId = usuarioId;
        this.usuarioEmail = usuarioEmail;
        this.acao = acao;
        this.entidade = entidade;
        this.entidadeId = entidadeId;
        this.ipOrigem = ipOrigem;
        this.detalhes = detalhes;
        this.criadoEm = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioEmail() {
        return usuarioEmail;
    }

    public void setUsuarioEmail(String usuarioEmail) {
        this.usuarioEmail = usuarioEmail;
    }

    public String getAcao() {
        return acao;
    }

    public void setAcao(String acao) {
        this.acao = acao;
    }

    public String getEntidade() {
        return entidade;
    }

    public void setEntidade(String entidade) {
        this.entidade = entidade;
    }

    public String getEntidadeId() {
        return entidadeId;
    }

    public void setEntidadeId(String entidadeId) {
        this.entidadeId = entidadeId;
    }

    public String getIpOrigem() {
        return ipOrigem;
    }

    public void setIpOrigem(String ipOrigem) {
        this.ipOrigem = ipOrigem;
    }

    public String getDetalhes() {
        return detalhes;
    }

    public void setDetalhes(String detalhes) {
        this.detalhes = detalhes;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
