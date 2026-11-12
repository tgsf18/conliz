"use client";

import React from "react";
import { ScrollExpansionHero } from "./scroll-expansion-hero";

export function ScrollExpansionHeroDemo() {
  return (
    <ScrollExpansionHero
      title="Conliz Construções"
      tagline="A CONFIANÇA SE CONSTRÓI"
      subtitle="Engenharia civil com qualidade, reformas e obras sob medida em Sorocaba e região."
      primaryCtaText="Solicitar Orçamento"
      primaryCtaLink="/orcamento"
      secondaryCtaText="Conhecer Projetos"
      secondaryCtaLink="/obras"
      heroImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
    />
  );
}
