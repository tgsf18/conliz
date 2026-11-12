import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeforeAfterSlider } from "@/components/obras/BeforeAfterSlider";
import { ArrowLeft, ArrowUpRight, MapPin, Calendar, Maximize2, Layers } from "lucide-react";

async function getObra(slug: string) {
  try {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/public/obras/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {}

  // Fallback data
  if (slug === "retrofit-hall-social-saint-paul") {
    return {
      id: "2",
      nome: "Retrofit e Hall Social Saint Paul",
      slug: "retrofit-hall-social-saint-paul",
      categoria: "REFORMA",
      descricao:
        "Transformação e modernização de área social comum predial no Jardim Campolim, Sorocaba. Piso em pedra calcária, iluminação escandinava difusa, marcenaria ripada sob medida e detalhes em latão fosco. O projeto substituiu um layout datado dos anos 90 por uma recepção contemporânea e fluida.",
      localizacao: "Rua José Maria Hanickel, Campolim",
      cidade: "Sorocaba",
      uf: "SP",
      areaM2: 520,
      anoConclusao: 2026,
      percentualConcluido: 42,
      faseAtual: "ALVENARIA",
      imagemCapaUrl:
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80",
      fotos: [
        {
          id: "f1",
          url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80",
          legenda: "Área de estar e convivência no novo hall",
          ehAntesDepois: false,
          ordem: 1,
        },
        {
          id: "f2",
          url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
          legenda: "Detalhe da iluminação linear e revestimento neutro",
          ehAntesDepois: false,
          ordem: 2,
        },
      ],
      antesDepois: {
        antesUrl:
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80",
        depoisUrl:
          "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80",
        legenda: "Comparativo entre o piso e recepção antiga e o novo layout Japandi Conliz",
      },
    };
  }

  return {
    id: "1",
    nome: "Residência Alphaville Nova Esplanada",
    slug: "residencia-alphaville-nova-esplanada",
    categoria: "RESIDENCIAL",
    descricao:
      "Projeto residencial de alto padrão em Votorantim/Sorocaba. Estrutura pura com grandes vãos, integração bioclimática com a natureza e acabamentos em linho, concreto ripado e madeira nobre. Projeto estrutural calculado para máximo aproveitamento solar e conforto térmico permanente.",
    localizacao: "Condomínio Alphaville Nova Esplanada 3",
    cidade: "Votorantim",
    uf: "SP",
    areaM2: 380,
    anoConclusao: 2026,
    percentualConcluido: 68,
    faseAtual: "ESTRUTURA",
    imagemCapaUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    fotos: [
      {
        id: "f3",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
        legenda: "Fachada poente e esquadrias de piso a teto",
        ehAntesDepois: false,
        ordem: 1,
      },
      {
        id: "f4",
        url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
        legenda: "Living integrado com concreto aparente e carvalho",
        ehAntesDepois: false,
        ordem: 2,
      },
    ],
    antesDepois: null,
  };
}

export const dynamicParams = false;

// Exportação estática: as rotas são geradas no build a partir da API pública.
export async function generateStaticParams() {
  const slugs = new Set<string>([
    "residencia-alphaville-nova-esplanada",
    "retrofit-hall-social-saint-paul",
  ]);
  try {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/public/obras`, { cache: "no-store" });
    if (res.ok) {
      const obras = await res.json();
      for (const obra of obras) {
        if (obra?.slug) slugs.add(obra.slug);
      }
    }
  } catch (error) {}
  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const obra = await getObra(params.slug);
  if (!obra) return { title: "Obra não encontrada" };
  return {
    title: `${obra.nome} | Conliz Obras`,
    description: obra.descricao?.slice(0, 160),
  };
}

export default async function ObraDetailPage({ params }: { params: { slug: string } }) {
  const obra = await getObra(params.slug);
  if (!obra) notFound();

  return (
    <article className="pt-28 pb-24 bg-maison-cream">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Link
          href="/obras"
          className="inline-flex items-center gap-2 text-xs font-sans tracking-editorial uppercase text-maison-muted hover:text-maison-terracotta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao catálogo de obras</span>
        </Link>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <span className="editorial-sub block mb-2">{obra.categoria}</span>
        <h1 className="text-4xl sm:text-6xl font-serif text-maison-charcoal leading-tight">
          {obra.nome}
        </h1>

        {/* Project Meta Bar */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-maison-linen border border-maison-hairline">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-maison-terracotta shrink-0" />
            <div>
              <p className="text-[10px] font-sans tracking-widest uppercase text-maison-muted">Localização</p>
              <p className="text-xs font-sans font-semibold text-maison-charcoal">{obra.localizacao}, {obra.cidade}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Maximize2 className="w-4 h-4 text-maison-terracotta shrink-0" />
            <div>
              <p className="text-[10px] font-sans tracking-widest uppercase text-maison-muted">Área Construída</p>
              <p className="text-xs font-sans font-semibold text-maison-charcoal">{obra.areaM2} m²</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-maison-terracotta shrink-0" />
            <div>
              <p className="text-[10px] font-sans tracking-widest uppercase text-maison-muted">Ano de Execução</p>
              <p className="text-xs font-sans font-semibold text-maison-charcoal">{obra.anoConclusao || 2026}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-maison-terracotta shrink-0" />
            <div>
              <p className="text-[10px] font-sans tracking-widest uppercase text-maison-muted">Fase / Progresso</p>
              <p className="text-xs font-sans font-semibold text-maison-charcoal">{obra.faseAtual} ({obra.percentualConcluido}%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative aspect-[21/9] w-full overflow-hidden border border-maison-hairline shadow-md">
          <Image
            src={obra.imagemCapaUrl}
            alt={obra.nome}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>

      {/* Description */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 space-y-6">
        <span className="editorial-sub block">Memorial Descritivo da Intervenção</span>
        <p className="text-lg font-serif text-maison-charcoal leading-relaxed">
          {obra.descricao}
        </p>
      </div>

      {/* Interactive Before & After Slider (If available) */}
      {obra.antesDepois && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 space-y-6">
          <div className="text-center space-y-2">
            <span className="editorial-sub block">Comparativo Visual</span>
            <h2 className="text-3xl font-serif text-maison-charcoal">
              Antes & Depois da Intervenção
            </h2>
          </div>
          <BeforeAfterSlider
            beforeUrl={obra.antesDepois.antesUrl}
            afterUrl={obra.antesDepois.depoisUrl}
            legenda={obra.antesDepois.legenda}
          />
        </section>
      )}

      {/* Photo Gallery */}
      {obra.fotos && obra.fotos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center mb-12 space-y-2">
            <span className="editorial-sub block">Documentação Fotográfica</span>
            <h2 className="text-3xl font-serif text-maison-charcoal">
              Galeria de Detalhes Construtivos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {obra.fotos.map((foto: any) => (
              <div key={foto.id} className="space-y-3">
                <div className="relative aspect-[16/10] w-full overflow-hidden border border-maison-hairline shadow-sm">
                  <Image
                    src={foto.url}
                    alt={foto.legenda || obra.nome}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                {foto.legenda && (
                  <p className="text-xs font-sans text-maison-muted italic">
                    {foto.legenda}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA for Similar Works */}
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-maison-charcoal text-white p-12 space-y-6">
          <span className="text-[11px] font-sans tracking-editorial uppercase text-maison-sand font-semibold">
            Inicie o seu projeto
          </span>
          <h3 className="text-3xl sm:text-4xl font-serif">
            Deseja uma execução com esse mesmo rigor técnico?
          </h3>
          <p className="font-sans text-sm text-maison-sand/80 max-w-lg mx-auto">
            Agende uma visita técnica sem compromisso ou envie seu projeto para cálculo paramétrico de orçamento.
          </p>
          <div className="pt-2">
            <Link
              href={`/orcamento?tipo=${encodeURIComponent(obra.categoria)}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-maison-terracotta text-white font-sans text-xs tracking-widest uppercase font-semibold hover:bg-maison-terracottaHover transition-all shadow-md"
            >
              <span>Solicitar Estudo de Viabilidade</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
