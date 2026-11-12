"use client";

import React from "react";
import { Package, Plus, Search, Filter, AlertTriangle } from "lucide-react";

export default function EstoquePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-conliz-charcoal flex items-center gap-2">
            <Package className="w-6 h-6 text-conliz-gold" />
            Estoque & Materiais
          </h1>
          <p className="text-sm text-conliz-muted mt-1">
            Controle de materiais, insumos e movimentações do canteiro.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-conliz-gold text-conliz-navy text-xs font-sans tracking-widest uppercase font-semibold hover:bg-conliz-goldHover transition-colors">
          <Plus className="w-4 h-4" />
          Novo Material
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-conliz-slate p-5">
          <p className="text-[11px] font-sans tracking-widest uppercase text-conliz-muted">Itens em estoque</p>
          <p className="text-3xl font-serif font-bold text-conliz-charcoal mt-1">—</p>
        </div>
        <div className="bg-white border border-conliz-slate p-5">
          <p className="text-[11px] font-sans tracking-widest uppercase text-conliz-muted">Alertas de mínimo</p>
          <p className="text-3xl font-serif font-bold text-amber-600 mt-1">—</p>
        </div>
        <div className="bg-white border border-conliz-slate p-5">
          <p className="text-[11px] font-sans tracking-widest uppercase text-conliz-muted">Movimentações (mês)</p>
          <p className="text-3xl font-serif font-bold text-conliz-charcoal mt-1">—</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-conliz-slate p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-conliz-muted" />
          <input
            type="text"
            placeholder="Buscar material, código ou fornecedor..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-conliz-slate focus:outline-none focus:border-conliz-gold"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-conliz-slate text-xs font-sans tracking-widest uppercase font-semibold text-conliz-charcoal hover:bg-conliz-slate">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Empty state */}
      <div className="bg-white border border-conliz-slate p-16 text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-conliz-slate flex items-center justify-center">
          <Package className="w-7 h-7 text-conliz-muted" />
        </div>
        <h3 className="text-lg font-serif text-conliz-charcoal mb-2">Módulo de Estoque em construção</h3>
        <p className="text-sm text-conliz-muted max-w-md mx-auto">
          Esta área permitirá cadastrar materiais, controlar entradas e saídas por obra,
          e receber alertas de estoque mínimo. Em breve com integração completa ao backend.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Funcionalidade prioritária — próxima sprint
        </div>
      </div>
    </div>
  );
}
