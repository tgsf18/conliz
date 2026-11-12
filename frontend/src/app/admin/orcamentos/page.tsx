"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/http.mjs";
import {
  FileSpreadsheet,
  Kanban,
  List,
  Search,
  Filter,
  ArrowRight,
  FileDown,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Plus,
  Send,
  Building,
  User,
  MapPin,
  Calendar,
  X,
  FileCheck,
} from "lucide-react";

interface Orcamento {
  id: string;
  codigo: string;
  clienteId: string | null;
  nomeSolicitante: string;
  emailSolicitante: string;
  telefoneSolicitante: string;
  tipoObra: string;
  areaM2: number | null;
  cidade: string;
  estado: string;
  status: "NOVO" | "EM_ANALISE" | "ENVIADO" | "APROVADO" | "RECUSADO";
  valorEstimado: number | null;
  descricao: string;
  anexosUrls: string | null;
  notasInternas: string | null;
  criadoEm: string;
}

export default function AdminOrcamentosPage() {
  const [viewMode, setViewMode] = useState<"kanban" | "lista">("kanban");
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // Selected for Modal Details
  const [selected, setSelected] = useState<Orcamento | null>(null);
  const [novaNota, setNovaNota] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOrcamentos = async (mode: "kanban" | "lista" = viewMode, pageIndex = page) => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "TODOS") {
        params.set("status", statusFilter);
      }
      if (mode === "lista") {
        params.set("page", String(pageIndex));
        params.set("size", String(pageSize));
      }
      const query = params.toString();
      const res = await apiFetch(`/api/admin/orcamentos${query ? `?${query}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrcamentos(data);
          setTotalPages(1);
        } else {
          setOrcamentos(data.content ?? []);
          setTotalPages(data.totalPages ?? 1);
        }
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrcamentos(viewMode, page);
  }, [viewMode, page, statusFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateStatus = async (id: string, newStatus: string, nota?: string) => {
    setActionLoading(true);
    try {
      const res = await apiFetch(`/api/admin/orcamentos/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, nota: nota || `Movido para ${newStatus}` }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrcamentos((prev) => prev.map((o) => (o.id === id ? updated : o)));
        if (selected && selected.id === id) {
          setSelected(updated);
        }
        showToast(`Status atualizado para ${newStatus}`);
      }
    } catch (e) {
      showToast("Erro ao atualizar status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !novaNota.trim()) return;

    setActionLoading(true);
    try {
      const res = await apiFetch(`/api/admin/orcamentos/${selected.id}/notas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nota: novaNota }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelected(updated);
        setOrcamentos((prev) => prev.map((o) => (o.id === selected.id ? updated : o)));
        setNovaNota("");
        showToast("Anotação interna adicionada.");
      }
    } catch (e) {
      showToast("Falha ao salvar anotação.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = (id: string, codigo: string) => {
    window.open(`/api/admin/orcamentos/${id}/proposta-pdf`, "_blank");
  };

  const handleConvertToContract = async (id: string) => {
    if (!confirm("Confirmar a conversão deste orçamento em Contrato Oficial da Conliz?")) return;

    setActionLoading(true);
    try {
      const res = await apiFetch(`/api/admin/orcamentos/${id}/converter-contrato`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        showToast(data.message || "Contrato gerado com sucesso!");
        fetchOrcamentos();
        if (selected && selected.id === id) {
          setSelected({ ...selected, status: "APROVADO" });
        }
      } else {
        showToast("Erro ao converter em contrato.");
      }
    } catch (e) {
      showToast("Falha na comunicação.");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = orcamentos.filter((o) => {
    const matchesSearch =
      o.nomeSolicitante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cidade?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "TODOS" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: "NOVO", title: "Novos Recebidos", color: "border-sky-500", bg: "bg-sky-50" },
    { key: "EM_ANALISE", title: "Em Levantamento", color: "border-amber-500", bg: "bg-amber-50" },
    { key: "ENVIADO", title: "Proposta Enviada", color: "border-indigo-500", bg: "bg-indigo-50" },
    { key: "APROVADO", title: "Aprovados", color: "border-emerald-500", bg: "bg-emerald-50" },
    { key: "RECUSADO", title: "Recusados", color: "border-rose-400", bg: "bg-rose-50" },
  ];

  const formatCurrency = (val: number | null) => {
    if (!val) return "A definir";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-maison-charcoal text-white px-5 py-3 shadow-xl text-xs font-sans flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-maison-hairline pb-4">
        <div>
          <span className="editorial-sub block mb-1">Pipeline Comercial</span>
          <h1 className="text-3xl font-serif text-maison-charcoal font-bold">
            Gestão de Orçamentos & Propostas
          </h1>
        </div>

        {/* View Mode Toggle & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="inline-flex border border-maison-hairline bg-white p-0.5">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans tracking-editorial uppercase ${
                viewMode === "kanban"
                  ? "bg-maison-terracotta text-white font-bold"
                  : "text-maison-charcoal hover:bg-maison-linen"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => {
                setPage(0);
                setViewMode("lista");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans tracking-editorial uppercase ${
                viewMode === "lista"
                  ? "bg-maison-terracotta text-white font-bold"
                  : "text-maison-charcoal hover:bg-maison-linen"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar cliente, código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-maison-hairline text-xs font-sans text-maison-charcoal focus:outline-none focus:border-maison-terracotta"
            />
            <Search className="w-3.5 h-3.5 text-maison-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* VIEW: KANBAN BOARD */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const items = filtered.filter((o) => o.status === col.key);

            return (
              <div key={col.key} className="bg-maison-linen/50 border border-maison-hairline p-3 flex flex-col min-w-[240px]">
                {/* Column Header */}
                <div className={`p-2.5 bg-white border-b-2 ${col.color} mb-3 flex items-center justify-between shadow-sm`}>
                  <span className="font-sans text-[11px] font-bold tracking-editorial uppercase text-maison-charcoal">
                    {col.title}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-maison-linen rounded-full text-maison-charcoal">
                    {items.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                  {items.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => setSelected(o)}
                      className="bg-white p-3.5 border border-maison-hairline shadow-sm hover:border-maison-terracotta cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold text-maison-terracotta">{o.codigo}</span>
                        <span className="text-maison-muted">{o.cidade}/SP</span>
                      </div>

                      <h4 className="font-serif text-sm font-bold text-maison-charcoal group-hover:text-maison-terracotta transition-colors leading-snug">
                        {o.nomeSolicitante}
                      </h4>

                      <p className="text-[11px] font-sans text-maison-muted line-clamp-2">
                        {o.tipoObra} • {o.areaM2 ? `${o.areaM2} m²` : "Área a definir"}
                      </p>

                      <div className="pt-2 border-t border-maison-hairline flex items-center justify-between text-xs">
                        <span className="font-semibold text-maison-charcoal text-[11px]">
                          {formatCurrency(o.valorEstimado)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(o);
                          }}
                          className="text-[10px] text-maison-terracotta hover:underline font-bold"
                        >
                          Ver Detalhes →
                        </button>
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="p-4 text-center text-xs font-sans text-maison-muted border border-dashed border-maison-hairline">
                      Nenhum orçamento nesta fase.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: TABLE LIST */}
      {viewMode === "lista" && (
        <div className="bg-white border border-maison-hairline shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-maison-hairline bg-maison-linen text-maison-charcoal font-bold tracking-editorial uppercase">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Solicitante</th>
                  <th className="py-3 px-4">Tipo de Obra</th>
                  <th className="py-3 px-4">Cidade</th>
                  <th className="py-3 px-4">Área m²</th>
                  <th className="py-3 px-4">Valor Estimado</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maison-hairline">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-maison-cream/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-maison-terracotta">{o.codigo}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-maison-charcoal">{o.nomeSolicitante}</p>
                      <p className="text-[10px] text-maison-muted">{o.emailSolicitante}</p>
                    </td>
                    <td className="py-3 px-4 font-medium">{o.tipoObra}</td>
                    <td className="py-3 px-4">{o.cidade}/SP</td>
                    <td className="py-3 px-4">{o.areaM2 ? `${o.areaM2} m²` : "-"}</td>
                    <td className="py-3 px-4 font-semibold text-maison-charcoal">
                      {formatCurrency(o.valorEstimado)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border rounded-none bg-maison-linen border-maison-hairline">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelected(o)}
                        className="px-2.5 py-1 text-xs border border-maison-hairline hover:border-maison-charcoal transition-colors"
                      >
                        Detalhes
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(o.id, o.codigo)}
                        className="px-2.5 py-1 text-xs bg-maison-terracotta text-white hover:bg-maison-terracottaHover transition-colors"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-maison-hairline px-4 py-3 text-xs font-sans text-maison-muted">
            <span>Página {page + 1} de {Math.max(totalPages, 1)}</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
                className="px-3 py-1 border border-maison-hairline disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="px-3 py-1 border border-maison-hairline disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL WITH PDF GENERATION & 1-CLICK CONVERSION */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-white border border-maison-hairline shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-maison-hairline pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold text-maison-terracotta">
                    {selected.codigo}
                  </span>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold tracking-widest uppercase bg-maison-linen border border-maison-hairline text-maison-charcoal">
                    {selected.status}
                  </span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-maison-charcoal mt-1">
                  {selected.nomeSolicitante}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-maison-muted hover:text-maison-charcoal p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Action Bar (Download PDF & Convert to Contract) */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-maison-linen border border-maison-hairline">
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans text-maison-charcoal font-semibold">Alterar Estágio:</span>
                <select
                  value={selected.status}
                  onChange={(e) => handleUpdateStatus(selected.id, e.target.value)}
                  disabled={actionLoading}
                  className="px-2.5 py-1 text-xs bg-white border border-maison-hairline font-sans focus:outline-none"
                >
                  <option value="NOVO">NOVO</option>
                  <option value="EM_ANALISE">EM_ANALISE</option>
                  <option value="ENVIADO">ENVIADO</option>
                  <option value="APROVADO">APROVADO</option>
                  <option value="RECUSADO">RECUSADO</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {/* PDF Proposal Download */}
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(selected.id, selected.codigo)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-maison-charcoal text-white text-xs font-sans tracking-widest uppercase font-semibold hover:bg-maison-charcoal/90 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Baixar Proposta PDF</span>
                </button>

                {/* 1-Click Convert to Contract */}
                <button
                  type="button"
                  onClick={() => handleConvertToContract(selected.id)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-maison-terracotta text-white text-xs font-sans tracking-widest uppercase font-semibold hover:bg-maison-terracottaHover transition-colors shadow-sm disabled:opacity-50"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Converter em Contrato</span>
                </button>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
              <div className="p-3.5 bg-maison-cream border border-maison-hairline space-y-1">
                <span className="text-[10px] tracking-widest uppercase text-maison-muted font-bold">Contato</span>
                <p className="font-semibold text-maison-charcoal">{selected.emailSolicitante}</p>
                <p className="text-maison-muted">{selected.telefoneSolicitante}</p>
              </div>

              <div className="p-3.5 bg-maison-cream border border-maison-hairline space-y-1">
                <span className="text-[10px] tracking-widest uppercase text-maison-muted font-bold">Localização</span>
                <p className="font-semibold text-maison-charcoal">{selected.cidade} / {selected.estado}</p>
                <p className="text-maison-muted">{selected.tipoObra}</p>
              </div>

              <div className="p-3.5 bg-maison-cream border border-maison-hairline space-y-1">
                <span className="text-[10px] tracking-widest uppercase text-maison-muted font-bold">Investimento Estimado</span>
                <p className="font-serif text-base font-bold text-maison-terracotta">
                  {formatCurrency(selected.valorEstimado)}
                </p>
                <p className="text-maison-muted">{selected.areaM2 ? `${selected.areaM2} m² calculados` : "Área sob medida"}</p>
              </div>
            </div>

            {/* Scope / Description */}
            <div className="space-y-2">
              <h4 className="font-sans text-xs tracking-editorial uppercase text-maison-charcoal font-bold">
                Memorial & Descrição do Solicitante
              </h4>
              <div className="p-4 bg-maison-cream border border-maison-hairline text-xs font-sans leading-relaxed text-maison-charcoal whitespace-pre-wrap">
                {selected.descricao}
              </div>
            </div>

            {/* Pranchas Link */}
            {selected.anexosUrls && (
              <div className="p-3 bg-maison-linen border border-maison-hairline text-xs flex items-center justify-between">
                <span>Pranchas e arquivos anexos compartilhados:</span>
                <a
                  href={selected.anexosUrls}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-maison-terracotta hover:underline"
                >
                  Abrir Arquivos Externos →
                </a>
              </div>
            )}

            {/* Internal Notes & History */}
            <div className="space-y-3 pt-2">
              <h4 className="font-sans text-xs tracking-editorial uppercase text-maison-charcoal font-bold">
                Histórico & Anotações Internas
              </h4>
              <div className="p-3.5 bg-maison-linen/60 border border-maison-hairline text-xs font-mono max-h-40 overflow-y-auto whitespace-pre-wrap text-maison-charcoal">
                {selected.notasInternas || "Nenhuma anotação registrada ainda."}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNota} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Adicionar anotação técnica/comercial..."
                  value={novaNota}
                  onChange={(e) => setNovaNota(e.target.value)}
                  className="flex-1 px-3 py-2 border border-maison-hairline text-xs text-maison-charcoal focus:outline-none focus:border-maison-terracotta"
                />
                <button
                  type="submit"
                  disabled={actionLoading || !novaNota.trim()}
                  className="px-4 py-2 bg-maison-charcoal text-white text-xs font-sans tracking-widest uppercase font-semibold disabled:opacity-50"
                >
                  Salvar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
