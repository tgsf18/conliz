"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Compass, ShieldCheck } from "lucide-react";

interface ScrollExpansionHeroProps {
  title?: string;
  tagline?: string;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  heroImage?: string;
}

export function ScrollExpansionHero({
  title = "Conliz Construções",
  tagline = "A CONFIANÇA SE CONSTRÓI",
  subtitle = "Engenharia de precisão, reformas sob medida e arquitetura autêntica em Sorocaba e região.",
  primaryCtaText = "Solicitar Orçamento",
  primaryCtaLink = "/orcamento",
  secondaryCtaText = "Obras Realizadas",
  secondaryCtaLink = "/obras",
  heroImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85",
}: ScrollExpansionHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Transição mais pronunciada: começa menor e cresce mais na tela
  const imageScale = useTransform(scrollYProgress, [0, 0.7], [0.72, 1.08]);
  const imageRadius = useTransform(scrollYProgress, [0, 0.7], ["28px", "0px"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.08]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -70]);

  return (
    <div ref={containerRef} className="relative min-h-[190vh] bg-conliz-navy">
      {/* Sticky Hero Frame */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-4 md:px-8 py-10">
        
        {/* Background Expanding Image */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            style={{
              scale: imageScale,
              borderRadius: imageRadius,
            }}
            className="relative w-full h-[90vh] overflow-hidden shadow-2xl"
          >
            <Image
              src={heroImage}
              alt="Conliz Obras e Arquitetura de Alto Padrão"
              fill
              priority
              className="object-cover object-center filter brightness-[0.75] contrast-[1.05]"
              sizes="100vw"
            />
            {/* Navy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-conliz-navy/90 via-conliz-navy/40 to-conliz-navy/20" />
            <div className="absolute inset-0 bg-conliz-navy/20 mix-blend-multiply" />
          </motion.div>
        </div>

        {/* Top Badges / Tagline */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-10 pt-16 md:pt-20 max-w-7xl mx-auto w-full text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-conliz-navy/80 backdrop-blur-md border border-conliz-gold/40 shadow-sm mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-conliz-gold" />
            <span className="text-[11px] font-sans font-semibold tracking-widest uppercase text-conliz-gold">
              {tagline}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-white tracking-tight leading-editorial max-w-5xl mx-auto drop-shadow-sm">
            {title.split(" ")[0]}{" "}
            <span className="italic font-normal text-conliz-gold">
              {title.split(" ").slice(1).join(" ")}
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl font-sans text-white/85 max-w-2xl mx-auto leading-relaxed drop-shadow">
            {subtitle}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={primaryCtaLink}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-none bg-conliz-gold text-conliz-navy font-sans text-xs tracking-widest uppercase font-semibold shadow-md hover:bg-conliz-goldHover transition-all duration-200"
            >
              <span>{primaryCtaText}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              href={secondaryCtaLink}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-none bg-white/10 backdrop-blur-sm text-white font-sans text-xs tracking-widest uppercase font-semibold border border-white/30 hover:bg-white/20 transition-all duration-200"
            >
              <Compass className="w-4 h-4 text-conliz-gold" />
              <span>{secondaryCtaText}</span>
            </Link>
          </div>
        </motion.div>

        {/* Bottom Scroll Indicator */}
        <motion.div
          style={{ opacity: contentOpacity }}
          className="relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full text-white/80 text-xs tracking-widest uppercase font-sans pb-4"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-conliz-gold animate-pulse" />
            <span className="text-white/90 font-medium">Sorocaba & Região Metropolitana</span>
          </div>

          <div className="flex items-center gap-2 text-white/70">
            <span>Role para explorar</span>
            <ArrowDown className="w-4 h-4 animate-bounce text-conliz-gold" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
