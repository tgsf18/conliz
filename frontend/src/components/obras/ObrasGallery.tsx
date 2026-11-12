"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Filter } from "lucide-react";

interface ObraItem {
  id: string;
  nome: string;
  slug: string;
  categoria: string;
  localizacao: string;
  cidade: string;
  uf: string;
  areaM2: number;
  anoConclusao: number;
  faseAtual: string;
  imagemCapaUrl: string;
}

interface ObrasGalleryProps {
  initialObras: ObraItem[];
}

export function ObrasGallery({ initialObras }: ObrasGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState("TODAS");

  const categories = [
    { label: "Todas", value: "TODAS" },
    { label: "Residencial", value: "RESIDENCIAL" },
    { label: "Reformas", value: "REFORMA" },
    { label: "Comercial", value: "COMERCIAL" },
  ];

  const filteredObras = initialObras.filter((obra) => {
    if (selectedCategory === "TODAS") return true;
    return obra.categoria?.toUpperCase() === selectedCategory;
  });

  return (
    <div>
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2 text-xs font-sans tracking-editorial uppercase transition-all duration-200 border ${
                isActive
                  ? "bg-maison-terracotta text-white border-maison-terracotta shadow-sm font-semibold"
                  : "bg-maison-cream text-maison-charcoal border-maison-hairline hover:border-maison-terracotta"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Works Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredObras.map((obra) => (
          <Link
            key={obra.slug}
            href={`/obras/${obra.slug}`}
            className="group block bg-maison-cream border border-maison-hairline overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-maison-terracotta"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-maison-linen">
              <Image
                src={obra.imagemCapaUrl}
                alt={obra.nome}
                fill
                className="object-cover transition-transform duration-750 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-4 left-4 bg-maison-cream/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-sans font-semibold tracking-editorial uppercase text-maison-charcoal border border-maison-hairline">
                {obra.categoria}
              </div>
              <div className="absolute bottom-4 right-4 bg-maison-charcoal/80 text-white backdrop-blur-sm px-2.5 py-1 text-[10px] font-sans tracking-widest uppercase">
                {obra.anoConclusao || 2026}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between text-xs font-sans text-maison-muted mb-2">
                <span>{obra.cidade} / {obra.uf || "SP"}</span>
                <span>{obra.areaM2 ? `${obra.areaM2} m²` : "Área sob medida"}</span>
              </div>
              <h3 className="text-xl font-serif text-maison-charcoal group-hover:text-maison-terracotta transition-colors">
                {obra.nome}
              </h3>
              <p className="mt-2 text-xs font-sans text-maison-muted">
                Fase atual: <span className="font-semibold text-maison-charcoal uppercase">{obra.faseAtual}</span>
              </p>
              <div className="mt-6 pt-4 border-t border-maison-hairline flex items-center justify-between text-xs font-sans tracking-editorial uppercase font-medium text-maison-terracotta">
                <span>Explorar Galeria & Detalhes</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredObras.length === 0 && (
        <div className="text-center py-16 bg-maison-linen border border-maison-hairline">
          <p className="font-serif text-xl text-maison-charcoal">
            Nenhuma obra encontrada para esta categoria.
          </p>
          <button
            onClick={() => setSelectedCategory("TODAS")}
            className="mt-4 px-5 py-2 bg-maison-terracotta text-white text-xs font-sans tracking-widest uppercase"
          >
            Ver todas
          </button>
        </div>
      )}
    </div>
  );
}
