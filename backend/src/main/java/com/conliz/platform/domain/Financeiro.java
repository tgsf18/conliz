package com.conliz.platform.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "financeiro")
public class Financeiro {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "obra_id")
    private UUID obraId;

    @Column(nullable = false, length = 30)
    private String tipo; // RECEITA, DESPESA

    @Column(nullable = false, length = 100)
    private String categoria;

    @Column(nullable = false, length = 255)
    private String descricao;

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal valor;

    @Column(name = "data_vencimento", nullable = false)
    private LocalDate dataVencimento;

    @Column(name = "data_pagamento")
    private LocalDate dataPagamento;

    @Column(nullable = false, length = 30)
    private String status = "PENDENTE"; // PENDENTE, PAGO, CANCELADO, ATRASADO

    @Column(name = "documento_num", length = 100)
    private String documentoNum;

    @Column(name = "fornecedor_id")
    private UUID fornecedorId;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    public Financeiro() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getObraId() { return obraId; }
    public void setObraId(UUID obraId) { this.obraId = obraId; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public LocalDate getDataVencimento() { return dataVencimento; }
    public void setDataVencimento(LocalDate dataVencimento) { this.dataVencimento = dataVencimento; }
    public LocalDate getDataPagamento() { return dataPagamento; }
    public void setDataPagamento(LocalDate dataPagamento) { this.dataPagamento = dataPagamento; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDocumentoNum() { return documentoNum; }
    public void setDocumentoNum(String documentoNum) { this.documentoNum = documentoNum; }
    public UUID getFornecedorId() { return fornecedorId; }
    public void setFornecedorId(UUID fornecedorId) { this.fornecedorId = fornecedorId; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}
