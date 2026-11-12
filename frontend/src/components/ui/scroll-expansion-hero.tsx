"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Compass } from "lucide-react";

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

  // Começa quase em tela cheia (0.94) e cresce suavemente até 1.02 — sem o efeito de "miniatura"
  const imageScale = useTransform(scrollYProgress, [0, 0.65], [0.94, 1.02]);
  const imageRadius = useTransform(scrollYProgress, [0, 0.65], ["12px", "0px"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.45], [0, -40]);

  return (
    <div ref={containerRef} className="relative min-h-[160vh] bg-[#071B2E]">
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-3 sm:px-6 md:px-8 py-6 sm:py-10">
        {/* Background Expanding Image */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            style={{
              scale: imageScale,
              borderRadius: imageRadius,
            }}
            className="relative w-full h-[92vh] sm:h-[90vh] overflow-hidden shadow-2xl"
          >
            <Image
              src={heroImage}
              alt="Conliz Obras e Arquitetura de Alto Padrão"
              fill
              priority
              className="object-cover object-center brightness-[0.7]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071B2E]/95 via-[#071B2E]/35 to-[#071B2E]/25" />
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-10 pt-20 sm:pt-24 max-w-7xl mx-auto w-full text-center px-2"
        >
          <p className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-white/70 mb-4 sm:mb-6">
            {tagline}
          </p>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-semibold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            {title}
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg font-sans text-white/80 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href={primaryCtaLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-white text-[#071B2E] font-sans text-xs tracking-[0.12em] uppercase font-semibold hover:bg-white/90 transition-colors"
            >
              <span>{primaryCtaText}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              href={secondaryCtaLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-transparent text-white font-sans text-xs tracking-[0.12em] uppercase font-semibold border border-white/30 hover:bg-white/10 transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>{secondaryCtaText}</span>
            </Link>
          </div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          style={{ opacity: contentOpacity }}
          className="relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full text-white/60 text-[10px] sm:text-xs tracking-[0.14em] uppercase font-sans pb-2"
        >
          <span className="hidden sm:inline">Sorocaba & Região</span>
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span>Role para explorar</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
