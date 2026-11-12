"use client";

import React from "react";
import { ShieldAlert, Search, Filter, Clock, User, FileText } from "lucide-react";

export default function AuditoriaPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-maison-charcoal flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-maison-terracotta" />
            Auditoria & Logs
          </h1>
          <p className="text-sm text-maison-muted mt-1">
            Rastreabilidade de ações, alterações de dados e acessos ao sistema.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-maison-hairline p-5">
          <p className="text-[11px] font-sans tracking-widest uppercase text-maison-muted">Eventos (hoje)</p>
          <p className="text-3xl font-serif font-bold text-maison-charcoal mt-1">—</p>
        </div>
        <div className="bg-white border border-maison-hairline p-5">
          <p className="text-[11px] font-sans tracking-widest uppercase text-maison-muted">Logins</p>
          <p className="text-3xl font-serif font-bold text-maison-charcoal mt-1">—</p>
        </div>
        <div className="bg-white border border-maison-hairline p-5">
          <p className="text-[11px] font-sans tracking-widest uppercase text-maison-muted">Alterações</p>
          <p className="text-3xl font-serif font-bold text-maison-charcoal mt-1">—</p>
        </div>
        <div className="bg-white border border-maison-hairline p-5">
          <p className="text-[11px] font-sans tracking-widest uppercase text-maison-muted">Alertas</p>
          <p className="text-3xl font-serif font-bold text-rose-600 mt-1">—</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-maison-hairline p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-maison-muted" />
          <input
            type="text"
            placeholder="Buscar por usuário, ação ou entidade..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-maison-hairline focus:outline-none focus:border-maison-terracotta"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-maison-hairline text-xs font-sans tracking-widest uppercase font-semibold text-maison-charcoal hover:bg-maison-linen">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Empty state */}
      <div className="bg-white border border-maison-hairline p-16 text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-maison-linen flex items-center justify-center">
          <ShieldAlert className="w-7 h-7 text-maison-muted" />
        </div>
        <h3 className="text-lg font-serif text-maison-charcoal mb-2">Módulo de Auditoria em construção</h3>
        <p className="text-sm text-maison-muted max-w-md mx-auto">
          Aqui você verá o histórico completo de ações dos usuários: criação e edição de orçamentos,
          contratos, obras, acessos e alterações sensíveis. O backend já possui a entidade AuditLog.
        </p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
          <div className="flex items-start gap-3 p-3 bg-maison-linen/50">
            <Clock className="w-4 h-4 text-maison-terracotta mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-maison-charcoal">Timeline</p>
              <p className="text-[11px] text-maison-muted">Eventos ordenados por data</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-maison-linen/50">
            <User className="w-4 h-4 text-maison-terracotta mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-maison-charcoal">Por usuário</p>
              <p className="text-[11px] text-maison-muted">Filtro por responsável</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-maison-linen/50">
            <FileText className="w-4 h-4 text-maison-terracotta mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-maison-charcoal">Exportação</p>
              <p className="text-[11px] text-maison-muted">CSV / PDF para compliance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
