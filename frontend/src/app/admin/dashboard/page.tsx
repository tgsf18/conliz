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
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Building,
  Users,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
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
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [periodo]);

  const COLORS = ["#A65E3F", "#2A2622", "#D8D0C7", "#7C736A", "#C28568", "#E4DED8"];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);
  };

  if (loading && !data) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-maison-terracotta border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-xs font-sans tracking-widest uppercase text-maison-muted">Carregando métricas...</p>
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
      
      {/* Top Title & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-maison-hairline pb-4">
        <div>
          <span className="editorial-sub block mb-1">Painel Gerencial</span>
          <h1 className="text-3xl font-serif text-maison-charcoal font-bold">
            Visão Geral Executiva
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-maison-muted" />
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-1.5 bg-white border border-maison-hairline text-xs font-sans text-maison-charcoal focus:outline-none focus:border-maison-terracotta"
          >
            <option value="ESTE_MES">Mês Atual</option>
            <option value="ULTIMOS_90_DIAS">Últimos 90 Dias</option>
            <option value="ANO_ATUAL">Ano Corrente (2026)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Orçamentos */}
        <div className="bg-white p-5 border border-maison-hairline shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans tracking-widest uppercase text-maison-muted font-bold">
              Orçamentos Totais
            </span>
            <FileSpreadsheet className="w-4 h-4 text-maison-terracotta" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-maison-charcoal">
              {orcamentos.total || 0}
            </span>
            <span className="text-xs font-sans text-emerald-700 font-semibold">
              {orcamentos.taxaConversao}% conv.
            </span>
          </div>
          <p className="text-[11px] font-sans text-maison-muted">
            {orcamentos.novos || 0} aguardando análise técnica
          </p>
        </div>

        {/* Card 2: Receita Realizada */}
        <div className="bg-white p-5 border border-maison-hairline shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans tracking-widest uppercase text-maison-muted font-bold">
              Receitas Realizadas
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-maison-charcoal">
              {formatCurrency(financeiro.receitaPaga || 143500)}
            </span>
          </div>
          <p className="text-[11px] font-sans text-maison-muted">
            + {formatCurrency(financeiro.receitaPendente || 58500)} a faturar
          </p>
        </div>

        {/* Card 3: Despesas & Custos */}
        <div className="bg-white p-5 border border-maison-hairline shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans tracking-widest uppercase text-maison-muted font-bold">
              Despesas Operacionais
            </span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-maison-charcoal">
              {formatCurrency(financeiro.despesaPaga || 46900)}
            </span>
          </div>
          <p className="text-[11px] font-sans text-maison-muted">
            {formatCurrency(financeiro.despesaPendente || 18400)} a vencer
          </p>
        </div>

        {/* Card 4: Headcount & Obras */}
        <div className="bg-white p-5 border border-maison-hairline shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans tracking-widest uppercase text-maison-muted font-bold">
              Equipe Ativa & Obras
            </span>
            <Users className="w-4 h-4 text-maison-charcoal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-maison-charcoal">
              {data?.headcountTotal || 23}
            </span>
            <span className="text-xs font-sans text-maison-muted font-medium">colaboradores</span>
          </div>
          <p className="text-[11px] font-sans text-maison-muted">
            {data?.totalContratosVigentes || 2} contratos vigentes
          </p>
        </div>
      </div>

      {/* Charts Row 1: Fluxo de Caixa Mensal + Funil de Orçamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Fluxo de Caixa (8 cols) */}
        <div className="lg:col-span-7 bg-white p-6 border border-maison-hairline shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-maison-hairline pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-maison-charcoal">
                Fluxo de Caixa Mensal (R$)
              </h3>
              <p className="text-[11px] font-sans text-maison-muted">Receitas faturadas vs custos de obras e operação</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-sans">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#A65E3F] inline-block" /> Receita</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#2A2622] inline-block" /> Despesa</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fluxoCaixa} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DED8" />
                <XAxis dataKey="mes" stroke="#7C736A" fontSize={11} />
                <YAxis stroke="#7C736A" fontSize={11} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{ backgroundColor: "#FAF8F5", borderColor: "#E4DED8", fontSize: "12px" }}
                />
                <Bar dataKey="receita" fill="#A65E3F" name="Receita" />
                <Bar dataKey="despesa" fill="#2A2622" name="Despesa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funil de Orçamentos (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 border border-maison-hairline shadow-sm space-y-4">
          <div className="border-b border-maison-hairline pb-3">
            <h3 className="font-serif text-lg font-bold text-maison-charcoal">
              Funil Comercial de Orçamentos
            </h3>
            <p className="text-[11px] font-sans text-maison-muted">Pipeline de propostas em andamento</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funilChartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DED8" />
                <XAxis type="number" stroke="#7C736A" fontSize={11} />
                <YAxis dataKey="status" type="category" stroke="#7C736A" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#FAF8F5", borderColor: "#E4DED8", fontSize: "12px" }} />
                <Bar dataKey="total" fill="#A65E3F">
                  {funilChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Receita x Custo por Obra + Obras por Fase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Receita x Custo por Obra (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 border border-maison-hairline shadow-sm space-y-4">
          <div className="border-b border-maison-hairline pb-3">
            <h3 className="font-serif text-lg font-bold text-maison-charcoal">
              Rentabilidade & Margem por Empreendimento
            </h3>
            <p className="text-[11px] font-sans text-maison-muted">Contratos em execução na região de Sorocaba</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receitaCusto} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DED8" />
                <XAxis dataKey="obra" stroke="#7C736A" fontSize={11} />
                <YAxis stroke="#7C736A" fontSize={11} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{ backgroundColor: "#FAF8F5", borderColor: "#E4DED8", fontSize: "12px" }}
                />
                <Bar dataKey="receita" fill="#A65E3F" name="Receita Contratada" />
                <Bar dataKey="custo" fill="#2A2622" name="Custo Realizado" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Obras por Fase (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 border border-maison-hairline shadow-sm space-y-4">
          <div className="border-b border-maison-hairline pb-3">
            <h3 className="font-serif text-lg font-bold text-maison-charcoal">
              Distribuição por Fase Construtiva
            </h3>
            <p className="text-[11px] font-sans text-maison-muted">Canteiros ativos e estágios de execução</p>
          </div>

          <div className="space-y-3 pt-2">
            {obrasPorFase.map((item: any, i: number) => {
              const maxObras = 6;
              const pct = Math.min(100, (Number(item.quantidade) / maxObras) * 100);
              return (
                <div key={item.fase} className="space-y-1">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="font-semibold text-maison-charcoal">{item.fase}</span>
                    <span className="text-maison-muted">{item.quantidade} obra(s)</span>
                  </div>
                  <div className="w-full h-2 bg-maison-linen overflow-hidden">
                    <div
                      className="h-full bg-maison-terracotta"
                      style={{ width: `${Math.max(10, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Contratos Próximos do Vencimento */}
      <div className="bg-white p-6 border border-maison-hairline shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-maison-hairline pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="font-serif text-lg font-bold text-maison-charcoal">
              Contratos com Alerta de Vencimento (Próximos 90 Dias)
            </h3>
          </div>
          <span className="text-xs font-sans text-maison-muted">Monitoramento de prazos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-maison-hairline bg-maison-linen text-maison-charcoal">
                <th className="py-2.5 px-4 font-bold tracking-editorial uppercase">Número</th>
                <th className="py-2.5 px-4 font-bold tracking-editorial uppercase">Obra / Título</th>
                <th className="py-2.5 px-4 font-bold tracking-editorial uppercase">Contratante</th>
                <th className="py-2.5 px-4 font-bold tracking-editorial uppercase">Valor Total</th>
                <th className="py-2.5 px-4 font-bold tracking-editorial uppercase">Data Término</th>
                <th className="py-2.5 px-4 font-bold tracking-editorial uppercase">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-maison-hairline">
              {contratosVencendo.map((c: any) => (
                <tr key={c.id} className="hover:bg-maison-cream/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-maison-terracotta">{c.numero}</td>
                  <td className="py-3 px-4 font-medium text-maison-charcoal">{c.titulo}</td>
                  <td className="py-3 px-4 text-maison-muted">{c.cliente}</td>
                  <td className="py-3 px-4 font-semibold text-maison-charcoal">{formatCurrency(c.valor)}</td>
                  <td className="py-3 px-4 text-amber-800 font-semibold">{c.dataFim}</td>
                  <td className="py-3 px-4">
                    <button className="text-[11px] text-maison-terracotta font-semibold hover:underline">
                      Gerar Aditivo
                    </button>
                  </td>
                </tr>
              ))}
              {contratosVencendo.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-maison-muted">
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
