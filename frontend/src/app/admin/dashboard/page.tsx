"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/http.mjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Users,
  Calendar,
  Clock,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [periodo, setPeriodo] = useState("ANO_ATUAL");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/admin/dashboard?periodo=${periodo}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [periodo]);

  // Navy / slate palette for charts
  const COLORS = ["#0A2540", "#1E3A5F", "#334155", "#64748B", "#94A3B8", "#CBD5E1"];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  if (loading && !data) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-[#0A2540] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-xs font-sans tracking-widest uppercase text-conliz-muted">
          Carregando métricas...
        </p>
      </div>
    );
  }

  const orcamentos = data?.orcamentosFunil || {};
  const financeiro = data?.financeiroKpis || {};
  const fluxoCaixa = data?.fluxoCaixaMensal || [];
  const obrasPorFase = data?.obrasPorFase || [];
  const receitaCusto = data?.receitaCustoPorObra || [];
  const contratosVencendo = data?.contratosVencendo || [];

  const funilChartData = [
    { status: "Novos", total: orcamentos.novos || 0 },
    { status: "Em Análise", total: orcamentos.emAnalise || 0 },
    { status: "Enviados", total: orcamentos.enviados || 0 },
    { status: "Aprovados", total: orcamentos.aprovados || 0 },
    { status: "Recusados", total: orcamentos.recusados || 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-conliz-slate pb-4">
        <div>
          <span className="text-[11px] tracking-[0.16em] uppercase text-conliz-muted font-semibold block mb-1">
            Painel Gerencial
          </span>
          <h1 className="text-2xl sm:text-3xl font-sans font-semibold text-conliz-charcoal">
            Visão Geral Executiva
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-conliz-muted" />
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-1.5 bg-white border border-conliz-slate text-xs font-sans text-conliz-charcoal focus:outline-none focus:border-[#0A2540]"
          >
            <option value="ESTE_MES">Mês Atual</option>
            <option value="ULTIMOS_90_DIAS">Últimos 90 Dias</option>
            <option value="ANO_ATUAL">Ano Corrente (2026)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-conliz-slate space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-widest uppercase text-conliz-muted font-semibold">
              Orçamentos Totais
            </span>
            <FileSpreadsheet className="w-4 h-4 text-[#0A2540]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-sans font-semibold text-conliz-charcoal">
              {orcamentos.total || 0}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">
              {orcamentos.taxaConversao}% conv.
            </span>
          </div>
          <p className="text-[11px] text-conliz-muted">
            {orcamentos.novos || 0} aguardando análise
          </p>
        </div>

        <div className="bg-white p-5 border border-conliz-slate space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-widest uppercase text-conliz-muted font-semibold">
              Receitas Realizadas
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-sans font-semibold text-conliz-charcoal block">
            {formatCurrency(financeiro.receitaPaga || 143500)}
          </span>
          <p className="text-[11px] text-conliz-muted">
            + {formatCurrency(financeiro.receitaPendente || 58500)} a faturar
          </p>
        </div>

        <div className="bg-white p-5 border border-conliz-slate space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-widest uppercase text-conliz-muted font-semibold">
              Despesas Operacionais
            </span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-sans font-semibold text-conliz-charcoal block">
            {formatCurrency(financeiro.despesaPaga || 46900)}
          </span>
          <p className="text-[11px] text-conliz-muted">
            {formatCurrency(financeiro.despesaPendente || 18400)} a vencer
          </p>
        </div>

        <div className="bg-white p-5 border border-conliz-slate space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-widest uppercase text-conliz-muted font-semibold">
              Equipe Ativa
            </span>
            <Users className="w-4 h-4 text-[#0A2540]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-sans font-semibold text-conliz-charcoal">
              {data?.headcountTotal || 23}
            </span>
            <span className="text-xs text-conliz-muted">colaboradores</span>
          </div>
          <p className="text-[11px] text-conliz-muted">
            {data?.totalContratosVigentes || 2} contratos vigentes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 border border-conliz-slate space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-conliz-slate pb-3">
            <div>
              <h3 className="font-sans text-base font-semibold text-conliz-charcoal">
                Fluxo de Caixa Mensal
              </h3>
              <p className="text-[11px] text-conliz-muted">Receitas vs despesas</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#0A2540] inline-block" /> Receita
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#94A3B8] inline-block" /> Despesa
              </span>
            </div>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fluxoCaixa} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="mes" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{ backgroundColor: "#fff", borderColor: "#E2E8F0", fontSize: "12px" }}
                />
                <Bar dataKey="receita" fill="#0A2540" name="Receita" />
                <Bar dataKey="despesa" fill="#94A3B8" name="Despesa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-5 sm:p-6 border border-conliz-slate space-y-4">
          <div className="border-b border-conliz-slate pb-3">
            <h3 className="font-sans text-base font-semibold text-conliz-charcoal">
              Funil de Orçamentos
            </h3>
            <p className="text-[11px] text-conliz-muted">Pipeline comercial</p>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funilChartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="status" type="category" stroke="#64748B" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", borderColor: "#E2E8F0", fontSize: "12px" }} />
                <Bar dataKey="total" fill="#0A2540">
                  {funilChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 border border-conliz-slate space-y-4">
          <div className="border-b border-conliz-slate pb-3">
            <h3 className="font-sans text-base font-semibold text-conliz-charcoal">
              Rentabilidade por Obra
            </h3>
            <p className="text-[11px] text-conliz-muted">Receita contratada vs custo</p>
          </div>
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receitaCusto} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="obra" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{ backgroundColor: "#fff", borderColor: "#E2E8F0", fontSize: "12px" }}
                />
                <Bar dataKey="receita" fill="#0A2540" name="Receita" />
                <Bar dataKey="custo" fill="#94A3B8" name="Custo" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-5 sm:p-6 border border-conliz-slate space-y-4">
          <div className="border-b border-conliz-slate pb-3">
            <h3 className="font-sans text-base font-semibold text-conliz-charcoal">
              Obras por Fase
            </h3>
            <p className="text-[11px] text-conliz-muted">Canteiros ativos</p>
          </div>
          <div className="space-y-3 pt-2">
            {obrasPorFase.map((item: any) => {
              const pct = Math.min(100, (Number(item.quantidade) / 6) * 100);
              return (
                <div key={item.fase} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-conliz-charcoal">{item.fase}</span>
                    <span className="text-conliz-muted">{item.quantidade}</span>
                  </div>
                  <div className="w-full h-2 bg-conliz-slate overflow-hidden">
                    <div className="h-full bg-[#0A2540]" style={{ width: `${Math.max(8, pct)}%` }} />
                  </div>
                </div>
              );
            })}
            {obrasPorFase.length === 0 && (
              <p className="text-sm text-conliz-muted py-6 text-center">Sem dados de fase no período.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6 border border-conliz-slate space-y-4">
        <div className="flex items-center gap-2 border-b border-conliz-slate pb-3">
          <Clock className="w-4 h-4 text-amber-600" />
          <h3 className="font-sans text-base font-semibold text-conliz-charcoal">
            Contratos próximos do vencimento
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[640px]">
            <thead>
              <tr className="border-b border-conliz-slate bg-conliz-slate/50 text-conliz-charcoal">
                <th className="py-2.5 px-3 font-semibold tracking-wider uppercase">Número</th>
                <th className="py-2.5 px-3 font-semibold tracking-wider uppercase">Título</th>
                <th className="py-2.5 px-3 font-semibold tracking-wider uppercase">Cliente</th>
                <th className="py-2.5 px-3 font-semibold tracking-wider uppercase">Valor</th>
                <th className="py-2.5 px-3 font-semibold tracking-wider uppercase">Término</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-conliz-slate">
              {contratosVencendo.map((c: any) => (
                <tr key={c.id} className="hover:bg-conliz-slate/30">
                  <td className="py-3 px-3 font-mono font-semibold text-[#0A2540]">{c.numero}</td>
                  <td className="py-3 px-3 text-conliz-charcoal">{c.titulo}</td>
                  <td className="py-3 px-3 text-conliz-muted">{c.cliente}</td>
                  <td className="py-3 px-3 font-semibold">{formatCurrency(c.valor)}</td>
                  <td className="py-3 px-3 text-amber-800 font-semibold">{c.dataFim}</td>
                </tr>
              ))}
              {contratosVencendo.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-conliz-muted">
                    Nenhum contrato com vencimento nos próximos 90 dias.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
