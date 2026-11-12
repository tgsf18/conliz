import React from "react";
import { ObrasGallery } from "@/components/obras/ObrasGallery";

async function getObras() {
  try {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/public/obras`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {}
  return [
    {
      id: "1",
      nome: "Residência Alphaville Nova Esplanada",
      slug: "residencia-alphaville-nova-esplanada",
      categoria: "RESIDENCIAL",
      localizacao: "Alphaville Nova Esplanada 3",
      cidade: "Votorantim",
      uf: "SP",
      areaM2: 380,
      anoConclusao: 2026,
      faseAtual: "ESTRUTURA",
      imagemCapaUrl:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "2",
      nome: "Retrofit e Hall Social Saint Paul",
      slug: "retrofit-hall-social-saint-paul",
      categoria: "REFORMA",
      localizacao: "Jardim Campolim",
      cidade: "Sorocaba",
      uf: "SP",
      areaM2: 520,
      anoConclusao: 2026,
      faseAtual: "ALVENARIA",
      imagemCapaUrl:
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "3",
      nome: "Consultórios Integrados Barão de Tatuí",
      slug: "consultorios-integrados-barao-de-tatui",
      categoria: "COMERCIAL",
      localizacao: "Av. Barão de Tatuí, Centro",
      cidade: "Sorocaba",
      uf: "SP",
      areaM2: 220,
      anoConclusao: 2025,
      faseAtual: "CONCLUIDA",
      imagemCapaUrl:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "4",
      nome: "Villa Quinta da Primavera",
      slug: "villa-quinta-da-primavera",
      categoria: "RESIDENCIAL",
      localizacao: "Condomínio Quinta da Primavera",
      cidade: "Itu",
      uf: "SP",
      areaM2: 410,
      anoConclusao: 2025,
      faseAtual: "CONCLUIDA",
      imagemCapaUrl:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    },
  ];
}

export const metadata = {
  title: "Obras Realizadas | Conliz Construções",
  description:
    "Explore o portfólio de obras residenciais, comerciais e reformas entregues pela Conliz em Sorocaba, Votorantim e região.",
};

export default async function ObrasPage() {
  const obras = await getObras();

  return (
    <div className="pt-28 pb-24 bg-maison-cream">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <span className="editorial-sub block mb-3">Portfólio Conliz</span>
        <h1 className="text-4xl sm:text-6xl font-serif text-maison-charcoal leading-tight">
          Obras <span className="italic font-normal text-maison-terracotta">Realizadas</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg font-sans text-maison-muted max-w-2xl mx-auto leading-relaxed">
          Nossa galeria de construções civis e intervenções arquitetônicas em Sorocaba e região metropolitana.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ObrasGallery initialObras={obras} />
      </div>
    </div>
  );
}
