"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FileText, Search, Plus, X, CheckCircle2, AlertCircle, CalendarClock } from "lucide-react";
import { apiFetch } from "@/lib/http.mjs";

interface Contrato {
  id: string;
  numero: string;
  orcamentoId: string | null;
  clienteId: string | null;
  clienteNome: string | null;
  clienteEmail: string | null;
  clienteTelefone: string | null;
  clienteCidade: string | null;
  clienteUf: string | null;
  titulo: string;
  valorTotal: number;
  dataInicio: string;
  dataFim: string;
  status: string;
  arquivoUrl: string | null;
  observacoes: string | null;
  criadoEm: string;
}

const STATUS = ["VIGENTE", "ENCERRADO", "SUSPENSO", "CANCELADO"];

const STATUS_STYLE: Record<string, string> = {
  VIGENTE: "bg-emerald-50 border-emerald-200 text-emerald-800",
  ENCERRADO: "bg-slate-100 border-slate-300 text-slate-700",
  SUSPENSO: "bg-amber-50 border-amber-200 text-amber-800",
  CANCELADO: "bg-rose-50 border-rose-200 text-rose-800",
};

const formVazio = {
  titulo: "",
  valorTotal: "",
  dataInicio: "",
  dataFim: "",
  status: "VIGENTE",
  clienteNome: "",
  clienteEmail: "",
  clienteTelefone: "",
  clienteCidade: "",
  clienteUf: "SP",
  observacoes: "",
};

export default function AdminContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [termo, setTermo] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [vencendo, setVencendo] = useState<Contrato[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...formVazio });
  const [salvando, setSalvando] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const carregar = useCallback(
    async (pageIndex = page) => {
      setLoading(true);
      setErro("");
      try {
        const params = new URLSearchParams({ page: String(pageIndex), size: "20" });
        if (statusFilter !== "TODOS") params.set("status", statusFilter);
        if (termo.trim()) params.set("termo", termo.trim());

        const res = await apiFetch(`/api/admin/contratos?${params.toString()}`);
        if (!res.ok) {
          setErro("Não foi possível carregar os contratos.");
          return;
        }
        const data = await res.json();
        setContratos(data.content ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotalElements(data.totalElements ?? 0);
      } catch {
        setErro("Falha de conexão com a API.");
      } finally {
        setLoading(false);
      }
    },
    [page, statusFilter, termo]
  );

  const carregarVencendo = useCallback(async () => {
    try {
      const res = await apiFetch("/api/admin/contratos/vencendo?dias=45");
      if (res.ok) setVencendo(await res.json());
    } catch {
      /* silencioso: o painel de vencimentos é complementar */
    }
  }, []);

  useEffect(() => {
    carregar(page);
  }, [page, statusFilter, carregar]);

  useEffect(() => {
    carregarVencendo();
  }, [carregarVencendo]);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await apiFetch("/api/admin/contratos", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          valorTotal: Number(form.valorTotal),
        }),
      });
      if (res.ok) {
        const criado = await res.json();
        setShowForm(false);
        setForm({ ...formVazio });
        showToast(`Contrato ${criado.numero} criado com sucesso.`);
        carregar(0);
        carregarVencendo();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || "Erro ao criar contrato.");
      }
    } catch {
      showToast("Falha de conexão.");
    } finally {
      setSalvando(false);
    }
  };

  const alterarStatus = async (id: string, novoStatus: string) => {
    try {
      const res = await apiFetch(`/api/admin/contratos/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: novoStatus }),
      });
      if (res.ok) {
        const atualizado: Contrato = await res.json();
        setContratos((prev) => prev.map((c) => (c.id === id ? atualizado : c)));
        showToast(`Contrato ${atualizado.numero}: ${atualizado.status}.`);
        carregarVencendo();
      } else {
        showToast("Não foi possível alterar o status.");
      }
    } catch {
      showToast("Falha de conexão.");
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const valorVigente = contratos
    .filter((c) => c.status === "VIGENTE")
    .reduce((acc, c) => acc + Number(c.valorTotal || 0), 0);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-maison-charcoal text-white px-5 py-3 shadow-xl text-xs font-sans flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-maison-hairline pb-4">
        <div>
          <span className="editorial-sub block mb-1">Carteira de Empreitadas</span>
          <h1 className="text-3xl font-serif text-maison-charcoal font-bold">Contratos</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              value={termo}
              onChange={(e) => {
                setTermo(e.target.value);
                setPage(0);
              }}
              placeholder="Buscar número, título ou cliente..."
              className="pl-8 pr-3 py-1.5 w-64 bg-white border border-maison-hairline text-xs text-maison-charcoal focus:outline-none focus:border-maison-terracotta"
            />
            <Search className="w-3.5 h-3.5 text-maison-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="px-2.5 py-1.5 bg-white border border-maison-hairline text-xs text-maison-charcoal focus:outline-none"
          >
            <option value="TODOS">Todos os status</option>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-maison-terracotta text-white text-xs font-sans tracking-widest uppercase font-semibold hover:bg-maison-terracottaHover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo contrato
          </button>
        </div>
      </div>

      {erro && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-maison-hairline p-4">
          <span className="editorial-sub">Contratos listados</span>
          <p className="text-2xl font-serif font-bold text-maison-charcoal mt-1">{totalElements}</p>
        </div>
        <div className="bg-white border border-maison-hairline p-4">
          <span className="editorial-sub">Valor vigente na página</span>
          <p className="text-2xl font-serif font-bold text-maison-charcoal mt-1">{formatCurrency(valorVigente)}</p>
        </div>
        <div className="bg-white border border-maison-hairline p-4">
          <span className="editorial-sub">Vencendo em 45 dias</span>
          <p className="text-2xl font-serif font-bold text-maison-terracotta mt-1">{vencendo.length}</p>
        </div>
      </div>

      {vencendo.length > 0 && (
        <div className="bg-maison-linen/60 border border-maison-hairline p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-maison-terracotta" />
            <span className="font-sans text-xs tracking-editorial uppercase font-bold text-maison-charcoal">
              Atenção à renovação
            </span>
          </div>
          <ul className="text-xs font-sans text-maison-charcoal space-y-1">
            {vencendo.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3">
                <span className="font-mono text-maison-terracotta">{c.numero}</span>
                <span className="flex-1 truncate">{c.clienteNome || c.titulo}</span>
                <span className="text-maison-muted">vence {formatDate(c.dataFim)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white border border-maison-hairline overflow-x-auto">
        <table className="w-full text-xs font-sans">
          <thead className="bg-maison-linen/70 text-maison-charcoal">
            <tr className="text-left tracking-editorial uppercase">
              <th className="px-4 py-3">Número</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Vigência</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-maison-muted">
                  Carregando contratos...
                </td>
              </tr>
            )}

            {!loading && contratos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-maison-muted">
                  <FileText className="w-6 h-6 mx-auto mb-2 text-maison-hairline" />
                  Nenhum contrato encontrado com os filtros atuais.
                </td>
              </tr>
            )}

            {!loading &&
              contratos.map((c) => (
                <tr key={c.id} className="border-t border-maison-hairline hover:bg-maison-cream/60">
                  <td className="px-4 py-3 font-mono font-bold text-maison-terracotta">{c.numero}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-maison-charcoal">{c.clienteNome || "—"}</p>
                    <p className="text-maison-muted">
                      {[c.clienteCidade, c.clienteUf].filter(Boolean).join("/") || c.clienteEmail || ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-maison-charcoal max-w-[280px] truncate">{c.titulo}</td>
                  <td className="px-4 py-3 text-maison-muted whitespace-nowrap">
                    {formatDate(c.dataInicio)} → {formatDate(c.dataFim)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-maison-charcoal">
                    {formatCurrency(Number(c.valorTotal))}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => alterarStatus(c.id, e.target.value)}
                      className={`px-2 py-1 border text-[11px] font-bold uppercase ${
                        STATUS_STYLE[c.status] || "bg-white border-maison-hairline text-maison-charcoal"
                      }`}
                    >
                      {STATUS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs font-sans text-maison-muted">
        <span>
          Página {page + 1} de {Math.max(totalPages, 1)}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            className="px-3 py-1.5 border border-maison-hairline bg-white disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-maison-hairline bg-white disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={salvar}
            className="w-full max-w-2xl bg-white border border-maison-hairline shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-maison-hairline pb-3">
              <h2 className="text-xl font-serif font-bold text-maison-charcoal">Novo contrato</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-maison-muted p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="sm:col-span-2 block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Título
                <input
                  required
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs normal-case tracking-normal focus:outline-none focus:border-maison-terracotta"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Valor total (R$)
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.valorTotal}
                  onChange={(e) => setForm({ ...form, valorTotal: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs focus:outline-none focus:border-maison-terracotta"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs bg-white focus:outline-none"
                >
                  {STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Início
                <input
                  required
                  type="date"
                  value={form.dataInicio}
                  onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Término
                <input
                  required
                  type="date"
                  value={form.dataFim}
                  onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Cliente
                <input
                  required
                  value={form.clienteNome}
                  onChange={(e) => setForm({ ...form, clienteNome: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs normal-case tracking-normal focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                E-mail do cliente
                <input
                  type="email"
                  value={form.clienteEmail}
                  onChange={(e) => setForm({ ...form, clienteEmail: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs normal-case tracking-normal focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Telefone
                <input
                  value={form.clienteTelefone}
                  onChange={(e) => setForm({ ...form, clienteTelefone: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs normal-case tracking-normal focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Cidade
                <input
                  value={form.clienteCidade}
                  onChange={(e) => setForm({ ...form, clienteCidade: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs normal-case tracking-normal focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                UF
                <input
                  maxLength={2}
                  value={form.clienteUf}
                  onChange={(e) => setForm({ ...form, clienteUf: e.target.value.toUpperCase() })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs focus:outline-none"
                />
              </label>

              <label className="sm:col-span-2 block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Observações
                <textarea
                  rows={3}
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs normal-case tracking-normal focus:outline-none"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-maison-hairline">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-maison-hairline text-xs uppercase tracking-widest text-maison-charcoal"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="px-4 py-2 bg-maison-charcoal text-white text-xs uppercase tracking-widest font-semibold disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Criar contrato"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
