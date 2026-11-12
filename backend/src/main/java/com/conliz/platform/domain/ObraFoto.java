package com.conliz.platform.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "obra_fotos")
public class ObraFoto {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "obra_id", nullable = false)
    @JsonIgnore
    private Obra obra;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(length = 255)
    private String legenda;

    @Column(name = "eh_antes_depois", nullable = false)
    private boolean ehAntesDepois = false;

    @Column(name = "eh_antes", nullable = false)
    private boolean ehAntes = false;

    @Column(nullable = false)
    private int ordem = 0;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    public ObraFoto() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Obra getObra() { return obra; }
    public void setObra(Obra obra) { this.obra = obra; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getLegenda() { return legenda; }
    public void setLegenda(String legenda) { this.legenda = legenda; }
    public boolean isEhAntesDepois() { return ehAntesDepois; }
    public void setEhAntesDepois(boolean ehAntesDepois) { this.ehAntesDepois = ehAntesDepois; }
    public boolean isEhAntes() { return ehAntes; }
    public void setEhAntes(boolean ehAntes) { this.ehAntes = ehAntes; }
    public int getOrdem() { return ordem; }
    public void setOrdem(int ordem) { this.ordem = ordem; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}
