"use client";

import React from "react";
import { ShieldAlert, Search, Filter, Clock, User, FileText } from "lucide-react";

export default function AuditoriaPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-conliz-charcoal flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-conliz-gold" />
            Auditoria & Logs
          </h1>
          <p className="text-sm text-conliz-muted mt-1">
            Rastreabilidade de ações, alterações de dados e acessos ao sistema.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-conliz-slate p-5">
          <p className="text-[11px] font-sans tracking-widest uppercase text-conliz-muted">Eventos (hoje)</p>
          <p className="text-3xl font-serif font-bold text-conliz-charcoal mt-1">—</p>
        </div>
        <div className="bg-white border border-conliz-slate p-5">
          <p className="text-[11px] font-sans tracking-widest uppercase text-conliz-muted">Logins</p>
          <p className="text-3xl font-serif font-bold text-conliz-charcoal mt-1">—</p>
        </div>
        <div className="bg-white border border-conliz-slate p-5">
          <p className="text-[11px] font-sans tracking-widest uppercase text-conliz-muted">Alterações</p>
          <p className="text-3xl font-serif font-bold text-conliz-charcoal mt-1">—</p>
        </div>
        <div className="bg-white border border-conliz-slate p-5">
          <p className="text-[11px] font-sans tracking-widest uppercase text-conliz-muted">Alertas</p>
          <p className="text-3xl font-serif font-bold text-rose-600 mt-1">—</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-conliz-slate p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-conliz-muted" />
          <input
            type="text"
            placeholder="Buscar por usuário, ação ou entidade..."
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
          <ShieldAlert className="w-7 h-7 text-conliz-muted" />
        </div>
        <h3 className="text-lg font-serif text-conliz-charcoal mb-2">Módulo de Auditoria em construção</h3>
        <p className="text-sm text-conliz-muted max-w-md mx-auto">
          Aqui você verá o histórico completo de ações dos usuários: criação e edição de orçamentos,
          contratos, obras, acessos e alterações sensíveis. O backend já possui a entidade AuditLog.
        </p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
          <div className="flex items-start gap-3 p-3 bg-conliz-slate/50">
            <Clock className="w-4 h-4 text-conliz-gold mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-conliz-charcoal">Timeline</p>
              <p className="text-[11px] text-conliz-muted">Eventos ordenados por data</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-conliz-slate/50">
            <User className="w-4 h-4 text-conliz-gold mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-conliz-charcoal">Por usuário</p>
              <p className="text-[11px] text-conliz-muted">Filtro por responsável</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-conliz-slate/50">
            <FileText className="w-4 h-4 text-conliz-gold mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-conliz-charcoal">Exportação</p>
              <p className="text-[11px] text-conliz-muted">CSV / PDF para compliance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
