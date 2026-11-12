"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Trash2,
} from "lucide-react";
import { apiFetch } from "@/lib/http.mjs";

interface Lancamento {
  id: string;
  tipo: "RECEITA" | "DESPESA";
  categoria: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: string;
  documentoNum: string | null;
  atrasado: boolean;
}

interface Resumo {
  receitaPaga: number;
  despesaPaga: number;
  receitaPendente: number;
  despesaPendente: number;
  saldoRealizado: number;
  saldoPrevisto: number;
  lancamentosAtrasados: number;
  valorAtrasado: number;
  porCategoria: { tipo: string; categoria: string; total: number; quantidade: number }[];
}

const STATUS = ["PENDENTE", "PAGO", "ATRASADO", "CANCELADO"];

const formVazio = {
  tipo: "DESPESA",
  categoria: "",
  descricao: "",
  valor: "",
  dataVencimento: "",
  status: "PENDENTE",
  documentoNum: "",
};

export default function AdminFinanceiroPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [tipoFilter, setTipoFilter] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [termo, setTermo] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [toast, setToast] = useState<string | null>(null);

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
        if (tipoFilter !== "TODOS") params.set("tipo", tipoFilter);
        if (statusFilter !== "TODOS") params.set("status", statusFilter);
        if (termo.trim()) params.set("termo", termo.trim());

        const res = await apiFetch(`/api/admin/financeiro?${params.toString()}`);
        if (!res.ok) {
          setErro("Não foi possível carregar o financeiro.");
          return;
        }
        const data = await res.json();
        setLancamentos(data.content ?? []);
        setTotalPages(data.totalPages ?? 1);
      } catch {
        setErro("Falha de conexão com a API.");
      } finally {
        setLoading(false);
      }
    },
    [page, tipoFilter, statusFilter, termo]
  );

  const carregarResumo = useCallback(async () => {
    try {
      const res = await apiFetch("/api/admin/financeiro/resumo");
      if (res.ok) setResumo(await res.json());
    } catch {
      /* complementar */
    }
  }, []);

  useEffect(() => {
    carregar(page);
  }, [page, tipoFilter, statusFilter, carregar]);

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(val) || 0);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await apiFetch("/api/admin/financeiro", {
        method: "POST",
        body: JSON.stringify({ ...form, valor: Number(form.valor) }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ ...formVazio });
        showToast("Lançamento registrado.");
        carregar(0);
        carregarResumo();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || "Erro ao registrar lançamento.");
      }
    } catch {
      showToast("Falha de conexão.");
    } finally {
      setSalvando(false);
    }
  };

  const alterarStatus = async (id: string, novoStatus: string) => {
    try {
      const res = await apiFetch(`/api/admin/financeiro/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: novoStatus }),
      });
      if (res.ok) {
        const atualizado: Lancamento = await res.json();
        setLancamentos((prev) => prev.map((l) => (l.id === id ? atualizado : l)));
        showToast(`Lançamento marcado como ${atualizado.status}.`);
        carregarResumo();
      } else {
        showToast("Não foi possível alterar o status.");
      }
    } catch {
      showToast("Falha de conexão.");
    }
  };

  const excluir = async (id: string) => {
    if (!confirm("Excluir este lançamento financeiro? A ação fica registrada na auditoria.")) return;
    try {
      const res = await apiFetch(`/api/admin/financeiro/${id}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setLancamentos((prev) => prev.filter((l) => l.id !== id));
        showToast("Lançamento excluído.");
        carregarResumo();
      } else {
        showToast("Apenas ADMIN pode excluir lançamentos.");
      }
    } catch {
      showToast("Falha de conexão.");
    }
  };

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
          <span className="editorial-sub block mb-1">Caixa & Obrigações</span>
          <h1 className="text-3xl font-serif text-maison-charcoal font-bold">Financeiro</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              value={termo}
              onChange={(e) => {
                setTermo(e.target.value);
                setPage(0);
              }}
              placeholder="Buscar descrição ou categoria..."
              className="pl-8 pr-3 py-1.5 w-60 bg-white border border-maison-hairline text-xs text-maison-charcoal focus:outline-none focus:border-maison-terracotta"
            />
            <Search className="w-3.5 h-3.5 text-maison-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={tipoFilter}
            onChange={(e) => {
              setTipoFilter(e.target.value);
              setPage(0);
            }}
            className="px-2.5 py-1.5 bg-white border border-maison-hairline text-xs focus:outline-none"
          >
            <option value="TODOS">Receitas e despesas</option>
            <option value="RECEITA">Receitas</option>
            <option value="DESPESA">Despesas</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="px-2.5 py-1.5 bg-white border border-maison-hairline text-xs focus:outline-none"
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
            Novo lançamento
          </button>
        </div>
      </div>

      {erro && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-maison-hairline p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <ArrowUpCircle className="w-4 h-4" />
            <span className="editorial-sub">Receitas pagas</span>
          </div>
          <p className="text-xl font-serif font-bold text-maison-charcoal mt-1">
            {formatCurrency(resumo?.receitaPaga ?? 0)}
          </p>
          <p className="text-[11px] text-maison-muted mt-1">
            a receber: {formatCurrency(resumo?.receitaPendente ?? 0)}
          </p>
        </div>

        <div className="bg-white border border-maison-hairline p-4">
          <div className="flex items-center gap-2 text-rose-700">
            <ArrowDownCircle className="w-4 h-4" />
            <span className="editorial-sub">Despesas pagas</span>
          </div>
          <p className="text-xl font-serif font-bold text-maison-charcoal mt-1">
            {formatCurrency(resumo?.despesaPaga ?? 0)}
          </p>
          <p className="text-[11px] text-maison-muted mt-1">
            a pagar: {formatCurrency(resumo?.despesaPendente ?? 0)}
          </p>
        </div>

        <div className="bg-white border border-maison-hairline p-4">
          <div className="flex items-center gap-2 text-maison-charcoal">
            <Wallet className="w-4 h-4" />
            <span className="editorial-sub">Saldo realizado</span>
          </div>
          <p
            className={`text-xl font-serif font-bold mt-1 ${
              (resumo?.saldoRealizado ?? 0) >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {formatCurrency(resumo?.saldoRealizado ?? 0)}
          </p>
          <p className="text-[11px] text-maison-muted mt-1">
            previsto: {formatCurrency(resumo?.saldoPrevisto ?? 0)}
          </p>
        </div>

        <div className="bg-white border border-maison-hairline p-4">
          <span className="editorial-sub">Em atraso</span>
          <p className="text-xl font-serif font-bold text-rose-700 mt-1">{formatCurrency(resumo?.valorAtrasado ?? 0)}</p>
          <p className="text-[11px] text-maison-muted mt-1">
            {resumo?.lancamentosAtrasados ?? 0} lançamento(s) vencido(s)
          </p>
        </div>
      </div>

      {resumo && resumo.porCategoria.length > 0 && (
        <div className="bg-maison-linen/60 border border-maison-hairline p-4">
          <span className="font-sans text-xs tracking-editorial uppercase font-bold text-maison-charcoal">
            Por categoria no mês
          </span>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {resumo.porCategoria.slice(0, 9).map((c) => (
              <div key={`${c.tipo}-${c.categoria}`} className="flex items-center justify-between text-xs font-sans">
                <span className="text-maison-charcoal truncate">
                  <span className={c.tipo === "RECEITA" ? "text-emerald-700" : "text-rose-700"}>●</span> {c.categoria}
                </span>
                <span className="font-semibold text-maison-charcoal">{formatCurrency(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-maison-hairline overflow-x-auto">
        <table className="w-full text-xs font-sans">
          <thead className="bg-maison-linen/70 text-maison-charcoal">
            <tr className="text-left tracking-editorial uppercase">
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-maison-muted">
                  Carregando lançamentos...
                </td>
              </tr>
            )}

            {!loading && lancamentos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-maison-muted">
                  Nenhum lançamento encontrado com os filtros atuais.
                </td>
              </tr>
            )}

            {!loading &&
              lancamentos.map((l) => (
                <tr key={l.id} className="border-t border-maison-hairline hover:bg-maison-cream/60">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={l.atrasado ? "text-rose-700 font-semibold" : "text-maison-muted"}>
                      {formatDate(l.dataVencimento)}
                    </span>
                    {l.dataPagamento && (
                      <span className="block text-[10px] text-emerald-700">pago {formatDate(l.dataPagamento)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {l.tipo === "RECEITA" ? (
                        <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <ArrowDownCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span className="text-maison-charcoal">{l.descricao}</span>
                    </div>
                    {l.documentoNum && <span className="text-[10px] text-maison-muted">doc. {l.documentoNum}</span>}
                  </td>
                  <td className="px-4 py-3 text-maison-muted">{l.categoria}</td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      l.tipo === "RECEITA" ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {l.tipo === "RECEITA" ? "+" : "−"} {formatCurrency(Number(l.valor))}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={l.status}
                      onChange={(e) => alterarStatus(l.id, e.target.value)}
                      className="px-2 py-1 border border-maison-hairline bg-white text-[11px] font-bold uppercase text-maison-charcoal"
                    >
                      {STATUS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => excluir(l.id)}
                      title="Excluir (apenas ADMIN)"
                      className="text-maison-muted hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
            className="w-full max-w-xl bg-white border border-maison-hairline shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-maison-hairline pb-3">
              <h2 className="text-xl font-serif font-bold text-maison-charcoal">Novo lançamento</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-maison-muted p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Tipo
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs bg-white focus:outline-none"
                >
                  <option value="RECEITA">Receita</option>
                  <option value="DESPESA">Despesa</option>
                </select>
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Categoria
                <input
                  required
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  placeholder="MEDICAO, MATERIAL, FOLHA..."
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs normal-case tracking-normal focus:outline-none"
                />
              </label>

              <label className="sm:col-span-2 block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Descrição
                <input
                  required
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs normal-case tracking-normal focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Valor (R$)
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Vencimento
                <input
                  required
                  type="date"
                  value={form.dataVencimento}
                  onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs focus:outline-none"
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
                Documento / NF
                <input
                  value={form.documentoNum}
                  onChange={(e) => setForm({ ...form, documentoNum: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs focus:outline-none"
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
                {salvando ? "Salvando..." : "Registrar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
