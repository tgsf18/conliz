import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollExpansionHero } from "@/components/ui/scroll-expansion-hero";
import {
  ArrowUpRight,
  CheckCircle2,
  Building2,
  HardHat,
  Ruler,
  Sparkles,
  Quote,
  ShieldAlert,
} from "lucide-react";

async function getFeaturedObras() {
  try {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/public/obras`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      return data.slice(0, 3);
    }
  } catch (error) {
    // Fallback static data if backend is offline during build
  }
  return [
    {
      id: "1",
      nome: "Residência Alphaville Nova Esplanada",
      slug: "residencia-alphaville-nova-esplanada",
      categoria: "RESIDENCIAL",
      cidade: "Votorantim",
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
      cidade: "Sorocaba",
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
      cidade: "Sorocaba",
      areaM2: 220,
      anoConclusao: 2025,
      faseAtual: "CONCLUIDA",
      imagemCapaUrl:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    },
  ];
}

export default async function HomePage() {
  const featuredObras = await getFeaturedObras();

  return (
    <div className="bg-maison-cream selection:bg-maison-terracotta/20">
      {/* 1. Scroll Expansion Hero */}
      <ScrollExpansionHero
        title="Conliz Construções"
        tagline="A CONFIANÇA SE CONSTRÓI"
        subtitle="Construção civil com qualidade técnica irrestrita, reformas inteligentes e projetos sob medida para você em Sorocaba e região."
        primaryCtaText="Solicitar Orçamento"
        primaryCtaLink="/orcamento"
        secondaryCtaText="Explorar Obras"
        secondaryCtaLink="/obras"
        heroImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
      />

      {/* 2. Editorial Philosophy Statement */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center border-b border-maison-hairline">
        <span className="editorial-sub block mb-4">Filosofia Conliz</span>
        <h2 className="text-3xl sm:text-5xl font-serif text-maison-charcoal leading-tight">
          Acreditamos que a solidez de uma edificação reside tanto no{" "}
          <span className="italic text-maison-terracotta font-normal">cálculo estrutural</span>{" "}
          quanto na honestidade de cada etapa executada.
        </h2>
        <p className="mt-8 text-base sm:text-lg font-sans text-maison-muted leading-relaxed max-w-3xl mx-auto">
          Fundada com o propósito de redefinir o padrão construtivo em Sorocaba, a Conliz une
          o rigor da engenharia moderna à sensibilidade dos materiais nobres. Sem improvisos,
          sem aditivos injustificados e com o acompanhamento próximo de engenheiros residentes em cada canteiro.
        </p>
      </section>

      {/* 3. Solutions Summary (Editorial Grid) */}
      <section className="py-24 bg-maison-linen border-b border-maison-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="editorial-sub block mb-2">O Que Fazemos</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-maison-charcoal">
                Soluções completas para <span className="italic font-normal">edificar</span> o seu futuro.
              </h2>
            </div>
            <Link
              href="/solucoes"
              className="inline-flex items-center gap-1.5 text-xs font-sans tracking-editorial uppercase text-maison-terracotta hover:text-maison-charcoal font-semibold transition-colors"
            >
              <span>Ver todas as soluções</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-maison-cream p-8 border border-maison-hairline flex flex-col justify-between hover:border-maison-terracotta transition-colors group">
              <div>
                <div className="w-10 h-10 mb-6 bg-maison-linen flex items-center justify-center text-maison-terracotta">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="font-sans text-[11px] tracking-widest uppercase text-maison-muted font-medium">
                  01 / Alto Padrão
                </span>
                <h3 className="text-2xl font-serif text-maison-charcoal mt-2 mb-4 group-hover:text-maison-terracotta transition-colors">
                  Construção Residencial
                </h3>
                <p className="text-sm font-sans text-maison-muted leading-relaxed">
                  Execução de casas em condomínios fechados em Sorocaba e Votorantim. Grandes vãos estruturais,
                  isolamento acústico e harmonia com a iluminação natural.
                </p>
              </div>
              <div className="pt-8 border-t border-maison-hairline mt-8 flex items-center justify-between text-xs font-sans tracking-editorial uppercase font-medium text-maison-charcoal">
                <span>Da Fundação às Chaves</span>
                <ArrowUpRight className="w-4 h-4 text-maison-terracotta" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-maison-cream p-8 border border-maison-hairline flex flex-col justify-between hover:border-maison-terracotta transition-colors group">
              <div>
                <div className="w-10 h-10 mb-6 bg-maison-linen flex items-center justify-center text-maison-terracotta">
                  <Ruler className="w-5 h-5" />
                </div>
                <span className="font-sans text-[11px] tracking-widest uppercase text-maison-muted font-medium">
                  02 / Precisão
                </span>
                <h3 className="text-2xl font-serif text-maison-charcoal mt-2 mb-4 group-hover:text-maison-terracotta transition-colors">
                  Reformas & Retrofit
                </h3>
                <p className="text-sm font-sans text-maison-muted leading-relaxed">
                  Transformações profundas de coberturas duplex, apartamentos e imóveis comerciais.
                  Reforço estrutural, integração e acabamentos com estética Japandi.
                </p>
              </div>
              <div className="pt-8 border-t border-maison-hairline mt-8 flex items-center justify-between text-xs font-sans tracking-editorial uppercase font-medium text-maison-charcoal">
                <span>Renovação sem Imprevistos</span>
                <ArrowUpRight className="w-4 h-4 text-maison-terracotta" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-maison-cream p-8 border border-maison-hairline flex flex-col justify-between hover:border-maison-terracotta transition-colors group">
              <div>
                <div className="w-10 h-10 mb-6 bg-maison-linen flex items-center justify-center text-maison-terracotta">
                  <HardHat className="w-5 h-5" />
                </div>
                <span className="font-sans text-[11px] tracking-widest uppercase text-maison-muted font-medium">
                  03 / Corporativo
                </span>
                <h3 className="text-2xl font-serif text-maison-charcoal mt-2 mb-4 group-hover:text-maison-terracotta transition-colors">
                  Obras Comerciais
                </h3>
                <p className="text-sm font-sans text-maison-muted leading-relaxed">
                  Clínicas médicas, sedes corporativas e escritórios boutique. Cumprimento inflexível
                  de prazos para antecipar a inauguração e geração de receita.
                </p>
              </div>
              <div className="pt-8 border-t border-maison-hairline mt-8 flex items-center justify-between text-xs font-sans tracking-editorial uppercase font-medium text-maison-charcoal">
                <span>Turnkey Corporativo</span>
                <ArrowUpRight className="w-4 h-4 text-maison-terracotta" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Projects (Editorial Gallery) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-maison-hairline">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="editorial-sub block mb-2">Portfólio Selecionado</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-maison-charcoal">
              Obras que contam a nossa <span className="italic font-normal">história</span>.
            </h2>
          </div>
          <Link
            href="/obras"
            className="inline-flex items-center gap-1.5 text-xs font-sans tracking-editorial uppercase text-maison-terracotta hover:text-maison-charcoal font-semibold transition-colors"
          >
            <span>Ver galeria completa</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredObras.map((obra: any) => (
            <Link
              key={obra.slug}
              href={`/obras/${obra.slug}`}
              className="group block bg-maison-cream border border-maison-hairline overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-maison-linen">
                <Image
                  src={obra.imagemCapaUrl}
                  alt={obra.nome}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-4 left-4 bg-maison-cream/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-sans font-semibold tracking-editorial uppercase text-maison-charcoal border border-maison-hairline">
                  {obra.categoria}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between text-xs font-sans text-maison-muted mb-2">
                  <span>{obra.cidade} / SP</span>
                  <span>{obra.areaM2} m²</span>
                </div>
                <h3 className="text-xl font-serif text-maison-charcoal group-hover:text-maison-terracotta transition-colors">
                  {obra.nome}
                </h3>
                <div className="mt-4 pt-4 border-t border-maison-hairline flex items-center justify-between text-xs font-sans tracking-widest uppercase font-medium text-maison-terracotta">
                  <span>Ver Detalhes & Fotos</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Company Numbers (Minimalist Japandi Stat Strip) */}
      <section className="py-20 bg-maison-linen border-b border-maison-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            <div className="space-y-2">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-maison-charcoal block">
                100%
              </span>
              <p className="font-sans text-xs tracking-editorial uppercase text-maison-muted">
                Prazos rigorosamente cumpridos
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-maison-charcoal block">
                45+
              </span>
              <p className="font-sans text-xs tracking-editorial uppercase text-maison-muted">
                Obras entregues na região
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-maison-charcoal block">
                15+
              </span>
              <p className="font-sans text-xs tracking-editorial uppercase text-maison-muted">
                Anos de experiência técnica
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-maison-terracotta block">
                Zero
              </span>
              <p className="font-sans text-xs tracking-editorial uppercase text-maison-muted">
                Custos ocultos ou surpresas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-maison-hairline">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="editorial-sub block mb-2">Depoimentos</span>
          <h2 className="text-3xl sm:text-4xl font-serif text-maison-charcoal">
            A palavra de quem já <span className="italic font-normal">construiu</span> conosco.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-maison-linen p-8 border border-maison-hairline space-y-4">
            <Quote className="w-8 h-8 text-maison-terracotta/40" />
            <p className="font-serif italic text-lg text-maison-charcoal leading-relaxed">
              &quot;A Conliz conduziu a obra da nossa casa no Alphaville com um controle financeiro e cronograma
              que nunca vi em outra construtora. As medições foram transparentes e o resultado superou as expectativas.&quot;
            </p>
            <div className="pt-4 border-t border-maison-hairline">
              <p className="font-sans text-sm font-semibold text-maison-charcoal">Dr. Roberto Silveira</p>
              <p className="font-sans text-xs text-maison-muted">Residência Alphaville Nova Esplanada</p>
            </div>
          </div>

          <div className="bg-maison-linen p-8 border border-maison-hairline space-y-4">
            <Quote className="w-8 h-8 text-maison-terracotta/40" />
            <p className="font-serif italic text-lg text-maison-charcoal leading-relaxed">
              &quot;Reformamos todo o hall social do condomínio no Campolim com a Conliz. Organização exemplar,
              respeito rigoroso aos condôminos e acabamento de altíssimo padrão.&quot;
            </p>
            <div className="pt-4 border-t border-maison-hairline">
              <p className="font-sans text-sm font-semibold text-maison-charcoal">Condomínio Residencial Saint Paul</p>
              <p className="font-sans text-xs text-maison-muted">Campolim, Sorocaba</p>
            </div>
          </div>

          <div className="bg-maison-linen p-8 border border-maison-hairline space-y-4">
            <Quote className="w-8 h-8 text-maison-terracotta/40" />
            <p className="font-serif italic text-lg text-maison-charcoal leading-relaxed">
              &quot;A clínica precisava abrir no prazo limite por conta dos agendamentos de pacientes.
              A engenharia da Conliz entregou com 5 dias de antecedência e sem nenhum retrabalho.&quot;
            </p>
            <div className="pt-4 border-t border-maison-hairline">
              <p className="font-sans text-sm font-semibold text-maison-charcoal">Clínica Odontológica Sorocaba</p>
              <p className="font-sans text-xs text-maison-muted">Av. Barão de Tatuí, Centro</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call To Action (Terracotta & Linen) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-maison-charcoal text-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[11px] font-sans font-semibold tracking-editorial uppercase text-maison-sand">
            Pronto para iniciar?
          </span>
          <h2 className="text-4xl sm:text-6xl font-serif leading-tight">
            Vamos transformar a sua visão em uma <span className="italic text-maison-sand">obra concreta</span>.
          </h2>
          <p className="font-sans text-base sm:text-lg text-maison-sand/80 max-w-2xl mx-auto">
            Receba um estudo prévio e proposta detalhada elaborada por nossa equipe de engenharia para Sorocaba e região.
          </p>
          <div className="pt-4">
            <Link
              href="/orcamento"
              className="inline-flex items-center gap-2 px-9 py-4 bg-maison-terracotta text-white font-sans text-xs tracking-widest uppercase font-semibold hover:bg-maison-terracottaHover transition-all shadow-xl"
            >
              <span>Solicitar Orçamento Online</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
