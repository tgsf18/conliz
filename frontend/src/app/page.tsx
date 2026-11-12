import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollExpansionHero } from "@/components/ui/scroll-expansion-hero";
import { ArrowUpRight, Building2, HardHat, Ruler, Play, ExternalLink } from "lucide-react";

async function getFeaturedObras() {
  try {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/public/obras`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return data.slice(0, 3);
    }
  } catch {}
  return [
    {
      id: "1",
      nome: "Residência Alphaville Nova Esplanada",
      slug: "residencia-alphaville-nova-esplanada",
      categoria: "RESIDENCIAL",
      cidade: "Votorantim",
      areaM2: 380,
      imagemCapaUrl:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "2",
      nome: "Retrofit Hall Social Saint Paul",
      slug: "retrofit-hall-social-saint-paul",
      categoria: "REFORMA",
      cidade: "Sorocaba",
      areaM2: 520,
      imagemCapaUrl:
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "3",
      nome: "Consultórios Barão de Tatuí",
      slug: "consultorios-integrados-barao-de-tatui",
      categoria: "COMERCIAL",
      cidade: "Sorocaba",
      areaM2: 220,
      imagemCapaUrl:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    },
  ];
}

export default async function HomePage() {
  const featuredObras = await getFeaturedObras();

  return (
    <div className="bg-conliz-cream dark:bg-conliz-navyDark">
      <ScrollExpansionHero
        title="Conliz Construções"
        tagline="A CONFIANÇA SE CONSTRÓI"
        subtitle="Construção civil, reformas e projetos sob medida em Sorocaba e região — com engenharia residente em cada obra."
        primaryCtaText="Solicitar Orçamento"
        primaryCtaLink="/orcamento"
        secondaryCtaText="Ver Obras"
        secondaryCtaLink="/obras"
      />

      {/* Filosofia */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-b border-conliz-slate dark:border-white/10">
        <p className="text-[11px] font-sans font-semibold tracking-[0.18em] uppercase text-conliz-muted mb-4">
          Filosofia
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-semibold text-conliz-charcoal dark:text-white leading-snug">
          Solidez no cálculo estrutural e honestidade em cada etapa.
        </h2>
        <p className="mt-6 text-sm sm:text-base text-conliz-muted dark:text-white/65 leading-relaxed max-w-2xl mx-auto">
          A Conliz une engenharia moderna ao acompanhamento próximo em cada canteiro.
          Sem improvisos e com transparência de medições e cronograma.
        </p>
      </section>

      {/* Diários de Obra — vídeos limpos */}
      <section className="py-16 sm:py-20 bg-[#071B2E] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/50 mb-2">
                Diários de Obra
              </p>
              <h2 className="text-2xl sm:text-3xl font-sans font-semibold">
                Bastidores e entregas reais
              </h2>
            </div>
            <a
              href="https://www.instagram.com/conliz_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase text-white/70 hover:text-white"
            >
              Instagram @conliz_
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 1 */}
            <article className="border border-white/10 bg-white/5 overflow-hidden">
              <div className="relative aspect-[4/5] sm:aspect-[9/14] max-h-[480px] bg-black">
                <iframe
                  src="https://www.instagram.com/reel/DcQzj9csw_C/embed"
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  loading="lazy"
                  title="Conliz — Origem da empresa"
                />
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase text-white/50 mb-2">
                  <Play className="w-3.5 h-3.5" /> Institucional
                </div>
                <h3 className="font-sans font-semibold text-base sm:text-lg">
                  Como nasceu a Conliz
                </h3>
                <p className="mt-1.5 text-sm text-white/55 leading-relaxed">
                  A ideia, a equipe de engenharia e o diferencial de supervisão em todas as obras.
                </p>
              </div>
            </article>

            {/* Card 2 */}
            <article className="border border-white/10 bg-white/5 overflow-hidden">
              <div className="relative aspect-[4/5] sm:aspect-[9/14] max-h-[480px] bg-[#0A2540] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <p className="font-sans font-semibold text-lg">Ranch Blackstone</p>
                <p className="text-sm text-white/50 mt-1">Tour da obra entregue</p>
                <a
                  href="https://www.instagram.com/conliz_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 border border-white/25 text-xs tracking-[0.12em] uppercase hover:bg-white/10 transition-colors"
                >
                  Assistir no Instagram
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase text-white/50 mb-2">
                  <Play className="w-3.5 h-3.5" /> Resultado
                </div>
                <h3 className="font-sans font-semibold text-base sm:text-lg">
                  Entrega completa
                </h3>
                <p className="mt-1.5 text-sm text-white/55 leading-relaxed">
                  Pistas, galpão, área de lazer e acabamentos — obra finalizada pela equipe Conliz.
                </p>
              </div>
            </article>
          </div>

          <p className="mt-8 text-center text-xs text-white/40">
            Para hospedar o segundo vídeo direto no site, envie o arquivo MP4 para a pasta{" "}
            <code className="text-white/60">/public/videos/</code> e avise a equipe técnica.
          </p>
        </div>
      </section>

      {/* Soluções */}
      <section className="py-16 sm:py-24 border-b border-conliz-slate dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-conliz-muted mb-2">
                Serviços
              </p>
              <h2 className="text-2xl sm:text-3xl font-sans font-semibold text-conliz-charcoal dark:text-white">
                O que entregamos
              </h2>
            </div>
            <Link
              href="/solucoes"
              className="inline-flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase font-semibold text-conliz-navy dark:text-white hover:opacity-70"
            >
              Ver soluções <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Building2,
                title: "Construção Residencial",
                desc: "Casas e condomínios em Sorocaba e Votorantim, da fundação às chaves.",
              },
              {
                icon: Ruler,
                title: "Reformas & Retrofit",
                desc: "Transformações estruturais e acabamentos com cronograma controlado.",
              },
              {
                icon: HardHat,
                title: "Obras Comerciais",
                desc: "Clínicas, escritórios e sedes com cumprimento rigoroso de prazos.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white dark:bg-white/5 border border-conliz-slate dark:border-white/10 p-6 sm:p-8"
              >
                <item.icon className="w-5 h-5 text-conliz-navy dark:text-white mb-4" />
                <h3 className="font-sans font-semibold text-lg text-conliz-charcoal dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-conliz-muted dark:text-white/60 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfólio */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-conliz-muted mb-2">
              Portfólio
            </p>
            <h2 className="text-2xl sm:text-3xl font-sans font-semibold text-conliz-charcoal dark:text-white">
              Obras selecionadas
            </h2>
          </div>
          <Link
            href="/obras"
            className="inline-flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase font-semibold text-conliz-navy dark:text-white hover:opacity-70"
          >
            Galeria completa <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredObras.map((obra: any) => (
            <Link
              key={obra.slug}
              href={`/obras/${obra.slug}`}
              className="group block bg-white dark:bg-white/5 border border-conliz-slate dark:border-white/10 overflow-hidden hover:border-conliz-navy/30 dark:hover:border-white/25 transition-colors"
            >
              <div className="relative aspect-[4/3] bg-conliz-slate">
                <Image
                  src={obra.imagemCapaUrl}
                  alt={obra.nome}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <span className="absolute top-3 left-3 bg-[#071B2E]/90 text-white text-[10px] tracking-[0.12em] uppercase px-2 py-1">
                  {obra.categoria}
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex justify-between text-xs text-conliz-muted mb-1.5">
                  <span>{obra.cidade}</span>
                  <span>{obra.areaM2} m²</span>
                </div>
                <h3 className="font-sans font-semibold text-conliz-charcoal dark:text-white group-hover:opacity-80">
                  {obra.nome}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Números */}
      <section className="py-14 sm:py-16 bg-[#071B2E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: "100%", l: "Prazos cumpridos" },
              { n: "45+", l: "Obras na região" },
              { n: "15+", l: "Anos de experiência" },
              { n: "Zero", l: "Custos ocultos" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-3xl sm:text-4xl font-sans font-semibold">{s.n}</p>
                <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-white/55">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 text-center border-t border-conliz-slate dark:border-white/10">
        <h2 className="text-2xl sm:text-4xl font-sans font-semibold text-conliz-charcoal dark:text-white max-w-2xl mx-auto">
          Pronto para construir com confiança?
        </h2>
        <p className="mt-4 text-sm sm:text-base text-conliz-muted dark:text-white/60 max-w-lg mx-auto">
          Solicite uma proposta elaborada pela equipe de engenharia para Sorocaba e região.
        </p>
        <Link
          href="/orcamento"
          className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-[#0A2540] dark:bg-white text-white dark:text-[#071B2E] font-sans text-xs tracking-[0.12em] uppercase font-semibold hover:opacity-90 transition-opacity"
        >
          Solicitar Orçamento
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
