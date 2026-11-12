"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Users, Search, Plus, X, CheckCircle2, AlertCircle, Briefcase } from "lucide-react";
import { apiFetch } from "@/lib/http.mjs";

interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  email: string | null;
  telefone: string | null;
  cargo: string;
  departamento: string;
  dataAdmissao: string;
  dataDemissao: string | null;
  status: string;
  salarioBase: number;
  criadoEm: string;
}

interface RhResumo {
  totalAtivos: number;
  totalAfastados: number;
  totalDesligados: number;
  folhaBaseAtiva: number;
  custoMedioAtivo: number;
  admissoesUltimos30Dias: number;
  porDepartamento: { departamento: string; total: number; folha: number }[];
}

const STATUS = ["ATIVO", "AFASTADO", "FERIAS", "DESLIGADO"];

const STATUS_STYLE: Record<string, string> = {
  ATIVO: "bg-emerald-50 border-emerald-200 text-emerald-800",
  AFASTADO: "bg-amber-50 border-amber-200 text-amber-800",
  FERIAS: "bg-sky-50 border-sky-200 text-sky-800",
  DESLIGADO: "bg-slate-100 border-slate-300 text-slate-700",
};

const formVazio = {
  nome: "",
  cpf: "",
  email: "",
  telefone: "",
  cargo: "",
  departamento: "",
  dataAdmissao: "",
  status: "ATIVO",
  salarioBase: "",
};

export default function AdminRhPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [resumo, setResumo] = useState<RhResumo | null>(null);
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [deptoFilter, setDeptoFilter] = useState("TODOS");
  const [termo, setTermo] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
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
        if (statusFilter !== "TODOS") params.set("status", statusFilter);
        if (deptoFilter !== "TODOS") params.set("departamento", deptoFilter);
        if (termo.trim()) params.set("termo", termo.trim());

        const res = await apiFetch(`/api/admin/funcionarios?${params.toString()}`);
        if (!res.ok) {
          setErro("Não foi possível carregar o quadro de pessoal (perfil RH/ADMIN necessário).");
          return;
        }
        const data = await res.json();
        setFuncionarios(data.content ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotalElements(data.totalElements ?? 0);
      } catch {
        setErro("Falha de conexão com a API.");
      } finally {
        setLoading(false);
      }
    },
    [page, statusFilter, deptoFilter, termo]
  );

  const carregarComplementos = useCallback(async () => {
    try {
      const [resumoRes, deptoRes] = await Promise.all([
        apiFetch("/api/admin/funcionarios/resumo"),
        apiFetch("/api/admin/funcionarios/departamentos"),
      ]);
      if (resumoRes.ok) setResumo(await resumoRes.json());
      if (deptoRes.ok) setDepartamentos(await deptoRes.json());
    } catch {
      /* complementar */
    }
  }, []);

  useEffect(() => {
    carregar(page);
  }, [page, statusFilter, deptoFilter, carregar]);

  useEffect(() => {
    carregarComplementos();
  }, [carregarComplementos]);

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
      const res = await apiFetch("/api/admin/funcionarios", {
        method: "POST",
        body: JSON.stringify({ ...form, salarioBase: Number(form.salarioBase) }),
      });
      if (res.ok) {
        const criado = await res.json();
        setShowForm(false);
        setForm({ ...formVazio });
        showToast(`${criado.nome} cadastrado com sucesso.`);
        carregar(0);
        carregarComplementos();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || "Erro ao cadastrar funcionário.");
      }
    } catch {
      showToast("Falha de conexão.");
    } finally {
      setSalvando(false);
    }
  };

  const alterarStatus = async (id: string, novoStatus: string) => {
    try {
      const res = await apiFetch(`/api/admin/funcionarios/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: novoStatus }),
      });
      if (res.ok) {
        const atualizado: Funcionario = await res.json();
        setFuncionarios((prev) => prev.map((f) => (f.id === id ? atualizado : f)));
        showToast(`${atualizado.nome}: ${atualizado.status}.`);
        carregarComplementos();
      } else {
        showToast("Não foi possível alterar o status.");
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
          <span className="editorial-sub block mb-1">Pessoal & Folha</span>
          <h1 className="text-3xl font-serif text-maison-charcoal font-bold">RH & Equipe</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              value={termo}
              onChange={(e) => {
                setTermo(e.target.value);
                setPage(0);
              }}
              placeholder="Buscar nome ou cargo..."
              className="pl-8 pr-3 py-1.5 w-56 bg-white border border-maison-hairline text-xs text-maison-charcoal focus:outline-none focus:border-maison-terracotta"
            />
            <Search className="w-3.5 h-3.5 text-maison-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={deptoFilter}
            onChange={(e) => {
              setDeptoFilter(e.target.value);
              setPage(0);
            }}
            className="px-2.5 py-1.5 bg-white border border-maison-hairline text-xs focus:outline-none"
          >
            <option value="TODOS">Todos os departamentos</option>
            {departamentos.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
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
            Novo funcionário
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
          <div className="flex items-center gap-2 text-maison-charcoal">
            <Users className="w-4 h-4" />
            <span className="editorial-sub">Colaboradores ativos</span>
          </div>
          <p className="text-2xl font-serif font-bold text-maison-charcoal mt-1">{resumo?.totalAtivos ?? 0}</p>
          <p className="text-[11px] text-maison-muted mt-1">
            afastados: {resumo?.totalAfastados ?? 0} • desligados: {resumo?.totalDesligados ?? 0}
          </p>
        </div>

        <div className="bg-white border border-maison-hairline p-4">
          <span className="editorial-sub">Folha base ativa</span>
          <p className="text-2xl font-serif font-bold text-maison-charcoal mt-1">
            {formatCurrency(resumo?.folhaBaseAtiva ?? 0)}
          </p>
          <p className="text-[11px] text-maison-muted mt-1">salários, sem encargos</p>
        </div>

        <div className="bg-white border border-maison-hairline p-4">
          <span className="editorial-sub">Custo médio por ativo</span>
          <p className="text-2xl font-serif font-bold text-maison-charcoal mt-1">
            {formatCurrency(resumo?.custoMedioAtivo ?? 0)}
          </p>
        </div>

        <div className="bg-white border border-maison-hairline p-4">
          <span className="editorial-sub">Admissões (30 dias)</span>
          <p className="text-2xl font-serif font-bold text-maison-terracotta mt-1">
            {resumo?.admissoesUltimos30Dias ?? 0}
          </p>
          <p className="text-[11px] text-maison-muted mt-1">{totalElements} registros no filtro atual</p>
        </div>
      </div>

      {resumo && resumo.porDepartamento.length > 0 && (
        <div className="bg-maison-linen/60 border border-maison-hairline p-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-maison-terracotta" />
            <span className="font-sans text-xs tracking-editorial uppercase font-bold text-maison-charcoal">
              Headcount por departamento
            </span>
          </div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {resumo.porDepartamento.map((d) => (
              <div key={d.departamento} className="flex items-center justify-between text-xs font-sans">
                <span className="text-maison-charcoal truncate">{d.departamento}</span>
                <span className="text-maison-muted">
                  {d.total} • {formatCurrency(d.folha)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-maison-hairline overflow-x-auto">
        <table className="w-full text-xs font-sans">
          <thead className="bg-maison-linen/70 text-maison-charcoal">
            <tr className="text-left tracking-editorial uppercase">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Cargo</th>
              <th className="px-4 py-3">Departamento</th>
              <th className="px-4 py-3">Admissão</th>
              <th className="px-4 py-3 text-right">Salário base</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-maison-muted">
                  Carregando equipe...
                </td>
              </tr>
            )}

            {!loading && funcionarios.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-maison-muted">
                  Nenhum funcionário encontrado com os filtros atuais.
                </td>
              </tr>
            )}

            {!loading &&
              funcionarios.map((f) => (
                <tr key={f.id} className="border-t border-maison-hairline hover:bg-maison-cream/60">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-maison-charcoal">{f.nome}</p>
                    <p className="text-maison-muted">{f.email || f.telefone || f.cpf}</p>
                  </td>
                  <td className="px-4 py-3 text-maison-charcoal">{f.cargo}</td>
                  <td className="px-4 py-3 text-maison-muted">{f.departamento}</td>
                  <td className="px-4 py-3 text-maison-muted whitespace-nowrap">{formatDate(f.dataAdmissao)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-maison-charcoal">
                    {formatCurrency(Number(f.salarioBase))}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={f.status}
                      onChange={(e) => alterarStatus(f.id, e.target.value)}
                      className={`px-2 py-1 border text-[11px] font-bold uppercase ${
                        STATUS_STYLE[f.status] || "bg-white border-maison-hairline text-maison-charcoal"
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
            className="w-full max-w-xl bg-white border border-maison-hairline shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-maison-hairline pb-3">
              <h2 className="text-xl font-serif font-bold text-maison-charcoal">Novo funcionário</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-maison-muted p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="sm:col-span-2 block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Nome completo
                <input
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs normal-case tracking-normal focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                CPF
                <input
                  required
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                E-mail
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs normal-case tracking-normal focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Telefone
                <input
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs normal-case tracking-normal focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Cargo
                <input
                  required
                  value={form.cargo}
                  onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs normal-case tracking-normal focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Departamento
                <input
                  required
                  list="departamentos"
                  value={form.departamento}
                  onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs normal-case tracking-normal focus:outline-none"
                />
                <datalist id="departamentos">
                  {departamentos.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Admissão
                <input
                  required
                  type="date"
                  value={form.dataAdmissao}
                  onChange={(e) => setForm({ ...form, dataAdmissao: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-maison-hairline text-xs focus:outline-none"
                />
              </label>

              <label className="block text-[11px] tracking-editorial uppercase text-maison-charcoal font-semibold">
                Salário base (R$)
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salarioBase}
                  onChange={(e) => setForm({ ...form, salarioBase: e.target.value })}
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
                {salvando ? "Salvando..." : "Cadastrar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
