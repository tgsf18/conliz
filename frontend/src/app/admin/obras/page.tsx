"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HardHat, Plus, Search, MapPin, Calendar, ArrowUpRight } from "lucide-react";

interface Obra {
  id: string;
  nome: string;
  slug?: string;
  cidade?: string;
  categoria?: string;
  faseAtual?: string;
  areaM2?: number;
  status?: string;
}

export default function AdminObrasPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/obras").catch(() => null);
        if (res?.ok) {
          const data = await res.json();
          setObras(Array.isArray(data) ? data : data.items || []);
        }
      } catch {
        // empty until backend wired
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = obras.filter((o) =>
    o.nome?.toLowerCase().includes(query.toLowerCase()) ||
    o.cidade?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-sans font-semibold text-conliz-charcoal dark:text-white flex items-center gap-2">
            <HardHat className="w-6 h-6 text-[#0A2540] dark:text-white" />
            Obras & Canteiro
          </h1>
          <p className="text-sm text-conliz-muted mt-1">
            Gestão de obras em andamento, fases e acompanhamento de canteiro.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2540] text-white text-xs font-sans tracking-widest uppercase font-semibold hover:bg-[#071B2E] transition-colors dark:bg-white dark:text-[#071B2E]">
          <Plus className="w-4 h-4" />
          Nova Obra
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: obras.length || "—" },
          { label: "Em andamento", value: "—" },
          { label: "Concluídas", value: "—" },
          { label: "Atrasadas", value: "—" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0D1F33] border border-conliz-slate dark:border-white/10 p-4">
            <p className="text-[10px] font-sans tracking-widest uppercase text-conliz-muted">{s.label}</p>
            <p className="text-2xl font-sans font-semibold text-conliz-charcoal dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0D1F33] border border-conliz-slate dark:border-white/10 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-conliz-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar obra, cidade..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-conliz-slate dark:border-white/10 bg-transparent focus:outline-none focus:border-[#0A2540] dark:text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-conliz-muted">Carregando obras...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#0D1F33] border border-conliz-slate dark:border-white/10 p-12 text-center">
          <HardHat className="w-10 h-10 mx-auto text-conliz-muted mb-3" />
          <h3 className="font-sans font-semibold text-conliz-charcoal dark:text-white">Nenhuma obra cadastrada</h3>
          <p className="text-sm text-conliz-muted mt-2 max-w-md mx-auto">
            Cadastre a primeira obra para acompanhar fases, equipe e materiais do canteiro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((obra) => (
            <div
              key={obra.id}
              className="bg-white dark:bg-[#0D1F33] border border-conliz-slate dark:border-white/10 p-5 hover:border-[#0A2540]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-sans font-semibold text-conliz-charcoal dark:text-white text-sm leading-snug">
                  {obra.nome}
                </h3>
                <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 bg-conliz-slate dark:bg-white/10 text-conliz-muted shrink-0">
                  {obra.faseAtual || obra.status || "—"}
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-conliz-muted">
                {obra.cidade && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {obra.cidade}
                  </p>
                )}
                {obra.categoria && (
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {obra.categoria}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-conliz-slate dark:border-white/10">
                <Link
                  href={`/admin/obras/${obra.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A2540] dark:text-white hover:underline"
                >
                  Abrir canteiro <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
