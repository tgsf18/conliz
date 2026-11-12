import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollExpansionHero } from "@/components/ui/scroll-expansion-hero";
import {
  ArrowUpRight,
  Building2,
  HardHat,
  Ruler,
  Quote,
  Play,
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
    <div className="bg-conliz-cream selection:bg-conliz-gold/30">
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center border-b border-conliz-slate">
        <span className="editorial-sub block mb-4">Filosofia Conliz</span>
        <h2 className="text-3xl sm:text-5xl font-serif text-conliz-charcoal leading-tight">
          Acreditamos que a solidez de uma edificação reside tanto no{" "}
          <span className="italic text-conliz-gold font-normal">cálculo estrutural</span>{" "}
          quanto na honestidade de cada etapa executada.
        </h2>
        <p className="mt-8 text-base sm:text-lg font-sans text-conliz-muted leading-relaxed max-w-3xl mx-auto">
          Fundada com o propósito de redefinir o padrão construtivo em Sorocaba, a Conliz une
          o rigor da engenharia moderna à sensibilidade dos materiais nobres. Sem improvisos,
          sem aditivos injustificados e com o acompanhamento próximo de engenheiros residentes em cada canteiro.
        </p>
      </section>

      {/* 3. Diários de Obra — Vídeos */}
      <section className="py-24 bg-conliz-navy text-white border-b border-conliz-navyLight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[11px] font-sans font-semibold tracking-[0.22em] uppercase text-conliz-gold block mb-3">
              Diários de Obra
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif">
              Acompanhe a construção <span className="italic text-conliz-gold">ao vivo</span>
            </h2>
            <p className="mt-4 text-white/70 text-base sm:text-lg">
              Vídeos reais do nosso dia a dia e resultados de obras entregues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vídeo 1 — CEO / Origem */}
            <div className="bg-conliz-navyDark border border-conliz-navyLight overflow-hidden group">
              <div className="relative aspect-[9/16] max-h-[520px] bg-black">
                <iframe
                  src="https://www.instagram.com/reel/DcQzj9csw_C/embed"
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  loading="lazy"
                  title="Conliz — Quem constrói sonhos, constrói histórias"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-4 h-4 text-conliz-gold" />
                  <span className="text-[11px] font-sans tracking-widest uppercase text-conliz-gold font-semibold">
                    Institucional
                  </span>
                </div>
                <h3 className="font-serif text-xl text-white">
                  Quem constrói sonhos, constrói histórias
                </h3>
                <p className="mt-2 text-sm text-white/60">
                  O CEO da Conliz conta como nasceu a empresa e o diferencial de ter toda obra supervisionada pela engenharia.
                </p>
              </div>
            </div>

            {/* Vídeo 2 — Resultado de obra (Ranch Blackstone) */}
            <div className="bg-conliz-navyDark border border-conliz-navyLight overflow-hidden group">
              <div className="relative aspect-[9/16] max-h-[520px] bg-black flex items-center justify-center">
                {/* Placeholder até hospedar o MP4 em /public/videos/ ou usar CDN */}
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-conliz-gold/20 flex items-center justify-center">
                    <Play className="w-7 h-7 text-conliz-gold" />
                  </div>
                  <p className="text-sm text-white/80 font-medium">Ranch Blackstone</p>
                  <p className="text-xs text-white/50 mt-1">Resultado de obra</p>
                  <a
                    href="https://www.instagram.com/conliz_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-4 text-xs text-conliz-gold hover:underline"
                  >
                    Ver no Instagram
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-4 h-4 text-conliz-gold" />
                  <span className="text-[11px] font-sans tracking-widest uppercase text-conliz-gold font-semibold">
                    Resultado de Obra
                  </span>
                </div>
                <h3 className="font-serif text-xl text-white">
                  Ranch Blackstone — Entrega
                </h3>
                <p className="mt-2 text-sm text-white/60">
                  Tour completo da obra finalizada: pistas, galpão, área de lazer e acabamentos de alto padrão.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <a
              href="https://www.instagram.com/conliz_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-sans tracking-[0.18em] uppercase text-conliz-gold hover:text-white font-semibold transition-colors"
            >
              Ver todos os diários no Instagram
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. Solutions Summary */}
      <section className="py-24 bg-conliz-slate border-b border-conliz-slate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="editorial-sub block mb-2">O Que Fazemos</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-conliz-charcoal">
                Soluções completas para <span className="italic font-normal text-conliz-gold">edificar</span> o seu futuro.
              </h2>
            </div>
            <Link
              href="/solucoes"
              className="inline-flex items-center gap-1.5 text-xs font-sans tracking-[0.18em] uppercase text-conliz-gold hover:text-conliz-navy font-semibold transition-colors"
            >
              <span>Ver todas as soluções</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 border border-conliz-slate flex flex-col justify-between hover:border-conliz-gold transition-colors group">
              <div>
                <div className="w-10 h-10 mb-6 bg-conliz-slate flex items-center justify-center text-conliz-gold">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="font-sans text-[11px] tracking-widest uppercase text-conliz-muted font-medium">
                  01 / Alto Padrão
                </span>
                <h3 className="text-2xl font-serif text-conliz-charcoal mt-2 mb-4 group-hover:text-conliz-gold transition-colors">
                  Construção Residencial
                </h3>
                <p className="text-sm font-sans text-conliz-muted leading-relaxed">
                  Execução de casas em condomínios fechados em Sorocaba e Votorantim. Grandes vãos estruturais,
                  isolamento acústico e harmonia com a iluminação natural.
                </p>
              </div>
              <div className="pt-8 border-t border-conliz-slate mt-8 flex items-center justify-between text-xs font-sans tracking-[0.18em] uppercase font-medium text-conliz-charcoal">
                <span>Da Fundação às Chaves</span>
                <ArrowUpRight className="w-4 h-4 text-conliz-gold" />
              </div>
            </div>

            <div className="bg-white p-8 border border-conliz-slate flex flex-col justify-between hover:border-conliz-gold transition-colors group">
              <div>
                <div className="w-10 h-10 mb-6 bg-conliz-slate flex items-center justify-center text-conliz-gold">
                  <Ruler className="w-5 h-5" />
                </div>
                <span className="font-sans text-[11px] tracking-widest uppercase text-conliz-muted font-medium">
                  02 / Precisão
                </span>
                <h3 className="text-2xl font-serif text-conliz-charcoal mt-2 mb-4 group-hover:text-conliz-gold transition-colors">
                  Reformas & Retrofit
                </h3>
                <p className="text-sm font-sans text-conliz-muted leading-relaxed">
                  Transformações profundas de coberturas duplex, apartamentos e imóveis comerciais.
                  Reforço estrutural, integração e acabamentos de alto padrão.
                </p>
              </div>
              <div className="pt-8 border-t border-conliz-slate mt-8 flex items-center justify-between text-xs font-sans tracking-[0.18em] uppercase font-medium text-conliz-charcoal">
                <span>Renovação sem Imprevistos</span>
                <ArrowUpRight className="w-4 h-4 text-conliz-gold" />
              </div>
            </div>

            <div className="bg-white p-8 border border-conliz-slate flex flex-col justify-between hover:border-conliz-gold transition-colors group">
              <div>
                <div className="w-10 h-10 mb-6 bg-conliz-slate flex items-center justify-center text-conliz-gold">
                  <HardHat className="w-5 h-5" />
                </div>
                <span className="font-sans text-[11px] tracking-widest uppercase text-conliz-muted font-medium">
                  03 / Corporativo
                </span>
                <h3 className="text-2xl font-serif text-conliz-charcoal mt-2 mb-4 group-hover:text-conliz-gold transition-colors">
                  Obras Comerciais
                </h3>
                <p className="text-sm font-sans text-conliz-muted leading-relaxed">
                  Clínicas médicas, sedes corporativas e escritórios boutique. Cumprimento inflexível
                  de prazos para antecipar a inauguração e geração de receita.
                </p>
              </div>
              <div className="pt-8 border-t border-conliz-slate mt-8 flex items-center justify-between text-xs font-sans tracking-[0.18em] uppercase font-medium text-conliz-charcoal">
                <span>Turnkey Corporativo</span>
                <ArrowUpRight className="w-4 h-4 text-conliz-gold" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Projects */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-conliz-slate">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="editorial-sub block mb-2">Portfólio Selecionado</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-conliz-charcoal">
              Obras que contam a nossa <span className="italic font-normal text-conliz-gold">história</span>.
            </h2>
          </div>
          <Link
            href="/obras"
            className="inline-flex items-center gap-1.5 text-xs font-sans tracking-[0.18em] uppercase text-conliz-gold hover:text-conliz-navy font-semibold transition-colors"
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
              className="group block bg-white border border-conliz-slate overflow-hidden transition-all hover:shadow-lg hover:border-conliz-gold"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-conliz-slate">
                <Image
                  src={obra.imagemCapaUrl}
                  alt={obra.nome}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-4 left-4 bg-conliz-navy/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-sans font-semibold tracking-[0.18em] uppercase text-conliz-gold border border-conliz-gold/30">
                  {obra.categoria}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between text-xs font-sans text-conliz-muted mb-2">
                  <span>{obra.cidade} / SP</span>
                  <span>{obra.areaM2} m²</span>
                </div>
                <h3 className="text-xl font-serif text-conliz-charcoal group-hover:text-conliz-gold transition-colors">
                  {obra.nome}
                </h3>
                <div className="mt-4 pt-4 border-t border-conliz-slate flex items-center justify-between text-xs font-sans tracking-widest uppercase font-medium text-conliz-gold">
                  <span>Ver Detalhes & Fotos</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Company Numbers */}
      <section className="py-20 bg-conliz-navy text-white border-b border-conliz-navyLight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            <div className="space-y-2">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-conliz-gold block">
                100%
              </span>
              <p className="font-sans text-xs tracking-[0.18em] uppercase text-white/70">
                Prazos rigorosamente cumpridos
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-white block">
                45+
              </span>
              <p className="font-sans text-xs tracking-[0.18em] uppercase text-white/70">
                Obras entregues na região
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-white block">
                15+
              </span>
              <p className="font-sans text-xs tracking-[0.18em] uppercase text-white/70">
                Anos de experiência técnica
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-conliz-gold block">
                Zero
              </span>
              <p className="font-sans text-xs tracking-[0.18em] uppercase text-white/70">
                Custos ocultos ou surpresas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-conliz-slate">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="editorial-sub block mb-2">Depoimentos</span>
          <h2 className="text-3xl sm:text-4xl font-serif text-conliz-charcoal">
            A palavra de quem já <span className="italic font-normal text-conliz-gold">construiu</span> conosco.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-conliz-slate p-8 border border-conliz-slate space-y-4">
            <Quote className="w-8 h-8 text-conliz-gold/50" />
            <p className="font-serif italic text-lg text-conliz-charcoal leading-relaxed">
              "A Conliz conduziu a obra da nossa casa no Alphaville com um controle financeiro e cronograma
              que nunca vi em outra construtora. As medições foram transparentes e o resultado superou as expectativas."
            </p>
            <div className="pt-4 border-t border-conliz-slate">
              <p className="font-sans text-sm font-semibold text-conliz-charcoal">Dr. Roberto Silveira</p>
              <p className="font-sans text-xs text-conliz-muted">Residência Alphaville Nova Esplanada</p>
            </div>
          </div>

          <div className="bg-conliz-slate p-8 border border-conliz-slate space-y-4">
            <Quote className="w-8 h-8 text-conliz-gold/50" />
            <p className="font-serif italic text-lg text-conliz-charcoal leading-relaxed">
              "Reformamos todo o hall social do condomínio no Campolim com a Conliz. Organização exemplar,
              respeito rigoroso aos condôminos e acabamento de altíssimo padrão."
            </p>
            <div className="pt-4 border-t border-conliz-slate">
              <p className="font-sans text-sm font-semibold text-conliz-charcoal">Condomínio Residencial Saint Paul</p>
              <p className="font-sans text-xs text-conliz-muted">Campolim, Sorocaba</p>
            </div>
          </div>

          <div className="bg-conliz-slate p-8 border border-conliz-slate space-y-4">
            <Quote className="w-8 h-8 text-conliz-gold/50" />
            <p className="font-serif italic text-lg text-conliz-charcoal leading-relaxed">
              "A clínica precisava abrir no prazo limite por conta dos agendamentos de pacientes.
              A engenharia da Conliz entregou com 5 dias de antecedência e sem nenhum retrabalho."
            </p>
            <div className="pt-4 border-t border-conliz-slate">
              <p className="font-sans text-sm font-semibold text-conliz-charcoal">Clínica Odontológica Sorocaba</p>
              <p className="font-sans text-xs text-conliz-muted">Av. Barão de Tatuí, Centro</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call To Action */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-conliz-navy text-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[11px] font-sans font-semibold tracking-[0.22em] uppercase text-conliz-gold">
            Pronto para iniciar?
          </span>
          <h2 className="text-4xl sm:text-6xl font-serif leading-tight">
            Vamos transformar a sua visão em uma <span className="italic text-conliz-gold">obra concreta</span>.
          </h2>
          <p className="font-sans text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Receba um estudo prévio e proposta detalhada elaborada por nossa equipe de engenharia para Sorocaba e região.
          </p>
          <div className="pt-4">
            <Link
              href="/orcamento"
              className="inline-flex items-center gap-2 px-9 py-4 bg-conliz-gold text-conliz-navy font-sans text-xs tracking-widest uppercase font-semibold hover:bg-conliz-goldHover transition-all shadow-xl"
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
